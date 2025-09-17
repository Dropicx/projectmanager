# 🏗️ System Architecture

## Overview

Consailt is built as a modern, AI-powered knowledge management platform for individual consultants and small teams. The system uses a monorepo architecture with Next.js 15, tRPC, and Drizzle ORM, designed for high performance, type safety, and privacy-first data handling.

## 🎯 Architecture Principles

- **Type Safety**: End-to-end TypeScript with tRPC
- **Performance**: Optimized for speed with caching and efficient queries
- **Scalability**: Horizontal scaling with stateless services
- **Privacy**: Zero-data-retention AI with client sanitization
- **Developer Experience**: Monorepo with shared packages
- **Knowledge-First**: Designed around knowledge capture and discovery

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Web App (Next.js 15)  │  Mobile App  │  API Clients  │  Admin │
│  - React 19            │  - React Native │  - tRPC SDK │  - Dashboard │
│  - Tailwind CSS        │  - Native     │  - REST API  │  - Analytics │
│  - shadcn/ui           │  - Expo       │  - WebSocket │  - Monitoring │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes  │  tRPC Router  │  WebSocket  │  Webhooks │
│  - /api/trpc/*       │  - Type-safe  │  - Real-time│  - Clerk  │
│  - /api/health       │  - Validation │  - Updates  │  - Stripe │
│  - /api/webhooks/*   │  - Caching    │  - Chat     │  - AWS    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  Project Management  │  AI Orchestration  │  Analytics  │  Auth │
│  - CRUD Operations   │  - Multi-model     │  - KPIs     │  - Clerk │
│  - Task Management   │  - Cost Optimization│  - Reports  │  - RBAC │
│  - Team Collaboration│  - Streaming       │  - Insights │  - MFA  │
│  - Knowledge Base    │  - Risk Assessment │  - Metrics  │  - SSO  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Neon)   │  Redis (Railway)  │  S3 (AWS)    │  Vector DB │
│  - Primary Database  │  - Caching        │  - File Storage│  - Embeddings │
│  - ACID Compliance   │  - Sessions       │  - Documents  │  - RAG Search │
│  - Full-text Search  │  - Job Queues     │  - Images     │  - Knowledge │
│  - JSONB Support     │  - Rate Limiting  │  - Backups    │  - Semantic │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  AWS Bedrock        │  Clerk Auth      │  Railway      │  Monitoring │
│  - Claude 3.7       │  - User Mgmt     │  - Hosting    │  - Sentry  │
│  - Nova Pro/Lite    │  - SSO           │  - Databases  │  - Langfuse │
│  - Mistral Large    │  - MFA           │  - Redis      │  - Logs    │
│  - Llama 3.2        │  - RBAC          │  - Domains    │  - Metrics │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Monorepo Structure

### Package Organization
```
projectmanager/
├── apps/                          # Applications
│   ├── web/                      # Next.js 15 Web Application
│   │   ├── app/                  # App Router (Next.js 15)
│   │   │   ├── (dashboard)/      # Dashboard routes
│   │   │   │   ├── projects/     # Project management
│   │   │   │   ├── insights/     # AI insights
│   │   │   │   ├── knowledge/    # Knowledge base
│   │   │   │   └── analytics/    # Analytics dashboard
│   │   │   ├── api/              # API routes
│   │   │   │   ├── trpc/         # tRPC endpoints
│   │   │   │   ├── health/       # Health checks
│   │   │   │   └── webhooks/     # External webhooks
│   │   │   └── providers/        # React providers
│   │   ├── components/           # React components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── forms/            # Form components
│   │   │   └── ui/               # UI components
│   │   └── lib/                  # Utilities and configs
│   └── worker/                   # Background Job Processor
│       ├── src/                  # Worker source code
│       │   ├── jobs/             # Job definitions
│       │   ├── processors/       # Job processors
│       │   └── schedulers/       # Cron jobs
│       └── dist/                 # Compiled output
├── packages/                     # Shared Packages
│   ├── api/                      # tRPC API Layer
│   │   ├── trpc/                 # tRPC configuration
│   │   │   ├── root.ts          # Root router
│   │   │   ├── trpc.ts          # tRPC instance
│   │   │   └── routers/         # Feature routers
│   │   │       ├── projects.ts  # Project endpoints
│   │   │       ├── ai.ts        # AI endpoints
│   │   │       └── analytics.ts # Analytics endpoints
│   │   └── index.ts             # Package exports
│   ├── database/                 # Database Layer
│   │   ├── schema.ts            # Drizzle schema
│   │   ├── migrations/          # Database migrations
│   │   ├── queries/             # Query functions
│   │   └── index.ts             # Database exports
│   ├── ai/                      # AI Orchestration
│   │   ├── bedrock/             # AWS Bedrock clients
│   │   │   ├── claude.ts        # Claude client
│   │   │   ├── nova.ts          # Nova client
│   │   │   └── mistral.ts       # Mistral client
│   │   ├── orchestrator.ts      # AI orchestrator
│   │   ├── cost-tracker.ts      # Cost management
│   │   └── index.ts             # AI exports
│   └── ui/                      # Shared UI Components
│       ├── components/          # Reusable components
│       ├── lib/                 # UI utilities
│       └── index.ts             # UI exports
└── docs/                        # Documentation
    ├── PRD.md                   # Product Requirements
    ├── API.md                   # API Documentation
    ├── DEPLOYMENT_GUIDE.md      # Deployment Guide
    └── ARCHITECTURE.md          # This file
```

## 🔄 Data Flow Architecture

### Request Flow
```
1. User Request
   ↓
2. Next.js App Router
   ↓
3. tRPC API Layer
   ↓
4. Business Logic
   ↓
5. Database/External Services
   ↓
6. Response Processing
   ↓
7. Client Update
```

### AI Processing Flow
```
1. User AI Request
   ↓
2. AI Orchestrator
   ↓
3. Model Selection (Cost Optimization)
   ↓
4. AWS Bedrock API
   ↓
5. Response Processing
   ↓
6. Cost Tracking
   ↓
7. Result Storage
   ↓
8. Client Response
```

### Background Job Flow
```
1. Trigger Event
   ↓
2. Job Queue (Redis)
   ↓
3. Worker Service
   ↓
4. Job Processor
   ↓
5. External API Calls
   ↓
6. Database Updates
   ↓
7. Notification/Webhook
```

## 🗄️ Database Architecture

### Schema Design
```sql
-- Core Tables
organizations          -- Multi-tenant organizations
├── users             -- User accounts and profiles
├── engagements       -- Client projects/engagements
├── knowledge_base    -- Core knowledge repository
│   ├── knowledge_categories -- Hierarchical organization
│   ├── knowledge_templates  -- Reusable structures
│   └── knowledge_tags       -- Flexible tagging
├── ai_interactions   -- AI usage tracking
├── news_articles     -- RSS feed content
├── search_history    -- Search analytics
└── files            -- Document attachments

-- Relationships
organizations (1) ←→ (N) users
organizations (1) ←→ (N) engagements
organizations (1) ←→ (N) knowledge_base
knowledge_base (N) ←→ (N) knowledge_categories
knowledge_base (N) ←→ (N) tags
users (1) ←→ (N) ai_interactions
users (1) ←→ (N) search_history
```

### Data Patterns
- **Multi-tenancy**: Organization-based data isolation
- **Audit Trail**: Complete change tracking
- **Soft Deletes**: Data preservation for compliance
- **JSONB Fields**: Flexible metadata storage
- **Vector Storage**: AI embeddings for RAG

## 🤖 AI Architecture

### Model Selection Strategy
```typescript
const modelMatrix = {
  'quick_summary': 'amazon.nova-lite',      // $0.06/1M tokens
  'project_analysis': 'amazon.nova-pro',    // $0.80/1M tokens  
  'risk_assessment': 'claude-3.7-sonnet',   // $3.00/1M tokens
  'technical_docs': 'mistral-large-2',      // $2.00/1M tokens
  'realtime': 'llama-3.2-3b'               // $0.10/1M tokens
}
```

### AI Features
- **Intelligent Model Routing**: Cost-optimized model selection
- **Streaming Responses**: Real-time AI interactions
- **Cost Tracking**: Usage monitoring and limits
- **Fallback Models**: Resilience and reliability
- **Context Management**: Efficient prompt engineering

## 🔐 Security Architecture

### Security Layers
```
1. Network Security
   ├── HTTPS/TLS 1.3
   ├── CORS Configuration
   └── Rate Limiting

2. Authentication
   ├── Clerk Integration
   ├── JWT Tokens
   ├── MFA Support
   └── SSO Integration

3. Authorization
   ├── RBAC (Role-Based Access Control)
   ├── Resource-Level Permissions
   └── API Key Management

4. Data Security
   ├── Encryption at Rest
   ├── Encryption in Transit
   ├── Zero-Data Retention (AI)
   └── GDPR Compliance

5. Application Security
   ├── Input Validation
   ├── SQL Injection Prevention
   ├── XSS Protection
   └── CSRF Protection
```

### Compliance
- **GDPR**: EU data residency and privacy
- **SOC2 Type II**: Security controls (in progress)
- **ISO 27001**: Information security (planned)
- **Zero-Data Retention**: AI model data handling

## 🚀 Deployment Architecture

### Railway Services
```
Railway Project
├── Web Service (Next.js)
│   ├── Port: 3000
│   ├── Health: /api/health
│   ├── Domain: https://your-app.railway.app
│   └── Auto-scaling: Enabled
├── Worker Service (Background Jobs)
│   ├── No port (background)
│   ├── Restart policy: on-failure
│   └── Concurrency: 5 workers
├── PostgreSQL Database
│   ├── Connection pooling
│   ├── Automated backups
│   └── Read replicas (optional)
└── Redis Database
    ├── Session storage
    ├── Job queues
    └── Caching layer
```

### Environment Strategy
- **Development**: Local with Docker
- **Staging**: Railway preview deployments
- **Production**: Railway with custom domain
- **CI/CD**: GitHub Actions with Railway

## 📊 Monitoring Architecture

### Observability Stack
```
Application Metrics
├── Sentry (Error Tracking)
├── Langfuse (AI Observability)
├── Railway Metrics (Infrastructure)
└── Custom Dashboards (Business Metrics)

Logging
├── Application Logs (Railway)
├── Database Logs (Neon)
├── AI Usage Logs (Custom)
└── Audit Logs (Database)

Alerting
├── Error Rate Alerts
├── Performance Alerts
├── Cost Alerts (AI)
└── Security Alerts
```

### Key Metrics
- **Performance**: Response time, throughput
- **Reliability**: Uptime, error rate
- **Business**: User engagement, AI usage
- **Cost**: Infrastructure, AI spending
- **Security**: Failed logins, suspicious activity

## 🔄 Scalability Architecture

### Horizontal Scaling
- **Stateless Services**: Easy horizontal scaling
- **Database Sharding**: Organization-based partitioning
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Automatic traffic distribution

### Performance Optimization
- **Caching Strategy**: Redis for hot data
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Code Splitting**: Optimized bundle sizes

### Future Scaling
- **Microservices**: Service decomposition
- **Event Sourcing**: Event-driven architecture
- **CQRS**: Command Query Responsibility Segregation
- **GraphQL**: Flexible data fetching

## 🛠️ Development Architecture

### Development Workflow
```
1. Feature Development
   ├── Feature branch
   ├── Local development
   ├── Unit tests
   └── Integration tests

2. Code Quality
   ├── TypeScript checking
   ├── ESLint/Biome linting
   ├── Prettier formatting
   └── Pre-commit hooks

3. Deployment
   ├── GitHub Actions CI
   ├── Railway deployment
   ├── Health checks
   └── Rollback capability
```

### Technology Choices

#### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: Component library
- **TanStack Query**: Data fetching and caching

#### Backend
- **tRPC**: Type-safe API layer
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database
- **Redis**: Caching and job queues

#### AI/ML
- **AWS Bedrock**: Multi-model AI platform
- **Claude 3.7**: Advanced reasoning
- **Nova Pro/Lite**: Cost-effective analysis
- **Mistral Large**: Technical documentation
- **Llama 3.2**: Real-time interactions

#### Infrastructure
- **Railway**: Application hosting
- **Neon**: PostgreSQL hosting
- **Clerk**: Authentication
- **Sentry**: Error monitoring
- **Langfuse**: AI observability

## 📈 Performance Architecture

### Performance Targets
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 100ms
- **Database Query Time**: < 50ms
- **AI Response Time**: < 5 seconds
- **Uptime**: 99.9%

### Optimization Strategies
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js Image component
- **Caching**: Multi-layer caching strategy
- **CDN**: Global content delivery
- **Database**: Query optimization and indexing

## 🔮 Future Architecture

### Planned Enhancements
- **Microservices**: Service decomposition
- **Event Streaming**: Real-time data processing
- **GraphQL**: Flexible API layer
- **Mobile Apps**: React Native applications
- **Advanced AI**: Custom model fine-tuning

### Scalability Roadmap
- **Multi-region**: Global deployment
- **Edge Computing**: Edge functions
- **Advanced Caching**: Distributed caching
- **Message Queues**: Event-driven architecture
- **Service Mesh**: Inter-service communication

## 📚 Documentation Architecture

### Documentation Structure
```
docs/
├── PRD.md                    # Product Requirements
├── API.md                    # API Documentation
├── DEPLOYMENT_GUIDE.md       # Deployment Guide
├── AWS_BEDROCK_INTEGRATION.md # AI Integration
├── DRIZZLE_ORM_GUIDE.md      # Database Guide
├── DEVELOPMENT_SETUP.md      # Development Setup
└── ARCHITECTURE.md           # This file
```

### Documentation Principles
- **Living Documentation**: Always up-to-date
- **Code Examples**: Practical implementation
- **Visual Diagrams**: Clear architecture understanding
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Recommended patterns

---

*Last Updated: January 2024*  
*Architecture Version: 1.0.0*
