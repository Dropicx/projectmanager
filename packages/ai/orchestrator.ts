import { BedrockClient } from './bedrock/client'
import { AITask, AIResponse, ModelConfig, ModelType, AITaskType } from './types'
import { UsageLimiter } from './usage-limiter'
import { db } from '@consulting-platform/database'
import { users } from '@consulting-platform/database/schema'
import { eq } from 'drizzle-orm'

export class AIOrchestrator {
  private bedrockClient: BedrockClient
  private modelConfigs: Map<ModelType, ModelConfig>
  private usageLimiter: UsageLimiter

  constructor() {
    this.bedrockClient = new BedrockClient()
    this.modelConfigs = this.initializeModelConfigs()
    this.usageLimiter = new UsageLimiter()
  }

  async processRequest(task: AITask): Promise<AIResponse> {
    const modelConfig = this.selectOptimalModel(task)
    const modelId = this.getModelId(modelConfig.model)

    // Get user's organization
    const organizationId = await this.getUserOrganization(task.userId)
    if (!organizationId) {
      throw new Error('User organization not found')
    }

    // Check budget before making API call
    const estimatedTokens = this.usageLimiter.estimateTokens(task.prompt) + 2000 // Add buffer for response
    const budgetCheck = await this.usageLimiter.checkBudget(
      organizationId,
      modelConfig.model,
      estimatedTokens
    )

    if (!budgetCheck.allowed) {
      throw new Error(`Budget limit exceeded: ${budgetCheck.reason}`)
    }

    // Log budget stats if near limit
    if (budgetCheck.stats?.isNearLimit) {
      console.warn(`⚠️ Organization ${organizationId} is at ${budgetCheck.stats.percentUsed.toFixed(1)}% of monthly budget`)
    }

    // Make the actual API call
    const startTime = Date.now()
    const response = await this.bedrockClient.invokeModel(
      modelId,
      task.prompt,
      modelConfig
    )
    const latencyMs = Date.now() - startTime

    // Record actual usage
    await this.usageLimiter.recordUsage(
      organizationId,
      task.userId,
      task.projectId || null,
      modelConfig.model,
      task.prompt,
      response.content,
      response.tokensUsed,
      latencyMs
    )

    return response
  }

  private selectOptimalModel(task: AITask): ModelConfig {
    const { complexity, urgency, accuracyRequired, contextLength, budgetConstraint } = task

    // Cost-optimized selection matrix
    const candidates = Array.from(this.modelConfigs.values())
      .filter(config => 
        config.maxContextLength >= contextLength &&
        config.costPer1MTokens <= budgetConstraint
      )
      .sort((a, b) => a.costPer1MTokens - b.costPer1MTokens)

    if (candidates.length === 0) {
      throw new Error('No suitable model found for task requirements')
    }

    // Select based on task type and requirements
    switch (task.type) {
      case 'quick_summary':
        return candidates.find(c => c.model === 'nova-lite') || candidates[0]
      
      case 'project_analysis':
        return candidates.find(c => c.model === 'nova-pro') || candidates[0]
      
      case 'risk_assessment':
        return candidates.find(c => c.model === 'claude-3-7-sonnet') || candidates[0]
      
      case 'technical_docs':
        return candidates.find(c => c.model === 'mistral-large') || candidates[0]
      
      case 'realtime_assist':
        return candidates.find(c => c.model === 'llama-3-8b') || candidates[0]
      
      case 'knowledge_search':
        return candidates.find(c => c.model === 'nova-lite') || candidates[0]
      
      case 'report_generation':
        return candidates.find(c => c.model === 'claude-3-7-sonnet') || candidates[0]
      
      default:
        return candidates[0]
    }
  }

