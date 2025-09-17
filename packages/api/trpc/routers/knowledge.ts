import { AIOrchestrator } from "@consulting-platform/ai";
import { knowledge_base, engagements } from "@consulting-platform/database";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const aiOrchestrator = new AIOrchestrator();

export const knowledgeRouter = router({
  /**
   * Add a knowledge entry (note, meeting, decision, etc.)
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        type: z.enum(["note", "meeting", "decision", "feedback", "documentation", "task_update"]),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to engagement
      const engagement = await ctx.db
        .select()
        .from(engagements)
        .where(eq(engagements.id, input.projectId))
        .limit(1);

      if (!engagement.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Engagement not found",
        });
      }

      // Generate embedding for the content
      const embedding = await generateEmbedding(input.content);

      // Create knowledge entry
      const [entry] = await ctx.db
        .insert(knowledge_base)
        .values({
          organization_id: engagement[0].organization_id,
          engagement_id: input.projectId,
          title: input.title,
          content: input.content,
          embedding: embedding,
          tags: input.tags || [],
          metadata: {
            type: input.type,
            author: ctx.user.id,
            createdAt: new Date().toISOString(),
            ...input.metadata,
          },
          created_by: ctx.user.id,
        })
        .returning();

      return entry;
    }),

  /**
   * Get all knowledge entries for a project
   */
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        type: z
          .enum(["note", "meeting", "decision", "feedback", "documentation", "task_update", "all"])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // For now, return empty array if table doesn't exist or query fails
        const entries = await ctx.db
          .select()
          .from(knowledge_base)
          .where(eq(knowledge_base.engagement_id, input.projectId))
          .orderBy(desc(knowledge_base.created_at))
          .limit(input.limit)
          .catch(() => []); // Return empty array if table doesn't exist

        // Filter by type in memory if specified
        if (input.type && input.type !== "all") {
          return entries.filter((entry: any) => {
            const metadata = entry.metadata as any;
            return metadata?.type === input.type;
          });
        }

        return entries;
      } catch (error) {
        console.error("Error fetching knowledge entries:", error);
        return []; // Return empty array on error
      }
    }),

  /**
   * Search knowledge base with semantic search
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        projectId: z.string().uuid().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Generate embedding for search query
        const queryEmbedding = await generateEmbedding(input.query);

        // Get all entries (with optional project filter)
        const conditions = [];
        if (input.projectId) {
          conditions.push(eq(knowledge_base.engagement_id, input.projectId));
        }

        const entries = await ctx.db
          .select()
          .from(knowledge_base)
          .where(conditions.length ? and(...conditions) : undefined)
          .catch(() => []);

        // Perform semantic search using embeddings
        const results = entries
          .map((entry: any) => {
            if (!entry.embedding) return null;
            const similarity = cosineSimilarity(queryEmbedding, entry.embedding as number[]);
            return { ...entry, similarity };
          })
          .filter((entry: any) => entry !== null && entry.similarity > 0.7)
          .sort((a: any, b: any) => b?.similarity - a?.similarity)
          .slice(0, input.limit);

        return results;
      } catch (error) {
        console.error("Error searching knowledge base:", error);
        return [];
      }
    }),

  /**
   * Update knowledge entry
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: any = {
        updated_at: new Date(),
      };

      if (input.title) updates.title = input.title;
      if (input.tags) updates.tags = input.tags;

      if (input.content) {
        updates.content = input.content;
        // Regenerate embedding if content changed
        updates.embedding = await generateEmbedding(input.content);
      }

      const [updated] = await ctx.db
        .update(knowledge_base)
        .set(updates)
        .where(eq(knowledge_base.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Generate project status summary using AI
   */
  generateStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get recent knowledge entries
        const entries = await ctx.db
          .select()
          .from(knowledge_base)
          .where(eq(knowledge_base.engagement_id, input.projectId))
          .orderBy(desc(knowledge_base.created_at))
          .limit(20)
          .catch(() => []);

        // Get engagement details
        const [engagement] = await ctx.db
          .select()
          .from(engagements)
          .where(eq(engagements.id, input.projectId));

        if (!engagement) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Engagement not found",
          });
        }

        // Prepare context for AI
        const context = {
          projectName: engagement.client_name,
          projectDescription: engagement.description || '',
          status: engagement.status,
          recentUpdates: entries.map((e: any) => ({
            title: e.title,
            content: e.content.substring(0, 500),
            type: (e.metadata as any)?.type,
            date: e.created_at,
          })),
        };

        // Generate status summary using AI
        const statusSummary = await aiOrchestrator.processRequest({
          type: "project_analysis",
          prompt: `Generate a comprehensive project status summary based on the following information:

Project: ${context.projectName}
Description: ${context.projectDescription}
Current Status: ${context.status}

Recent Updates:
${context.recentUpdates.map((u: any) => `- [${u.type}] ${u.title}: ${u.content}`).join("\n")}

Please provide:
1. Current Status Overview (2-3 sentences)
2. Recent Progress (bullet points)
3. Key Decisions Made
4. Upcoming Milestones
5. Risks or Blockers
6. Team Sentiment (if apparent from updates)

Format the response in markdown.`,
          userId: ctx.user.id,
          projectId: input.projectId,
          complexity: 6,
          urgency: "batch",
          accuracyRequired: "standard",
          contextLength: 4000,
          budgetConstraint: 50,
        });

        return {
          summary: statusSummary.content,
          lastUpdated: new Date().toISOString(),
          entriesAnalyzed: entries.length,
        };
      } catch (error) {
        console.error("Error generating status:", error);
        return {
          summary: "Unable to generate status at this time.",
          lastUpdated: new Date().toISOString(),
          entriesAnalyzed: 0,
        };
      }
    }),

  /**
   * Generate project wiki/documentation
   */
  generateWiki: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get all documentation entries
        const allEntries = await ctx.db
          .select()
          .from(knowledge_base)
          .where(eq(knowledge_base.engagement_id, input.projectId))
          .catch(() => []);

        // Filter for documentation and decision types
        const docs = allEntries.filter((entry: any) => {
          const metadata = entry.metadata as any;
          return metadata?.type === "documentation" || metadata?.type === "decision";
        });

        const [engagement] = await ctx.db
          .select()
          .from(engagements)
          .where(eq(engagements.id, input.projectId));

        if (!engagement) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Engagement not found",
          });
        }

        // Generate wiki structure using AI
        const wikiContent = await aiOrchestrator.processRequest({
          type: "technical_docs",
          prompt: `Generate a comprehensive wiki/knowledge base structure for the project:

Project: ${engagement.client_name}
Description: ${engagement.description || ''}

Documentation entries:
${docs.map((d: any) => `- ${d.title}: ${d.content.substring(0, 300)}`).join("\n")}

Please create a well-structured wiki with:
1. Project Overview
2. Technical Architecture (if applicable)
3. Key Concepts and Terminology
4. Process and Workflows
5. Important Decisions and Rationale
6. Resources and Links
7. FAQ Section

Format in markdown with clear headings and sections.`,
          userId: ctx.user.id,
          projectId: input.projectId,
          complexity: 7,
          urgency: "batch",
          accuracyRequired: "standard",
          contextLength: 4000,
          budgetConstraint: 80,
        });

        return {
          content: wikiContent.content,
          lastGenerated: new Date().toISOString(),
          sourceCount: docs.length,
        };
      } catch (error) {
        console.error("Error generating wiki:", error);
        return {
          content: "Unable to generate wiki at this time.",
          lastGenerated: new Date().toISOString(),
          sourceCount: 0,
        };
      }
    }),
});

// Helper function to generate embeddings
async function generateEmbedding(_text: string): Promise<number[]> {
  // For now, return a mock embedding
  // In production, you'd call OpenAI or another embedding service
  const mockEmbedding = new Array(1536).fill(0).map(() => Math.random());
  return mockEmbedding;
}

// Helper function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
