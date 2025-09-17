import { z } from "zod";
import {
  fetchAndStoreRSSFeed,
  getAllNewsArticles,
  getRecentNewsArticles,
} from "../../lib/rss-parser";
import { protectedProcedure, router } from "../trpc";

export const newsRouter = router({
  getRecentNews: protectedProcedure
    .input(
      z
        .object({
          daysBack: z.number().min(1).max(30).default(7),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const daysBack = input?.daysBack || 7;
      const articles = await getRecentNewsArticles(daysBack);
      return articles;
    }),

  getAllNews: protectedProcedure.query(async () => {
    const articles = await getAllNewsArticles();
    return articles;
  }),

  syncRssFeed: protectedProcedure.mutation(async () => {
    const result = await fetchAndStoreRSSFeed();
    return result;
  }),
});
