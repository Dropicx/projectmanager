# 🔌 API Documentation

## Overview

Consailt provides a comprehensive API built with **tRPC** for type-safe, end-to-end communication between the frontend and backend. The API is designed for knowledge management with modern patterns including automatic type inference, request/response validation, and AI-powered insights.

## 🏗️ Architecture

### API Structure
```
/api/
├── /trpc/          # Type-safe API endpoints
│   ├── /knowledge/ # Knowledge base operations
│   ├── /ai/        # AI orchestration and insights
│   ├── /projects/  # Engagement management
│   └── /analytics/ # Usage and performance metrics
└── /health/        # Health checks
```

### Technology Stack
- **Framework**: tRPC v11 with Next.js 15 App Router
- **Validation**: Zod schemas for runtime type safety
- **Database**: Drizzle ORM with PostgreSQL
- **Caching**: Redis for query caching and session management
- **Authentication**: Clerk for user management

## 🚀 Quick Start

### Base URL
```
Production: https://your-app.railway.app/api/trpc
Development: http://localhost:3000/api/trpc
```

### Authentication
All API requests require authentication via Clerk session tokens:

```typescript
// Client-side setup
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'

const trpc = createTRPCReact<AppRouter>()

const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        return {
          authorization: `Bearer ${getAuthToken()}`,
        }
      },
    }),
  ],
})
```

## 📋 Core Endpoints

### Knowledge Base API

#### Get All Knowledge Entries
```typescript
// Query
const knowledge = trpc.knowledge.getAll.useQuery({
  limit: 20,
  offset: 0,
  category: "solutions"
})

// Response
{
  "data": [
    {
      "id": "kb_123",
      "title": "AWS Migration Best Practices",
      "content": "Comprehensive guide for migrating to AWS...",
      "summary": "Key considerations for AWS migration projects",
      "knowledgeType": "solution",
      "entryType": "document",
      "visibility": "team",
      "tags": ["aws", "migration", "cloud"],
      "technologies": ["AWS", "Docker", "Kubernetes"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

#### Create Knowledge Entry
```typescript
// Mutation
const createKnowledge = trpc.knowledge.create.useMutation()

// Usage
createKnowledge.mutate({
  title: "Docker Containerization Guide",
  content: "Step-by-step guide for containerizing applications...",
  knowledgeType: "solution",
  entryType: "document",
  visibility: "team",
  tags: ["docker", "containers", "devops"],
  technologies: ["Docker", "Docker Compose"],
  engagementId: "eng_123" // Optional
})

