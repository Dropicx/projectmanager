import { router } from './trpc'
import { projectsRouter } from './routers/projects'
import { aiRouter } from './routers/ai'
import { tasksRouter } from './routers/tasks'

export const appRouter = router({
  projects: projectsRouter,
  ai: aiRouter,
  tasks: tasksRouter
})

export type AppRouter = typeof appRouter
