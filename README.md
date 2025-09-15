# 🚀 Enterprise Consulting Platform

A production-ready consulting project management platform with AI-powered insights, built with the latest September 2025 tech stack and deployed on Railway.app.

## ✨ Features

- **AI-Powered Insights**: Multi-model AI orchestration with Claude, Nova, and Mistral
- **Project Management**: Comprehensive project tracking and collaboration
- **Knowledge Base**: RAG-enabled knowledge management system
- **Real-time Collaboration**: Live updates and notifications
- **Risk Assessment**: Automated AI-driven risk analysis
- **Cost Optimization**: Intelligent model selection based on task requirements
- **Zero-Data Retention**: GDPR-compliant with AWS Bedrock integration

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.5, React 19, Tailwind CSS v4, shadcn/ui
- **Backend**: Hono API, tRPC, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **AI**: AWS Bedrock (Claude, Nova, Mistral)
- **Queue**: BullMQ with Redis
- **Deployment**: Railway.app
- **Auth**: Clerk

### Monorepo Structure
```
consulting-platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── worker/                 # Background jobs
├── packages/
│   ├── database/               # Drizzle schema & migrations
│   ├── ai/                     # AI orchestration
│   ├── api/                    # tRPC API
│   └── ui/                     # Shared UI components
└── railway.toml                # Railway deployment config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.14.0+
- pnpm 9.0.0+
- PostgreSQL database
- Redis instance
- AWS Bedrock access
- Clerk account

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd consulting-platform
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host:5432/db
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
   CLERK_SECRET_KEY=sk_live_xxx
   
   # AWS Bedrock
   AWS_REGION=eu-central-1
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   
   # Redis
   REDIS_URL=redis://default:xxx@host:6379
   ```

3. **Database Setup**
   ```bash
   pnpm db:push
   pnpm db:migrate
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

   This will start:
   - Web app on http://localhost:3000
   - Worker processes for background jobs

## 🎯 Usage

### Project Management
- Create and manage consulting projects
- Track tasks, timelines, and budgets
- Collaborate with team members
- Generate AI-powered insights

### AI Features
- **Quick Summaries**: Fast insights using Nova Lite
- **Project Analysis**: Deep analysis with Nova Pro
- **Risk Assessment**: Critical analysis with Claude 3.7
- **Knowledge Search**: RAG-powered knowledge retrieval

### Cost Optimization
The AI orchestrator automatically selects the most cost-effective model:
- **Nova Lite**: $0.06/1M tokens (quick tasks)
- **Nova Pro**: $0.80/1M tokens (analysis)
- **Claude 3.7**: $3.00/1M tokens (critical tasks)
- **Mistral Large**: $2.00/1M tokens (technical docs)

## 🚄 Deployment

### Railway Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**
   ```bash
   railway up
   ```

3. **Configure Environment**
   ```bash
   railway variables set DATABASE_URL=your_postgres_url
   railway variables set REDIS_URL=your_redis_url
   # ... set other variables
   ```

### Environment Variables
See `env.example` for all required environment variables.

## 🔧 Development

### Available Scripts
```bash
# Development
pnpm dev                 # Start all services
pnpm build              # Build all packages
pnpm start              # Start production

# Database
pnpm db:push            # Push schema changes
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Drizzle Studio

# Testing
pnpm test               # Run tests
pnpm test:e2e           # Run E2E tests

# Linting
pnpm lint               # Lint all packages
pnpm type-check         # Type check all packages
```

### Package Structure
- **Database**: Drizzle ORM with PostgreSQL
- **AI**: Multi-model orchestration with cost optimization
- **API**: tRPC with Hono for type-safe APIs
- **UI**: Shared component library with shadcn/ui
- **Worker**: Background job processing with BullMQ

## 🔒 Security

- **Zero-Data Retention**: AWS Bedrock doesn't store your data
- **End-to-End Encryption**: Sensitive data encrypted in transit
- **GDPR Compliant**: EU data residency with Frankfurt region
- **Authentication**: Secure auth with Clerk
- **Rate Limiting**: API protection with Upstash

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **AI Observability**: Langfuse for LLM monitoring
- **Performance**: Built-in Next.js analytics
- **Logging**: Structured logging across all services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ using the latest 2025 tech stack