import { db, news_articles } from "@consulting-platform/database";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import Parser from "rss-parser";
import {
  BRIEF360_FEEDS,
  type FeedConfig as Brief360FeedConfig,
  type Brief360FeedKey,
} from "./brief360-feeds";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

// RSSHub configuration
const RSSHUB_URL = process.env.RSSHUB_URL || "https://rsshub.app";
const RSSHUB_SELF_HOSTED = process.env.RSSHUB_SELF_HOSTED === "true";
const USE_SELF_HOSTED_RSSHUB = RSSHUB_SELF_HOSTED && process.env.RSSHUB_URL;

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  link: string;
  image_url: string | null;
  thumbnail_url: string | null;
  author: string | null;
  categories: string[];
  tags: string[];
  source: string;
  guid: string | null;
  published_at: Date;
  fetched_at: Date;
  metadata: Record<string, any>;
}

export interface FeedConfig {
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  feed_type?: "rss" | "rsshub" | "api";
  fetch_frequency_minutes?: number;
  category?: string;
}

// Original RSS Feed Categories Configuration (legacy)
export const RSS_FEED_CATEGORIES = {
  general: {
    name: "General IT News",
    url: "https://rss.the-morpheus.news/rss/high_rating",
    description: "Global IT news from governments, companies, and releases",
    enabled: true,
    feed_type: "rss" as const,
    fetch_frequency_minutes: 1440, // Daily
    category: "general",
  },
  security: {
    name: "Security Advisories",
    url: "https://wid.cert-bund.de/content/public/securityAdvisory/rss",
    description: "Security vulnerabilities and advisories from CERT-Bund",
    enabled: true,
    feed_type: "rss" as const,
    fetch_frequency_minutes: 1440, // Daily
    category: "security",
  },
  citizen: {
    name: "Citizen Security",
    url: "https://wid.cert-bund.de/content/public/buergercert/rss",
    description: "Security information for citizens from CERT-Bund",
    enabled: true,
    feed_type: "rss" as const,
    fetch_frequency_minutes: 1440, // Daily
    category: "security",
  },
} as const;

export type FeedCategory = keyof typeof RSS_FEED_CATEGORIES;

// Get all feeds (legacy + brief360)
export function getAllFeeds(): Map<string, FeedConfig> {
  const feeds = new Map<string, FeedConfig>();

  // Add legacy feeds
  for (const [key, config] of Object.entries(RSS_FEED_CATEGORIES)) {
    feeds.set(key, config as FeedConfig);
  }

  // Add brief360 feeds if enabled
  if (process.env.RSS_ENABLE_BRIEF360_FEEDS !== "false") {
    for (const [key, config] of Object.entries(BRIEF360_FEEDS)) {
      feeds.set(key, config);
    }
  }

  return feeds;
}

// Helper to convert RSSHub URLs to use self-hosted instance if configured
function normalizeRSSHubUrl(url: string): string {
  if (url.startsWith("https://rsshub.app/") && USE_SELF_HOSTED_RSSHUB) {
    const path = url.replace("https://rsshub.app/", "");
    return `${RSSHUB_URL}/${path}`;
  }
  return url;
}

// Configuration for RSS feed fetching
const RSS_FEED_CONFIG = {
  maxArticlesPerFeed: 500, // Maximum number of articles to process per feed
  maxArticleAgeInDays: 365, // Maximum age of articles to keep (1 year)
};

