import { db, news_articles } from "@consulting-platform/database";
import { and, desc, eq, gte } from "drizzle-orm";
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
  },
  security: {
    name: "Security Advisories",
    url: "https://wid.cert-bund.de/content/public/securityAdvisory/rss",
    description: "Security vulnerabilities and advisories from CERT-Bund",
  },
  citizen: {
    name: "Citizen Security",
    url: "https://wid.cert-bund.de/content/public/buergercert/rss",
    description: "Security information for citizens from CERT-Bund",
  },
} as const;

export type FeedCategory = keyof typeof RSS_FEED_CATEGORIES;

// Configuration for RSS feed fetching
const RSS_FEED_CONFIG = {
  maxArticlesPerFeed: 500, // Maximum number of articles to process per feed
};

export async function fetchAndStoreRSSFeed(feedCategory: FeedCategory = "general") {
  const feedConfig = RSS_FEED_CATEGORIES[feedCategory];
  const feedUrl = feedConfig.url;
  try {
    console.log(`Fetching RSS feed from: ${feedUrl}`);

    const feed = await parser.parseURL(feedUrl);
    const articles = [];

    // Limit the number of articles to process
    const itemsToProcess = feed.items.slice(0, RSS_FEED_CONFIG.maxArticlesPerFeed);
    console.log(`Processing ${itemsToProcess.length} of ${feed.items.length} articles from feed`);

    for (const item of itemsToProcess) {
      // Extract image URL from various possible sources
      let imageUrl = null;
      let thumbnailUrl = null;

      // Check for media content
      if ((item as any).mediaContent) {
        const mediaContent = (item as any).mediaContent;
        if (mediaContent.$ && mediaContent.$.url) {
          imageUrl = mediaContent.$.url;
        }
      }

      // Check for media thumbnail
      if ((item as any).mediaThumbnail) {
        const mediaThumbnail = (item as any).mediaThumbnail;
        if (mediaThumbnail.$ && mediaThumbnail.$.url) {
          thumbnailUrl = mediaThumbnail.$.url;
        }
      }

      // Check for enclosure (common for images)
      if ((item as any).enclosure && (item as any).enclosure.url) {
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

      articles.push(articleData);
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

    console.log(`RSS feed sync completed. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);

    return {
      success: true,
      insertedCount,
      skippedCount,
      totalFetched: articles.length,
    };
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
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
      .orderBy(desc(news_articles.published_at));
    return articles as NewsArticle[];
  } else {
    const articles = await db
      .select()
      .from(news_articles)
      .orderBy(desc(news_articles.published_at));
    return articles as NewsArticle[];
  }
}

// Sync all configured RSS feeds
export async function syncAllRssFeeds() {
  const results = [];
  const categories = Object.keys(RSS_FEED_CATEGORIES) as FeedCategory[];
  console.log(`Starting sync of ${categories.length} RSS feeds: ${categories.join(", ")}`);

  for (const category of categories) {
    console.log(`Syncing feed category: ${category}`);
    const result = await fetchAndStoreRSSFeed(category);
    results.push({ category, ...result });
  }

  console.log(`Completed sync of ${results.length} RSS feeds`);
  return results;
}
