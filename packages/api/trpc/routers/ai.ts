import { AITaskTypeSchema } from "@consulting-platform/ai";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const aiRouter = router({
  // Process AI request
  processRequest: protectedProcedure
    .input(
      z.object({
        type: AITaskTypeSchema,
        prompt: z.string().min(1),
        context: z.string().optional(),
        complexity: z.number().min(1).max(10).optional(),
        urgency: z.enum(["realtime", "batch"]).optional(),
        accuracyRequired: z.enum(["standard", "critical"]).optional(),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.ai.processRequest({
        type: input.type,
        prompt: input.prompt,
        context: input.context,
        complexity: input.complexity || 5,
        urgency: input.urgency || "batch",
        accuracyRequired: input.accuracyRequired || "standard",
        contextLength: 4000,
        budgetConstraint: 100,
        projectId: input.projectId,
        userId: ctx.user.id,
      });

      return response;
    }),

  // Generate project insights
  generateInsights: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.ai.generateProjectInsights(
        input.projectId,
        "Generate comprehensive project insights including progress, risks, and recommendations."
      );

      return response;
    }),

  // Assess project risk
  assessRisk: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.ai.assessProjectRisk(
        input.projectId,
        "Assess project risks and provide mitigation strategies."
      );

      return response;
    }),

  // Search knowledge base
  searchKnowledge: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.ai.searchKnowledge(input.query, input.context);

      return response;
    }),
});
