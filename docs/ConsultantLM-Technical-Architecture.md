# ConsultantLM Technical Architecture
## Building an AI-Powered Knowledge Platform with AWS Bedrock

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js App Router | React 19 | TailwindCSS | shadcn/ui    │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                          API Layer                           │
│        tRPC Routers | Type-safe Endpoints | Middleware       │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                    AI Orchestration Layer                    │
│   Model Selection | Cost Optimization | Context Management   │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                      AWS Bedrock Layer                       │
│    Claude 3.5 | Nova Pro/Lite | Mistral | Llama | Embeddings│
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                       Storage Layer                          │
│   PostgreSQL + pgvector | Redis Cache | S3 Object Storage   │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components Implementation

### 1. Enhanced Knowledge Processing Pipeline

```typescript
// packages/ai/knowledge-processor.ts
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client } from "@aws-sdk/client-s3";
import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

export class KnowledgeProcessor {
  private bedrock: BedrockRuntimeClient;
  private s3: S3Client;

  constructor() {
    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
    });
  }

  async processDocument(file: File, organizationId: string) {
    // Step 1: Extract content based on file type
    const content = await this.extractContent(file);

    // Step 2: Generate intelligent chunks with overlap
    const chunks = await this.intelligentChunking(content);

    // Step 3: Generate embeddings for each chunk
    const embeddings = await this.generateEmbeddings(chunks);

    // Step 4: Extract metadata and entities
    const metadata = await this.extractMetadata(content);

    // Step 5: Store in vector database
    const documentId = await this.storeInVectorDB({
      chunks,
      embeddings,
      metadata,
      organizationId,
      fileName: file.name,
    });

    // Step 6: Update knowledge graph
    await this.updateKnowledgeGraph(documentId, metadata);

    return documentId;
  }

  private async intelligentChunking(content: string): Promise<ChunkData[]> {
    // Use Nova Lite for fast chunk generation with semantic boundaries
    const response = await this.bedrock.send({
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: `Divide this document into semantic chunks for RAG processing.
                Each chunk should be self-contained and meaningful.
                Target size: 500-1000 tokens with 10% overlap.

                Document: ${content}

                Return JSON array of chunks with titles and content.`,
        maxTokens: 4096,
        temperature: 0.1,
      }),
    });

    return JSON.parse(response.body);
  }

  private async generateEmbeddings(chunks: ChunkData[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const response = await this.bedrock.send({
          modelId: "amazon.titan-embed-text-v2:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            inputText: chunk.content,
            dimensions: 1536,
            normalize: true,
          }),
        });

        return JSON.parse(response.body).embedding;
      })
    );

    return embeddings;
  }

  private async extractMetadata(content: string): Promise<DocumentMetadata> {
    // Use Nova Pro for comprehensive metadata extraction
    const response = await this.bedrock.send({
      modelId: "amazon.nova-pro-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: `Extract comprehensive metadata from this document:

                1. Document type (report, presentation, email, etc.)
                2. Key topics and themes
                3. Named entities (people, organizations, projects)
                4. Dates and timelines mentioned
                5. Key insights and decisions
                6. Action items and recommendations
                7. Sentiment and tone
                8. Industry/domain classification

                Document: ${content}

                Return structured JSON.`,
        maxTokens: 2048,
        temperature: 0.1,
      }),
    });

    return JSON.parse(response.body);
  }
}
```

### 2. Conversational AI Interface

