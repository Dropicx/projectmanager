import { db, news_articles } from "@consulting-platform/database";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import Parser from "rss-parser";

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

// RSS Feed Categories Configuration
export const RSS_FEED_CATEGORIES = {
  general: {
    name: "General IT News",
    url: "https://rss.the-morpheus.news/rss/high_rating",
    description: "Global IT news from governments, companies, and releases",
    enabled: true,
  },
  security: {
    name: "Security Advisories",
    url: "https://wid.cert-bund.de/content/public/securityAdvisory/rss",
    description: "Security vulnerabilities and advisories from CERT-Bund",
    enabled: true,
  },
  citizen: {
    name: "Citizen Security",
    url: "https://wid.cert-bund.de/content/public/buergercert/rss",
    description: "Security information for citizens from CERT-Bund",
    enabled: true,
  },
} as const;

export type FeedCategory = keyof typeof RSS_FEED_CATEGORIES;

// Configuration for RSS feed fetching
const RSS_FEED_CONFIG = {
  maxArticlesPerFeed: 500, // Maximum number of articles to process per feed
  maxArticleAgeInDays: 365, // Maximum age of articles to keep (1 year)
};

export async function fetchAndStoreRSSFeed(feedCategory: FeedCategory = "general") {
  const feedConfig = RSS_FEED_CATEGORIES[feedCategory];
  const feedUrl = feedConfig.url;

  // Check if feed is enabled
  if (!feedConfig.enabled) {
    console.log(`[RSS Parser] ⛔ Feed disabled: ${feedCategory}`);
    console.log(`[RSS Parser]   Reason: Temporarily disabled for maintenance`);
    return {
      success: false,
      error: "Feed is temporarily disabled",
      insertedCount: 0,
      skippedCount: 0,
      totalFetched: 0,
    };
  }

  try {
    console.log(`[RSS Parser] Fetching feed: ${feedCategory}`);
    console.log(`[RSS Parser]   URL: ${feedUrl}`);
    console.log(`[RSS Parser]   Description: ${feedConfig.description}`);

    const fetchStart = Date.now();
    let feed: any;

    try {
      // Try to fetch without retry logic first
      console.log(`[RSS Parser]   Fetching feed...`);
      feed = await parser.parseURL(feedUrl);
    } catch (parseError) {
      // If parsing fails, log detailed error and return gracefully
      console.error(`[RSS Parser] ⚠️ Failed to parse feed: ${feedCategory}`);
      console.error(`[RSS Parser]   Error details: ${(parseError as Error).message}`);
      return {
        success: false,
        error: `Feed parsing failed: ${(parseError as Error).message.substring(0, 200)}`,
        insertedCount: 0,
        skippedCount: 0,
        totalFetched: 0,
      };
    }

    const fetchDuration = ((Date.now() - fetchStart) / 1000).toFixed(2);

    const articles = [];

    // Validate feed has items
    if (!feed || !feed.items || !Array.isArray(feed.items)) {
      console.log(`[RSS Parser] ⚠️ Feed has no valid items for ${feedCategory}`);
      return {
        success: false,
        error: "Feed contains no valid items",
        insertedCount: 0,
        skippedCount: 0,
        totalFetched: 0,
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
        const articleData = {
          title: item.title || "Untitled",
          description: item.contentSnippet || item.content || null,
          content: content,
          link: item.link || "",
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          author: item.creator || null,
          categories: item.categories || [],
          tags: [],
          source: feedUrl,
          guid: item.guid || item.link || null,
          published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
          metadata: {
            feed_title: feed.title,
            feed_description: feed.description,
            feed_category: feedCategory,
            feed_category_name: feedConfig.name,
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
    console.log(`[RSS Parser]   Feed sync completed for: ${feedCategory}`);

    return {
      success: true,
      insertedCount,
      skippedCount,
      totalFetched: articles.length,
    };
  } catch (error) {
    console.error(`[RSS Parser] ❌ Unexpected error for ${feedCategory}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      insertedCount: 0,
      skippedCount: 0,
      totalFetched: 0,
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

// Sync all configured RSS feeds
export async function syncAllRssFeeds() {
  const results = [];
  const categories = Object.keys(RSS_FEED_CATEGORIES) as FeedCategory[];
  const enabledCategories = categories.filter((cat) => RSS_FEED_CATEGORIES[cat].enabled);
  const disabledCategories = categories.filter((cat) => !RSS_FEED_CATEGORIES[cat].enabled);

  console.log(`[RSS Sync] Starting sync of ${enabledCategories.length} enabled RSS feeds`);
  console.log(`[RSS Sync] Enabled categories: ${enabledCategories.join(", ") || "none"}`);
  if (disabledCategories.length > 0) {
    console.log(`[RSS Sync] Disabled categories: ${disabledCategories.join(", ")}`);
  }
  console.log(`[RSS Sync] Max articles per feed: ${RSS_FEED_CONFIG.maxArticlesPerFeed}`);
  console.log(`[RSS Sync] Article retention period: ${RSS_FEED_CONFIG.maxArticleAgeInDays} days`);

  for (const category of categories) {
    console.log(`[RSS Sync] Processing category: ${category}`);
    const result = await fetchAndStoreRSSFeed(category);
    results.push({ category, ...result });
  }

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

  console.log(`[RSS Sync] All feeds synced successfully`);
  return results;
}
