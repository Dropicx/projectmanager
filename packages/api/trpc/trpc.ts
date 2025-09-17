import { AIOrchestrator } from "@consulting-platform/ai";
import { db } from "@consulting-platform/database";
import { initTRPC, TRPCError } from "@trpc/server";

// Create AI orchestrator instance
const aiOrchestrator = new AIOrchestrator();

// Context type
export interface Context {
  user?: {
    id: string;
    email: string;
    organizationId: string;
  };
  db: typeof db;
  ai: AIOrchestrator;
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Context creator
export const createContext = (): Context => ({
  db,
  ai: aiOrchestrator,
});

// Middleware for authentication
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(authMiddleware) as any;