  private getModelId(model: ModelType): string {
    const modelMap: Record<ModelType, string> = {
      'claude-3-7-sonnet': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'claude-3-5-haiku': 'anthropic.claude-3-5-haiku-20241022-v1:0',
      'nova-pro': 'amazon.nova-pro-v1:0',
      'nova-lite': 'amazon.nova-lite-v1:0',
      'mistral-large': 'mistral.mistral-large-2407-v1:0',
      'llama-3-8b': 'meta.llama-3-8b-instruct-v1:0',
      'llama-3-70b': 'meta.llama-3-70b-instruct-v1:0'
    }

    return modelMap[model] || modelMap['claude-3-7-sonnet']
  }

  private initializeModelConfigs(): Map<ModelType, ModelConfig> {
    const configs = new Map<ModelType, ModelConfig>()

    // Claude 3.7 Sonnet - Premium model for complex tasks
    configs.set('claude-3-7-sonnet', {
      model: 'claude-3-7-sonnet',
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 300, // $3.00
      maxContextLength: 200000,
      capabilities: ['reasoning', 'analysis', 'code', 'writing']
    })

    // Claude 3.5 Haiku - Fast and cost-effective
    configs.set('claude-3-5-haiku', {
      model: 'claude-3-5-haiku',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 100, // $1.00
      maxContextLength: 200000,
      capabilities: ['reasoning', 'analysis', 'code', 'writing']
    })

    // Nova Pro - Amazon's premium model
    configs.set('nova-pro', {
      model: 'nova-pro',
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 80, // $0.80
      maxContextLength: 300000,
      capabilities: ['reasoning', 'analysis', 'code', 'writing']
    })

    // Nova Lite - Amazon's cost-effective model
    configs.set('nova-lite', {
      model: 'nova-lite',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 6, // $0.06
      maxContextLength: 100000,
      capabilities: ['reasoning', 'analysis', 'writing']
    })

    // Mistral Large - Good for technical content
    configs.set('mistral-large', {
      model: 'mistral-large',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 200, // $2.00
      maxContextLength: 128000,
      capabilities: ['reasoning', 'analysis', 'code', 'writing']
    })

    // Llama 3 8B - Fast and cheap
    configs.set('llama-3-8b', {
      model: 'llama-3-8b',
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 10, // $0.10
      maxContextLength: 8000,
      capabilities: ['reasoning', 'writing']
    })

    // Llama 3 70B - High capability
    configs.set('llama-3-70b', {
      model: 'llama-3-70b',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      costPer1MTokens: 65, // $0.65
      maxContextLength: 8000,
      capabilities: ['reasoning', 'analysis', 'code', 'writing']
    })

    return configs
  }

  private async getUserOrganization(userId: string): Promise<string | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      return user?.organization_id || null
    } catch (error) {
      console.error('Error fetching user organization:', error)
      return null
    }
  }

  // Utility methods for specific use cases
  async generateProjectInsights(projectId: string, context: string): Promise<AIResponse> {
    const task: AITask = {
      type: 'project_analysis',
      prompt: `Analyze this project and provide key insights:\n\n${context}`,
      context,
      complexity: 7,
      urgency: 'batch',
      accuracyRequired: 'standard',
      contextLength: 4000,
      budgetConstraint: 100,
      projectId,
      userId: 'system' // This would be the actual user ID
    }

    return this.processRequest(task)
  }

  async assessProjectRisk(projectId: string, projectData: string): Promise<AIResponse> {
    const task: AITask = {
      type: 'risk_assessment',
      prompt: `Assess the risks for this project and provide recommendations:\n\n${projectData}`,
      context: projectData,
      complexity: 8,
      urgency: 'batch',
      accuracyRequired: 'critical',
      contextLength: 4000,
      budgetConstraint: 100,
      projectId,
      userId: 'system'
    }

    return this.processRequest(task)
  }

  async searchKnowledge(query: string, context?: string): Promise<AIResponse> {
    const task: AITask = {
      type: 'knowledge_search',
      prompt: `Search and provide relevant information for: ${query}`,
      context,
      complexity: 3,
      urgency: 'realtime',
      accuracyRequired: 'standard',
      contextLength: 4000,
      budgetConstraint: 100,
      userId: 'system'
    }

    return this.processRequest(task)
  }
}
