import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getRecentNewsArticles, getAllNewsArticles, fetchAndStoreRSSFeed } from "../../lib/rss-parser";

export const newsRouter = createTRPCRouter({
  getRecentNews: protectedProcedure
    .input(
      z.object({
        daysBack: z.number().min(1).max(30).default(7),
      }).optional()
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