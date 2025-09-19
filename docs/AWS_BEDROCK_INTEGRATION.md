# 🤖 AWS Bedrock Integration Guide

## Overview

This guide covers integrating **AWS Bedrock** with Consailt for AI-powered knowledge management, intelligent insights generation, and automated content analysis. We use multiple models optimized for different knowledge tasks with cost-effective routing and intelligent model selection.

## 🏗️ Architecture

### AI Model Matrix
```typescript
const modelMatrix = {
  'quick_summary': 'amazon.nova-lite',      // $0.06/1M tokens
  'knowledge_analysis': 'amazon.nova-pro',  // $0.80/1M tokens  
  'insight_generation': 'claude-3.7-sonnet', // $3.00/1M tokens
  'technical_docs': 'mistral-large-2',      // $2.00/1M tokens
  'realtime_search': 'llama-3.2-3b'        // $0.10/1M tokens
}
```

### Service Flow
```
Knowledge Request → AI Orchestrator → Model Selection → Bedrock API → Response Processing → Cost Tracking → Knowledge Storage
```

## 🚀 Setup and Configuration

### 1. AWS Account Setup

#### Enable Bedrock Access
```bash
# Login to AWS Console
aws configure

# Enable Bedrock in your region (eu-central-1)
aws bedrock list-foundation-models --region eu-central-1
```

#### Create IAM User
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. Environment Configuration

#### Required Variables
```bash
# AWS Configuration
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# AI Settings
AI_COST_LIMIT_CENTS=50000  # $500/month limit
ENABLE_AI_INSIGHTS=true
AI_DEFAULT_MODEL=amazon.nova-lite
```

#### Environment Setup
```typescript
// packages/ai/config.ts
export const aiConfig = {
  region: process.env.AWS_REGION || 'eu-central-1',
  costLimit: parseInt(process.env.AI_COST_LIMIT_CENTS || '50000'),
  defaultModel: process.env.AI_DEFAULT_MODEL || 'amazon.nova-lite',
  enabled: process.env.ENABLE_AI_INSIGHTS === 'true',
} as const
```

### 3. Bedrock Client Setup

#### Base Client Configuration
```typescript
// packages/ai/bedrock/client.ts
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { fromEnv } from '@aws-sdk/credential-providers'

export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: fromEnv(),
})

export interface BedrockResponse {
  content: string
  model: string
  costCents: number
  tokensUsed: number
  finishReason: string
}
```

#### Model-Specific Clients
```typescript
// packages/ai/bedrock/models.ts
import { bedrockClient } from './client'

export class ClaudeClient {
  private client = bedrockClient
  private modelId = 'anthropic.claude-3-7-sonnet-20240229-v1:0'

  async invoke(prompt: string): Promise<BedrockResponse> {
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      contentType: 'application/json',
    })

    const response = await this.client.send(command)
    const body = JSON.parse(new TextDecoder().decode(response.body))
    
    return {
      content: body.content[0].text,
      model: this.modelId,
      costCents: this.calculateCost(body.usage),
      tokensUsed: body.usage.input_tokens + body.usage.output_tokens,
      finishReason: body.stop_reason
    }
  }

  private calculateCost(usage: any): number {
    const inputCost = usage.input_tokens * 0.003
    const outputCost = usage.output_tokens * 0.015
    return Math.round((inputCost + outputCost) * 100) // Convert to cents
  }
}

export class NovaClient {
  private client = bedrockClient
  private modelId = 'amazon.nova-pro-v1:0'

  async invoke(prompt: string): Promise<BedrockResponse> {
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        inferenceConfig: {
          maxTokens: 4000,
          temperature: 0.7,
          topP: 0.9
        }
      }),
      contentType: 'application/json',
    })

    const response = await this.client.send(command)
    const body = JSON.parse(new TextDecoder().decode(response.body))
    
    return {
      content: body.output.message.content[0].text,
      model: this.modelId,
      costCents: this.calculateCost(body.usage),
      tokensUsed: body.usage.inputTokens + body.usage.outputTokens,
      finishReason: body.stopReason
    }
  }

  private calculateCost(usage: any): number {
    const inputCost = usage.inputTokens * 0.0008
    const outputCost = usage.outputTokens * 0.0008
    return Math.round((inputCost + outputCost) * 100)
  }
}
```

