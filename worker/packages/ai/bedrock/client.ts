import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { fromEnv } from '@aws-sdk/credential-providers'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { ModelConfig, AIResponse, AITask } from '../types'

export class BedrockClient {
  private client: BedrockRuntimeClient
  private region: string

  constructor() {
    this.region = process.env.AWS_REGION || 'eu-central-1'
    
    this.client = new BedrockRuntimeClient({
      region: this.region,
      credentials: fromEnv(),
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 5000,
        socketTimeout: 60000,
      }),
    })
  }

  async invokeModel(
    modelId: string,
    prompt: string,
    config: ModelConfig
  ): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      const body = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const command = new InvokeModelCommand({
        modelId,
        body,
        contentType: 'application/json',
        accept: 'application/json'
      })

      const response = await this.client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      
      const latencyMs = Date.now() - startTime
      const tokensUsed = this.estimateTokens(prompt + responseBody.content[0].text)
      const costCents = Math.ceil((tokensUsed / 1000000) * config.costPer1MTokens)

      return {
        content: responseBody.content[0].text,
        model: config.model as any,
        tokensUsed,
        costCents,
        latencyMs,
        metadata: {
          modelId,
          region: this.region
        }
      }
    } catch (error) {
      console.error('Bedrock invocation failed:', error)
      throw new Error(`AI model invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4)
  }
}
