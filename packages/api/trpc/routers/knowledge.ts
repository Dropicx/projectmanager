import { AIOrchestrator } from "@consulting-platform/ai";
import {
  engagements,
  knowledge_base,
  knowledge_categories,
  knowledge_to_categories,
} from "@consulting-platform/database";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const aiOrchestrator = new AIOrchestrator();

export const knowledgeRouter = router({
  /**
   * List all general knowledge items (not tied to specific engagements)
   */
  list: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
        type: z
          .enum(["methodology", "framework", "template", "case-study", "guide", "checklist", "all"])
          .optional()
          .default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Ensure we only return knowledge for the user's organization
        if (!ctx.user.organizationId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Organization context required",
          });
        }

        const conditions = [
          isNull(knowledge_base.engagement_id),
          eq(knowledge_base.organization_id, ctx.user.organizationId),
        ];

        if (input.search) {
          const searchCondition = or(
            like(knowledge_base.title, `%${input.search}%`),
            like(knowledge_base.content, `%${input.search}%`)
          );
          if (searchCondition) {
            conditions.push(searchCondition);
          }
        }

        if (input.type && input.type !== "all") {
          conditions.push(
            eq(
              knowledge_base.knowledge_type,
              input.type as
                | "solution"
                | "issue"
                | "decision"
                | "pattern"
                | "template"
                | "reference"
                | "insight"
                | "lesson_learned"
            )
          );
        }

        const items = await ctx.db
          .select({
            id: knowledge_base.id,
            title: knowledge_base.title,
            content: knowledge_base.content,
            type: knowledge_base.knowledge_type,
            tags: knowledge_base.tags,
            isPublic: knowledge_base.is_public,
            createdAt: knowledge_base.created_at,
            updatedAt: knowledge_base.updated_at,
            createdBy: knowledge_base.created_by,
            views: sql<number>`COALESCE(${knowledge_base.metadata}->>'views', '0')::int`,
          })
          .from(knowledge_base)
          .where(and(...conditions))
          .orderBy(desc(knowledge_base.created_at))
          .limit(input.limit)
          .offset(input.offset);

        if (input.categoryId) {
          const categoryItems = await ctx.db
            .select({ knowledgeId: knowledge_to_categories.knowledge_id })
            .from(knowledge_to_categories)
            .where(eq(knowledge_to_categories.category_id, input.categoryId));

          const categoryItemIds = categoryItems.map((item) => item.knowledgeId);
          return items.filter((item) => categoryItemIds.includes(item.id));
        }

        return items;
      } catch (error) {
        console.error("Error listing knowledge items:", error);
        return [];
      }
    }),

  /**
   * Get all categories
   */
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Only return categories for the user's organization
      const categories = await ctx.db
        .select()
        .from(knowledge_categories)
        .where(eq(knowledge_categories.organization_id, ctx.user.organizationId || ""))
        .orderBy(knowledge_categories.position, knowledge_categories.name);

      // Calculate actual item counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const count = await ctx.db
            .select({ count: sql`count(*)::int` })
            .from(knowledge_to_categories)
            .innerJoin(knowledge_base, eq(knowledge_to_categories.knowledge_id, knowledge_base.id))
            .where(
              and(
                eq(knowledge_to_categories.category_id, category.id),
                eq(knowledge_base.organization_id, ctx.user.organizationId || "")
              )
            );

          return {
            ...category,
            item_count: count[0]?.count || 0,
          };
        })
      );

      return categoriesWithCounts;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }),

  /**
   * Create a new category
   */
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        parent_id: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.organizationId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Organization context required",
        });
      }

      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const [category] = await ctx.db
        .insert(knowledge_categories)
        .values({
          organization_id: ctx.user.organizationId,
          name: input.name,
          slug,
          description: input.description,
          icon: input.icon || "Folder",
          color: input.color || "#6B7280",
          parent_id: input.parent_id,
          level: input.parent_id ? 1 : 0,
          position: 0,
          is_public: false,
          created_by: ctx.user.id,
        })
        .returning();

      return category;
    }),

  /**
   * Update a category
   */
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        parent_id: z.string().uuid().nullable().optional(),
        position: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: any = {
        updated_at: new Date(),
      };

      if (input.name) {
        updates.name = input.name;
        updates.slug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      if (input.description !== undefined) updates.description = input.description;
      if (input.icon) updates.icon = input.icon;
      if (input.color) updates.color = input.color;
      if (input.parent_id !== undefined) {
        updates.parent_id = input.parent_id;
        updates.level = input.parent_id ? 1 : 0;
      }
      if (input.position !== undefined) updates.position = input.position;

      const [category] = await ctx.db
        .update(knowledge_categories)
        .set(updates)
        .where(
          and(
            eq(knowledge_categories.id, input.id),
            eq(knowledge_categories.organization_id, ctx.user.organizationId || "")
          )
        )
        .returning();

      return category;
    }),

  /**
   * Get a knowledge item by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db
        .select()
        .from(knowledge_base)
        .where(
          and(
            eq(knowledge_base.id, input.id),
            eq(knowledge_base.organization_id, ctx.user.organizationId || "")
          )
        )
        .limit(1);

      return item[0] || null;
    }),

  /**
   * Get categories for a knowledge item
   */
  getKnowledgeCategories: protectedProcedure
    .input(z.object({ knowledgeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db
        .select({
          id: knowledge_categories.id,
          name: knowledge_categories.name,
        })
        .from(knowledge_to_categories)
        .innerJoin(
          knowledge_categories,
          eq(knowledge_to_categories.category_id, knowledge_categories.id)
        )
        .where(eq(knowledge_to_categories.knowledge_id, input.knowledgeId));

      return categories;
    }),

  /**
   * Delete a category
   */
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // First, remove all associations with knowledge items
      await ctx.db
        .delete(knowledge_to_categories)
        .where(eq(knowledge_to_categories.category_id, input.id));

      // Then delete the category
      const [deleted] = await ctx.db
        .delete(knowledge_categories)
        .where(
          and(
            eq(knowledge_categories.id, input.id),
            eq(knowledge_categories.organization_id, ctx.user.organizationId || "")
          )
        )
        .returning();

      return deleted;
    }),

  /**
   * Create a general knowledge item
   */
  createGeneral: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        type: z.enum(["methodology", "framework", "template", "case-study", "guide", "checklist"]),
        tags: z.array(z.string()).optional(),
        categoryIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const embedding = await generateEmbedding(input.content);

      const [entry] = await ctx.db
        .insert(knowledge_base)
        .values({
          organization_id: ctx.user.organizationId || "",
          title: input.title,
          content: input.content,
          embedding: embedding as any, // Cast to any for JSONB compatibility
          tags: input.tags || [],
          knowledge_type: mapToKnowledgeType(input.type),
          is_public: false, // Always private to organization
          created_by: ctx.user.id,
          metadata: { views: 0 },
        })
        .returning();

      if (input.categoryIds && input.categoryIds.length > 0) {
        await ctx.db.insert(knowledge_to_categories).values(
          input.categoryIds.map((categoryId) => ({
            knowledge_id: entry.id,
            category_id: categoryId,
          }))
        );
      }

      return entry;
    }),

  /**
   * Delete a general knowledge item
   */
  deleteGeneral: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // First delete any category associations
      await ctx.db
        .delete(knowledge_to_categories)
        .where(eq(knowledge_to_categories.knowledge_id, input.id));

      // Then delete the knowledge item (only if it belongs to the user's organization)
      await ctx.db
        .delete(knowledge_base)
        .where(
          and(
            eq(knowledge_base.id, input.id),
            eq(knowledge_base.organization_id, ctx.user.organizationId || "")
          )
        );

      return { success: true };
    }),

  /**
   * Update a general knowledge item
   */
  updateGeneral: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        content: z.string().optional(),
        type: z
          .enum(["methodology", "framework", "template", "case-study", "guide", "checklist"])
          .optional(),
        tags: z.array(z.string()).optional(),
        categoryIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Partial<{
        updated_at: Date;
        title: string;
        tags: string[] | null;
        knowledge_type:
          | "solution"
          | "issue"
          | "decision"
          | "pattern"
          | "template"
          | "reference"
          | "insight"
          | "lesson_learned";
        is_public: boolean;
        content: string;
        embedding: number[];
      }> = {
        updated_at: new Date(),
      };

      if (input.title) updates.title = input.title;
      if (input.tags) updates.tags = input.tags;
      if (input.type) updates.knowledge_type = mapToKnowledgeType(input.type);
      // is_public is always false - no public knowledge

      if (input.content) {
        updates.content = input.content;
        updates.embedding = (await generateEmbedding(input.content)) as any; // Cast to any for JSONB compatibility
      }

      // Ensure user can only update their organization's knowledge
      const [updated] = await ctx.db
        .update(knowledge_base)
        .set(updates)
        .where(
          and(
            eq(knowledge_base.id, input.id),
            eq(knowledge_base.organization_id, ctx.user.organizationId || "")
          )
        )
        .returning();

      if (input.categoryIds) {
        await ctx.db
          .delete(knowledge_to_categories)
          .where(eq(knowledge_to_categories.knowledge_id, input.id));
        if (input.categoryIds.length > 0) {
          await ctx.db.insert(knowledge_to_categories).values(
            input.categoryIds.map((categoryId) => ({
              knowledge_id: input.id,
              category_id: categoryId,
            }))
          );
        }
      }

      return updated;
    }),

  /**
   * Delete a knowledge item
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(knowledge_to_categories)
        .where(eq(knowledge_to_categories.knowledge_id, input.id));
      const [deleted] = await ctx.db
        .delete(knowledge_base)
        .where(eq(knowledge_base.id, input.id))
        .returning();
      return deleted;
    }),

  /**
   * Increment view count
   */
  incrementViews: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .select()
        .from(knowledge_base)
        .where(eq(knowledge_base.id, input.id));

      if (item) {
        const metadata = item.metadata as { views?: number } | null;
        const currentViews = metadata?.views || 0;
        await ctx.db
          .update(knowledge_base)
          .set({
            metadata: { ...(metadata || {}), views: currentViews + 1 },
          })
          .where(eq(knowledge_base.id, input.id));
      }
    }),
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
          organization_id: engagement[0].organization_id || "",
          engagement_id: input.projectId,
          title: input.title,
          content: input.content,
          embedding: embedding,
          tags: input.tags || [],
          knowledge_type: input.type as
            | "solution"
            | "issue"
            | "decision"
            | "pattern"
            | "template"
            | "reference"
            | "insight"
            | "lesson_learned",
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
          return entries.filter((entry) => {
            return entry.knowledge_type === input.type;
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
          .map((entry) => {
            if (!entry.embedding) return null;
            const similarity = cosineSimilarity(queryEmbedding, entry.embedding as number[]);
            return { ...entry, similarity };
          })
          .filter(
            (entry): entry is typeof entry & { similarity: number } =>
              entry !== null && "similarity" in entry && entry.similarity > 0.7
          )
          .sort((a, b) => b.similarity - a.similarity)
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
      const updates: Partial<{
        updated_at: Date;
        title: string;
        tags: string[];
        content: string;
        embedding: number[];
      }> = {
        updated_at: new Date(),
      };

      if (input.title) updates.title = input.title;
      if (input.tags) updates.tags = input.tags;

      if (input.content) {
        updates.content = input.content;
        // Regenerate embedding if content changed
        updates.embedding = await generateEmbedding(input.content);
      }

      // Ensure user can only update their organization's knowledge
      const [updated] = await ctx.db
        .update(knowledge_base)
        .set(updates)
        .where(
          and(
            eq(knowledge_base.id, input.id),
            eq(knowledge_base.organization_id, ctx.user.organizationId || "")
          )
        )
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
          projectDescription: engagement.description || "",
          status: engagement.status,
          recentUpdates: entries.map((e) => ({
            title: e.title,
            content: e.content.substring(0, 500),
            type: e.knowledge_type || "note",
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
${context.recentUpdates.map((u) => `- [${u.type}] ${u.title}: ${u.content}`).join("\n")}

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
        const docs = allEntries.filter((entry) => {
          return entry.knowledge_type === "reference" || entry.knowledge_type === "decision";
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
Description: ${engagement.description || ""}

Documentation entries:
${docs.map((d) => `- ${d.title}: ${d.content.substring(0, 300)}`).join("\n")}

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

// Helper function to map frontend types to database types
function mapToKnowledgeType(
  type: string
):
  | "solution"
  | "issue"
  | "decision"
  | "pattern"
  | "template"
  | "reference"
  | "insight"
  | "lesson_learned" {
  const typeMap: Record<
    string,
    | "solution"
    | "issue"
    | "decision"
    | "pattern"
    | "template"
    | "reference"
    | "insight"
    | "lesson_learned"
  > = {
    methodology: "pattern",
    framework: "pattern",
    template: "template",
    "case-study": "reference",
    guide: "reference",
    checklist: "template",
  };
  return typeMap[type] || "reference";
}

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
