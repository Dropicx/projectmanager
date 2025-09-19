/**
 * Queue Client - BullMQ Queue Interface for API
 *
 * This module provides a client interface to interact with BullMQ queues
 * from the API layer. It allows enqueueing jobs that will be processed
 * by the worker service asynchronously.
 */

import { Queue } from "bullmq";
import { Redis } from "ioredis";

// Redis connection configuration
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Parse Redis URL from environment
let redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// If using Railway's internal URL, try the public URL if available
if (redisUrl.includes(".railway.internal")) {
  const publicUrl = process.env.REDIS_PUBLIC_URL || process.env.REDISHOST;
  if (publicUrl) {
    console.log("[Queue Client] Using public Redis URL instead of internal");
    redisUrl = publicUrl;
  }
}

// Create Redis connection for queues
const queueConnection = new Redis(redisUrl, {
  ...redisOptions,
  family: 0, // Auto-detect IPv4/IPv6
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

queueConnection.on("error", (err) => {
  console.error("[Queue Client] Redis connection error:", err.message);
});

queueConnection.on("connect", () => {
  console.log("[Queue Client] Successfully connected to Redis");
});

// Initialize queues
export const knowledgeSummaryQueue = new Queue("knowledge-summary", {
  connection: queueConnection,
});

/**
 * Enqueue a single knowledge summary generation job
 */
export async function enqueueSummaryGeneration(knowledgeId: string, userId: string): Promise<void> {
  await knowledgeSummaryQueue.add(
    "generate-summary",
    {
      knowledgeId,
      userId,
      isBatch: false,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );

  console.log(`[Queue Client] Enqueued summary generation for knowledge item ${knowledgeId}`);
}

/**
 * Enqueue a batch summary generation job for multiple items
 */
export async function enqueueBatchSummaryGeneration(userId: string): Promise<void> {
  await knowledgeSummaryQueue.add(
    "generate-batch-summaries",
    {
      userId,
      isBatch: true,
    },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );

  console.log(`[Queue Client] Enqueued batch summary generation for user ${userId}`);
}

/**
 * Get queue status and job counts
 */
export async function getQueueStatus() {
  const jobCounts = await knowledgeSummaryQueue.getJobCounts();
  const isPaused = await knowledgeSummaryQueue.isPaused();

  return {
    name: "knowledge-summary",
    isPaused,
    jobCounts,
  };
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await knowledgeSummaryQueue.close();
  await queueConnection.quit();
});