## 🧠 AI Orchestrator Implementation

### Core Orchestrator
```typescript
// packages/ai/orchestrator.ts
import { ClaudeClient } from './bedrock/models'
import { NovaClient } from './bedrock/models'
import { MistralClient } from './bedrock/models'
import { LlamaClient } from './bedrock/models'

export class AIOrchestrator {
  private clients = {
    claude: new ClaudeClient(),
    nova: new NovaClient(),
    mistral: new MistralClient(),
    llama: new LlamaClient(),
  }

  private costTracker = new CostTracker()

  async generateProjectInsights(projectId: string, projectData: string): Promise<AIResponse> {
    // Check cost limits
    if (this.costTracker.exceedsLimit()) {
      throw new Error('AI cost limit exceeded')
    }

    const prompt = this.buildProjectInsightsPrompt(projectData)
    const model = this.selectModel('project_analysis')
    
    const response = await this.clients[model].invoke(prompt)
    
    // Track costs
    this.costTracker.recordUsage(response.costCents)
    
    return {
      content: response.content,
      model: response.model,
      costCents: response.costCents,
      generatedAt: new Date().toISOString()
    }
  }

  async assessProjectRisk(projectId: string, projectData: string): Promise<AIResponse> {
    const prompt = this.buildRiskAssessmentPrompt(projectData)
    const model = this.selectModel('risk_assessment')
    
    const response = await this.clients[model].invoke(prompt)
    this.costTracker.recordUsage(response.costCents)
    
    return {
      content: response.content,
      model: response.model,
      costCents: response.costCents,
      generatedAt: new Date().toISOString()
    }
  }

  private selectModel(taskType: keyof typeof modelMatrix): keyof typeof clients {
    const modelId = modelMatrix[taskType]
    
    switch (modelId) {
      case 'claude-3.7-sonnet':
        return 'claude'
      case 'amazon.nova-pro':
        return 'nova'
      case 'mistral-large-2':
        return 'mistral'
      case 'llama-3.2-3b':
        return 'llama'
      default:
        return 'nova' // Default to cost-effective option
    }
  }

  private buildProjectInsightsPrompt(projectData: string): string {
    return `
Analyze the following project data and provide actionable insights:

${projectData}

Please provide:
1. Key performance indicators
2. Potential risks and mitigation strategies
3. Resource optimization opportunities
4. Timeline recommendations
5. Budget insights

Format as structured JSON with clear categories and actionable recommendations.
    `.trim()
  }

  private buildRiskAssessmentPrompt(projectData: string): string {
    return `
Conduct a comprehensive risk assessment for this project:

${projectData}

Evaluate risks in these categories:
1. Budget and financial risks
2. Timeline and delivery risks
3. Technical and quality risks
4. Resource and team risks
5. Client and stakeholder risks

For each risk, provide:
- Risk level (Low/Medium/High/Critical)
- Probability (1-10)
- Impact (1-10)
- Mitigation strategies
- Early warning indicators

Format as structured JSON with risk scores and actionable recommendations.
    `.trim()
  }
}
```