```typescript
// packages/api/trpc/routers/ai-assistant.ts
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { KnowledgeRetriever } from "@consulting-platform/ai/retriever";
import { ConversationManager } from "@consulting-platform/ai/conversation";

export const aiAssistantRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string().optional(),
        projectId: z.string().optional(),
        mode: z.enum(["general", "project", "research", "analysis"]).default("general"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const retriever = new KnowledgeRetriever();
      const conversationManager = new ConversationManager();

      // Load conversation context
      const context = await conversationManager.loadContext(
        input.conversationId || uuidv4(),
        ctx.user.organizationId
      );

      // Retrieve relevant knowledge
      const relevantDocs = await retriever.retrieve({
        query: input.message,
        organizationId: ctx.user.organizationId,
        projectId: input.projectId,
        limit: 10,
        threshold: 0.7,
      });

      // Build enhanced prompt with context
      const enhancedPrompt = await this.buildEnhancedPrompt({
        userMessage: input.message,
        context: context,
        relevantDocs: relevantDocs,
        mode: input.mode,
      });

      // Select optimal model based on query complexity
      const model = this.selectModel(input.message, input.mode);

      // Generate response with streaming
      const response = await this.generateResponse({
        prompt: enhancedPrompt,
        model: model,
        stream: true,
      });

      // Store conversation turn
      await conversationManager.storeTurn({
        conversationId: context.id,
        userMessage: input.message,
        aiResponse: response.content,
        metadata: {
          model: model,
          tokensUsed: response.tokensUsed,
          relevantDocs: relevantDocs.map(d => d.id),
        },
      });

      return {
        response: response.content,
        sources: relevantDocs,
        conversationId: context.id,
        suggestions: await this.generateFollowUpSuggestions(response.content),
      };
    }),

  generateInsight: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        depth: z.enum(["quick", "standard", "comprehensive"]),
        projectIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Comprehensive insight generation across knowledge base
      const insights = await this.analyzeTopicAcrossKnowledge({
        topic: input.topic,
        organizationId: ctx.user.organizationId,
        projectIds: input.projectIds,
        depth: input.depth,
      });

      return insights;
    }),

  summarizeDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        style: z.enum(["executive", "technical", "bullets", "narrative"]),
        maxLength: z.number().default(500),
      })
    )
    .query(async ({ ctx, input }) => {
      const document = await this.getDocument(input.documentId);

      const summary = await this.generateSummary({
        content: document.content,
        style: input.style,
        maxLength: input.maxLength,
        model: "amazon.nova-lite-v1:0", // Fast model for summaries
      });

      return summary;
    }),
});
```

### 3. Advanced RAG Implementation

