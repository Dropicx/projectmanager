import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { projects, project_members, tasks } from '@consulting-platform/database'
import { eq, and, desc } from 'drizzle-orm'

export const projectsRouter = router({
  // Get all projects for user's organization
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userProjects = await ctx.db
      .select()
      .from(projects)
      .where(eq(projects.organization_id, ctx.user.organizationId))
      .orderBy(desc(projects.created_at))

    return userProjects
  }),

  // Get project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, input.id),
            eq(projects.organization_id, ctx.user.organizationId)
          )
        )
        .limit(1)

      if (!project.length) {
        throw new Error('Project not found')
      }

      return project[0]
    }),

  // Create new project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        budget: z.number().optional(),
        timeline: z.record(z.any()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newProject] = await ctx.db
        .insert(projects)
        .values({
          organization_id: ctx.user.organizationId,
          name: input.name,
          description: input.description,
          budget: input.budget,
          timeline: input.timeline,
          status: 'planning'
        })
        .returning()

      // Add creator as project owner
      await ctx.db.insert(project_members).values({
        project_id: newProject.id,
        user_id: ctx.user.id,
        role: 'owner'
      })

      return newProject
    }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional(),
        budget: z.number().optional(),
        timeline: z.record(z.any()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const [updatedProject] = await ctx.db
        .update(projects)
        .set({
          ...updateData,
          updated_at: new Date()
        })
        .where(
          and(
            eq(projects.id, id),
            eq(projects.organization_id, ctx.user.organizationId)
          )
        )
        .returning()

      if (!updatedProject) {
        throw new Error('Project not found')
      }

      return updatedProject
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedProject = await ctx.db
        .delete(projects)
        .where(
          and(
            eq(projects.id, input.id),
            eq(projects.organization_id, ctx.user.organizationId)
          )
        )
        .returning()

      if (!deletedProject.length) {
        throw new Error('Project not found')
      }

      return { success: true }
    }),

  // Get project tasks
  getTasks: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const projectTasks = await ctx.db
        .select()
        .from(tasks)
        .where(eq(tasks.project_id, input.projectId))
        .orderBy(desc(tasks.created_at))

      return projectTasks
    }),

  // Get project insights from AI
  getInsights: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, input.projectId),
            eq(projects.organization_id, ctx.user.organizationId)
          )
        )
        .limit(1)

      if (!project.length) {
        throw new Error('Project not found')
      }

      const projectData = {
        name: project[0].name,
        description: project[0].description,
        status: project[0].status,
        budget: project[0].budget,
        timeline: project[0].timeline
      }

      const insights = await ctx.ai.generateProjectInsights(
        input.projectId,
        JSON.stringify(projectData)
      )

      return {
        insights: insights.content,
        model: insights.model,
        costCents: insights.costCents
      }
    })
})
