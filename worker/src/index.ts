/**
 * Worker Service - Background Job Processing and AI Operations
 *
 * This service handles all background processing for the consulting platform:
 * - AI-powered project insights generation
 * - Risk assessment and analysis
 * - Scheduled job processing with cron
 * - Queue management with BullMQ and Redis
 * - Health monitoring and graceful shutdown
 *
 * Key Features:
 * - Redis-based job queues for scalability
 * - AI orchestrator integration for intelligent processing
 * - Scheduled jobs for automated insights
 * - Error handling and retry mechanisms
 * - Health check endpoints for monitoring
 */

import { AIOrchestrator } from "@consulting-platform/ai";
import { syncAllRssFeeds } from "@consulting-platform/api";
import { db, engagements } from "@consulting-platform/database";
import { Queue, Worker } from "bullmq";
import { CronJob } from "cron";
import { eq, gte } from "drizzle-orm";
import { Redis } from "ioredis";
import "./health"; // Start health check server

// Redis connection configuration for BullMQ
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Parse Redis URL if provided
let redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
console.log("Original Redis URL:", redisUrl ? redisUrl.replace(/:[^:@]*@/, ":****@") : "not set");
console.log(
  "Environment variables available:",
  Object.keys(process.env).filter((k) => k.includes("REDIS"))
);

// If using Railway's internal URL, try the public URL if available
if (redisUrl.includes(".railway.internal")) {
  const publicUrl = process.env.REDIS_PUBLIC_URL || process.env.REDISHOST;
  if (publicUrl) {
    console.log("Using public Redis URL instead of internal");
    redisUrl = publicUrl;
  } else {
    console.log("Warning: Using Railway internal URL, may have connectivity issues");
    // Railway internal URLs might need IPv6 support
    console.log("Consider adding REDIS_PUBLIC_URL environment variable with the public Redis URL");
  }
}

