/**
 * AI Package - Main Entry Point
 * 
 * This package provides AI capabilities for the consulting platform, including:
 * - AWS Bedrock integration for various AI models
 * - AI task orchestration and model selection
 * - Usage tracking and budget management
 * - Type definitions for AI operations
 * 
 * Key Components:
 * - BedrockClient: Direct interface to AWS Bedrock models
 * - AIOrchestrator: High-level AI task management and model selection
 * - UsageLimiter: Budget tracking and usage analytics
 * - Types: Comprehensive TypeScript definitions for AI operations
 */

// Export the main AI client for AWS Bedrock integration
export { BedrockClient } from "./bedrock/client";

// Export the high-level AI orchestrator for task management
export { AIOrchestrator } from "./orchestrator";

// Export all type definitions for AI operations
export * from "./types";

// Export usage tracking types and utilities
export type { UsageStats } from "./usage-limiter";
export { UsageLimiter } from "./usage-limiter";
