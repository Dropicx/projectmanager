import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { db } from '@consulting-platform/database'
import { AIOrchestrator } from '@consulting-platform/ai'

// Initialize tRPC
const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

// Context type
export interface Context {
  user?: {
    id: string
    email: string
    organizationId: string
  }
  db: typeof db
  ai: AIOrchestrator
}

// Middleware for authentication
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Unauthorized')
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  })
})

export const protectedProcedure = t.procedure.use(authMiddleware)