```typescript
// packages/ai/retriever.ts
export class KnowledgeRetriever {
  private pgClient: Client;
  private embeddingModel: BedrockRuntimeClient;

  async retrieve(params: RetrievalParams): Promise<RelevantDocument[]> {
    // Step 1: Generate query embedding
    const queryEmbedding = await this.generateQueryEmbedding(params.query);

    // Step 2: Perform hybrid search (vector + keyword)
    const hybridResults = await this.hybridSearch({
      embedding: queryEmbedding,
      query: params.query,
      organizationId: params.organizationId,
      projectId: params.projectId,
      limit: params.limit * 3, // Over-fetch for re-ranking
    });

    // Step 3: Re-rank results using cross-encoder
    const rerankedResults = await this.rerank({
      query: params.query,
      documents: hybridResults,
      model: "amazon.nova-pro-v1:0",
    });

    // Step 4: Apply threshold filtering
    const filteredResults = rerankedResults.filter(
      doc => doc.relevanceScore > params.threshold
    );

    // Step 5: Fetch full document context
    const documentsWithContext = await this.fetchContext(
      filteredResults.slice(0, params.limit)
    );

    return documentsWithContext;
  }

  private async hybridSearch(params: HybridSearchParams): Promise<SearchResult[]> {
    // Combine vector similarity and BM25 keyword search
    const query = `
      WITH vector_search AS (
        SELECT
          id,
          chunk_content,
          metadata,
          1 - (embedding <=> $1::vector) as vector_score
        FROM knowledge_chunks
        WHERE organization_id = $2
          ${params.projectId ? 'AND project_id = $3' : ''}
        ORDER BY embedding <=> $1::vector
        LIMIT $4
      ),
      keyword_search AS (
        SELECT
          id,
          chunk_content,
          metadata,
          ts_rank(search_vector, plainto_tsquery('english', $5)) as keyword_score
        FROM knowledge_chunks
        WHERE organization_id = $2
          ${params.projectId ? 'AND project_id = $3' : ''}
          AND search_vector @@ plainto_tsquery('english', $5)
        LIMIT $4
      )
      SELECT
        COALESCE(v.id, k.id) as id,
        COALESCE(v.chunk_content, k.chunk_content) as content,
        COALESCE(v.metadata, k.metadata) as metadata,
        COALESCE(v.vector_score, 0) * 0.7 + COALESCE(k.keyword_score, 0) * 0.3 as combined_score
      FROM vector_search v
      FULL OUTER JOIN keyword_search k ON v.id = k.id
      ORDER BY combined_score DESC
      LIMIT $4;
    `;

    const results = await this.pgClient.query(query, [
      params.embedding,
      params.organizationId,
      params.projectId,
      params.limit,
      params.query,
    ]);

    return results.rows;
  }

  private async rerank(params: RerankParams): Promise<RankedDocument[]> {
    // Use a more powerful model to re-rank results
    const rerankPrompt = `
      Query: "${params.query}"

      Rank these documents by relevance to the query (1-10 scale):
      ${params.documents.map((doc, i) => `
        Document ${i + 1}:
        ${doc.content.substring(0, 500)}
      `).join('\n')}

      Return JSON array with document indices and scores.
    `;

    const response = await this.bedrock.send({
      modelId: params.model,
      body: JSON.stringify({
        prompt: rerankPrompt,
        maxTokens: 1024,
        temperature: 0,
      }),
    });

    const rankings = JSON.parse(response.body);

    return rankings.map((r: any) => ({
      ...params.documents[r.index],
      relevanceScore: r.score / 10,
    }));
  }
}
```

### 4. Knowledge Graph Implementation

```typescript
// packages/ai/knowledge-graph.ts
import { Neo4jDriver } from "neo4j-driver";

export class KnowledgeGraph {
  private driver: Neo4jDriver;

  async updateGraph(documentId: string, metadata: DocumentMetadata) {
    const session = this.driver.session();

    try {
      // Create document node
      await session.run(`
        MERGE (d:Document {id: $id})
        SET d.title = $title,
            d.type = $type,
            d.created = $created,
            d.organizationId = $organizationId
      `, {
        id: documentId,
        title: metadata.title,
        type: metadata.documentType,
        created: new Date().toISOString(),
        organizationId: metadata.organizationId,
      });

      // Create entity nodes and relationships
      for (const entity of metadata.entities) {
        await session.run(`
          MERGE (e:Entity {name: $name, type: $type})
          MERGE (d:Document {id: $docId})
          MERGE (d)-[r:MENTIONS {confidence: $confidence}]->(e)
        `, {
          name: entity.name,
          type: entity.type,
          docId: documentId,
          confidence: entity.confidence,
        });
      }

      // Create topic nodes and relationships
      for (const topic of metadata.topics) {
        await session.run(`
          MERGE (t:Topic {name: $name})
          MERGE (d:Document {id: $docId})
          MERGE (d)-[r:DISCUSSES {relevance: $relevance}]->(t)
        `, {
          name: topic.name,
          docId: documentId,
          relevance: topic.relevance,
        });
      }

      // Identify and create cross-document relationships
      await this.identifyCrossDocumentPatterns(documentId, metadata);

    } finally {
      await session.close();
    }
  }

  async queryGraph(params: GraphQueryParams): Promise<GraphResult> {
    const session = this.driver.session();

    try {
      // Complex graph traversal to find insights
      const result = await session.run(`
        MATCH path = (start:Entity {name: $startEntity})-[*1..3]-(related)
        WHERE related:Document OR related:Entity OR related:Topic
        AND exists((related)-[]-(d:Document {organizationId: $orgId}))
        RETURN path,
               length(path) as distance,
               labels(related) as nodeType,
               properties(related) as properties
        ORDER BY distance
        LIMIT $limit
      `, {
        startEntity: params.startEntity,
        orgId: params.organizationId,
        limit: params.limit || 50,
      });

      return this.formatGraphResult(result);
    } finally {
      await session.close();
    }
  }

  private async identifyCrossDocumentPatterns(
    documentId: string,
    metadata: DocumentMetadata
  ) {
    // Use AI to identify patterns across documents
    const patterns = await this.detectPatterns({
      newDocument: metadata,
      existingDocuments: await this.getRelatedDocuments(metadata),
    });

    // Create pattern relationships in graph
    for (const pattern of patterns) {
      await this.createPatternRelationship(documentId, pattern);
    }
  }
}
```

