import { z } from "zod";
import {
  type FeedCategory,
  fetchAndStoreRSSFeed,
  getAllNewsArticles,
  getRecentNewsArticles,
  RSS_FEED_CATEGORIES,
  syncAllRssFeeds,
} from "../../lib/rss-parser";
import { protectedProcedure, router } from "../trpc";

export const newsRouter = router({
  getRecentNews: protectedProcedure
    .input(
      z
        .object({
          daysBack: z.number().min(1).max(30).default(7),
          category: z
            .enum(["general", "security", "citizen", "all"] as const)
            .optional()
            .default("all"),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const daysBack = input?.daysBack || 7;
      const category = input?.category || "all";

      if (category === "all") {
        return await getRecentNewsArticles(daysBack);
      }
      return await getRecentNewsArticles(daysBack, category as FeedCategory);
    }),

  getAllNews: protectedProcedure
    .input(
      z
        .object({
          category: z
            .enum(["general", "security", "citizen", "all"] as const)
            .optional()
            .default("all"),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const category = input?.category || "all";

      if (category === "all") {
        return await getAllNewsArticles();
      }
      return await getAllNewsArticles(category as FeedCategory);
    }),

  syncRssFeed: protectedProcedure
    .input(
      z
        .object({
          category: z
            .enum(["general", "security", "citizen", "all"] as const)
            .optional()
            .default("all"),
        })
        .optional()
    )
    .mutation(async ({ input }) => {
      const category = input?.category || "all";

      if (category === "all") {
        return await syncAllRssFeeds();
      }
      return await fetchAndStoreRSSFeed(category as FeedCategory);
    }),

  getFeedCategories: protectedProcedure.query(async () => {
    return Object.entries(RSS_FEED_CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      url: value.url,
    }));
  }),
});
