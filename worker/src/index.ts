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

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";
import { AIOrchestrator } from "@consulting-platform/ai";
import { syncAllRssFeeds, syncFeedsByFrequency } from "@consulting-platform/api";
import { ai_interactions, db, engagements, knowledge_base } from "@consulting-platform/database";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Queue, Worker } from "bullmq";
import { CronJob } from "cron";
import { eq } from "drizzle-orm";
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
const knowledgeSummaryQueue = new Queue("knowledge-summary", { connection: queueConnection });
const embeddingQueue = new Queue("embedding-generation", { connection: queueConnection });

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

// Knowledge Summary Worker
const workerConnection3 = new Redis(redisUrl, {
  ...redisOptions,
  family: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
const knowledgeSummaryWorker = new Worker(
  "knowledge-summary",
  async (job) => {
    const { knowledgeId, userId, isBatch } = job.data;

    try {
      if (isBatch) {
        // Batch processing: generate summaries for multiple items
        const items = await db
          .select()
          .from(knowledge_base)
          .where(eq(knowledge_base.created_by, userId))
          .limit(50); // Process up to 50 items at a time

        console.log(`Starting batch summary generation for ${items.length} knowledge items`);
        let successCount = 0;
        let errorCount = 0;

        for (const item of items) {
          // Skip if summary already exists in the summary column
          if (item.summary) {
            console.log(`Skipping ${item.id} - summary already exists`);
            continue;
          }

          try {
            const response = await aiOrchestrator.execute({
              prompt: `Provide a concise summary (2-3 sentences) of the following content:\n\n${item.content}`,
              userId,
              knowledgeId: item.id,
              preferredModel: "nova-lite",
              complexity: 2,
              urgency: "batch",
              accuracyRequired: "standard",
              contextLength: 4000,
              budgetConstraint: 10,
            });

            // Update item with AI summary - save to summary column
            const existingMetadata = (item.metadata as any) || {};
            await db
              .update(knowledge_base)
              .set({
                summary: response.content, // Save summary to dedicated column
                metadata: {
                  ...existingMetadata,
                  summaryGeneratedAt: new Date().toISOString(),
                  ai_model: response.model,
                  ai_cost_cents: response.costCents,
                },
                updated_at: new Date(),
              })
              .where(eq(knowledge_base.id, item.id));

            successCount++;
            console.log(`Generated summary for knowledge item ${item.id}`);
          } catch (error) {
            errorCount++;
            console.error(`Failed to generate summary for item ${item.id}:`, error);
          }
        }

        console.log(`Batch summary complete: ${successCount} succeeded, ${errorCount} failed`);
      } else {
        // Single item processing
        const [item] = await db
          .select()
          .from(knowledge_base)
          .where(eq(knowledge_base.id, knowledgeId))
          .limit(1);

        if (!item) {
          throw new Error("Knowledge item not found");
        }

        // Generate AI summary using Nova Lite
        const response = await aiOrchestrator.execute({
          prompt: `Provide a concise summary (2-3 sentences) of the following content:\n\n${item.content}`,
          userId,
          knowledgeId,
          preferredModel: "nova-lite",
          complexity: 2,
          urgency: "batch",
          accuracyRequired: "standard",
          contextLength: 4000,
          budgetConstraint: 10,
        });

        // Update knowledge item with AI summary - save to summary column
        const existingMetadata = (item.metadata as any) || {};
        await db
          .update(knowledge_base)
          .set({
            summary: response.content, // Save summary to dedicated column
            metadata: {
              ...existingMetadata,
              summaryGeneratedAt: new Date().toISOString(),
              ai_model: response.model,
              ai_cost_cents: response.costCents,
            },
            updated_at: new Date(),
          })
          .where(eq(knowledge_base.id, knowledgeId));

        console.log(`Generated AI summary for knowledge item ${knowledgeId}`);
      }
    } catch (error) {
      console.error(`Failed to generate summary for knowledge item:`, error);
      throw error;
    }
  },
  {
    connection: workerConnection3,
    concurrency: 10, // Higher concurrency for lightweight summary tasks
  }
);

// Embedding Generation Worker
const workerConnection4 = new Redis(redisUrl, {
  ...redisOptions,
  family: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Initialize Bedrock client for embeddings
const getBedrockClient = (): BedrockRuntimeClient => {
  const region = process.env.AWS_REGION || "eu-central-1";
  const bedrockApiKey = process.env.BEDROCK_API_KEY;

  if (bedrockApiKey) {
    console.log("[Embedding Worker] Using Bedrock API key for embeddings");
    process.env.AWS_BEARER_TOKEN_BEDROCK = bedrockApiKey;
    return new BedrockRuntimeClient({
      region,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 5000,
        socketTimeout: 30000,
      }),
    });
  }

  console.log("[Embedding Worker] Using AWS IAM credentials for embeddings");
  return new BedrockRuntimeClient({
    region,
    credentials: fromEnv(),
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 5000,
      socketTimeout: 30000,
    }),
  });
};

