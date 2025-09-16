# 🔌 API Documentation

## Overview

Consailt provides a comprehensive REST API built with **tRPC** for type-safe, end-to-end communication between the frontend and backend. The API is designed with modern patterns including automatic type inference, request/response validation, and real-time capabilities.

## 🏗️ Architecture

### API Structure
```
/api/
├── /trpc/          # Type-safe API endpoints
│   ├── /projects/  # Project management
│   ├── /ai/        # AI orchestration
│   └── /analytics/ # Reporting & insights
├── /webhooks/      # External integrations
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

### Projects API

#### Get All Projects
```typescript
// Query
const projects = trpc.projects.getAll.useQuery()

// Response
{
  "data": [
    {
      "id": "proj_123",
      "name": "Digital Transformation",
      "status": "active",
      "client": "Acme Corp",
      "startDate": "2024-01-15",
      "endDate": "2024-06-15",
      "budget": 150000,
      "progress": 65,
      "team": [
        {
          "id": "user_456",
          "name": "Sarah Johnson",
          "role": "Senior Consultant"
        }
      ]
    }
  ]
}
```

#### Create Project
```typescript
// Mutation
const createProject = trpc.projects.create.useMutation()

// Usage
createProject.mutate({
  name: "New Project",
  client: "Client Name",
  startDate: "2024-02-01",
  endDate: "2024-08-01",
  budget: 200000,
  description: "Project description"
})

// Response
{
  "data": {
    "id": "proj_124",
    "name": "New Project",
    "status": "active",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Update Project
```typescript
// Mutation
const updateProject = trpc.projects.update.useMutation()

// Usage
updateProject.mutate({
  id: "proj_123",
  data: {
    name: "Updated Project Name",
    status: "completed",
    progress: 100
  }
})
```

#### Delete Project
```typescript
// Mutation
const deleteProject = trpc.projects.delete.useMutation()

// Usage
deleteProject.mutate({ id: "proj_123" })
```

### AI API

#### Generate Project Insights
```typescript
// Mutation
const generateInsights = trpc.ai.generateInsights.useMutation()

// Usage
const insights = await generateInsights.mutate({
  projectId: "proj_123",
  context: "Recent project updates and team feedback"
})

// Response
{
  "data": {
    "insights": [
      {
        "type": "risk_assessment",
        "title": "Budget Overrun Risk",
        "description": "Project is 15% over budget due to scope creep",
        "severity": "medium",
        "recommendations": [
          "Review scope with client",
          "Implement change control process"
        ]
      }
    ],
    "model": "claude-3.7-sonnet",
    "costCents": 25,
    "generatedAt": "2024-01-20T10:30:00Z"
  }
}
```

#### Assess Project Risk
```typescript
// Mutation
const assessRisk = trpc.ai.assessRisk.useMutation()

// Usage
const riskAssessment = await assessRisk.mutate({
  projectId: "proj_123",
  riskFactors: [
    "budget_variance",
    "timeline_delays",
    "resource_availability"
  ]
})
```

#### Chat with AI Assistant
```typescript
// Mutation with streaming
const chatWithAI = trpc.ai.chat.useMutation()

// Usage
const chat = await chatWithAI.mutate({
  message: "What are the key risks for this project?",
  projectId: "proj_123",
  context: "project_data"
})
```

### Analytics API

#### Get Project KPIs
```typescript
// Query
const kpis = trpc.analytics.getProjectKPIs.useQuery({
  projectId: "proj_123",
  timeframe: "monthly"
})

// Response
{
  "data": {
    "budgetUtilization": 78.5,
    "timelineProgress": 65.2,
    "teamEfficiency": 92.1,
    "riskScore": 3.2,
    "clientSatisfaction": 4.5
  }
}
```

#### Get Portfolio Overview
```typescript
// Query
const portfolio = trpc.analytics.getPortfolioOverview.useQuery({
  timeframe: "quarterly"
})

// Response
{
  "data": {
    "totalProjects": 15,
    "activeProjects": 8,
    "completedProjects": 7,
    "totalRevenue": 2500000,
    "averageProjectDuration": 4.2,
    "topPerformingTeam": "Strategy Team"
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