// Overloaded function signature
export async function fetchAndStoreRSSFeed(feedKey: string | FeedCategory): Promise<{
  success: boolean;
  insertedCount: number;
  skippedCount: number;
  totalFetched: number;
  error?: string;
  category?: string;
}> {
  const allFeeds = getAllFeeds();
  let feedConfig: FeedConfig | undefined;
  let feedKeyUsed: string;

  // Try to find feed in all feeds
  if (allFeeds.has(feedKey)) {
    feedConfig = allFeeds.get(feedKey)!;
    feedKeyUsed = feedKey;
  } else if (feedKey in RSS_FEED_CATEGORIES) {
    // Legacy category support
    feedConfig = RSS_FEED_CATEGORIES[feedKey as FeedCategory] as FeedConfig;
    feedKeyUsed = feedKey;
  } else {
    return {
      success: false,
      error: `Feed not found: ${feedKey}`,
      insertedCount: 0,
      skippedCount: 0,
      totalFetched: 0,
      category: feedKey,
    };
  }

  // Check if feed is enabled
  if (!feedConfig.enabled) {
    console.log(`[RSS Parser] ⛔ Feed disabled: ${feedKeyUsed}`);
    console.log(`[RSS Parser]   Reason: Temporarily disabled for maintenance`);
    return {
      success: false,
      error: "Feed is temporarily disabled",
      insertedCount: 0,
      skippedCount: 0,
      totalFetched: 0,
      category: feedKeyUsed,
    };
  }

  // Normalize URL (handle RSSHub routing)
  let feedUrl = feedConfig.url;
  if (feedConfig.feed_type === "rsshub") {
    feedUrl = normalizeRSSHubUrl(feedUrl);
  }

  try {
    console.log(`[RSS Parser] Fetching feed: ${feedKeyUsed}`);
    console.log(`[RSS Parser]   Name: ${feedConfig.name}`);
    console.log(`[RSS Parser]   URL: ${feedUrl}`);
    console.log(`[RSS Parser]   Type: ${feedConfig.feed_type || "rss"}`);
    console.log(`[RSS Parser]   Description: ${feedConfig.description}`);

    const fetchStart = Date.now();
    let feed: any;

    try {
      // Try to fetch without retry logic first
      console.log(`[RSS Parser]   Fetching feed...`);

      // Add timeout and better error handling
      const timeout = parseInt(process.env.RSS_FETCH_TIMEOUT_MS || "30000", 10);
      feed = (await Promise.race([
        parser.parseURL(feedUrl),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Feed fetch timeout after ${timeout}ms`)), timeout)
        ),
      ])) as any;
    } catch (parseError) {
      // If parsing fails, log detailed error and return gracefully
      console.error(`[RSS Parser] ⚠️ Failed to parse feed: ${feedKeyUsed}`);
      console.error(`[RSS Parser]   Error details: ${(parseError as Error).message}`);
      return {
        success: false,
        error: `Feed parsing failed: ${(parseError as Error).message.substring(0, 200)}`,
        insertedCount: 0,
        skippedCount: 0,
        totalFetched: 0,
        category: feedKeyUsed,
      };
    }

    const fetchDuration = ((Date.now() - fetchStart) / 1000).toFixed(2);

    const articles = [];

    // Validate feed has items
    if (!feed || !feed.items || !Array.isArray(feed.items)) {
      console.log(`[RSS Parser] ⚠️ Feed has no valid items for ${feedKeyUsed}`);
      return {
        success: false,
        error: "Feed contains no valid items",
        insertedCount: 0,
        skippedCount: 0,
        totalFetched: 0,
        category: feedKeyUsed,
      };
    }

    // Limit the number of articles to process
    const itemsToProcess = feed.items.slice(0, RSS_FEED_CONFIG.maxArticlesPerFeed);
    console.log(`[RSS Parser]   Feed fetched in ${fetchDuration}s`);
    console.log(`[RSS Parser]   Total articles in feed: ${feed.items.length}`);
    console.log(
      `[RSS Parser]   Articles to process: ${itemsToProcess.length} (limit: ${RSS_FEED_CONFIG.maxArticlesPerFeed})`
    );

    for (const item of itemsToProcess) {
      try {
        // Extract image URL from various possible sources
        let imageUrl = null;
        let thumbnailUrl = null;

        // Check for media content
        if ((item as any).mediaContent) {
          const mediaContent = (item as any).mediaContent;
          if (mediaContent.$?.url) {
            imageUrl = mediaContent.$.url;
          }
        }

        // Check for media thumbnail
        if ((item as any).mediaThumbnail) {
          const mediaThumbnail = (item as any).mediaThumbnail;
          if (mediaThumbnail.$?.url) {
            thumbnailUrl = mediaThumbnail.$.url;
          }
        }

        // Check for enclosure (common for images)
        if ((item as any).enclosure?.url) {
          if (!imageUrl) {
            imageUrl = (item as any).enclosure.url;
          }
        }

        // Extract content
        const content = (item as any).contentEncoded || item.content || item.contentSnippet || null;

        // Prepare article data
        // Ensure arrays are proper arrays, not strings or other types
        let categories: string[] = [];
        if (Array.isArray(item.categories)) {
          categories = item.categories;
        } else if (item.categories && typeof item.categories === "string") {
          categories = [item.categories];
        }

        const articleData = {
          title: item.title || "Untitled",
          description: item.contentSnippet || item.content || null,
          content: content,
          link: item.link || "",
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          author: item.creator || null,
          categories: categories,
          tags: [] as string[],
          source: feedUrl,
          guid: item.guid || item.link || null,
          published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
          metadata: {
            feed_title: feed.title,
            feed_description: feed.description,
            feed_category: feedKeyUsed,
            feed_category_name: feedConfig.name,
            feed_type: feedConfig.feed_type || "rss",
            feed_source_category: feedConfig.category || feedKeyUsed,
          },
        };

        // Validate required fields
        if (!articleData.link || !articleData.title) {
          console.log(
            `[RSS Parser]   Skipping invalid article: missing link or title for "${articleData.title?.substring(
              0,
              50
            )}"`
          );
          continue;
        }

        // Sanitize and limit text fields
        articleData.title = articleData.title.substring(0, 500);
        if (articleData.description) {
          articleData.description = articleData.description.substring(0, 2000);
        }
        if (articleData.content) {
          articleData.content = articleData.content.substring(0, 10000);
        }

        articles.push(articleData);
      } catch (itemError) {
        console.log(
          `[RSS Parser]   Error processing item: ${(itemError as Error).message.substring(0, 100)}`
        );
      }
    }

    // Insert articles into database, handling duplicates
    let insertedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      try {
        // Check if article already exists by link
        const existing = await db
          .select()
          .from(news_articles)
          .where(eq(news_articles.link, article.link))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(news_articles).values(article);
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error inserting article: ${article.title}`, error);
      }
    }

    console.log(`[RSS Parser]   Database operations completed`);
    console.log(`[RSS Parser]     • New articles inserted: ${insertedCount}`);
    console.log(`[RSS Parser]     • Duplicate articles skipped: ${skippedCount}`);
    console.log(`[RSS Parser]   Feed sync completed for: ${feedKeyUsed}`);

    return {
      success: true,
      insertedCount,
      skippedCount,
      totalFetched: articles.length,
      category: feedKeyUsed,
    };
  } catch (error) {
    console.error(`[RSS Parser] ❌ Unexpected error for ${feedKeyUsed}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      insertedCount: 0,
      skippedCount: 0,
      totalFetched: 0,
      category: feedKeyUsed,
    };
  }
}

