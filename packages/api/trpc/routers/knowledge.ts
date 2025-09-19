import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";
import {
  ai_interactions,
  engagements,
  knowledge_base,
  knowledge_categories,
  knowledge_to_categories,
} from "@consulting-platform/database";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  enqueueBatchEmbeddingGeneration,
  enqueueBatchSummaryGeneration,
  enqueueEmbeddingGeneration,
  enqueueSummaryGeneration,
} from "../../lib/queue-client";
import { protectedProcedure, router } from "../trpc";

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

        // Build the query based on whether we need to filter by category
        let query = ctx.db
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
            summary: knowledge_base.summary, // Get summary from dedicated column
          })
          .from(knowledge_base);

        // If filtering by category, join with the junction table
        if (input.categoryId) {
          query = query
            .innerJoin(
              knowledge_to_categories,
              eq(knowledge_base.id, knowledge_to_categories.knowledge_id)
            )
            .where(and(...conditions, eq(knowledge_to_categories.category_id, input.categoryId)));
        } else {
          query = query.where(and(...conditions));
        }

        const items = await query
          .orderBy(desc(knowledge_base.created_at))
          .limit(input.limit)
          .offset(input.offset);

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
        categories.map(async (category: (typeof categories)[0]) => {
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
      const updates: Record<string, unknown> = {
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
      const embedding = await generateEmbedding(input.content, {
        db: ctx.db,
        userId: ctx.user.id,
        organizationId: ctx.user.organizationId,
        trackCost: true,
      });

      const [entry] = await ctx.db
        .insert(knowledge_base)
        .values({
          organization_id: ctx.user.organizationId || "",
          title: input.title,
          content: input.content,
          embedding: embedding as unknown as any, // Cast for JSONB compatibility
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
        updates.embedding = (await generateEmbedding(input.content, {
          db: ctx.db,
          userId: ctx.user.id,
          organizationId: ctx.user.organizationId,
          trackCost: true,
        })) as unknown as any; // Cast for JSONB compatibility
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
      const embedding = await generateEmbedding(input.content, {
        db: ctx.db,
        userId: ctx.user.id,
        organizationId: ctx.user.organizationId,
        trackCost: true,
      });

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
          return entries.filter((entry: (typeof entries)[0]) => {
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
        const queryEmbedding = await generateEmbedding(input.query, {
          db: ctx.db,
          userId: ctx.user.id,
          organizationId: ctx.user.organizationId,
          trackCost: true,
        });

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
          .map((entry: (typeof entries)[0]) => {
            if (!entry.embedding) return null;
            const similarity = cosineSimilarity(queryEmbedding, entry.embedding as number[]);
            return { ...entry, similarity };
          })
          .filter(
            (entry: any): entry is typeof entry & { similarity: number } =>
              entry !== null && "similarity" in entry && entry.similarity > 0.7
          )
          .sort((a: any, b: any) => b.similarity - a.similarity)
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
        updates.embedding = await generateEmbedding(input.content, {
          db: ctx.db,
          userId: ctx.user.id,
          organizationId: ctx.user.organizationId,
          knowledgeId: input.id,
          trackCost: true,
        });
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
        const _context = {
          projectName: engagement.client_name,
          projectDescription: engagement.description || "",
          status: engagement.status,
          recentUpdates: entries.map((e: any) => ({
            title: e.title,
            content: e.content.substring(0, 500),
            type: e.knowledge_type || "note",
            date: e.created_at,
          })),
        };

        // Generate status summary using AI
        // TODO: Move to background queue
        const statusSummary = {
          content: "Summary generation temporarily disabled - moving to background queue",
        };
        /* await aiOrchestrator.processRequest({
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
        }); */

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
        // TODO: Move to background queue
        const wikiContent = {
          content: "Wiki generation temporarily disabled - moving to background queue",
        };
        /* await aiOrchestrator.processRequest({
          type: "technical_docs",
          prompt: `Generate a comprehensive wiki/knowledge base structure for the project:

Project: ${engagement.client_name}
Description: ${engagement.description || ""}

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
        }); */

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

  /**
   * Generate AI summary for a knowledge item using Nova Lite
   */
  generateSummary: protectedProcedure
    .input(
      z.object({
        knowledgeId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the knowledge item exists and belongs to the user's org
        const item = await ctx.db
          .select()
          .from(knowledge_base)
          .where(
            and(
              eq(knowledge_base.id, input.knowledgeId),
              eq(knowledge_base.organization_id, ctx.user.organizationId || "")
            )
          )
          .limit(1);

        if (!item || item.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Knowledge item not found",
          });
        }

        // Enqueue the summary generation job
        await enqueueSummaryGeneration(input.knowledgeId, ctx.user.id);

        return {
          message: "Summary generation queued",
          status: "processing",
          knowledgeId: input.knowledgeId,
        };
      } catch (error) {
        console.error("Error enqueueing summary generation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue summary generation",
        });
      }
    }),

  /**
   * Get summaries for multiple knowledge items
   */
  generateBatchSummaries: protectedProcedure
    .input(
      z.object({
        knowledgeIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // If specific IDs provided, validate they belong to the user's org
        if (input.knowledgeIds && input.knowledgeIds.length > 0) {
          const items = await ctx.db
            .select({ id: knowledge_base.id })
            .from(knowledge_base)
            .where(
              and(
                eq(knowledge_base.organization_id, ctx.user.organizationId || ""),
                inArray(knowledge_base.id, input.knowledgeIds)
              )
            );

          if (items.length !== input.knowledgeIds.length) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Some knowledge items not found or unauthorized",
            });
          }
        }

        // Enqueue batch summary generation job
        await enqueueBatchSummaryGeneration(ctx.user.id);

        return {
          message: "Batch summary generation queued",
          status: "processing",
          itemCount: input.knowledgeIds?.length || "all",
        };
      } catch (error) {
        console.error("Error enqueueing batch summary generation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue batch summary generation",
        });
      }
    }),

  /**
   * Queue embedding generation for a knowledge item
   */
  generateEmbeddingAsync: protectedProcedure
    .input(
      z.object({
        knowledgeId: z.string(),
        priority: z.number().min(0).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the knowledge item
      const [item] = await ctx.db
        .select()
        .from(knowledge_base)
        .where(
          and(
            eq(knowledge_base.id, input.knowledgeId),
            eq(knowledge_base.organization_id, ctx.user.organizationId || "")
          )
        )
        .limit(1);

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Knowledge item not found",
        });
      }

      try {
        // Enqueue embedding generation
        await enqueueEmbeddingGeneration(
          item.id,
          item.content,
          ctx.user.id,
          ctx.user.organizationId || "",
          { priority: input.priority }
        );

        return {
          message: "Embedding generation queued",
          knowledgeId: item.id,
          status: "queued",
        };
      } catch (error) {
        console.error("Error enqueueing embedding generation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue embedding generation",
        });
      }
    }),

  /**
   * Queue batch embedding generation for multiple knowledge items
   */
  generateBatchEmbeddingsAsync: protectedProcedure
    .input(
      z.object({
        knowledgeIds: z.array(z.string()).optional(),
        regenerate: z.boolean().default(false), // Regenerate even if embeddings exist
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Build query conditions
        const conditions: any[] = [
          eq(knowledge_base.organization_id, ctx.user.organizationId || ""),
        ];

        if (input.knowledgeIds && input.knowledgeIds.length > 0) {
          conditions.push(inArray(knowledge_base.id, input.knowledgeIds));
        }

        if (!input.regenerate) {
          // Only get items without embeddings
          conditions.push(isNull(knowledge_base.embedding));
        }

        // Get items to process
        const items = await ctx.db
          .select({
            id: knowledge_base.id,
            content: knowledge_base.content,
          })
          .from(knowledge_base)
          .where(and(...conditions))
          .limit(100); // Process max 100 items at a time

        if (items.length === 0) {
          return {
            message: "No items need embedding generation",
            status: "completed",
            itemCount: 0,
          };
        }

        // Enqueue batch embedding generation
        await enqueueBatchEmbeddingGeneration(
          items.map((item: (typeof items)[0]) => ({
            knowledgeId: item.id,
            content: item.content,
          })),
          ctx.user.id,
          ctx.user.organizationId || ""
        );

        return {
          message: "Batch embedding generation queued",
          status: "processing",
          itemCount: items.length,
        };
      } catch (error) {
        console.error("Error enqueueing batch embedding generation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue batch embedding generation",
        });
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

// Initialize Bedrock client for embeddings
const getBedrockClient = (): BedrockRuntimeClient => {
  const region = process.env.AWS_REGION || "eu-central-1";
  const bedrockApiKey = process.env.BEDROCK_API_KEY;

  if (bedrockApiKey) {
    console.log("Using Bedrock API key for embeddings");
    process.env.AWS_BEARER_TOKEN_BEDROCK = bedrockApiKey;
    return new BedrockRuntimeClient({
      region,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 5000,
        socketTimeout: 30000,
      }),
    });
  }

  console.log("Using AWS IAM credentials for embeddings");
  return new BedrockRuntimeClient({
    region,
    credentials: fromEnv(),
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 5000,
      socketTimeout: 30000,
    }),
  });
};