### 5. Real-time Processing with WebSockets

```typescript
// packages/api/websocket/knowledge-stream.ts
import { WebSocketServer } from "ws";
import { EventEmitter } from "events";

export class KnowledgeStreamServer {
  private wss: WebSocketServer;
  private eventBus: EventEmitter;

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port });
    this.eventBus = new EventEmitter();

    this.wss.on("connection", (ws, req) => {
      const organizationId = this.extractOrgId(req);

      ws.on("message", async (message) => {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "subscribe_insights":
            this.subscribeToInsights(ws, organizationId);
            break;

          case "live_analysis":
            this.handleLiveAnalysis(ws, data.payload);
            break;

          case "collaborative_session":
            this.joinCollaborativeSession(ws, data.sessionId);
            break;
        }
      });
    });
  }

  private subscribeToInsights(ws: WebSocket, organizationId: string) {
    // Real-time insights as documents are processed
    const listener = (insight: Insight) => {
      ws.send(JSON.stringify({
        type: "insight",
        payload: insight,
      }));
    };

    this.eventBus.on(`insight:${organizationId}`, listener);

    ws.on("close", () => {
      this.eventBus.removeListener(`insight:${organizationId}`, listener);
    });
  }

  private async handleLiveAnalysis(ws: WebSocket, payload: any) {
    // Stream AI analysis results as they're generated
    const stream = await this.createAnalysisStream(payload);

    for await (const chunk of stream) {
      ws.send(JSON.stringify({
        type: "analysis_chunk",
        payload: chunk,
      }));
    }
  }
}
```

### 6. Cost Optimization Engine

