/**
 * AI Orchestrator - High-Level AI Task Management
 *
 * This class provides intelligent AI task orchestration with:
 * - Automatic model selection based on task requirements
 * - Budget management and usage tracking
 * - Cost optimization across multiple AI providers
 * - User organization-based access control
 *
 * The orchestrator acts as the main interface for AI operations,
 * abstracting away the complexity of model selection and usage tracking.
 */

import { db, users } from "@consulting-platform/database";
import { eq } from "drizzle-orm";
import { BedrockClient } from "./bedrock/client";
import type { AIResponse, AITask, ModelConfig, ModelType } from "./types";
import { UsageLimiter } from "./usage-limiter";

/**
 * AIOrchestrator - Main class for managing AI operations
 *
 * Responsibilities:
 * - Model selection based on task requirements and budget constraints
 * - Usage tracking and budget enforcement
 * - User organization management
 * - Cost optimization across different AI models
 */
export class AIOrchestrator {
  private bedrockClient: BedrockClient; // AWS Bedrock client for model invocations
  private modelConfigs: Map<ModelType, ModelConfig>; // Available model configurations
  private usageLimiter: UsageLimiter; // Budget and usage tracking

  constructor() {
    this.bedrockClient = new BedrockClient();
    this.modelConfigs = this.initializeModelConfigs();
    this.usageLimiter = new UsageLimiter();
  }

  /**
   * Process an AI task request with intelligent model selection and budget management
   *
   * This is the main entry point for AI operations. It:
   * 1. Selects the optimal model based on task requirements
   * 2. Validates user permissions and budget constraints
   * 3. Executes the AI request
   * 4. Records usage for billing and analytics
   *
   * @param task - The AI task to process
   * @returns Promise<AIResponse> - The AI model's response with metadata
   * @throws Error if budget exceeded or user not found
   */
  async processRequest(task: AITask): Promise<AIResponse> {
    // Step 1: Select the optimal model based on task requirements and budget
    const modelConfig = this.selectOptimalModel(task);
    const modelId = this.getModelId(modelConfig.model);

    // Step 2: Get user's organization for budget tracking
    const organizationId = await this.getUserOrganization(task.userId);
    if (!organizationId) {
      throw new Error("User organization not found");
    }

    // Step 3: Pre-flight budget check to avoid unnecessary API calls
    const estimatedTokens = this.usageLimiter.estimateTokens(task.prompt) + 2000; // Add buffer for response
    const budgetCheck = await this.usageLimiter.checkBudget(
      organizationId,
      modelConfig.model,
      estimatedTokens
    );

    if (!budgetCheck.allowed) {
      throw new Error(`Budget limit exceeded: ${budgetCheck.reason}`);
    }

    // Step 4: Log warning if approaching budget limit
    if (budgetCheck.stats?.isNearLimit) {
      console.warn(
        `⚠️ Organization ${organizationId} is at ${budgetCheck.stats.percentUsed.toFixed(1)}% of monthly budget`
      );
    }

    // Step 5: Execute the AI request with performance tracking
    const startTime = Date.now();
    const response = await this.bedrockClient.invokeModel(modelId, task.prompt, modelConfig);
    const latencyMs = Date.now() - startTime;

    // Step 6: Record actual usage for billing and analytics
    // Map task type to action for logging
    const actionMap: Record<
      string,
      "generate" | "summarize" | "extract" | "translate" | "analyze" | "embed"
    > = {
      quick_summary: "summarize",
      project_analysis: "analyze",
      risk_assessment: "analyze",
      technical_docs: "generate",
      realtime_assist: "generate",
      knowledge_search: "extract",
      report_generation: "generate",
      general: "generate",
    };

    await this.usageLimiter.recordUsage(
      organizationId,
      task.userId,
      task.projectId || null,
      modelConfig.model,
      task.prompt,
      response.content,
      response.tokensUsed,
      latencyMs,
      task.knowledgeId || null,
      actionMap[task.type] || "generate"
    );

    return response;
  }

