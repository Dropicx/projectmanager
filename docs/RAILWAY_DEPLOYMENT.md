# Railway Deployment Guide

## Overview

This project consists of multiple services that need to be deployed on Railway:
1. **Web Service** - Next.js frontend application
2. **Worker Service** - Background job processor for AI tasks
3. **PostgreSQL** - Database (Railway managed)
4. **Redis** - Queue and caching (Railway managed)

## Prerequisites

- Railway account with a project created
- GitHub repository connected to Railway
- Environment variables configured in Railway dashboard

## Service Setup

### 1. PostgreSQL Database

1. Add PostgreSQL service from Railway marketplace
2. Copy the `DATABASE_URL` from the service variables
3. Add it to both Web and Worker services

### 2. Redis Service

1. Add Redis service from Railway marketplace
2. Copy the `REDIS_URL` from the service variables
3. Add it to the Worker service (required for BullMQ)

### 3. Web Service

**Railway Configuration:**
- Service Name: `web-production`
- Build Command: Auto-detected from `Dockerfile`
- Start Command: Auto-detected from `Dockerfile`
- Port: Railway will auto-detect from the `PORT` environment variable

**Required Environment Variables:**
```env
# Database
DATABASE_URL=<from-postgresql-service>

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# AWS Bedrock (for AI features)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Application
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
```

**Deployment:**
1. Create a new service in Railway
2. Connect your GitHub repository
3. Set the root directory to `/` (project root)
4. Railway will use `railway.toml` and `Dockerfile` automatically
5. Add environment variables
6. Deploy

### 4. Worker Service

**Railway Configuration:**
- Service Name: `worker-production`
- Build Command: Uses `Dockerfile.worker`
- No exposed ports (background service)

**Required Environment Variables:**
```env
# Database (same as web service)
DATABASE_URL=<from-postgresql-service>

# Redis (from Redis service)
REDIS_URL=<from-redis-service>

# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Optional AI Services
OPENAI_API_KEY=sk-...
MISTRAL_API_KEY=...
```

**Deployment Steps:**
1. Create a new service in Railway (separate from web)
2. Connect the same GitHub repository
3. **IMPORTANT**: Override the Dockerfile path:
   - Go to service settings
   - Set custom build command: `docker build -f Dockerfile.worker .`
   - Or use the Railway CLI with `railway.worker.toml`
4. Add environment variables
5. Deploy

## Multi-Service Deployment with Railway CLI

If using Railway CLI:

```bash
# Deploy web service
railway up --service web

# Deploy worker service with custom config
railway up --service worker -c railway.worker.toml
```

## Environment Variable Management

### Shared Variables
Some variables should be shared across services:
- `DATABASE_URL`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Use Railway's variable referencing feature:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Service-Specific Variables
- Web: Clerk keys, `NEXT_PUBLIC_*` variables
- Worker: Redis URL, worker configuration

## Monitoring and Logs

1. **Web Service**: Check `/api/health` endpoint
2. **Worker Service**: Monitor through Railway logs
3. **Database**: Use Railway's database metrics
4. **Redis**: Monitor through Railway's Redis metrics

## Scaling Considerations

### Web Service
- Railway auto-scales based on traffic
- Consider setting resource limits in Railway dashboard

### Worker Service
- Adjust `WORKER_CONCURRENCY` based on workload
- Monitor Redis queue length
- Can run multiple worker instances if needed

## Troubleshooting

### Common Issues

1. **Build fails with Clerk error**
   - Ensure Clerk environment variables are set
   - Check that dynamic imports are working

2. **Worker can't connect to Redis**
   - Verify `REDIS_URL` is correct
   - Use internal Railway networking (`.railway.internal`)

3. **Database connection issues**
   - Check `DATABASE_URL` format
   - Ensure database is running
   - Verify network connectivity

4. **Port binding issues**
   - Web service must use `process.env.PORT`
   - Worker service doesn't need ports

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run (`pnpm db:migrate`)
- [ ] Redis service running
- [ ] Health check endpoint responding
- [ ] Worker service processing jobs
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place
- [ ] SSL certificates configured (Railway handles this)

## Cost Optimization

1. Use Railway's usage-based pricing efficiently
2. Set resource limits for services
3. Use internal networking (free data transfer)
4. Monitor and optimize worker job processing
5. Use Redis for caching to reduce database load