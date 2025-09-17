import Parser from "rss-parser";
import { db, news_articles } from "@consulting-platform/database";
import { eq, desc, and, gte } from "drizzle-orm";

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

export async function fetchAndStoreRSSFeed(feedUrl: string = "https://rss.the-morpheus.news/rss/high_rating") {
  try {
    console.log(`Fetching RSS feed from: ${feedUrl}`);

    const feed = await parser.parseURL(feedUrl);
    const articles = [];

    for (const item of feed.items) {
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

export async function getRecentNewsArticles(daysBack: number = 7): Promise<NewsArticle[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const articles = await db
    .select()
    .from(news_articles)
    .where(gte(news_articles.published_at, cutoffDate))
    .orderBy(desc(news_articles.published_at));

  return articles as NewsArticle[];
}

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  const articles = await db
    .select()
    .from(news_articles)
    .orderBy(desc(news_articles.published_at));

  return articles as NewsArticle[];
}