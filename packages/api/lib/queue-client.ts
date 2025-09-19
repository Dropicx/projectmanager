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

export const embeddingQueue = new Queue("embedding-generation", {
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
 * Enqueue embedding generation job
 */
export async function enqueueEmbeddingGeneration(
  knowledgeId: string,
  content: string,
  userId: string,
  organizationId: string,
  options?: {
    priority?: number;
    delay?: number;
  }
): Promise<void> {
  await embeddingQueue.add(
    "generate-embedding",
    {
      knowledgeId,
      content,
      userId,
      organizationId,
      timestamp: new Date().toISOString(),
    },
    {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    }
  );

  console.log(`[Queue Client] Enqueued embedding generation for knowledge item ${knowledgeId}`);
}

/**
 * Enqueue batch embedding generation for multiple knowledge items
 */
export async function enqueueBatchEmbeddingGeneration(
  items: Array<{ knowledgeId: string; content: string }>,
  userId: string,
  organizationId: string
): Promise<void> {
  const jobs = items.map((item) => ({
    name: "generate-embedding",
    data: {
      knowledgeId: item.knowledgeId,
      content: item.content,
      userId,
      organizationId,
      timestamp: new Date().toISOString(),
    },
    opts: {
      attempts: 3,
      backoff: {
        type: "exponential" as const,
        delay: 2000,
      },
    },
  }));

  await embeddingQueue.addBulk(jobs);

  console.log(`[Queue Client] Enqueued batch embedding generation for ${items.length} items`);
}

/**
 * Get queue status and job counts
 */
export async function getQueueStatus() {
  const [summaryJobCounts, embeddingJobCounts] = await Promise.all([
    knowledgeSummaryQueue.getJobCounts(),
    embeddingQueue.getJobCounts(),
  ]);

  const [summaryPaused, embeddingPaused] = await Promise.all([
    knowledgeSummaryQueue.isPaused(),
    embeddingQueue.isPaused(),
  ]);

  return {
    queues: [
      {
        name: "knowledge-summary",
        isPaused: summaryPaused,
        jobCounts: summaryJobCounts,
      },
      {
        name: "embedding-generation",
        isPaused: embeddingPaused,
        jobCounts: embeddingJobCounts,
      },
    ],
  };
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await knowledgeSummaryQueue.close();
  await embeddingQueue.close();
  await queueConnection.quit();
});