```typescript
// packages/ai/cost-optimizer.ts
export class CostOptimizer {
  private usageHistory: Map<string, UsageStats> = new Map();

  selectOptimalModel(request: AIRequest): ModelSelection {
    const taskComplexity = this.assessComplexity(request);
    const urgency = request.urgency || "standard";
    const budgetRemaining = this.getBudgetRemaining(request.organizationId);

    // Decision matrix for model selection
    const modelMatrix = {
      simple: {
        urgent: "nova-lite",      // $0.06/1M - Fast & cheap
        standard: "nova-lite",
        batch: "llama-3-8b",      // $0.10/1M - Good for batch
      },
      moderate: {
        urgent: "nova-pro",        // $0.80/1M - Balanced
        standard: "mistral-large", // $2.00/1M - Good quality
        batch: "nova-pro",
      },
      complex: {
        urgent: "claude-3-5-sonnet",  // $3.00/1M - Best quality
        standard: "claude-3-5-sonnet",
        batch: "mistral-large",
      },
    };

    let selectedModel = modelMatrix[taskComplexity][urgency];

    // Budget override - downgrade if necessary
    if (budgetRemaining < 100 && selectedModel === "claude-3-5-sonnet") {
      selectedModel = "nova-pro";
    }

    // Cache optimization - use cached results if available
    const cacheKey = this.generateCacheKey(request);
    const cachedResult = await this.checkCache(cacheKey);

    if (cachedResult && request.allowCache) {
      return {
        model: "cache",
        response: cachedResult,
        cost: 0,
      };
    }

    return {
      model: selectedModel,
      estimatedCost: this.estimateCost(selectedModel, request),
      reasoning: this.explainSelection(taskComplexity, urgency, budgetRemaining),
    };
  }

  private assessComplexity(request: AIRequest): "simple" | "moderate" | "complex" {
    const factors = {
      tokenCount: request.prompt.length,
      hasCodeGeneration: request.prompt.includes("code") || request.prompt.includes("implement"),
      requiresReasoning: request.prompt.includes("why") || request.prompt.includes("analyze"),
      multiStep: request.prompt.includes("step") || request.prompt.includes("plan"),
      creativityNeeded: request.prompt.includes("create") || request.prompt.includes("design"),
    };

    let complexityScore = 0;

    if (factors.tokenCount > 2000) complexityScore += 2;
    else if (factors.tokenCount > 500) complexityScore += 1;

    if (factors.hasCodeGeneration) complexityScore += 2;
    if (factors.requiresReasoning) complexityScore += 2;
    if (factors.multiStep) complexityScore += 1;
    if (factors.creativityNeeded) complexityScore += 1;

    if (complexityScore >= 5) return "complex";
    if (complexityScore >= 3) return "moderate";
    return "simple";
  }
}
```

### 7. Intelligent Caching Layer

```typescript
// packages/ai/cache-manager.ts
import { Redis } from "ioredis";
import { createHash } from "crypto";

export class AIResponseCache {
  private redis: Redis;
  private semanticCache: Map<string, CachedResponse[]>;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.semanticCache = new Map();
  }

  async get(query: string, threshold: number = 0.95): Promise<CachedResponse | null> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Check exact match first
    const exactMatch = await this.redis.get(this.hashQuery(query));
    if (exactMatch) {
      return JSON.parse(exactMatch);
    }

    // Semantic similarity search
    const similarQueries = await this.findSimilarQueries(queryEmbedding, threshold);

    if (similarQueries.length > 0) {
      // Return most similar cached response
      return similarQueries[0].response;
    }

    return null;
  }

  async set(query: string, response: AIResponse, ttl: number = 3600) {
    const queryHash = this.hashQuery(query);
    const queryEmbedding = await this.generateEmbedding(query);

    const cacheEntry = {
      query,
      response,
      embedding: queryEmbedding,
      timestamp: Date.now(),
      accessCount: 0,
    };

    // Store in Redis with TTL
    await this.redis.set(
      queryHash,
      JSON.stringify(cacheEntry),
      "EX",
      ttl
    );

    // Update semantic cache
    this.updateSemanticCache(queryHash, cacheEntry);
  }

  private hashQuery(query: string): string {
    return createHash("sha256").update(query).digest("hex");
  }

  private async findSimilarQueries(
    embedding: number[],
    threshold: number
  ): Promise<SimilarQuery[]> {
    // Implement vector similarity search
    // This would typically use pgvector or a dedicated vector DB
    const allCached = await this.getAllCachedEmbeddings();

    const similarities = allCached.map(cached => ({
      ...cached,
      similarity: this.cosineSimilarity(embedding, cached.embedding),
    }));

    return similarities
      .filter(s => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }
}
```

### 8. Background Processing with BullMQ

