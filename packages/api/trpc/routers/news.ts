import { z } from "zod";
import {
  getAllFeedHealth,
  getFeedHealthSummary,
  getFeedMetrics,
  type HealthStatus,
  updateFeedStatus,
} from "../../lib/feed-health";
import {
  type FeedCategory,
  fetchAndStoreRSSFeed,
  getAllFeeds,
  getAllNewsArticles,
  getRecentNewsArticles,
  syncAllRssFeeds,
} from "../../lib/rss-parser";
import { protectedProcedure, router } from "../trpc";

export const newsRouter = router({
  getRecentNews: protectedProcedure
    .input(
      z
        .object({
          daysBack: z.number().min(1).max(30).default(7),
          category: z.string().optional().default("all"), // Support any category now
          limit: z.number().min(1).max(1000).optional().default(1000),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const daysBack = input?.daysBack || 7;
      const category = input?.category || "all";
      const limit = input?.limit || 1000;

      if (category === "all") {
        const articles = await getRecentNewsArticles(daysBack);
        return articles.slice(0, limit);
      }

      // Support both legacy and new categories
      const articles = await getRecentNewsArticles(daysBack, category as FeedCategory);
      return articles.slice(0, limit);
    }),

  getAllNews: protectedProcedure
    .input(
      z
        .object({
          category: z.string().optional().default("all"), // Support any category
          limit: z.number().min(1).max(1000).optional().default(1000),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const category = input?.category || "all";
      const limit = input?.limit || 1000;

      if (category === "all") {
        const articles = await getAllNewsArticles();
        return articles.slice(0, limit);
      }

      // Support both legacy and new categories
      const articles = await getAllNewsArticles(category as FeedCategory);
      return articles.slice(0, limit);
    }),

  syncRssFeed: protectedProcedure
    .input(
      z
        .object({
          category: z.string().optional().default("all"), // Support any category
        })
        .optional()
    )
    .mutation(async ({ input }) => {
      const category = input?.category || "all";

      if (category === "all") {
        return await syncAllRssFeeds();
      }

      // Support both legacy and new feed keys
      return await fetchAndStoreRSSFeed(category);
    }),

  getFeedCategories: protectedProcedure.query(async () => {
    const allFeeds = getAllFeeds();
    const feeds = Array.from(allFeeds.entries()).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      url: value.url,
      enabled: value.enabled,
      feed_type: value.feed_type || "rss",
      fetch_frequency_minutes: value.fetch_frequency_minutes,
      category: value.category,
    }));

    // Group by category
    const byCategory = feeds.reduce(
      (acc, feed) => {
        const cat = feed.category || "general";
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(feed);
        return acc;
      },
      {} as Record<string, typeof feeds>
    );

    return {
      feeds,
      byCategory,
      total: feeds.length,
      enabled: feeds.filter((f) => f.enabled).length,
    };
  }),

  // Monitoring endpoints
  getFeedHealth: protectedProcedure
    .input(
      z
        .object({
          feedKey: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const all = await getAllFeedHealth();
      if (input?.feedKey) {
        return all.filter((f) => f.feed_key === input.feedKey);
      }
      return all;
    }),

  getFeedMetrics: protectedProcedure
    .input(
      z
        .object({
          feedKey: z.string(),
          sinceDays: z.number().min(1).max(30).optional(),
        })
        .required()
    )
    .query(async ({ input }) => {
      const since = input.sinceDays
        ? new Date(Date.now() - input.sinceDays * 24 * 60 * 60 * 1000)
        : undefined;
      return await getFeedMetrics(input.feedKey, since);
    }),

  getFeedHealthSummary: protectedProcedure.query(async () => {
    return await getFeedHealthSummary();
  }),

  updateFeedStatus: protectedProcedure
    .input(
      z
        .object({
          feedKey: z.string(),
          status: z.enum(["healthy", "degraded", "failing", "disabled"]),
        })
        .required()
    )
    .mutation(async ({ input }) => {
      await updateFeedStatus(input.feedKey, input.status as HealthStatus);
      return { success: true };
    }),
});
