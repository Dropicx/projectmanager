import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import type { AIResponse, ModelConfig } from "../types";

export class BedrockClient {
  private client: BedrockRuntimeClient;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || "eu-central-1";

    // Check if using API key authentication
    const bedrockApiKey = process.env.BEDROCK_API_KEY;

    if (bedrockApiKey) {
      // Set the API key as Bearer token for Bedrock
      console.log("Using Bedrock API key authentication");
      process.env.AWS_BEARER_TOKEN_BEDROCK = bedrockApiKey;

      // Create client without explicit credentials - it will use the bearer token
      this.client = new BedrockRuntimeClient({
        region: this.region,
        requestHandler: new NodeHttpHandler({
          connectionTimeout: 5000,
          socketTimeout: 60000,
        }),
      });
    } else {
      // Fall back to standard AWS IAM credentials
      console.log("Using AWS IAM credentials for Bedrock");
      this.client = new BedrockRuntimeClient({
        region: this.region,
        credentials: fromEnv(),
        requestHandler: new NodeHttpHandler({
          connectionTimeout: 5000,
          socketTimeout: 60000,
        }),
      });
    }
  }

  async invokeModel(modelId: string, prompt: string, config: ModelConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Different request formats for different model families
      let body: string;
      let responseText: string;

      if (
        modelId.startsWith("amazon.nova") ||
        modelId.startsWith("us.amazon.nova") ||
        modelId.startsWith("eu.amazon.nova")
      ) {
        // Nova model format
        body = JSON.stringify({
          messages: [
            {
              role: "user",
              content: [{ text: prompt }],
            },
          ],
          system: [],
          inferenceConfig: {
            temperature: config.temperature,
            top_p: config.topP,
            max_new_tokens: config.maxTokens,
            stopSequences: [],
          },
        });
      } else if (modelId.startsWith("anthropic.claude")) {
        // Claude model format
        body = JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: config.topP,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });
      } else {
        throw new Error(`Unsupported model: ${modelId}`);
      }

      const command = new InvokeModelCommand({
        modelId,
        body,
        contentType: "application/json",
        accept: "application/json",
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Extract text based on model family
      if (
        modelId.startsWith("amazon.nova") ||
        modelId.startsWith("us.amazon.nova") ||
        modelId.startsWith("eu.amazon.nova")
      ) {
        responseText = responseBody.output?.message?.content?.[0]?.text || "";
      } else if (modelId.startsWith("anthropic.claude")) {
        responseText = responseBody.content?.[0]?.text || "";
      } else {
        throw new Error(`Unable to parse response from model: ${modelId}`);
      }

      const latencyMs = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + responseText);
      const costCents = Math.ceil((tokensUsed / 1000000) * config.costPer1MTokens);

      return {
        content: responseText,
        model: config.model as any,
        tokensUsed,
        costCents,
        latencyMs,
        metadata: {
          modelId,
          region: this.region,
        },
      };
    } catch (error) {
      console.error("Bedrock invocation failed:", error);
      throw new Error(
        `AI model invocation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}