### Cost Tracking
```typescript
// packages/ai/cost-tracker.ts
export class CostTracker {
  private dailyUsage = new Map<string, number>()
  private monthlyUsage = 0
  private costLimit: number

  constructor(costLimit: number = 50000) {
    this.costLimit = costLimit
  }

  recordUsage(costCents: number): void {
    const today = new Date().toISOString().split('T')[0]
    const currentDaily = this.dailyUsage.get(today) || 0
    this.dailyUsage.set(today, currentDaily + costCents)
    this.monthlyUsage += costCents
  }

  exceedsLimit(): boolean {
    return this.monthlyUsage >= this.costLimit
  }

  getDailyUsage(date: string): number {
    return this.dailyUsage.get(date) || 0
  }

  getMonthlyUsage(): number {
    return this.monthlyUsage
  }

  getRemainingBudget(): number {
    return Math.max(0, this.costLimit - this.monthlyUsage)
  }

  resetMonthly(): void {
    this.monthlyUsage = 0
    this.dailyUsage.clear()
  }
}
```

## 🔄 Streaming Responses

### Real-time AI Responses
```typescript
// packages/ai/streaming.ts
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime'

export class StreamingAIOrchestrator extends AIOrchestrator {
  async streamProjectInsights(
    projectId: string, 
    projectData: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const prompt = this.buildProjectInsightsPrompt(projectData)
    const model = this.selectModel('project_analysis')
    
    const command = new InvokeModelWithResponseStreamCommand({
      modelId: this.getModelId(model),
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        inferenceConfig: {
          maxTokens: 4000,
          temperature: 0.7
        }
      }),
      contentType: 'application/json',
    })

    const response = await this.bedrockClient.send(command)
    
    for await (const chunk of response.body) {
      if (chunk.chunk?.bytes) {
        const data = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes))
        if (data.delta?.text) {
          onChunk(data.delta.text)
        }
      }
    }
  }
}
```

### tRPC Streaming Endpoint
```typescript
// packages/api/trpc/routers/ai.ts
export const aiRouter = createTRPCRouter({
  streamInsights: publicProcedure
    .input(z.object({
      projectId: z.string(),
      projectData: z.string()
    }))
    .subscription(async function* ({ input }) {
      const orchestrator = new StreamingAIOrchestrator()
      
      let fullResponse = ''
      
      await orchestrator.streamProjectInsights(
        input.projectId,
        input.projectData,
        (chunk) => {
          fullResponse += chunk
        }
      )
      
      yield {
        type: 'chunk',
        content: fullResponse
      }
    }),
})
```

## 📊 Usage Analytics

### AI Usage Tracking
```typescript
// packages/ai/analytics.ts
export class AIAnalytics {
  private db: Database

  constructor(db: Database) {
    this.db = db
  }

  async recordUsage(usage: AIUsage): Promise<void> {
    await this.db.insert(aiInteractions).values({
      id: generateId(),
      projectId: usage.projectId,
      model: usage.model,
      costCents: usage.costCents,
      tokensUsed: usage.tokensUsed,
      taskType: usage.taskType,
      createdAt: new Date(),
    })
  }

  async getUsageStats(projectId?: string, timeframe: string = '30d'): Promise<UsageStats> {
    const where = projectId ? eq(aiInteractions.projectId, projectId) : undefined
    const since = this.getTimeframeDate(timeframe)
    
    const stats = await this.db
      .select({
        totalCost: sum(aiInteractions.costCents),
        totalTokens: sum(aiInteractions.tokensUsed),
        requestCount: count(),
        avgCostPerRequest: avg(aiInteractions.costCents),
      })
      .from(aiInteractions)
      .where(and(where, gte(aiInteractions.createdAt, since)))

    return {
      totalCost: stats[0]?.totalCost || 0,
      totalTokens: stats[0]?.totalTokens || 0,
      requestCount: stats[0]?.requestCount || 0,
      avgCostPerRequest: stats[0]?.avgCostPerRequest || 0,
    }
  }

  async getModelPerformance(): Promise<ModelPerformance[]> {
    const performance = await this.db
      .select({
        model: aiInteractions.model,
        avgCost: avg(aiInteractions.costCents),
        avgTokens: avg(aiInteractions.tokensUsed),
        requestCount: count(),
        totalCost: sum(aiInteractions.costCents),
      })
      .from(aiInteractions)
      .groupBy(aiInteractions.model)

    return performance.map(p => ({
      model: p.model,
      avgCost: p.avgCost || 0,
      avgTokens: p.avgTokens || 0,
      requestCount: p.requestCount || 0,
      totalCost: p.totalCost || 0,
      efficiency: (p.avgTokens || 0) / (p.avgCost || 1), // Tokens per cent
    }))
  }
}
```

