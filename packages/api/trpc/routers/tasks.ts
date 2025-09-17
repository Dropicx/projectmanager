import { projects, tasks, users } from "@consulting-platform/database";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

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
  // Get all tasks for a project
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        status: z.enum(["todo", "in-progress", "review", "completed", "all"]).optional(),
        assigneeId: z.string().optional(),
        sortBy: z.enum(["dueDate", "priority", "createdAt", "title"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, status, assigneeId, sortBy, sortOrder } = input;

      // Check if user has access to the project
      const project = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Build query conditions
      const conditions = [eq(tasks.project_id, projectId)];
      if (status && status !== "all") {
        conditions.push(eq(tasks.status, status));
      }
      if (assigneeId) {
        conditions.push(eq(tasks.assignee_id, assigneeId));
      }

      // Determine sort column
      const sortColumn = {
        dueDate: tasks.due_date,
        priority: tasks.priority,
        createdAt: tasks.created_at,
        title: tasks.title,
      }[sortBy];

      // Get tasks with assignee information
      const taskList = await ctx.db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          assigneeId: tasks.assignee_id,
          assignee: {
            id: users.id,
            firstName: users.first_name,
            lastName: users.last_name,
            email: users.email,
          },
          dueDate: tasks.due_date,
          estimatedHours: tasks.estimated_hours,
          actualHours: tasks.actual_hours,
          tags: tasks.tags,
          createdAt: tasks.created_at,
          updatedAt: tasks.updated_at,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assignee_id, users.id))
        .where(and(...conditions))
        .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn));

      return taskList;
    }),

  // Get single task
  getById: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const task = await ctx.db
      .select({
        id: tasks.id,
        projectId: tasks.project_id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        assigneeId: tasks.assignee_id,
        assignee: {
          id: users.id,
          firstName: users.first_name,
          lastName: users.last_name,
          email: users.email,
          avatarUrl: users.avatar_url,
        },
        dueDate: tasks.due_date,
        estimatedHours: tasks.estimated_hours,
        actualHours: tasks.actual_hours,
        tags: tasks.tags,
        createdAt: tasks.created_at,
        updatedAt: tasks.updated_at,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignee_id, users.id))
      .where(eq(tasks.id, input))
      .limit(1);

    if (!task.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    return task[0];
  }),

  // Create new task
  create: protectedProcedure.input(createTaskSchema).mutation(async ({ ctx, input }) => {
    const { projectId, assigneeId, dueDate, ...taskData } = input;

    // Verify project exists and user has access
    const project = await ctx.db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

    if (!project.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Create the task
    const [newTask] = await ctx.db
      .insert(tasks)
      .values({
        project_id: projectId,
        assignee_id: assigneeId || null,
        due_date: dueDate ? new Date(dueDate) : null,
        ...taskData,
      })
      .returning();

    return newTask;
  }),

  // Update task
  update: protectedProcedure.input(updateTaskSchema).mutation(async ({ ctx, input }) => {
    const { id, assigneeId, dueDate, ...updates } = input;

    // Check task exists
    const existingTask = await ctx.db.select().from(tasks).where(eq(tasks.id, id)).limit(1);

    if (!existingTask.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    // Update the task
    const [updatedTask] = await ctx.db
      .update(tasks)
      .set({
        ...updates,
        assignee_id: assigneeId !== undefined ? assigneeId : existingTask[0].assignee_id,
        due_date:
          dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask[0].due_date,
        updated_at: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return updatedTask;
  }),

  // Update task status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["todo", "in-progress", "review", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedTask] = await ctx.db
        .update(tasks)
        .set({
          status: input.status,
          updated_at: new Date(),
        })
        .where(eq(tasks.id, input.id))
        .returning();

      if (!updatedTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      return updatedTask;
    }),

  // Delete task
  delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const [deletedTask] = await ctx.db.delete(tasks).where(eq(tasks.id, input)).returning();

    if (!deletedTask) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    return { success: true };
  }),

  // Get task statistics for a project
  getStats: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const taskList = await ctx.db
      .select({
        status: tasks.status,
        priority: tasks.priority,
        estimatedHours: tasks.estimated_hours,
        actualHours: tasks.actual_hours,
      })
      .from(tasks)
      .where(eq(tasks.project_id, input));

    const stats = {
      total: taskList.length,
      byStatus: {
        todo: taskList.filter((t: any) => t.status === "todo").length,
        in_progress: taskList.filter((t: any) => t.status === "in-progress").length,
        review: taskList.filter((t: any) => t.status === "review").length,
        completed: taskList.filter((t: any) => t.status === "completed").length,
      },
      byPriority: {
        low: taskList.filter((t: any) => t.priority === "low").length,
        medium: taskList.filter((t: any) => t.priority === "medium").length,
        high: taskList.filter((t: any) => t.priority === "high").length,
        urgent: taskList.filter((t: any) => t.priority === "urgent").length,
      },
      totalEstimatedHours: taskList.reduce(
        (sum: number, t: any) => sum + (t.estimatedHours || 0),
        0
      ),
      totalActualHours: taskList.reduce((sum: number, t: any) => sum + (t.actualHours || 0), 0),
      completionRate:
        taskList.length > 0
          ? Math.round(
              (taskList.filter((t: any) => t.status === "completed").length / taskList.length) * 100
            )
          : 0,
    };

    return stats;
  }),
});