export async function getRecentNewsArticles(
  daysBack: number = 7,
  feedCategory?: FeedCategory
): Promise<NewsArticle[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Build the where clause
  let whereClause: any;
  if (feedCategory) {
    const feedUrl = RSS_FEED_CATEGORIES[feedCategory].url;
    whereClause = and(
      gte(news_articles.published_at, cutoffDate),
      eq(news_articles.source, feedUrl)
    );
  } else {
    whereClause = gte(news_articles.published_at, cutoffDate);
  }

  const articles = await db
    .select()
    .from(news_articles)
    .where(whereClause)
    .orderBy(desc(news_articles.published_at))
    .limit(1000); // Reasonable limit for UI display

  return articles as NewsArticle[];
}

export async function getAllNewsArticles(feedCategory?: FeedCategory): Promise<NewsArticle[]> {
  // Build query with optional where clause
  if (feedCategory) {
    const feedUrl = RSS_FEED_CATEGORIES[feedCategory].url;
    const articles = await db
      .select()
      .from(news_articles)
      .where(eq(news_articles.source, feedUrl))
      .orderBy(desc(news_articles.published_at))
      .limit(1000); // Reasonable limit for UI display
    return articles as NewsArticle[];
  } else {
    const articles = await db
      .select()
      .from(news_articles)
      .orderBy(desc(news_articles.published_at))
      .limit(1000); // Reasonable limit for UI display
    return articles as NewsArticle[];
  }
}

// Clean up old articles from the database
export async function cleanupOldArticles(): Promise<{ deletedCount: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RSS_FEED_CONFIG.maxArticleAgeInDays);

  try {
    console.log(`[RSS Cleanup] Checking for articles older than ${cutoffDate.toISOString()}`);
    console.log(`[RSS Cleanup] Retention policy: ${RSS_FEED_CONFIG.maxArticleAgeInDays} days`);

    // Get count of articles to delete for logging
    const articlesToDelete = await db
      .select({ id: news_articles.id })
      .from(news_articles)
      .where(lt(news_articles.published_at, cutoffDate));

    const deletedCount = articlesToDelete.length;

    if (deletedCount > 0) {
      console.log(`[RSS Cleanup] Found ${deletedCount} articles to delete`);
      // Delete old articles
      await db.delete(news_articles).where(lt(news_articles.published_at, cutoffDate));

      console.log(`[RSS Cleanup] ✅ Successfully deleted ${deletedCount} articles`);
    } else {
      console.log(
        "[RSS Cleanup] No old articles to clean up - database is within retention period"
      );
    }

    return { deletedCount };
  } catch (error) {
    console.error("[RSS Cleanup] ❌ Error cleaning up old articles:", error);
    return { deletedCount: 0 };
  }
}

// Batch processing helper
async function processFeedsInBatches(
  feeds: Array<{ key: string; config: FeedConfig }>,
  batchSize: number = 10
): Promise<
  Array<{
    category: string;
    success: boolean;
    insertedCount: number;
    skippedCount: number;
    totalFetched: number;
    error?: string;
  }>
