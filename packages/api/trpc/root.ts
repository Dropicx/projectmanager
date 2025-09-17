import { aiRouter } from "./routers/ai";
import { knowledgeRouter } from "./routers/knowledge";
import { newsRouter } from "./routers/news";
import { projectsRouter } from "./routers/projects";
import { tasksRouter } from "./routers/tasks";
import { usageRouter } from "./routers/usage";
import { router } from "./trpc";

export const appRouter = router({
  projects: projectsRouter,
  ai: aiRouter,
  tasks: tasksRouter,
  usage: usageRouter,
  knowledge: knowledgeRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
