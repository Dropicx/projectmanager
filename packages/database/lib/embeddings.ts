/**
 * Embedding utilities for RAG without pgvector
 * Provides multiple alternatives for vector similarity search
 */

/**
 * Calculate cosine similarity between two vectors
 * Used for in-memory similarity search
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find top K most similar embeddings
 * Performs in-memory search (suitable for small to medium datasets)
 */
export function findSimilarEmbeddings(
  queryEmbedding: number[],
  embeddings: Array<{ id: string; embedding: number[]; [key: string]: any }>,
  topK: number = 5,
  threshold: number = 0.7
): Array<{ id: string; similarity: number; [key: string]: any }> {
  const similarities = embeddings
    .map((item) => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .filter((item) => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return similarities;
}

/**
 * Alternative 1: Use external vector database service
 * Examples: Pinecone, Weaviate, Qdrant, Chroma
 */
export interface VectorDBService {
  store(id: string, embedding: number[], metadata?: any): Promise<void>;
  search(
    embedding: number[],
    topK?: number
  ): Promise<Array<{ id: string; score: number; metadata?: any }>>;
  delete(id: string): Promise<void>;
}

/**
 * Alternative 2: Use Supabase with pgvector
 * If you migrate to Supabase, you get pgvector out of the box
 */
export const SUPABASE_MIGRATION_QUERY = `
-- Enable pgvector extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to knowledge_base
ALTER TABLE knowledge_base
ADD COLUMN embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
`;

/**
 * Alternative 3: Hybrid approach - Store in PostgreSQL, compute in-memory
 * Best for small to medium datasets (< 100k documents)
 */
export class HybridEmbeddingService {
  private cache: Map<string, number[]> = new Map();

  /**
   * Store embedding in PostgreSQL as JSONB
   */
  async store(db: any, id: string, embedding: number[], table: string = "knowledge_base") {
    // Store in database as JSONB array
    await db
      .update(table)
      .set({
        embedding: JSON.stringify(embedding),
      })
      .where({ id });

    // Cache in memory for fast search
    this.cache.set(id, embedding);
  }

  /**
   * Load all embeddings into memory for search
   */
  async loadEmbeddings(db: any, table: string = "knowledge_base") {
    const records = await db
      .select()
      .from(table)
      .where({
        embedding: { not: null },
      });

    for (const record of records) {
      if (record.embedding) {
        this.cache.set(
          record.id,
          typeof record.embedding === "string" ? JSON.parse(record.embedding) : record.embedding
        );
      }
    }
  }

  /**
   * Search for similar embeddings in memory
   */
  search(queryEmbedding: number[], topK: number = 5): Array<{ id: string; similarity: number }> {
    const embeddings = Array.from(this.cache.entries()).map(([id, embedding]) => ({
      id,
      embedding,
    }));

    return findSimilarEmbeddings(queryEmbedding, embeddings, topK);
  }
}

/**
 * Alternative 4: Use OpenSearch/Elasticsearch with vector search
 * Requires separate OpenSearch/Elasticsearch instance
 */
export const OPENSEARCH_MAPPING = {
  mappings: {
    properties: {
      content: { type: "text" },
      embedding: {
        type: "knn_vector",
        dimension: 1536,
        method: {
          name: "hnsw",
          space_type: "cosinesimil",
          engine: "lucene",
        },
      },
    },
  },
};

/**
 * Recommended approach for Railway deployment:
 *
 * 1. For MVP/small scale (< 10k documents):
 *    - Use JSONB storage + in-memory search
 *    - Simple, no extra dependencies
 *
 * 2. For production/scale:
 *    - Use external vector DB service (Pinecone free tier)
 *    - Or migrate to Supabase (includes pgvector)
 *    - Or add OpenSearch to your Railway project
 */

export default {
  cosineSimilarity,
  findSimilarEmbeddings,
  HybridEmbeddingService,
  SUPABASE_MIGRATION_QUERY,
  OPENSEARCH_MAPPING,
};
