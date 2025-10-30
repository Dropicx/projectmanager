import { db, feed_health } from "@consulting-platform/database";
import { desc, eq } from "drizzle-orm";

const ALERT_THRESHOLD = parseInt(process.env.FEED_ALERT_THRESHOLD || "3", 10);

export async function checkAlerts(): Promise<void> {
  const rows = await db.select().from(feed_health).orderBy(desc(feed_health.updated_at));

  for (const row of rows) {
    if (row.health_status === "disabled") {
      console.warn(
        `[ALERT] Feed ${row.feed_key} is DISABLED${row.auto_disabled_at ? ` (auto-disabled at ${row.auto_disabled_at.toISOString()})` : ""}`
      );
      continue;
    }

    if ((row.consecutive_failures ?? 0) >= ALERT_THRESHOLD) {
      console.warn(
        `[ALERT] Feed ${row.feed_key} has ${row.consecutive_failures} consecutive failures. Last error: ${row.last_error || "n/a"}`
      );
    }
  }
}

export async function getCriticalFeeds(): Promise<string[]> {
  const rows = await db.select().from(feed_health).where(eq(feed_health.health_status, "failing"));
  return rows.map((r) => r.feed_key);
}