## 🛡️ Error Handling and Resilience

### Retry Logic
```typescript
// packages/ai/retry.ts
export class RetryableAIOrchestrator extends AIOrchestrator {
  private maxRetries = 3
  private baseDelay = 1000

  async generateProjectInsights(projectId: string, projectData: string): Promise<AIResponse> {
    return this.withRetry(async () => {
      return super.generateProjectInsights(projectId, projectData)
    })
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (this.isRetryableError(error)) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1)
          await this.sleep(delay)
          continue
        }
        
        throw error
      }
    }
    
    throw lastError!
  }

  private isRetryableError(error: any): boolean {
    if (error.name === 'ThrottlingException') return true
    if (error.name === 'ServiceUnavailableException') return true
    if (error.$metadata?.httpStatusCode === 429) return true
    if (error.$metadata?.httpStatusCode === 503) return true
    return false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### Fallback Models
```typescript
// packages/ai/fallback.ts
export class FallbackAIOrchestrator extends AIOrchestrator {
  private fallbackOrder = ['nova', 'llama', 'mistral', 'claude'] as const

  async generateProjectInsights(projectId: string, projectData: string): Promise<AIResponse> {
    for (const model of this.fallbackOrder) {
      try {
        const response = await this.clients[model].invoke(
          this.buildProjectInsightsPrompt(projectData)
        )
        this.costTracker.recordUsage(response.costCents)
        return response
      } catch (error) {
        console.warn(`Model ${model} failed, trying next:`, error)
        continue
      }
    }
    
    throw new Error('All AI models failed')
  }
}
```

## 🧪 Testing

### Unit Tests
```typescript
// packages/ai/__tests__/orchestrator.test.ts
import { AIOrchestrator } from '../orchestrator'
import { mockBedrockClient } from './mocks'

describe('AIOrchestrator', () => {
  let orchestrator: AIOrchestrator

  beforeEach(() => {
    orchestrator = new AIOrchestrator()
  })

  it('should generate project insights', async () => {
    const projectData = JSON.stringify({
      name: 'Test Project',
      budget: 100000,
      timeline: '6 months'
    })

    const insights = await orchestrator.generateProjectInsights('proj_123', projectData)
    
    expect(insights.content).toBeDefined()
    expect(insights.model).toBeDefined()
    expect(insights.costCents).toBeGreaterThan(0)
  })

  it('should respect cost limits', async () => {
    // Mock cost tracker to be at limit
    orchestrator.costTracker.recordUsage(50000)
    
    await expect(
      orchestrator.generateProjectInsights('proj_123', '{}')
    ).rejects.toThrow('AI cost limit exceeded')
  })
})
```

### Integration Tests
```typescript
// packages/ai/__tests__/integration.test.ts
import { AIOrchestrator } from '../orchestrator'

describe('AI Integration', () => {
  it('should work with real Bedrock API', async () => {
    const orchestrator = new AIOrchestrator()
    
    const response = await orchestrator.generateProjectInsights(
      'proj_123',
      JSON.stringify({ name: 'Test Project' })
    )
    
    expect(response.content).toContain('insights')
    expect(response.model).toMatch(/claude|nova|mistral|llama/)
  })
})
```

## 📈 Monitoring and Observability

### Metrics Collection
```typescript
// packages/ai/monitoring.ts
export class AIMonitoring {
  async recordMetrics(usage: AIUsage): Promise<void> {
    // Record to monitoring service
    console.log('AI Usage:', {
      model: usage.model,
      cost: usage.costCents,
      tokens: usage.tokensUsed,
      timestamp: new Date().toISOString()
    })
  }