```typescript
// packages/worker/processors/knowledge-processor.ts
import { Worker } from "bullmq";
import { KnowledgeProcessor } from "@consulting-platform/ai/knowledge-processor";

export class KnowledgeWorker {
  private worker: Worker;
  private processor: KnowledgeProcessor;

  constructor() {
    this.processor = new KnowledgeProcessor();

    this.worker = new Worker(
      "knowledge-processing",
      async (job) => {
        switch (job.name) {
          case "process_document":
            return await this.processDocument(job.data);

          case "generate_insights":
            return await this.generateInsights(job.data);

          case "update_embeddings":
            return await this.updateEmbeddings(job.data);

          case "cross_reference":
            return await this.crossReference(job.data);
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
        concurrency: 5,
      }
    );
  }

  private async processDocument(data: ProcessDocumentJob) {
    const { fileUrl, organizationId, userId } = data;

    // Download file from S3
    const file = await this.downloadFile(fileUrl);

    // Process with progress updates
    await this.processor.processDocument(
      file,
      organizationId,
      (progress) => {
        // Update job progress
        this.worker.updateProgress(progress);
      }
    );

    // Trigger insight generation
    await this.queueJob("generate_insights", {
      documentId: result.documentId,
      organizationId,
    });

    return result;
  }

  private async generateInsights(data: GenerateInsightsJob) {
    // Analyze document for insights
    const insights = await this.processor.analyzeForInsights(data.documentId);

    // Store insights
    await this.storeInsights(insights);

    // Notify via WebSocket
    await this.notifyInsights(data.organizationId, insights);

    return insights;
  }
}
```

---

## Database Schema Extensions

```sql
-- Enhanced knowledge base with vector support
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge chunks with embeddings
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    project_id UUID,

    -- Content
    chunk_content TEXT NOT NULL,
    chunk_title TEXT,
    chunk_index INTEGER NOT NULL,

    -- Vector embedding
    embedding vector(1536) NOT NULL,

    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', chunk_content)
    ) STORED,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),

    INDEXES
);

CREATE INDEX idx_chunks_embedding ON knowledge_chunks
    USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_search ON knowledge_chunks
    USING gin (search_vector);
CREATE INDEX idx_chunks_org_project ON knowledge_chunks
    (organization_id, project_id);

-- Conversation history
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    project_id UUID,

    -- Conversation data
    title TEXT,
    summary TEXT,
    status TEXT DEFAULT 'active',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversation turns
CREATE TABLE ai_conversation_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,

    -- Message data
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,

    -- Context used
    relevant_documents JSONB DEFAULT '[]',
    model_used TEXT NOT NULL,
    tokens_used INTEGER,
    response_time_ms INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge insights
CREATE TABLE knowledge_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,

    -- Insight data
    type TEXT NOT NULL, -- pattern, trend, anomaly, recommendation
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2),

    -- Related entities
    related_documents JSONB DEFAULT '[]',
    related_projects JSONB DEFAULT '[]',

    -- Status
    status TEXT DEFAULT 'active', -- active, validated, dismissed
    validated_by TEXT,
    validated_at TIMESTAMP,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Core Knowledge Operations

```typescript
// Enhanced knowledge router with AI capabilities
export const enhancedKnowledgeRouter = router({
  // Document processing
  uploadDocument: protectedProcedure
    .input(z.object({
      file: z.instanceof(File),
      projectId: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Queue document for processing
      const jobId = await queueDocumentProcessing(input.file, ctx.user.organizationId);
      return { jobId, status: "processing" };
    }),

  // Semantic search
  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      filters: z.object({
        projectIds: z.array(z.string()).optional(),
        dateRange: z.object({
          from: z.date(),
          to: z.date(),
        }).optional(),
        documentTypes: z.array(z.string()).optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const results = await semanticSearch({
        query: input.query,
        organizationId: ctx.user.organizationId,
        filters: input.filters,
      });
      return results;
    }),

  // AI-powered analysis
  analyzeProject: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      analysisType: z.enum(["health", "risks", "opportunities", "recommendations"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const analysis = await analyzeProject({
        projectId: input.projectId,
        type: input.analysisType,
        organizationId: ctx.user.organizationId,
      });
      return analysis;
    }),

  // Generate deliverables
  generateDeliverable: protectedProcedure
    .input(z.object({
      type: z.enum(["report", "presentation", "proposal", "memo"]),
      context: z.object({
        projectId: z.string().optional(),
        templateId: z.string().optional(),
        requirements: z.string(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const deliverable = await generateDeliverable({
        type: input.type,
        context: input.context,
        organizationId: ctx.user.organizationId,
      });
      return deliverable;
    }),
});
```

---

## Security & Compliance

### Data Isolation

```typescript
// Middleware for organization-level data isolation
export const organizationIsolation = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user?.organizationId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Organization context required",
    });
  }

  // Add organization filter to all database queries
  const db = ctx.db.withFilter({
    organization_id: ctx.user.organizationId,
  });

  return next({
    ctx: {
      ...ctx,
      db,
    },
  });
});
```

### Encryption

```typescript
// Encryption for sensitive data
import { createCipheriv, createDecipheriv } from "crypto";

