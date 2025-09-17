# 🛠️ Development Setup Guide

## Overview

This guide covers setting up the Consailt knowledge management platform development environment with all necessary tools, dependencies, and configurations for local development of the AI-powered knowledge base system.

## 📋 Prerequisites

### Required Software
- **Node.js**: 22.0.0 or higher
- **pnpm**: 9.0.0 or higher (recommended package manager)
- **Git**: Latest version
- **Docker**: For local database and Redis (optional)

### Recommended Tools
- **VS Code**: With recommended extensions
- **Postman/Insomnia**: For API testing
- **Drizzle Studio**: For database management
- **Railway CLI**: For deployment management

## 🚀 Quick Start

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/Dropicx/projectmanager.git
cd projectmanager

# Install dependencies
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Database Setup
```bash
# Start local PostgreSQL (using Docker)
docker run --name consailt-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=consailt_dev \
  -p 5432:5432 \
  -d postgres:15

# Start local Redis (using Docker)
docker run --name consailt-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Run database migrations
pnpm db:push
```

### 4. Start Development Servers
```bash
# Start all services
pnpm dev:all

# Or start individually
pnpm dev          # Web app only
pnpm dev:worker   # Worker service only
```

## 🔧 Detailed Setup

### Environment Configuration

#### Required Environment Variables
```bash
# .env.local
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/consailt_dev

# Redis
REDIS_URL=redis://localhost:6379

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# AWS Bedrock (for AI features)
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Application Settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
ENABLE_AI_INSIGHTS=true
ENABLE_REALTIME_COLLAB=true
AI_COST_LIMIT_CENTS=10000

# Optional Services
UPLOADTHING_SECRET=sk_xxx
UPLOADTHING_APP_ID=xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
LANGFUSE_PUBLIC_KEY=pk_xxx
LANGFUSE_SECRET_KEY=sk_xxx
```

#### Development vs Production
```bash
# Development (.env.local)
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/consailt_dev
REDIS_URL=redis://localhost:6379

# Production (.env.production)
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/consailt_prod
REDIS_URL=redis://default:pass@host:6379
```

### Database Setup

#### Option 1: Local PostgreSQL with Docker
```bash
# Start PostgreSQL container
docker run --name consailt-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=consailt_dev \
  -p 5432:5432 \
  -d postgres:15

# Verify connection
docker exec -it consailt-postgres psql -U postgres -d consailt_dev -c "SELECT version();"
```

#### Option 2: Neon Database (Cloud)
```bash
# 1. Create account at neon.tech
# 2. Create new database
# 3. Copy connection string
# 4. Update DATABASE_URL in .env.local
```

#### Option 3: Railway Database
```bash
# Add PostgreSQL service to Railway project
railway add postgresql

# Get connection string
railway variables | grep DATABASE_URL

# Copy to .env.local
```

### Redis Setup

#### Option 1: Local Redis with Docker
```bash
# Start Redis container
docker run --name consailt-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Verify connection
docker exec -it consailt-redis redis-cli ping
```

#### Option 2: Railway Redis
```bash
# Add Redis service to Railway project
railway add redis

# Get connection string
railway variables | grep REDIS_URL
```

### Authentication Setup (Clerk)

#### 1. Create Clerk Account
```bash
# 1. Go to clerk.com
# 2. Create new application
# 3. Choose "Next.js" as framework
# 4. Copy API keys
```

#### 2. Configure Clerk
```bash
# Add to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Configure webhooks (optional)
CLERK_WEBHOOK_SECRET=whsec_xxx
```

#### 3. Test Authentication
```bash
# Start development server
pnpm dev

# Visit http://localhost:3000
# Test sign up/sign in flow
```

### AI Services Setup (AWS Bedrock)

#### 1. AWS Account Setup
```bash
# 1. Create AWS account
# 2. Enable Bedrock in eu-central-1 region
# 3. Create IAM user with Bedrock permissions
# 4. Generate access keys
```

#### 2. Configure AWS Credentials
```bash
# Option 1: Environment variables
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Option 2: AWS CLI
aws configure
```

#### 3. Test AI Integration
```bash
# Test Bedrock connection
pnpm test:ai

# Or test in development
# Visit http://localhost:3000/projects
# Try generating AI insights
```

## 🏗️ Project Structure

### Monorepo Layout
```
projectmanager/
├── apps/
│   ├── web/                 # Next.js 15 application
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and configurations
│   │   └── package.json
│   └── worker/             # Background job processor
│       ├── src/           # Worker source code
│       └── package.json
├── packages/
│   ├── api/               # tRPC API layer
│   │   ├── trpc/         # tRPC routers and procedures
│   │   └── package.json
│   ├── database/          # Drizzle ORM and schema
│   │   ├── schema.ts     # Database schema
│   │   ├── migrations/   # Database migrations
│   │   └── package.json
│   ├── ai/               # AI orchestration
│   │   ├── bedrock/      # AWS Bedrock clients
│   │   ├── orchestrator.ts
│   │   └── package.json
│   └── ui/               # Shared UI components
│       ├── components/   # Reusable components
│       ├── lib/         # Utilities
│       └── package.json
├── docs/                 # Documentation
├── package.json         # Root package.json
├── pnpm-workspace.yaml  # Workspace configuration
└── turbo.json          # Turborepo configuration
```

