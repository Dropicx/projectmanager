import { router } from './trpc'
import { projectsRouter } from './routers/projects'
import { aiRouter } from './routers/ai'
import { tasksRouter } from './routers/tasks'
import { usageRouter } from './routers/usage'

export const appRouter = router({
  projects: projectsRouter,
  ai: aiRouter,
  tasks: tasksRouter,
  usage: usageRouter
})

export type AppRouter = typeof appRouter