  async getHealthStatus(): Promise<HealthStatus> {
    try {
      // Test Bedrock connectivity
      await this.testBedrockConnection()
      
      return {
        status: 'healthy',
        models: await this.getAvailableModels(),
        costLimit: this.costTracker.getRemainingBudget()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
}
```

## 🚀 Deployment

### Environment Variables
```bash
# AWS Bedrock Configuration
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# AI Settings
AI_COST_LIMIT_CENTS=50000
ENABLE_AI_INSIGHTS=true
AI_DEFAULT_MODEL=amazon.nova-lite

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LANGFUSE_PUBLIC_KEY=pk_xxx
LANGFUSE_SECRET_KEY=sk_xxx
```

### Railway Configuration
```toml
# railway.toml
[services.web]
buildCommand = "pnpm install --frozen-lockfile && pnpm build:web"
startCommand = "pnpm start --filter=@consulting-platform/web"

[services.worker]
startCommand = "pnpm worker:start"
```

## 🎯 Implemented Features

### Knowledge Item Summaries with Nova Lite
The first production implementation uses Amazon Nova Lite (`amazon.nova-lite-v1:0`) for generating concise summaries of knowledge base items:

#### Implementation Details
- **Model**: Amazon Nova Lite - Cost-effective at $0.06 per 1M tokens
- **Use Case**: Automatic 2-3 sentence summaries for knowledge cards
- **Caching**: Summaries stored in metadata and reused for 7 days
- **Batch Processing**: Generate up to 10 summaries simultaneously

#### API Endpoints
```typescript
// Generate single summary
trpc.knowledge.generateSummary.mutate({
  knowledgeId: "uuid-here"
})

// Generate batch summaries
trpc.knowledge.generateBatchSummaries.mutate({
  knowledgeIds: ["uuid-1", "uuid-2", "..."]
})
```

#### UI Features
- **Visual Indicator**: Summaries displayed with sparkle icon (✨)
- **Auto-Generation Button**: "Generate Summaries" button for items without summaries
- **Progressive Enhancement**: Falls back to content excerpt if no summary exists

#### BedrockClient Nova Support
```typescript
// Nova model format
if (modelId.startsWith("amazon.nova")) {
  body = JSON.stringify({
    messages: [{
      role: "user",
      content: [{ text: prompt }]
    }],
    system: [],
    inferenceConfig: {
      temperature: config.temperature,
      top_p: config.topP,
      max_new_tokens: config.maxTokens,
      stopSequences: []
    }
  });
}
```

## 📚 Best Practices

### Model Selection
- Use **Nova Lite** for simple summaries and quick responses
- Use **Nova Pro** for complex project analysis
- Use **Claude 3.7** for critical risk assessments
- Use **Mistral Large** for technical documentation
- Use **Llama 3.2** for real-time interactions

### Cost Optimization
- Implement intelligent model routing based on task complexity
- Use caching for repeated queries
- Set up cost alerts and limits
- Monitor usage patterns and optimize prompts

### Error Handling
- Implement retry logic with exponential backoff
- Use fallback models for critical operations
- Log all AI interactions for debugging
- Set up monitoring and alerting

### Security
- Never expose AWS credentials in client-side code
- Use IAM roles with minimal required permissions
- Implement rate limiting on AI endpoints
- Log and monitor all AI usage

## 📞 Support

- **AWS Bedrock Docs**: [docs.aws.amazon.com/bedrock](https://docs.aws.amazon.com/bedrock)
- **AWS SDK Docs**: [docs.aws.amazon.com/sdk-for-javascript](https://docs.aws.amazon.com/sdk-for-javascript)
- **Model Pricing**: [aws.amazon.com/bedrock/pricing](https://aws.amazon.com/bedrock/pricing)

---

*Last Updated: January 2024*  
*Integration Version: 1.0.0*