  /**
   * Select the optimal AI model for a given task
   *
   * This method implements intelligent model selection based on:
   * - Task type and complexity requirements
   * - Budget constraints and cost optimization
   * - Context length requirements
   * - Model capabilities and performance characteristics
   *
   * @param task - The AI task requiring model selection
   * @returns ModelConfig - The optimal model configuration
   * @throws Error if no suitable model is found
   */
  private selectOptimalModel(task: AITask): ModelConfig {
    const { contextLength, budgetConstraint } = task;

    // Step 1: Filter models that meet basic requirements
    // - Context length must be sufficient
    // - Cost must be within budget constraints
    const candidates = Array.from(this.modelConfigs.values())
      .filter(
        (config) =>
          config.maxContextLength >= contextLength && config.costPer1MTokens <= budgetConstraint
      )
      .sort((a, b) => a.costPer1MTokens - b.costPer1MTokens); // Sort by cost (cheapest first)

    if (candidates.length === 0) {
      throw new Error("No suitable model found for task requirements");
    }

    // Step 2: Select model based on task type and specific requirements
    // Each task type has an optimal model for best results
    switch (task.type) {
      case "quick_summary":
        // Fast, cost-effective model for simple summaries
        return candidates.find((c) => c.model === "nova-lite") || candidates[0];

      case "project_analysis":
        // High-capability model for comprehensive analysis
        return candidates.find((c) => c.model === "nova-pro") || candidates[0];

      case "risk_assessment":
        // Premium model for critical risk evaluation
        return candidates.find((c) => c.model === "claude-3-7-sonnet") || candidates[0];

      case "technical_docs":
        // Model optimized for technical content
        return candidates.find((c) => c.model === "mistral-large") || candidates[0];

      case "realtime_assist":
        // Fast, lightweight model for real-time responses
        return candidates.find((c) => c.model === "llama-3-8b") || candidates[0];

      case "knowledge_search":
        // Cost-effective model for search operations
        return candidates.find((c) => c.model === "nova-lite") || candidates[0];

      case "report_generation":
        // High-quality model for formal reports
        return candidates.find((c) => c.model === "claude-3-7-sonnet") || candidates[0];

      case "general":
        // For general tasks, use cost-effective model
        return candidates.find((c) => c.model === "nova-lite") || candidates[0];

      default:
        // Fallback to cheapest available model
        return candidates[0];
    }
  }

  private getModelId(model: ModelType): string {
    const modelMap: Record<ModelType, string> = {
      "claude-3-7-sonnet": "anthropic.claude-3-5-sonnet-20241022-v2:0",
      "claude-3-5-haiku": "anthropic.claude-3-5-haiku-20241022-v1:0",
      // Nova models use EU inference profiles for API key access
      "nova-pro": "eu.amazon.nova-pro-v1:0",
      "nova-lite": "eu.amazon.nova-lite-v1:0",
      "mistral-large": "mistral.mistral-large-2407-v1:0",
      "llama-3-8b": "meta.llama-3-8b-instruct-v1:0",
      "llama-3-70b": "meta.llama-3-70b-instruct-v1:0",
    };

    return modelMap[model] || modelMap["claude-3-7-sonnet"];
  }

