import { router } from './trpc'
import { projectsRouter } from './routers/projects'
import { aiRouter } from './routers/ai'

export const appRouter = router({
  projects: projectsRouter,
  ai: aiRouter
})

export type AppRouter = typeof appRouter
