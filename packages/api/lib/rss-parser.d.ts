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
export declare const RSS_FEED_CATEGORIES: {
  readonly general: {
    readonly name: "General IT News";
    readonly url: "https://rss.the-morpheus.news/rss/high_rating";
    readonly description: "Global IT news from governments, companies, and releases";
  };
  readonly security: {
    readonly name: "Security Advisories";
    readonly url: "https://wid.cert-bund.de/content/public/securityAdvisory/rss";
    readonly description: "Security vulnerabilities and advisories from CERT-Bund";
  };
  readonly citizen: {
    readonly name: "Citizen Security";
    readonly url: "https://wid.cert-bund.de/content/public/buergercert/rss";
    readonly description: "Security information for citizens from CERT-Bund";
  };
};
export type FeedCategory = keyof typeof RSS_FEED_CATEGORIES;
export declare function fetchAndStoreRSSFeed(feedCategory?: FeedCategory): Promise<
  | {
      success: boolean;
      insertedCount: number;
      skippedCount: number;
      totalFetched: number;
      error?: undefined;
    }
  | {
      success: boolean;
      error: string;
      insertedCount?: undefined;
      skippedCount?: undefined;
      totalFetched?: undefined;
    }
>;
export declare function getRecentNewsArticles(
  daysBack?: number,
  feedCategory?: FeedCategory
): Promise<NewsArticle[]>;
export declare function getAllNewsArticles(feedCategory?: FeedCategory): Promise<NewsArticle[]>;
export declare function syncAllRssFeeds(): Promise<
  (
    | {
        success: boolean;
        insertedCount: number;
        skippedCount: number;
        totalFetched: number;
        error?: undefined;
        category: "general" | "security" | "citizen";
      }
    | {
        success: boolean;
        error: string;
        insertedCount?: undefined;
        skippedCount?: undefined;
        totalFetched?: undefined;
        category: "general" | "security" | "citizen";
      }
  )[]
>;
//# sourceMappingURL=rss-parser.d.ts.map
