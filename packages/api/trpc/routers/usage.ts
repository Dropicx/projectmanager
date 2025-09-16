import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { UsageLimiter } from '@consulting-platform/ai'
import { TRPCError } from '@trpc/server'

export const usageRouter = createTRPCRouter({
  /**
   * Get current usage statistics for the user's organization
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const organizationId = ctx.session.user.organizationId

      if (!organizationId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User is not part of an organization'
        })
      }

      const limiter = new UsageLimiter()
      const stats = await limiter.getUsageStats(organizationId)

      return {
        usage: {
          monthly: {
            used: stats.monthlyUsed,
            limit: stats.monthlyLimit,
            percentUsed: stats.percentUsed
          },
          daily: {
            used: stats.dailyUsed,
            limit: stats.dailyLimit,
            percentUsed: (stats.dailyUsed / stats.dailyLimit) * 100
          }
        },
        isNearLimit: stats.isNearLimit,
        formattedUsage: {
          monthly: `$${(stats.monthlyUsed / 100).toFixed(2)} / $${(stats.monthlyLimit / 100).toFixed(2)}`,
          daily: `$${(stats.dailyUsed / 100).toFixed(2)} / $${(stats.dailyLimit / 100).toFixed(2)}`
        }
      }
    }),

  /**
   * Update budget limits (admin only)
   */
  updateLimits: protectedProcedure
    .input(z.object({
      monthlyBudgetUSD: z.number().min(10).max(10000).optional(),
      dailyLimitUSD: z.number().min(1).max(1000).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId

      if (!organizationId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User is not part of an organization'
        })
      }

      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only administrators can update budget limits'
        })
      }

      const limiter = new UsageLimiter()

      await limiter.updateBudgetLimits(
        organizationId,
        input.monthlyBudgetUSD ? input.monthlyBudgetUSD * 100 : undefined,
        input.dailyLimitUSD ? input.dailyLimitUSD * 100 : undefined
      )

      return { success: true }
    })
})