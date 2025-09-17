/**
 * AI Types - Comprehensive Type Definitions for AI Operations
 * 
 * This file defines all TypeScript types and Zod schemas for AI operations
 * in the consulting platform. It provides type safety and validation for:
 * - AI task definitions and requirements
 * - Model configurations and capabilities
 * - AI responses and metadata
 * - Usage tracking and analytics
 */

import { z } from "zod";

/**
 * AI Task Types - Defines the different types of AI tasks the system can handle
 * Each task type has specific characteristics and optimal model selection criteria
 */
export const AITaskTypeSchema = z.enum([
  "quick_summary",      // Fast, low-cost summaries for quick insights
  "project_analysis",   // Comprehensive project analysis and recommendations
  "risk_assessment",    // Critical risk evaluation requiring high accuracy
  "technical_docs",     // Technical documentation generation and analysis
  "realtime_assist",    // Real-time assistance requiring low latency
  "knowledge_search",   // Semantic search through knowledge base
  "report_generation",  // Formal report generation with structured output
]);

/**
 * Supported AI Models - Available models from various providers
 * Models are selected based on task requirements, cost, and performance
 */
export const ModelTypeSchema = z.enum([
  "claude-3-7-sonnet",  // Anthropic's premium model for complex reasoning
  "claude-3-5-haiku",   // Anthropic's fast, cost-effective model
  "nova-pro",           // Amazon's premium model with large context
  "nova-lite",          // Amazon's cost-effective model for simple tasks
  "mistral-large",      // Mistral's model for technical content
  "llama-3-8b",         // Meta's fast, lightweight model
  "llama-3-70b",        // Meta's high-capability model
]);

/**
 * AI Task Schema - Defines the structure of an AI task request
 * Includes all parameters needed for model selection and execution
 */
export const AITaskSchema = z.object({
  type: AITaskTypeSchema,                    // Type of AI task to perform
  prompt: z.string(),                        // The actual prompt/query
  context: z.string().optional(),            // Additional context for the task
  complexity: z.number().min(1).max(10).default(5),  // Task complexity (1-10 scale)
  urgency: z.enum(["realtime", "batch"]).default("batch"),  // Execution urgency
  accuracyRequired: z.enum(["standard", "critical"]).default("standard"),  // Accuracy requirements
  contextLength: z.number().default(4000),   // Expected context length in tokens
  budgetConstraint: z.number().default(100), // Maximum cost in cents
  projectId: z.string().optional(),          // Associated project ID
  userId: z.string(),                        // User making the request
});

/**
 * AI Response Schema - Defines the structure of AI model responses
 * Includes performance metrics and cost tracking
 */
export const AIResponseSchema = z.object({
  content: z.string(),                       // The generated content
  model: ModelTypeSchema,                    // Model used for generation
  tokensUsed: z.number(),                    // Total tokens consumed
  costCents: z.number(),                     // Cost in cents
  latencyMs: z.number(),                     // Response time in milliseconds
  metadata: z.record(z.any()).optional(),    // Additional metadata
});

/**
 * Model Configuration Schema - Defines model parameters and capabilities
 * Used for model selection and configuration management
 */
export const ModelConfigSchema = z.object({
  model: ModelTypeSchema,                    // Model identifier
  maxTokens: z.number().default(4096),       // Maximum tokens per request
  temperature: z.number().min(0).max(2).default(0.7),  // Creativity/randomness (0-2)
  topP: z.number().min(0).max(1).default(0.9),  // Nucleus sampling parameter
  costPer1MTokens: z.number(),              // Cost per 1M tokens in cents
  maxContextLength: z.number(),             // Maximum context length supported
  capabilities: z.array(z.string()),        // Model capabilities (e.g., "reasoning", "code")
});

// TypeScript type exports for use throughout the application
export type AITask = z.infer<typeof AITaskSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type AITaskType = z.infer<typeof AITaskTypeSchema>;
export type ModelType = z.infer<typeof ModelTypeSchema>;