// Create Redis connection with error handling
const redis = new Redis(redisUrl, {
  ...redisOptions,
  family: 0, // 0 = auto-detect (both IPv4 and IPv6), 4 = IPv4 only, 6 = IPv6 only
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis connection attempt ${times}, retrying in ${delay}ms...`);
    return delay;
  },
  reconnectOnError: (err) => {
    console.log("Redis reconnect on error:", err.message);
    return true;
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

// AI Orchestrator
const aiOrchestrator = new AIOrchestrator();

// Job queues with proper Redis configuration
const queueConnection = new Redis(redisUrl, {
  ...redisOptions,
  family: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
const aiInsightsQueue = new Queue("ai-insights", { connection: queueConnection });
const riskAssessmentQueue = new Queue("risk-assessment", { connection: queueConnection });

// Background job processors
const workerConnection1 = new Redis(redisUrl, {
  ...redisOptions,
  family: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
const aiInsightsWorker = new Worker(
  "ai-insights",
  async (job) => {
    const { projectId } = job.data;

    try {
      // Get project data
      const project = await db
        .select()
        .from(engagements)
        .where(eq(engagements.id, projectId))
        .limit(1);

      if (!project.length) {
        throw new Error("Project not found");
      }

      // Generate AI insights
      const insights = await aiOrchestrator.generateProjectInsights(
        projectId,
        JSON.stringify(project[0])
      );

      // Update project with insights
      await db
        .update(engagements)
        .set({
          ai_insights: {
            content: insights.content,
            model: insights.model,
            generated_at: new Date().toISOString(),
            cost_cents: insights.costCents,
          },
          updated_at: new Date(),
        })
        .where(eq(engagements.id, projectId));

      console.log(`Generated AI insights for project ${projectId}`);
    } catch (error) {
      console.error(`Failed to generate AI insights for project ${projectId}:`, error);
      throw error;
    }
  },
  {
    connection: workerConnection1,
    concurrency: 5,
  }
);

const workerConnection2 = new Redis(redisUrl, {
  ...redisOptions,
  family: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
const riskAssessmentWorker = new Worker(
  "risk-assessment",
  async (job) => {
    const { projectId } = job.data;

    try {
      // Get project data
      const project = await db
        .select()
        .from(engagements)
        .where(eq(engagements.id, projectId))
        .limit(1);

      if (!project.length) {
        throw new Error("Project not found");
      }

      // Assess project risk
      const riskAssessment = await aiOrchestrator.assessProjectRisk(
        projectId,
        JSON.stringify(project[0])
      );

      // Update project with risk assessment
      await db
        .update(engagements)
        .set({
          risk_assessment: {
            content: riskAssessment.content,
            model: riskAssessment.model,
            assessed_at: new Date().toISOString(),
            cost_cents: riskAssessment.costCents,
          },
          updated_at: new Date(),
        })
        .where(eq(engagements.id, projectId));

      console.log(`Completed risk assessment for project ${projectId}`);
    } catch (error) {
      console.error(`Failed to assess risk for project ${projectId}:`, error);
      throw error;
    }
  },
  {
    connection: workerConnection2,
    concurrency: 3,
  }
);

// Scheduled jobs
const _dailyInsightsJob = new CronJob(
  "0 9 * * *", // Run at 9 AM daily
  async () => {
    console.log("Running daily AI insights generation...");

    // Get all active projects
    const activeProjects = await db
      .select()
      .from(engagements)
      .where(eq(engagements.status, "active"));

    // Queue AI insights for each project
    for (const project of activeProjects) {
      await aiInsightsQueue.add("daily-insights", {
        projectId: project.id,
      });
    }

    console.log(`Queued AI insights for ${activeProjects.length} projects`);
  },
  null,
  true,
  "UTC"
);

// RSS Feed Sync - Now using shared function from api/lib/rss-parser
// This syncs all configured RSS feeds (General IT News, Security Advisories, Citizen Security)

// Daily RSS Feed Sync Job
console.log("[RSS SYNC] Initializing daily RSS sync cron job (8 AM UTC)...");
const dailyRssSyncJob = new CronJob(
  "0 8 * * *", // Run at 8 AM daily
  async () => {
    console.log("========================================");
    console.log("[RSS SYNC] Starting scheduled daily RSS feed sync");
    console.log(`[RSS SYNC] Timestamp: ${new Date().toISOString()}`);
    console.log("========================================");

    try {
      const startTime = Date.now();
      const results = await syncAllRssFeeds();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log("========================================");
      console.log("[RSS SYNC] Daily sync completed successfully");
      console.log(`[RSS SYNC] Total duration: ${duration} seconds`);
      console.log("[RSS SYNC] Results by feed:");

      let totalInserted = 0;
      let totalSkipped = 0;
      let totalFetched = 0;

      for (const result of results) {
        if (result.success) {
          console.log(`[RSS SYNC]   - ${result.category}:`);
          console.log(`[RSS SYNC]     • Fetched: ${result.totalFetched} articles`);
          console.log(`[RSS SYNC]     • Inserted: ${result.insertedCount} new`);
          console.log(`[RSS SYNC]     • Skipped: ${result.skippedCount} duplicates`);
          totalInserted += result.insertedCount || 0;
          totalSkipped += result.skippedCount || 0;
          totalFetched += result.totalFetched || 0;
        } else {
          console.log(`[RSS SYNC]   - ${result.category}: FAILED - ${result.error}`);
        }
      }

      console.log("[RSS SYNC] Summary:");
      console.log(`[RSS SYNC]   • Total articles fetched: ${totalFetched}`);
      console.log(`[RSS SYNC]   • Total new articles: ${totalInserted}`);
      console.log(`[RSS SYNC]   • Total duplicates skipped: ${totalSkipped}`);
      console.log("========================================\n");
    } catch (error) {
      console.error("[RSS SYNC] ❌ Daily sync failed:", error);
      console.error("========================================\n");
    }
  },
  null,
  true,
  "UTC"
);

// Run RSS sync immediately on startup for all feeds
console.log("========================================");
console.log("[RSS SYNC] Starting initial RSS feed sync on startup");
console.log(`[RSS SYNC] Timestamp: ${new Date().toISOString()}`);
console.log("========================================");

const rssStartTime = Date.now();
syncAllRssFeeds()
  .then((results: any) => {
    const duration = ((Date.now() - rssStartTime) / 1000).toFixed(2);

    console.log("========================================");
    console.log("[RSS SYNC] Initial sync completed successfully");
    console.log(`[RSS SYNC] Total duration: ${duration} seconds`);
    console.log("[RSS SYNC] Results by feed:");

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalFetched = 0;

    for (const result of results) {
      if (result.success) {
        console.log(`[RSS SYNC]   - ${result.category}:`);
        console.log(`[RSS SYNC]     • Fetched: ${result.totalFetched} articles`);
        console.log(`[RSS SYNC]     • Inserted: ${result.insertedCount} new`);
        console.log(`[RSS SYNC]     • Skipped: ${result.skippedCount} duplicates`);
        totalInserted += result.insertedCount || 0;
        totalSkipped += result.skippedCount || 0;
        totalFetched += result.totalFetched || 0;
      } else {
        console.log(`[RSS SYNC]   - ${result.category}: FAILED - ${result.error}`);
      }
    }

    console.log("[RSS SYNC] Summary:");
    console.log(`[RSS SYNC]   • Total articles fetched: ${totalFetched}`);
    console.log(`[RSS SYNC]   • Total new articles: ${totalInserted}`);
    console.log(`[RSS SYNC]   • Total duplicates skipped: ${totalSkipped}`);
    console.log("========================================\n");
  })
  .catch((error) => {
    console.error("[RSS SYNC] ❌ Initial sync failed:", error);
    console.error("========================================\n");
  });

const _weeklyRiskAssessmentJob = new CronJob(
  "0 10 * * 1", // Run at 10 AM every Monday
  async () => {
    console.log("Running weekly risk assessment...");

    // Get all active projects
    const activeProjects = await db
      .select()
      .from(engagements)
      .where(eq(engagements.status, "active"));

    // Queue risk assessment for each project
    for (const project of activeProjects) {
      await riskAssessmentQueue.add("weekly-risk-assessment", {
        projectId: project.id,
      });
    }

    console.log(`Queued risk assessment for ${activeProjects.length} projects`);
  },
  null,
  true,
  "UTC"
);

// Error handling
aiInsightsWorker.on("error", (error) => {
  console.error("AI Insights Worker error:", error);
});

riskAssessmentWorker.on("error", (error) => {
  console.error("Risk Assessment Worker error:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down workers...");
  await aiInsightsWorker.close();
  await riskAssessmentWorker.close();
  await aiInsightsQueue.close();
  await riskAssessmentQueue.close();
  await redis.quit();
  await queueConnection.quit();
  await workerConnection1.quit();
  await workerConnection2.quit();
  process.exit(0);
});

console.log("Background workers started successfully");

// Log cron job status
console.log("========================================");
console.log("[CRON JOBS] Status Report:");
console.log(`[CRON JOBS] Daily RSS Sync: ${dailyRssSyncJob.running ? "RUNNING" : "STOPPED"}`);
const nextRssSync = dailyRssSyncJob.nextDates(1);
console.log(`[CRON JOBS] Next RSS sync scheduled for: ${nextRssSync[0].toISO()} (UTC)`);
console.log(`[CRON JOBS] Current time: ${new Date().toISOString()}`);
const hoursUntilSync = Math.round((nextRssSync[0].toMillis() - Date.now()) / (1000 * 60 * 60));
console.log(`[CRON JOBS] Time until next sync: ~${hoursUntilSync} hours`);
console.log("========================================");