### Key Directories
- **`apps/web/`**: Main Next.js application
- **`apps/worker/`**: Background job processor
- **`packages/api/`**: tRPC API definitions
- **`packages/database/`**: Database schema and queries
- **`packages/ai/`**: AI orchestration and Bedrock integration
- **`packages/ui/`**: Shared UI components

## 🔄 Development Workflow

### Daily Development
```bash
# 1. Start development servers
pnpm dev:all

# 2. Open browser
open http://localhost:3000

# 3. Make changes
# - Edit code in your preferred editor
# - Changes auto-reload in browser

# 4. Run tests
pnpm test

# 5. Check types
pnpm type-check

# 6. Lint code
pnpm lint
```

### Database Changes
```bash
# 1. Modify schema in packages/database/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:push

# 4. Update types
pnpm type-check
```

### Adding New Features
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# - Add new components
# - Update API endpoints
# - Modify database schema if needed

# 3. Test changes
pnpm test
pnpm type-check
pnpm lint

# 4. Commit changes
git add .
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/new-feature
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in specific package
pnpm test --filter=@consulting-platform/api

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure
```
packages/
├── api/
│   └── __tests__/
│       ├── routers/
│       │   ├── projects.test.ts
│       │   └── ai.test.ts
│       └── setup.ts
├── database/
│   └── __tests__/
│       ├── queries/
│       │   └── projects.test.ts
│       └── setup.ts
└── ai/
    └── __tests__/
        ├── orchestrator.test.ts
        └── mocks/
```

### Writing Tests
```typescript
// packages/api/__tests__/routers/projects.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createCaller } from '../../trpc/root'
import { createMockContext } from '../setup'

describe('Projects Router', () => {
  let caller: ReturnType<typeof createCaller>

  beforeEach(() => {
    const ctx = createMockContext()
    caller = createCaller(ctx)
  })

  it('should create a project', async () => {
    const projectData = {
      name: 'Test Project',
      client: 'Test Client',
      startDate: '2024-01-01',
      endDate: '2024-06-01',
      budget: 100000
    }

    const result = await caller.projects.create(projectData)
    
    expect(result.id).toBeDefined()
    expect(result.name).toBe('Test Project')
  })
})
```

## 🔍 Debugging

### VS Code Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/web/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Worker",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/worker/src/index.ts",
      "cwd": "${workspaceFolder}/apps/worker",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Debugging Tools
```bash
# Debug Next.js app
pnpm dev --inspect

# Debug worker service
pnpm dev:worker --inspect

# Debug specific test
pnpm test --inspect-brk packages/api/__tests__/routers/projects.test.ts
```

### Common Debugging Scenarios
```typescript
// 1. Database connection issues
console.log('Database URL:', process.env.DATABASE_URL)

// 2. tRPC procedure debugging
export const debugProcedure = t.procedure
  .input(z.any())
  .query(async ({ input, ctx }) => {
    console.log('Input:', input)
    console.log('Context:', ctx)
    // ... rest of procedure
  })

// 3. AI service debugging
console.log('AWS Region:', process.env.AWS_REGION)
console.log('AI Enabled:', process.env.ENABLE_AI_INSIGHTS)
```

## 🚀 Deployment

### Local Testing
```bash
# Build all packages
pnpm build

# Start production build locally
pnpm start

# Test worker service
pnpm worker:start
```

### Railway Deployment
```bash
# Login to Railway
railway login

# Link to project
railway link

# Deploy
railway up

# Check status
railway status

# View logs
railway logs
```

### Environment Management
```bash
# Set production variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your-prod-db-url

# Deploy specific service
railway up --service web
railway up --service worker
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

#### 2. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### 3. Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

#### 4. Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear pnpm cache
pnpm store prune
```

#### 5. TypeScript Errors
```bash
# Regenerate types
pnpm type-check

# Clear TypeScript cache
rm -rf .next
rm -rf apps/*/dist
```

### Performance Issues

#### 1. Slow Build Times
```bash
# Use turbo cache
pnpm build --cache

# Clear turbo cache
pnpm turbo clean
```

#### 2. Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm dev

# Or use different Node.js version
nvm use 22
```

#### 3. Database Performance
```bash
# Check slow queries
# Add to .env.local
DEBUG=drizzle:*

# Monitor connection pool
# Check database logs
```

## 📚 Useful Commands

### Package Management
```bash
# Install dependencies
pnpm install

# Add new package
pnpm add package-name
pnpm add -D package-name  # dev dependency

# Add to specific workspace
pnpm add package-name --filter=@consulting-platform/web

# Update packages
pnpm update
pnpm update --latest
```

### Development
```bash
# Start all services
pnpm dev:all

# Start specific service
pnpm dev --filter=@consulting-platform/web
pnpm dev:worker

# Build all packages
pnpm build

# Type check
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

### Database
```bash
# Generate migration
pnpm db:generate

# Apply migrations
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Reset database
pnpm db:drop
pnpm db:push
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test
pnpm test packages/api/__tests__/routers/projects.test.ts
```

### Deployment
```bash
# Deploy to Railway
railway up

# Check deployment status
railway status

# View logs
railway logs

# Connect to database
railway connect postgresql
```

## 📞 Support

### Getting Help
- **Documentation**: Check the `/docs` folder
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub discussions
- **Slack**: Join #consailt-dev channel

### Useful Resources
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **tRPC Docs**: [trpc.io](https://trpc.io)
- **Drizzle Docs**: [orm.drizzle.team](https://orm.drizzle.team)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)

---

*Last Updated: January 2024*  
*Setup Version: 1.0.0*