export class EncryptionService {
  private algorithm = "aes-256-gcm";
  private key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  }

  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  decrypt(data: EncryptedData): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

    let decrypted = decipher.update(data.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
```

---

## Performance Optimizations

### 1. Embedding Cache
```typescript
// Cache frequently accessed embeddings in Redis
const embeddingCache = new RedisCache({
  ttl: 3600, // 1 hour
  keyPrefix: "embedding:",
});
```

### 2. Batch Processing
```typescript
// Process documents in batches for efficiency
const batchProcessor = new BatchProcessor({
  batchSize: 10,
  maxWaitTime: 5000, // 5 seconds
  processor: async (batch) => {
    return await processDocumentBatch(batch);
  },
});
```

### 3. Query Optimization
```typescript
// Pre-compute and cache common aggregations
const insightCache = new MaterializedViewCache({
  views: {
    projectHealth: "SELECT * FROM project_health_view",
    riskPatterns: "SELECT * FROM risk_patterns_view",
    knowledgeStats: "SELECT * FROM knowledge_stats_view",
  },
  refreshInterval: 300000, // 5 minutes
});
```

---

## Monitoring & Analytics

```typescript
// Track AI usage and performance
export class AIMetricsCollector {
  async trackUsage(metrics: UsageMetrics) {
    await prometheus.histogram("ai_response_time", metrics.responseTime);
    await prometheus.counter("ai_tokens_used", metrics.tokensUsed);
    await prometheus.gauge("ai_cost_per_request", metrics.cost);

    // Store for analytics
    await db.insert(ai_usage_metrics).values({
      ...metrics,
      timestamp: new Date(),
    });
  }

  async generateReport(organizationId: string, period: string) {
    const metrics = await db
      .select()
      .from(ai_usage_metrics)
      .where(
        and(
          eq(ai_usage_metrics.organization_id, organizationId),
          gte(ai_usage_metrics.timestamp, getPeriodStart(period))
        )
      );

    return {
      totalCost: sum(metrics, "cost"),
      totalTokens: sum(metrics, "tokensUsed"),
      averageResponseTime: average(metrics, "responseTime"),
      modelBreakdown: groupBy(metrics, "model"),
      topQueries: getTopQueries(metrics),
    };
  }
}
```

---

## Deployment Architecture

```yaml
# docker-compose.yml for ConsultantLM
version: '3.8'

services:
  web:
    build: ./web
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  worker:
    build: ./worker
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_DB=consultantlm
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  neo4j:
    image: neo4j:5-enterprise
    environment:
      - NEO4J_AUTH=${NEO4J_USER}/${NEO4J_PASSWORD}
      - NEO4J_ACCEPT_LICENSE_AGREEMENT=yes
    volumes:
      - neo4j_data:/data

volumes:
  postgres_data:
  redis_data:
  neo4j_data:
```

---

This technical architecture provides a comprehensive blueprint for implementing ConsultantLM using AWS Bedrock and modern web technologies. The system is designed for scalability, security, and cost-effectiveness while delivering powerful AI capabilities to consultants.