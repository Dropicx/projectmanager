var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSS_FEED_CATEGORIES = void 0;
exports.fetchAndStoreRSSFeed = fetchAndStoreRSSFeed;
exports.getRecentNewsArticles = getRecentNewsArticles;
exports.getAllNewsArticles = getAllNewsArticles;
exports.syncAllRssFeeds = syncAllRssFeeds;
const database_1 = require("@consulting-platform/database");
const drizzle_orm_1 = require("drizzle-orm");
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});
// RSS Feed Categories Configuration
exports.RSS_FEED_CATEGORIES = {
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
};
async function fetchAndStoreRSSFeed(feedCategory = "general") {
  const feedConfig = exports.RSS_FEED_CATEGORIES[feedCategory];
  const feedUrl = feedConfig.url;
  try {
    console.log(`Fetching RSS feed from: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl);
    const articles = [];
    for (const item of feed.items) {
      // Extract image URL from various possible sources
      let imageUrl = null;
      let thumbnailUrl = null;
      // Check for media content
      if (item.mediaContent) {
        const mediaContent = item.mediaContent;
        if (mediaContent.$?.url) {
          imageUrl = mediaContent.$.url;
        }
      }
      // Check for media thumbnail
      if (item.mediaThumbnail) {
        const mediaThumbnail = item.mediaThumbnail;
        if (mediaThumbnail.$?.url) {
          thumbnailUrl = mediaThumbnail.$.url;
        }
      }
      // Check for enclosure (common for images)
      if (item.enclosure?.url) {
        if (!imageUrl) {
          imageUrl = item.enclosure.url;
        }
      }
      // Extract content
      const content = item.contentEncoded || item.content || item.contentSnippet || null;
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
        const existing = await database_1.db
          .select()
          .from(database_1.news_articles)
          .where((0, drizzle_orm_1.eq)(database_1.news_articles.link, article.link))
          .limit(1);
        if (existing.length === 0) {
          await database_1.db.insert(database_1.news_articles).values(article);
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
async function getRecentNewsArticles(daysBack = 7, feedCategory) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  // Build the where clause
  let whereClause;
  if (feedCategory) {
    const feedUrl = exports.RSS_FEED_CATEGORIES[feedCategory].url;
    whereClause = (0, drizzle_orm_1.and)(
      (0, drizzle_orm_1.gte)(database_1.news_articles.published_at, cutoffDate),
      (0, drizzle_orm_1.eq)(database_1.news_articles.source, feedUrl)
    );
  } else {
    whereClause = (0, drizzle_orm_1.gte)(database_1.news_articles.published_at, cutoffDate);
  }
  const articles = await database_1.db
    .select()
    .from(database_1.news_articles)
    .where(whereClause)
    .orderBy((0, drizzle_orm_1.desc)(database_1.news_articles.published_at));
  return articles;
}
async function getAllNewsArticles(feedCategory) {
  // Build query with optional where clause
  if (feedCategory) {
    const feedUrl = exports.RSS_FEED_CATEGORIES[feedCategory].url;
    const articles = await database_1.db
      .select()
      .from(database_1.news_articles)
      .where((0, drizzle_orm_1.eq)(database_1.news_articles.source, feedUrl))
      .orderBy((0, drizzle_orm_1.desc)(database_1.news_articles.published_at));
    return articles;
  } else {
    const articles = await database_1.db
      .select()
      .from(database_1.news_articles)
      .orderBy((0, drizzle_orm_1.desc)(database_1.news_articles.published_at));
    return articles;
  }
}
// Sync all configured RSS feeds
async function syncAllRssFeeds() {
  const results = [];
  for (const category of Object.keys(exports.RSS_FEED_CATEGORIES)) {
    const result = await fetchAndStoreRSSFeed(category);
    results.push({ category, ...result });
  }
  return results;
}
//# sourceMappingURL=rss-parser.js.map