// Response
{
  "data": {
    "id": "kb_124",
    "title": "Docker Containerization Guide",
    "knowledgeType": "solution",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Search Knowledge
```typescript
// Query
const searchResults = trpc.knowledge.search.useQuery({
  query: "AWS migration",
  filters: {
    knowledgeType: "solution",
    tags: ["aws", "cloud"],
    dateRange: {
      from: "2024-01-01",
      to: "2024-12-31"
    }
  },
  limit: 10
})

// Response
{
  "data": [
    {
      "id": "kb_123",
      "title": "AWS Migration Best Practices",
      "summary": "Key considerations for AWS migration projects",
      "relevanceScore": 0.95,
      "tags": ["aws", "migration", "cloud"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 5,
  "query": "AWS migration"
}
```

#### Update Knowledge Entry
```typescript
// Mutation
const updateKnowledge = trpc.knowledge.update.useMutation()

// Usage
updateKnowledge.mutate({
  id: "kb_123",
  data: {
    title: "Updated AWS Migration Guide",
    content: "Updated content with latest best practices...",
    tags: ["aws", "migration", "cloud", "updated"]
  }
})
```

#### Generate AI Summary for Knowledge Item
```typescript
// Mutation
const generateSummary = trpc.knowledge.generateSummary.useMutation()

// Usage
const summary = await generateSummary.mutate({
  knowledgeId: "kb_123"
})

// Response
{
  "data": {
    "summary": "This knowledge item provides a comprehensive framework for AWS migration, focusing on cost optimization and security best practices. It includes step-by-step guidance for planning, execution, and post-migration validation.",
    "generatedAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Generate Batch AI Summaries
```typescript
// Mutation
const generateBatchSummaries = trpc.knowledge.generateBatchSummaries.useMutation()

// Usage
const summaries = await generateBatchSummaries.mutate({
  knowledgeIds: ["kb_123", "kb_124", "kb_125"]
})

// Response
{
  "data": [
    {
      "knowledgeId": "kb_123",
      "summary": "Comprehensive AWS migration framework with focus on cost and security.",
      "cached": false
    },
    {
      "knowledgeId": "kb_124",
      "summary": "Database optimization strategies for high-performance PostgreSQL deployments.",
      "cached": true  // Reused existing summary
    },
    {
      "knowledgeId": "kb_125",
      "error": "Not found"
    }
  ]
}
```

### AI API

#### Generate Knowledge Insights
```typescript
// Mutation
const generateInsights = trpc.ai.generateInsights.useMutation()

// Usage
const insights = await generateInsights.mutate({
  knowledgeId: "kb_123",
  context: "Recent AWS migration project with specific challenges"
})

// Response
{
  "data": {
    "insights": [
      {
        "type": "pattern",
        "title": "Common AWS Migration Challenges",
        "description": "Based on your knowledge base, the most frequent issues are...",
        "confidence": 0.87,
        "relatedKnowledge": ["kb_124", "kb_125"],
        "recommendations": [
          "Create a migration checklist template",
          "Document common failure points"
        ]
      }
    ],
    "model": "claude-3.7-sonnet",
    "costCents": 15,
    "generatedAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Analyze Knowledge Patterns
```typescript
// Mutation
const analyzePatterns = trpc.ai.analyzePatterns.useMutation()

// Usage
const patterns = await analyzePatterns.mutate({
  knowledgeIds: ["kb_123", "kb_124", "kb_125"],
  analysisType: "trends"
})

// Response
{
  "data": {
    "patterns": [
      {
        "type": "trend",
        "title": "Increasing Cloud Adoption",
        "description": "Your knowledge base shows a 40% increase in cloud-related solutions over the past 6 months",
        "confidence": 0.92,
        "timeframe": "6 months",
        "relatedTags": ["aws", "azure", "cloud", "migration"]
      }
    ],
    "model": "nova-pro",
    "costCents": 8,
    "generatedAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Chat with Knowledge Assistant
```typescript
// Mutation with streaming
const chatWithAI = trpc.ai.chat.useMutation()

// Usage
const chat = await chatWithAI.mutate({
  message: "What are the best practices for AWS migration?",
  context: "knowledge_base",
  includeRelated: true
})

// Response
{
  "data": {
    "response": "Based on your knowledge base, here are the key AWS migration best practices...",
    "relatedKnowledge": [
      {
        "id": "kb_123",
        "title": "AWS Migration Best Practices",
        "relevanceScore": 0.95
      }
    ],
    "model": "claude-3.7-sonnet",
    "costCents": 12
  }
}
```

### Analytics API

#### Get Knowledge Base Metrics
```typescript
// Query
const metrics = trpc.analytics.getKnowledgeMetrics.useQuery({
  timeframe: "monthly"
})

// Response
{
  "data": {
    "totalEntries": 150,
    "newEntriesThisMonth": 25,
    "mostActiveTags": ["aws", "docker", "kubernetes"],
    "searchQueries": 450,
    "aiInsightsGenerated": 12,
    "averageResponseTime": 1.2,
    "topCategories": [
      { "name": "Solutions", "count": 75 },
      { "name": "Issues", "count": 30 },
      { "name": "Patterns", "count": 25 }
    ]
  }
}
```

#### Get AI Usage Analytics
```typescript
// Query
const aiUsage = trpc.analytics.getAIUsage.useQuery({
  timeframe: "monthly"
})

// Response
{
  "data": {
    "totalQueries": 150,
    "totalCostCents": 2500,
    "averageCostPerQuery": 16.67,
    "modelUsage": [
      { "model": "nova-lite", "queries": 80, "costCents": 480 },
      { "model": "claude-3.7-sonnet", "queries": 45, "costCents": 1350 },
      { "model": "nova-pro", "queries": 25, "costCents": 670 }
    ],
    "queryTypes": [
      { "type": "insights", "count": 60 },
      { "type": "search", "count": 50 },
      { "type": "analysis", "count": 40 }
    ]
  }
}
```

## 🔄 Real-time Features

### WebSocket Subscriptions
```typescript
// Subscribe to project updates
const projectUpdates = trpc.projects.onUpdate.useSubscription({
  projectId: "proj_123"
}, {
  onData: (update) => {
    console.log('Project updated:', update)
  }
})

// Subscribe to AI insights
const aiInsights = trpc.ai.onInsightsGenerated.useSubscription({
  projectId: "proj_123"
})
```

## 🛡️ Error Handling

### Standard Error Response
```typescript
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "field": "authorization",
      "expected": "Bearer token"
    }
  }
}
```

### Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## 📊 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Queries | 1000 | 1 minute |
| Mutations | 100 | 1 minute |
| AI Operations | 50 | 1 minute |
| File Uploads | 20 | 1 minute |

## 🔐 Authentication

### Clerk Integration
```typescript
// Server-side auth check
import { auth } from '@clerk/nextjs'

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { userId } = auth()
  
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    })
  }
  
  return {
    userId,
    db,
    // ... other context
  }
}
```

### Role-Based Access Control
```typescript
// Project access control
const projectAccess = trpc.projects.get.useQuery(
  { id: "proj_123" },
  {
    enabled: hasPermission('project:read', 'proj_123')
  }
)
```

## 📝 Request/Response Examples

### Complete Project Creation Flow
```typescript
// 1. Create project
const project = await trpc.projects.create.mutate({
  name: "Digital Transformation",
  client: "Acme Corp",
  startDate: "2024-02-01",
  endDate: "2024-08-01",
  budget: 200000,
  description: "Complete digital transformation initiative"
})

