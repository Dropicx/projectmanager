import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

// Tasks have been removed from the consultant-focused schema
// This router returns empty data for backward compatibility

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "review", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
  actualHours: z.number().min(0).optional(),
});

export const tasksRouter = router({
  // Return empty arrays for backward compatibility
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        status: z.enum(["todo", "in-progress", "review", "completed", "all"]).optional(),
        sortBy: z.enum(["createdAt", "dueDate", "priority"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async () => {
      // Tasks removed - return empty array
      return [];
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async () => {
      return null;
    }),

  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ input }) => {
      // Tasks removed - return mock task
      return {
        id: crypto.randomUUID(),
        ...input,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ input }) => {
      // Tasks removed - return mock task
      return {
        ...input,
        updated_at: new Date(),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async () => {
      return { success: true };
    }),

  getStats: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async () => {
      // Return empty stats
      return {
        total: 0,
        byStatus: {
          todo: 0,
          "in-progress": 0,
          review: 0,
          completed: 0,
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
        },
        totalEstimatedHours: 0,
        totalActualHours: 0,
        completionRate: 0,
        overdueTasks: 0,
      };
    }),
});