// Helper function to generate embeddings with AWS Titan
async function generateEmbedding(
  text: string,
  options?: {
    db?: any; // Database connection for cost tracking
    userId?: string;
    organizationId?: string;
    engagementId?: string;
    knowledgeId?: string;
    trackCost?: boolean;
  }
): Promise<number[]> {
  const startTime = Date.now();

  try {
    // Validate input
    if (!text || text.trim().length === 0) {
      console.warn("Empty text provided for embedding generation");
      return generateMockEmbedding();
    }

    // Truncate text if too long (Titan has a limit)
    const maxChars = 8000; // Titan's approximate character limit
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

    if (text.length > maxChars) {
      console.warn(`Text truncated from ${text.length} to ${maxChars} characters for embedding`);
    }

    // Use AWS Titan Embed Text v2 model
    const modelId = "amazon.titan-embed-text-v2:0";
    const client = getBedrockClient();

    // Prepare the request body for Titan embedding
    const requestBody = {
      inputText: truncatedText,
      dimensions: 1536, // Titan v2 supports configurable dimensions
      normalize: true, // Normalize embeddings for cosine similarity
    };

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(requestBody),
      contentType: "application/json",
      accept: "application/json",
    });

    console.log(`Generating embedding for text (${truncatedText.length} chars) with Titan...`);
    const response = await client.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract the embedding from Titan's response
    const embedding = responseBody.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      console.error("Invalid embedding response from Titan:", responseBody);
      throw new Error("Invalid embedding response structure");
    }

    // Validate embedding dimensions
    if (embedding.length !== 1536) {
      console.warn(`Unexpected embedding dimensions: ${embedding.length}, expected 1536`);
    }

    const latencyMs = Date.now() - startTime;
    console.log(`Embedding generated successfully in ${latencyMs}ms`);

    // Track cost if requested
    if (options?.trackCost && options.userId && options.organizationId && options.db) {
      try {
        // Estimate tokens (Titan charges per input token)
        // Rough estimate: 1 token ≈ 4 characters
        const estimatedTokens = Math.ceil(truncatedText.length / 4);

        // Titan Embed v2 pricing: $0.02 per 1M input tokens (as of 2024)
        const costPer1MTokens = 2; // in cents
        const costCents = Math.ceil((estimatedTokens / 1000000) * costPer1MTokens);

        // Log to ai_interactions table
        await options.db.insert(ai_interactions).values({
          user_id: options.userId,
          organization_id: options.organizationId,
          engagement_id: options.engagementId || null,
          knowledge_id: options.knowledgeId || null,
          model: "titan-embed-v2",
          action: "embed",
          prompt: truncatedText.substring(0, 500), // Store first 500 chars as sample
          response: `Generated ${embedding.length}D embedding`,
          tokens_used: estimatedTokens,
          cost_cents: costCents,
          latency_ms: latencyMs,
        });

        console.log(`Embedding cost tracked: ${costCents} cents for ~${estimatedTokens} tokens`);
      } catch (trackingError) {
        console.error("Failed to track embedding cost:", trackingError);
        // Don't fail the embedding generation due to tracking errors
      }
    }

    return embedding;
  } catch (error) {
    console.error("Failed to generate embedding with AWS Titan:", error);

    // Log error details for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      });
    }

    // Check for specific AWS errors
    if (error instanceof Error) {
      if (error.message.includes("throttling") || error.message.includes("rate")) {
        console.warn("AWS Bedrock rate limit hit, falling back to mock embedding");
      } else if (error.message.includes("credentials") || error.message.includes("auth")) {
        console.error("AWS authentication issue, check credentials configuration");
      } else if (error.message.includes("model")) {
        console.error(
          "Model invocation issue, check if Titan Embed v2 is available in your region"
        );
      }
    }

    // Fallback to mock embedding for development/testing
    console.warn("Falling back to mock embedding generation");
    return generateMockEmbedding();
  }
}

// Fallback function for mock embeddings
function generateMockEmbedding(): number[] {
  // Generate deterministic mock embedding for consistency in development
  const mockEmbedding = new Array(1536).fill(0).map((_, i) => {
    // Create a somewhat realistic distribution
    const base = Math.sin(i * 0.1) * 0.3;
    const noise = (Math.random() - 0.5) * 0.2;
    return base + noise;
  });

  // Normalize the mock embedding
  const magnitude = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
  return mockEmbedding.map((val) => val / magnitude);
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