> {
  const results: Array<{
    category: string;
    success: boolean;
    insertedCount: number;
    skippedCount: number;
    totalFetched: number;
    error?: string;
  }> = [];
  const enabledFeeds = feeds.filter(({ config }) => config.enabled);

  console.log(
    `[RSS Sync] Processing ${enabledFeeds.length} enabled feeds in batches of ${batchSize}`
  );

  // Process feeds in batches
  for (let i = 0; i < enabledFeeds.length; i += batchSize) {
    const batch = enabledFeeds.slice(i, i + batchSize);
    console.log(
      `[RSS Sync] Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} feeds)...`
    );

    // Process batch concurrently with limit
    const batchResults = await Promise.all(
      batch.map(async ({ key, config }) => {
        try {
          const result = await fetchAndStoreRSSFeed(key);
          return { category: key, ...result };
        } catch (error) {
          console.error(`[RSS Sync] Error processing feed ${key}:`, error);
          return {
            category: key,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            insertedCount: 0,
            skippedCount: 0,
            totalFetched: 0,
          };
        }
      })
    );

    results.push(...batchResults);

    // Small delay between batches to avoid overwhelming feeds
    if (i + batchSize < enabledFeeds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Sync all configured RSS feeds (legacy + brief360)
export async function syncAllRssFeeds() {
  const allFeeds = getAllFeeds();
  const feedEntries = Array.from(allFeeds.entries()).map(([key, config]) => ({ key, config }));

  const enabledFeeds = feedEntries.filter(({ config }) => config.enabled);
  const disabledFeeds = feedEntries.filter(({ config }) => !config.enabled);

  console.log(`[RSS Sync] Starting sync of ${enabledFeeds.length} enabled RSS feeds`);
  console.log(`[RSS Sync] Total feeds: ${feedEntries.length}`);
  console.log(`[RSS Sync] Enabled: ${enabledFeeds.length}`);
  if (disabledFeeds.length > 0) {
    console.log(`[RSS Sync] Disabled: ${disabledFeeds.length}`);
  }
  console.log(`[RSS Sync] Max articles per feed: ${RSS_FEED_CONFIG.maxArticlesPerFeed}`);
  console.log(`[RSS Sync] Article retention period: ${RSS_FEED_CONFIG.maxArticleAgeInDays} days`);

  // Get batch size from env or default
  const batchSize = parseInt(process.env.RSS_MAX_CONCURRENT_FEEDS || "10", 10);

  // Process feeds in batches
  const results = await processFeedsInBatches(feedEntries, batchSize);

  // Clean up old articles after syncing
  console.log(`[RSS Sync] Starting database cleanup...`);
  const cleanupStart = Date.now();
  const cleanupResult = await cleanupOldArticles();
  const cleanupDuration = ((Date.now() - cleanupStart) / 1000).toFixed(2);
  console.log(`[RSS Sync] Cleanup completed in ${cleanupDuration}s`);
  console.log(`[RSS Sync]   • Articles deleted: ${cleanupResult.deletedCount}`);
  console.log(
    `[RSS Sync]   • Cutoff date: Articles older than ${RSS_FEED_CONFIG.maxArticleAgeInDays} days`
  );

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalInserted = results.reduce((sum, r) => sum + (r.insertedCount || 0), 0);
  const totalSkipped = results.reduce((sum, r) => sum + (r.skippedCount || 0), 0);
  const totalFetched = results.reduce((sum, r) => sum + (r.totalFetched || 0), 0);

  console.log(`[RSS Sync] ====== Summary ======`);
  console.log(`[RSS Sync]   • Successful: ${successful}`);
  console.log(`[RSS Sync]   • Failed: ${failed}`);
  console.log(`[RSS Sync]   • Total articles fetched: ${totalFetched}`);
  console.log(`[RSS Sync]   • New articles inserted: ${totalInserted}`);
  console.log(`[RSS Sync]   • Duplicates skipped: ${totalSkipped}`);
  console.log(`[RSS Sync] All feeds synced successfully`);

  return results;
}

// Sync feeds by frequency (for cron scheduling)
export async function syncFeedsByFrequency(frequencyMinutes: number) {
  const allFeeds = getAllFeeds();
  const feedEntries = Array.from(allFeeds.entries())
    .map(([key, config]) => ({ key, config }))
    .filter(({ config }) => {
      const feedFreq = config.fetch_frequency_minutes || 1440; // Default to daily
      return config.enabled && feedFreq === frequencyMinutes;
    });

  console.log(
    `[RSS Sync] Syncing ${feedEntries.length} feeds with frequency ${frequencyMinutes} minutes`
  );

  const batchSize = parseInt(process.env.RSS_MAX_CONCURRENT_FEEDS || "10", 10);
  return await processFeedsInBatches(feedEntries, batchSize);
}