const embeddingWorker = new Worker(
  "embedding-generation",
  async (job) => {
    const { knowledgeId, content, userId, organizationId } = job.data;
    const startTime = Date.now();

    try {
      console.log(`[Embedding Worker] Processing embedding for knowledge item ${knowledgeId}`);

      // Validate input
      if (!content || content.trim().length === 0) {
        console.warn(`[Embedding Worker] Empty content for ${knowledgeId}, using mock embedding`);
        const mockEmbedding = generateMockEmbedding();
        await updateKnowledgeEmbedding(knowledgeId, mockEmbedding);
        return { success: true, type: "mock", knowledgeId };
      }

      // Truncate text if too long
      const maxChars = 8000;
      const truncatedText = content.length > maxChars ? content.substring(0, maxChars) : content;

      if (content.length > maxChars) {
        console.warn(
          `[Embedding Worker] Text truncated from ${content.length} to ${maxChars} characters`
        );
      }

      // Generate embedding with AWS Titan
      const modelId = "amazon.titan-embed-text-v2:0";
      const client = getBedrockClient();

      const requestBody = {
        inputText: truncatedText,
        dimensions: 1536,
        normalize: true,
      };

      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(requestBody),
        contentType: "application/json",
        accept: "application/json",
      });

      console.log(`[Embedding Worker] Invoking AWS Titan for ${knowledgeId}...`);
      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const embedding = responseBody.embedding;

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Invalid embedding response from Titan");
      }

      const latencyMs = Date.now() - startTime;
      console.log(`[Embedding Worker] Generated embedding in ${latencyMs}ms`);

      // Track cost in ai_interactions
      const estimatedTokens = Math.ceil(truncatedText.length / 4);
      const costPer1MTokens = 2; // cents
      const costCents = Math.ceil((estimatedTokens / 1000000) * costPer1MTokens);

      await db.insert(ai_interactions).values({
        user_id: userId,
        organization_id: organizationId,
        knowledge_id: knowledgeId,
        model: "titan-embed-v2",
        action: "embed",
        prompt: truncatedText.substring(0, 500),
        response: `Generated ${embedding.length}D embedding (queued)`,
        tokens_used: estimatedTokens,
        cost_cents: costCents,
        latency_ms: latencyMs,
      });

      // Update knowledge item with embedding
      await updateKnowledgeEmbedding(knowledgeId, embedding);

      console.log(`[Embedding Worker] Successfully updated embedding for ${knowledgeId}`);
      return { success: true, type: "titan", knowledgeId, costCents, latencyMs };
    } catch (error) {
      console.error(`[Embedding Worker] Failed to generate embedding for ${knowledgeId}:`, error);

      // Fallback to mock embedding
      console.log(`[Embedding Worker] Using fallback mock embedding for ${knowledgeId}`);
      const mockEmbedding = generateMockEmbedding();
      await updateKnowledgeEmbedding(knowledgeId, mockEmbedding);

      return {
        success: true,
        type: "mock-fallback",
        knowledgeId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  {
    connection: workerConnection4,
    concurrency: 5, // Process up to 5 embeddings in parallel
  }
);

// Helper function to update knowledge embedding
async function updateKnowledgeEmbedding(knowledgeId: string, embedding: number[]): Promise<void> {
  await db
    .update(knowledge_base)
    .set({
      embedding: embedding as any, // Cast for JSONB
      updated_at: new Date(),
    })
    .where(eq(knowledge_base.id, knowledgeId));
}

// Helper function for mock embeddings
function generateMockEmbedding(): number[] {
  const mockEmbedding = new Array(1536).fill(0).map((_, i) => {
    const base = Math.sin(i * 0.1) * 0.3;
    const noise = (Math.random() - 0.5) * 0.2;
    return base + noise;
  });

  const magnitude = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
  return mockEmbedding.map((val) => val / magnitude);
}

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

// RSS Feed Sync - Multi-frequency scheduler (like brief360)
// Supports feeds with different fetch frequencies: 15min, 30min, 60min, 120min

// Helper function to run RSS sync for a specific frequency
async function runRssSyncForFrequency(frequencyMinutes: number, frequencyName: string) {
  console.log("========================================");
  console.log(`[RSS SYNC] Starting ${frequencyName} RSS feed sync (${frequencyMinutes} min)`);
  console.log(`[RSS SYNC] Timestamp: ${new Date().toISOString()}`);
  console.log("========================================");

  try {
    const startTime = Date.now();
    const results = await syncFeedsByFrequency(frequencyMinutes);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("========================================");
    console.log(`[RSS SYNC] ${frequencyName} sync completed successfully`);
    console.log(`[RSS SYNC] Total duration: ${duration} seconds`);
    console.log(`[RSS SYNC] Feeds processed: ${results.length}`);

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalFetched = 0;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (results.length > 0) {
      console.log("[RSS SYNC] Results:");
      for (const result of results) {
        if (result.success) {
          totalInserted += result.insertedCount || 0;
          totalSkipped += result.skippedCount || 0;
          totalFetched += result.totalFetched || 0;
        }
      }
    }

    console.log("[RSS SYNC] Summary:");
    console.log(`[RSS SYNC]   • Successful: ${successful}`);
    console.log(`[RSS SYNC]   • Failed: ${failed}`);
    console.log(`[RSS SYNC]   • Total articles fetched: ${totalFetched}`);
    console.log(`[RSS SYNC]   • New articles inserted: ${totalInserted}`);
    console.log(`[RSS SYNC]   • Duplicates skipped: ${totalSkipped}`);
    console.log("========================================\n");
  } catch (error) {
    console.error(`[RSS SYNC] ❌ ${frequencyName} sync failed:`, error);
    console.error("========================================\n");
  }
}

// Priority 1: Security feeds (15 minutes) - Critical security feeds
console.log("[RSS SYNC] Initializing 15-minute RSS sync cron job...");
const rss15MinJob = new CronJob(
  "*/15 * * * *", // Every 15 minutes
  async () => {
    await runRssSyncForFrequency(15, "15-minute");
  },
  null,
  true,
  "UTC"
);

// Priority 2: News/Business/Tech feeds (30 minutes)
console.log("[RSS SYNC] Initializing 30-minute RSS sync cron job...");
const rss30MinJob = new CronJob(
  "*/30 * * * *", // Every 30 minutes
  async () => {
    await runRssSyncForFrequency(30, "30-minute");
  },
  null,
  true,
  "UTC"
);

// Priority 3: Business/Technology feeds (60 minutes / 1 hour)
console.log("[RSS SYNC] Initializing 60-minute RSS sync cron job...");
const rss60MinJob = new CronJob(
  "0 * * * *", // Every hour
  async () => {
    await runRssSyncForFrequency(60, "60-minute");
  },
  null,
  true,
  "UTC"
);

// Priority 4: Politics/Regulation feeds (120 minutes / 2 hours)
console.log("[RSS SYNC] Initializing 120-minute RSS sync cron job...");
const rss120MinJob = new CronJob(
  "0 */2 * * *", // Every 2 hours
  async () => {
    await runRssSyncForFrequency(120, "120-minute");
  },
  null,
  true,
  "UTC"
);

// Daily full sync for legacy feeds and any feeds without specific frequency
console.log("[RSS SYNC] Initializing daily full RSS sync cron job (8 AM UTC)...");
const dailyRssSyncJob = new CronJob(
  "0 8 * * *", // Run at 8 AM daily
  async () => {
    console.log("========================================");
    console.log("[RSS SYNC] Starting scheduled daily full RSS feed sync");
    console.log(`[RSS SYNC] Timestamp: ${new Date().toISOString()}`);
    console.log("========================================");

    try {
      const startTime = Date.now();
      const results = await syncAllRssFeeds();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log("========================================");
      console.log("[RSS SYNC] Daily full sync completed successfully");
      console.log(`[RSS SYNC] Total duration: ${duration} seconds`);

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      const totalInserted = results.reduce((sum, r) => sum + (r.insertedCount || 0), 0);
      const totalSkipped = results.reduce((sum, r) => sum + (r.skippedCount || 0), 0);
      const totalFetched = results.reduce((sum, r) => sum + (r.totalFetched || 0), 0);

      console.log("[RSS SYNC] Summary:");
      console.log(`[RSS SYNC]   • Successful: ${successful}`);
      console.log(`[RSS SYNC]   • Failed: ${failed}`);
      console.log(`[RSS SYNC]   • Total articles fetched: ${totalFetched}`);
      console.log(`[RSS SYNC]   • New articles inserted: ${totalInserted}`);
      console.log(`[RSS SYNC]   • Duplicates skipped: ${totalSkipped}`);
      console.log("========================================\n");
    } catch (error) {
      console.error("[RSS SYNC] ❌ Daily full sync failed:", error);
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

knowledgeSummaryWorker.on("error", (error) => {
  console.error("Knowledge Summary Worker error:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down workers...");
  await aiInsightsWorker.close();
  await riskAssessmentWorker.close();
  await knowledgeSummaryWorker.close();
  await aiInsightsQueue.close();
  await riskAssessmentQueue.close();
  await knowledgeSummaryQueue.close();
  await redis.quit();
  await queueConnection.quit();
  await workerConnection1.quit();
  await workerConnection2.quit();
  await workerConnection3.quit();
  process.exit(0);
});

console.log("Background workers started successfully");

// Log cron job status
console.log("========================================");
console.log("[CRON JOBS] Status Report:");
console.log(`[CRON JOBS] 15-minute RSS Sync: ${rss15MinJob.running ? "RUNNING" : "STOPPED"}`);
console.log(`[CRON JOBS] 30-minute RSS Sync: ${rss30MinJob.running ? "RUNNING" : "STOPPED"}`);
console.log(`[CRON JOBS] 60-minute RSS Sync: ${rss60MinJob.running ? "RUNNING" : "STOPPED"}`);
console.log(`[CRON JOBS] 120-minute RSS Sync: ${rss120MinJob.running ? "RUNNING" : "STOPPED"}`);
console.log(`[CRON JOBS] Daily Full RSS Sync: ${dailyRssSyncJob.running ? "RUNNING" : "STOPPED"}`);

const next15Min = rss15MinJob.nextDates(1);
console.log(`[CRON JOBS] Next 15-min sync: ${next15Min[0].toISO()} (UTC)`);

const next30Min = rss30MinJob.nextDates(1);
console.log(`[CRON JOBS] Next 30-min sync: ${next30Min[0].toISO()} (UTC)`);

const nextDaily = dailyRssSyncJob.nextDates(1);
console.log(`[CRON JOBS] Next daily sync: ${nextDaily[0].toISO()} (UTC)`);
console.log(`[CRON JOBS] Current time: ${new Date().toISOString()}`);
console.log("========================================");
