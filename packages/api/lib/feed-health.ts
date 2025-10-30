import { db, feed_health, feed_metrics } from "@consulting-platform/database";
import { and, desc, eq, gte } from "drizzle-orm";

export type HealthStatus = "healthy" | "degraded" | "failing" | "disabled";

const AUTO_DISABLE_THRESHOLD = parseInt(process.env.FEED_AUTO_DISABLE_THRESHOLD || "10", 10);

export async function ensureFeedHealthRecordsExist(feedKeys: string[]): Promise<void> {
  const uniqueKeys = Array.from(new Set(feedKeys));
  if (uniqueKeys.length === 0) return;

  // Bulk insert with UPSERT semantics to avoid unique constraint violations
  const rows = uniqueKeys.map((key) => ({
    feed_key: key,
    health_status: "healthy" as HealthStatus,
  }));

  // Prefer explicit target for PostgreSQL
  // Drizzle PG supports onConflictDoNothing({ target })
  // Optional chaining keeps backward compatibility if the helper isn't present
  await (db.insert(feed_health).values(rows) as any).onConflictDoNothing?.({
    target: feed_health.feed_key,
  });
}

export async function isFeedDisabled(feedKey: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(feed_health)
    .where(eq(feed_health.feed_key, feedKey))
    .limit(1);
  return rows.length > 0 && rows[0].health_status === "disabled";
}

export async function recordFeedMetric(params: {
  feedKey: string;
  success: boolean;
  durationMs?: number;
  articlesFetched?: number;
  articlesInserted?: number;
  articlesSkipped?: number;
  errorMessage?: string;
  errorType?: string;
}): Promise<void> {
  const {
    feedKey,
    success,
    durationMs = 0,
    articlesFetched = 0,
    articlesInserted = 0,
    articlesSkipped = 0,
    errorMessage,
    errorType,
  } = params;

  await db.insert(feed_metrics).values({
    feed_key: feedKey,
    success,
    duration_ms: durationMs,
    articles_fetched: articlesFetched,
    articles_inserted: articlesInserted,
    articles_skipped: articlesSkipped,
    error_message: errorMessage,
    error_type: errorType,
  });
}

export async function updateFeedHealthAfterResult(params: {
  feedKey: string;
  success: boolean;
  errorMessage?: string;
}): Promise<void> {
  const { feedKey, success, errorMessage } = params;
  const [row] = await db
    .select()
    .from(feed_health)
    .where(eq(feed_health.feed_key, feedKey))
    .limit(1);

  if (!row) {
    await db.insert(feed_health).values({ feed_key: feedKey, health_status: "healthy" });
  }

  if (success) {
    await db
      .update(feed_health)
      .set({
        consecutive_failures: 0,
        last_successful_fetch: new Date(),
        last_error: null,
        last_error_at: null,
        updated_at: new Date(),
      })
      .where(eq(feed_health.feed_key, feedKey));
  } else {
    const currentFailures = row?.consecutive_failures || 0;
    const newFailures = currentFailures + 1;
    const shouldAutoDisable = newFailures >= AUTO_DISABLE_THRESHOLD;

    await db
      .update(feed_health)
      .set({
        consecutive_failures: newFailures,
        last_error: errorMessage?.substring(0, 500) || "Unknown error",
        last_error_at: new Date(),
        health_status: shouldAutoDisable
          ? ("disabled" as HealthStatus)
          : row?.health_status || ("failing" as HealthStatus),
        auto_disabled_at: shouldAutoDisable ? new Date() : (row?.auto_disabled_at ?? null),
        updated_at: new Date(),
      })
      .where(eq(feed_health.feed_key, feedKey));
  }

  // Recalculate success rates (24h, 7d)
  await recalculateSuccessRates(feedKey);
}

export async function recalculateSuccessRates(feedKey: string): Promise<void> {
  const now = new Date();
  const d24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const d7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const metrics24h = await db
    .select()
    .from(feed_metrics)
    .where(and(eq(feed_metrics.feed_key, feedKey), gte(feed_metrics.fetch_timestamp, d24h)));

  const metrics7d = await db
    .select()
    .from(feed_metrics)
    .where(and(eq(feed_metrics.feed_key, feedKey), gte(feed_metrics.fetch_timestamp, d7d)));

  const successRate = (metrics: Array<{ success: boolean }>) => {
    if (metrics.length === 0) return 100;
    const successCount = metrics.filter((m) => m.success).length;
    return Math.round((successCount / metrics.length) * 100);
  };

  const sr24 = successRate(metrics24h);
  const sr7d = successRate(metrics7d);

  // Update health status based on success rates
  let newStatus: HealthStatus = "healthy";
  if (sr24 < 30 || sr7d < 50) newStatus = "failing";
  else if (sr24 < 70 || sr7d < 80) newStatus = "degraded";

  await db
    .update(feed_health)
    .set({
      success_rate_24h: sr24,
      success_rate_7d: sr7d,
      health_status: newStatus,
      updated_at: new Date(),
    })
    .where(eq(feed_health.feed_key, feedKey));
}

export async function getAllFeedHealth() {
  return await db.select().from(feed_health).orderBy(desc(feed_health.updated_at));
}

export async function getFeedMetrics(feedKey: string, since?: Date) {
  if (since) {
    return await db
      .select()
      .from(feed_metrics)
      .where(and(eq(feed_metrics.feed_key, feedKey), gte(feed_metrics.fetch_timestamp, since)))
      .orderBy(desc(feed_metrics.fetch_timestamp));
  }
  return await db
    .select()
    .from(feed_metrics)
    .where(eq(feed_metrics.feed_key, feedKey))
    .orderBy(desc(feed_metrics.fetch_timestamp));
}

export async function updateFeedStatus(feedKey: string, status: HealthStatus): Promise<void> {
  await db
    .update(feed_health)
    .set({
      health_status: status,
      updated_at: new Date(),
      auto_disabled_at: status === "disabled" ? new Date() : null,
    })
    .where(eq(feed_health.feed_key, feedKey));
}

export async function getFeedHealthSummary() {
  const all = await getAllFeedHealth();
  const summary = { healthy: 0, degraded: 0, failing: 0, disabled: 0 } as Record<
    HealthStatus,
    number
  >;
  for (const r of all) {
    summary[r.health_status as HealthStatus] = (summary[r.health_status as HealthStatus] || 0) + 1;
  }
  return summary;
}