// 2. Add team members
await trpc.projects.addTeamMember.mutate({
  projectId: project.id,
  userId: "user_456",
  role: "Project Manager"
})

// 3. Generate initial insights
const insights = await trpc.ai.generateInsights.mutate({
  projectId: project.id,
  context: "New project setup"
})

// 4. Set up monitoring
trpc.analytics.getProjectKPIs.useQuery({
  projectId: project.id,
  timeframe: "weekly"
})
```

## 🧪 Testing

### Unit Testing
```typescript
import { createCaller } from '@/server/api/root'
import { createMockContext } from './test-utils'

describe('Projects API', () => {
  it('should create a project', async () => {
    const caller = createCaller(createMockContext())
    
    const result = await caller.projects.create({
      name: 'Test Project',
      client: 'Test Client',
      startDate: '2024-01-01',
      endDate: '2024-06-01',
      budget: 100000
    })
    
    expect(result.id).toBeDefined()
    expect(result.name).toBe('Test Project')
  })
})
```

### Integration Testing
```typescript
import { appRouter } from '@/server/api/root'

describe('API Integration', () => {
  it('should handle complete project workflow', async () => {
    // Test full project lifecycle
    const project = await createProject()
    const insights = await generateInsights(project.id)
    const kpis = await getProjectKPIs(project.id)
    
    expect(project).toBeDefined()
    expect(insights).toBeDefined()
    expect(kpis).toBeDefined()
  })
})
```

## 📚 SDKs and Client Libraries

### TypeScript Client
```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/api/root'

export const trpc = createTRPCReact<AppRouter>()
```

### React Query Integration
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
})
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://default:pass@host:6379

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# AI Services
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### tRPC Configuration
```typescript
// server/api/trpc.ts
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { userId } = auth()
  
  return {
    userId,
    db,
    redis,
    // ... other context
  }
}

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})
```

## 📈 Performance Optimization

### Query Optimization
```typescript
// Use select to limit returned fields
const projects = trpc.projects.getAll.useQuery(undefined, {
  select: (data) => data.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status
  }))
})

// Enable background refetching
const project = trpc.projects.get.useQuery(
  { id: "proj_123" },
  {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000
  }
)
```

### Caching Strategy
```typescript
// Server-side caching
export const getProject = t.procedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const cacheKey = `project:${input.id}`
    
    // Check cache first
    const cached = await ctx.redis.get(cacheKey)
    if (cached) return JSON.parse(cached)
    
    // Fetch from database
    const project = await ctx.db.query.projects.findFirst({
      where: eq(projects.id, input.id)
    })
    
    // Cache for 5 minutes
    await ctx.redis.setex(cacheKey, 300, JSON.stringify(project))
    
    return project
  })
```

## 🚨 Monitoring and Observability

### Health Checks
```typescript
// GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai": "operational"
  },
  "version": "1.0.0"
}
```

### Metrics and Logging
```typescript
// Request logging
export const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  
  const result = await next()
  
  const duration = Date.now() - start
  
  console.log(`${type.toUpperCase()} ${path} - ${duration}ms`)
  
  return result
})
```

## 📞 Support

For API support and questions:
- **Documentation**: [docs.consailt.ai](https://docs.consailt.ai)
- **Support Email**: api-support@consailt.ai
- **Status Page**: [status.consailt.ai](https://status.consailt.ai)

---

*Last Updated: January 2024*  
*API Version: 1.0.0*