  private initializeModelConfigs(): Map<ModelType, ModelConfig> {
    const configs = new Map<ModelType, ModelConfig>();

    // Claude 3.7 Sonnet - Premium model for complex tasks
    configs.set("claude-3-7-sonnet", {
      model: "claude-3-7-sonnet",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 300, // $3.00
      maxContextLength: 200000,
      capabilities: ["reasoning", "analysis", "code", "writing"],
    });

    // Claude 3.5 Haiku - Fast and cost-effective
    configs.set("claude-3-5-haiku", {
      model: "claude-3-5-haiku",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 100, // $1.00
      maxContextLength: 200000,
      capabilities: ["reasoning", "analysis", "code", "writing"],
    });

    // Nova Pro - Amazon's premium model
    configs.set("nova-pro", {
      model: "nova-pro",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 80, // $0.80
      maxContextLength: 300000,
      capabilities: ["reasoning", "analysis", "code", "writing"],
    });

    // Nova Lite - Amazon's cost-effective model
    configs.set("nova-lite", {
      model: "nova-lite",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 6, // $0.06
      maxContextLength: 100000,
      capabilities: ["reasoning", "analysis", "writing"],
    });

    // Mistral Large - Good for technical content
    configs.set("mistral-large", {
      model: "mistral-large",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 200, // $2.00
      maxContextLength: 128000,
      capabilities: ["reasoning", "analysis", "code", "writing"],
    });

    // Llama 3 8B - Fast and cheap
    configs.set("llama-3-8b", {
      model: "llama-3-8b",
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 10, // $0.10
      maxContextLength: 8000,
      capabilities: ["reasoning", "writing"],
    });

    // Llama 3 70B - High capability
    configs.set("llama-3-70b", {
      model: "llama-3-70b",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 65, // $0.65
      maxContextLength: 8000,
      capabilities: ["reasoning", "analysis", "code", "writing"],
    });

    return configs;
  }

  private async getUserOrganization(userId: string): Promise<string | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      return user?.organization_id || null;
    } catch (error) {
      console.error("Error fetching user organization:", error);
      return null;
    }
  }

  // Utility methods for specific use cases
  async generateProjectInsights(projectId: string, context: string): Promise<AIResponse> {
    const task: AITask = {
      type: "project_analysis",
      prompt: `Analyze this project and provide key insights:\n\n${context}`,
      context,
      complexity: 7,
      urgency: "batch",
      accuracyRequired: "standard",
      contextLength: 4000,
      budgetConstraint: 100,
      projectId,
      userId: "system", // This would be the actual user ID
    };

    return this.processRequest(task);
  }

  async assessProjectRisk(projectId: string, projectData: string): Promise<AIResponse> {
    const task: AITask = {
      type: "risk_assessment",
      prompt: `Assess the risks for this project and provide recommendations:\n\n${projectData}`,
      context: projectData,
      complexity: 8,
      urgency: "batch",
      accuracyRequired: "critical",
      contextLength: 4000,
      budgetConstraint: 100,
      projectId,
      userId: "system",
    };

    return this.processRequest(task);
  }

  async searchKnowledge(query: string, context?: string): Promise<AIResponse> {
    const task: AITask = {
      type: "knowledge_search",
      prompt: `Search and provide relevant information for: ${query}`,
      context,
      complexity: 3,
      urgency: "realtime",
      accuracyRequired: "standard",
      contextLength: 4000,
      budgetConstraint: 100,
      userId: "system",
    };

    return this.processRequest(task);
  }

  /**
   * Execute an AI task with optional model preference
   * This is a convenience method that allows specifying a preferred model
   */
  async execute(params: {
    prompt: string;
    userId: string;
    projectId?: string;
    knowledgeId?: string;
    complexity?: number;
    urgency?: "realtime" | "batch" | "background";
    accuracyRequired?: "high" | "standard" | "low";
    contextLength?: number;
    budgetConstraint?: number;
    preferredModel?: string;
  }): Promise<AIResponse> {
    // Map broader urgency values to AITask's narrower type
    const urgency: "realtime" | "batch" = params.urgency === "realtime" ? "realtime" : "batch";

    // Map broader accuracyRequired values to AITask's narrower type
    // "high" -> "critical", "low" -> "standard", "standard" -> "standard"
    const accuracyRequired: "standard" | "critical" =
      params.accuracyRequired === "high"
        ? "critical"
        : params.accuracyRequired === "low"
          ? "standard"
          : "standard";

    const task: AITask = {
      type: params.preferredModel === "nova-lite" ? "quick_summary" : "general",
      prompt: params.prompt,
      complexity: params.complexity || 3,
      urgency,
      accuracyRequired,
      contextLength: params.contextLength || 4000,
      budgetConstraint: params.budgetConstraint || 100,
      userId: params.userId,
      projectId: params.projectId,
      knowledgeId: params.knowledgeId,
    };

    return this.processRequest(task);
  }
}
