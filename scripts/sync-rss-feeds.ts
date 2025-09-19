#!/usr/bin/env tsx

import { syncAllRssFeeds } from "../packages/api/lib/rss-parser";

async function main() {
  console.log("🔄 Starting RSS feed sync...\n");

  try {
    // Option 1: Sync all feeds at once
    console.log("📡 Syncing all configured RSS feeds...");
    const results = await syncAllRssFeeds();

    console.log("\n📊 Sync Results:");
    for (const result of results) {
      console.log(`\n📌 Category: ${result.category}`);
      if (result.success) {
        console.log(`  ✅ Success`);
        console.log(`  📥 Inserted: ${result.insertedCount} articles`);
        console.log(`  ⏭️  Skipped: ${result.skippedCount} articles (already exist)`);
        console.log(`  📄 Total fetched: ${result.totalFetched} articles`);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }

    // Option 2: Sync feeds individually (uncomment if needed)
    // for (const [category, config] of Object.entries(RSS_FEED_CATEGORIES)) {
    //   console.log(`\n📡 Syncing ${config.name}...`);
    //   const result = await fetchAndStoreRSSFeed(category as any);
    //   if (result.success) {
    //     console.log(`  ✅ Inserted: ${result.insertedCount}, Skipped: ${result.skippedCount}`);
    //   } else {
    //     console.log(`  ❌ Error: ${result.error}`);
    //   }
    // }

    console.log("\n✨ RSS feed sync completed!");
  } catch (error) {
    console.error("❌ Error syncing RSS feeds:", error);
    process.exit(1);
  }
}

main().catch(console.error);
