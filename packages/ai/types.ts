import { z } from "zod";

export const AITaskTypeSchema = z.enum([
  "quick_summary",
  "project_analysis",
  "risk_assessment",
  "technical_docs",
  "realtime_assist",
  "knowledge_search",
  "report_generation",
]);

export const ModelTypeSchema = z.enum([
  "claude-3-7-sonnet",
  "claude-3-5-haiku",
  "nova-pro",
  "nova-lite",
  "mistral-large",
  "llama-3-8b",
  "llama-3-70b",
]);

export const AITaskSchema = z.object({
  type: AITaskTypeSchema,
  prompt: z.string(),
  context: z.string().optional(),
  complexity: z.number().min(1).max(10).default(5),
  urgency: z.enum(["realtime", "batch"]).default("batch"),
  accuracyRequired: z.enum(["standard", "critical"]).default("standard"),
  contextLength: z.number().default(4000),
  budgetConstraint: z.number().default(100), // cents
  projectId: z.string().optional(),
  userId: z.string(),
});

export const AIResponseSchema = z.object({
  content: z.string(),
  model: ModelTypeSchema,
  tokensUsed: z.number(),
  costCents: z.number(),
  latencyMs: z.number(),
  metadata: z.record(z.any()).optional(),
});

export const ModelConfigSchema = z.object({
  model: ModelTypeSchema,
  maxTokens: z.number().default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(0.9),
  costPer1MTokens: z.number(), // in cents
  maxContextLength: z.number(),
  capabilities: z.array(z.string()),
});

export type AITask = z.infer<typeof AITaskSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type AITaskType = z.infer<typeof AITaskTypeSchema>;
export type ModelType = z.infer<typeof ModelTypeSchema>;
