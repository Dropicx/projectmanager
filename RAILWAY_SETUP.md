# Railway Infrastructure as Code Setup Guide

This guide explains how to deploy the Consailt platform to Railway with all services, including the new RSSHub service for brief360 RSS feed integration.

## Project Structure

The Railway project "consailt" includes:

- **Web Service**: Next.js 15 application
- **Worker Service**: Background job processor with RSS feed syncing
- **RSSHub Service**: Self-hosted RSS aggregator (NEW)
- **PostgreSQL**: Database for application data
- **Redis**: Cache and job queue storage

## Quick Setup Script

Run this script to set up all services:

```bash
#!/bin/bash
# Setup Railway infrastructure for Consailt

# 1. Link to existing project
railway link 88196c0b-74a3-4682-acd4-8d89d9f7799b

# 2. Add databases (if not already added)
railway add postgresql
railway add redis

# 3. Create/configure services
# Note: Railway CLI doesn't fully support multi-service JSON yet,
# so we'll configure via CLI commands and dashboard

echo "✅ Railway project linked"
echo "📝 Next: Configure services via Railway dashboard or CLI commands below"
```

## Manual Service Configuration

### 1. Web Service

The web service is configured via `railway.json` (default service):

```bash
# Ensure web service is set as default
railway service web

# Set environment variables
railway variables set NODE_ENV=production
railway variables set NEXT_TELEMETRY_DISABLED=1
railway variables set RSSHUB_SELF_HOSTED=true
railway variables set RSS_ENABLE_BRIEF360_FEEDS=true
railway variables set RSS_MAX_CONCURRENT_FEEDS=10
railway variables set RSS_FETCH_TIMEOUT_MS=30000
```

### 2. Worker Service

```bash
# Create worker service
railway service create worker --source .

# Set worker-specific variables
railway service worker variables set NODE_ENV=production
railway service worker variables set WORKER_ENABLED=true
railway service worker variables set WORKER_CONCURRENCY=5
railway service worker variables set RSSHUB_SELF_HOSTED=true
railway service worker variables set RSS_ENABLE_BRIEF360_FEEDS=true

# Configure build args
railway service worker variables set SERVICE=worker
```

### 3. RSSHub Service (NEW)

RSSHub needs to be added as a separate service. Railway doesn't support Docker image services directly via CLI, so use one of these approaches:

#### Option A: Via Railway Dashboard

1. Go to Railway dashboard → Consailt project
2. Click "New" → "Service"
3. Select "GitHub Repo" → Choose a simple repo or use "Docker Image"
4. For Docker Image:
   - Image: `diygod/rsshub:latest`
   - Port: `1200`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=1200
     CACHE_TYPE=redis
     REDIS_URL=${REDIS_URL}
     REDIS_DB=3
     ```

#### Option B: Via Railway CLI (if supported)

```bash
# Create RSSHub service
railway service create rsshub

# Set as Docker image service
railway service rsshub variables set RAILWAY_DOCKERFILE_PATH=""
railway service rsshub variables set RAILWAY_DOCKER_IMAGE="diygod/rsshub:latest"

# Set environment variables
railway service rsshub variables set NODE_ENV=production
railway service rsshub variables set PORT=1200
railway service rsshub variables set CACHE_TYPE=redis
railway service rsshub variables set REDIS_DB=3
# REDIS_URL will be automatically injected by Railway
```

#### Option C: Deploy RSSHub via Railway Template

Railway has RSSHub templates available. You can:

1. Go to Railway dashboard
2. Click "New" → "Deploy from Template"
3. Search for "RSSHub"
4. Configure Redis connection to use existing Redis service
5. Set port to 1200

### 4. Set RSSHub URL in Web/Worker Services

After RSSHub service is created, get its service URL and update web/worker:

```bash
# Get RSSHub service URL (Railway provides this as SERVICE_URL)
# Then update web and worker services:

# For Web service
railway service web variables set RSSHUB_URL="${RSSHUB_SERVICE_URL}"

# For Worker service  
railway service worker variables set RSSHUB_URL="${RSSHUB_SERVICE_URL}"
```

**Note**: Railway provides a `RAILWAY_PRIVATE_DOMAIN` environment variable for inter-service communication. You can use:
- `http://rsshub-<service-id>.railway.internal:1200` OR
- Use Railway's service discovery if available

## Complete Environment Variables

### Web Service Variables

```bash
# Core
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1

# Database (auto-injected by Railway)
DATABASE_URL=${Postgres.DATABASE_URL}
REDIS_URL=${Redis.REDIS_URL}

# Clerk (set your actual keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AWS Bedrock
AWS_REGION=eu-central-1
BEDROCK_API_KEY=xxx
# OR
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Budget Control
BEDROCK_FREE_TIER_BUDGET_USD=10
BEDROCK_PRO_TIER_BUDGET_USD=50
BEDROCK_ENTERPRISE_BUDGET_USD=200
BEDROCK_DAILY_LIMIT_USD=20
BEDROCK_MONTHLY_BUDGET_USD=500

# RSS Configuration
RSS_ENABLE_BRIEF360_FEEDS=true
RSS_MAX_CONCURRENT_FEEDS=10
RSS_FETCH_TIMEOUT_MS=30000
RSS_ENABLED_CATEGORIES=security,news,business,technology,politics,regulation
RSSHUB_URL=http://rsshub-service-id.railway.internal:1200
RSSHUB_SELF_HOSTED=true
```

### Worker Service Variables

```bash
# Core
NODE_ENV=production
WORKER_ENABLED=true

# Database (auto-injected)
DATABASE_URL=${Postgres.DATABASE_URL}
REDIS_URL=${Redis.REDIS_URL}

# AWS Bedrock (same as web)
AWS_REGION=eu-central-1
BEDROCK_API_KEY=xxx

# Budget Control (same as web)
BEDROCK_FREE_TIER_BUDGET_USD=10
BEDROCK_PRO_TIER_BUDGET_USD=50
BEDROCK_ENTERPRISE_BUDGET_USD=200
BEDROCK_DAILY_LIMIT_USD=20
BEDROCK_MONTHLY_BUDGET_USD=500

# Worker Configuration
WORKER_CONCURRENCY=5
MAX_RETRIES=3
JOB_TIMEOUT_MS=300000
LOG_LEVEL=info

# RSS Configuration
RSS_ENABLE_BRIEF360_FEEDS=true
RSS_MAX_CONCURRENT_FEEDS=10
RSS_FETCH_TIMEOUT_MS=30000
RSSHUB_URL=http://rsshub-service-id.railway.internal:1200
RSSHUB_SELF_HOSTED=true
```

### RSSHub Service Variables

```bash
NODE_ENV=production
PORT=1200
CACHE_TYPE=redis
REDIS_URL=${Redis.REDIS_URL}
REDIS_DB=3
```

## Setting Variables via Railway CLI

### Bulk Variable Import

Create a file `railway-vars.env`:

```bash
NODE_ENV=production
RSS_ENABLE_BRIEF360_FEEDS=true
RSS_MAX_CONCURRENT_FEEDS=10
# ... etc
```

Then import:

```bash
# For web service
railway service web variables import railway-vars.env

# For worker service
railway service worker variables import railway-vars.env
```

## Verification Steps

### 1. Check Services

```bash
# List all services
railway status

# Check service health
railway logs --service web
railway logs --service worker
railway logs --service rsshub
```

### 2. Test RSSHub Connection

```bash
# From web or worker service
curl http://rsshub-service-url:1200/
# Should return RSSHub welcome page or API status
```

### 3. Verify RSS Feed Syncing

```bash
# Check worker logs for RSS sync
railway logs --service worker | grep "RSS SYNC"

# Should see:
# - Initial sync on startup
# - 15-minute, 30-minute, 60-minute, 120-minute cron jobs
# - Daily full sync
```

### 4. Check Database

```bash
# Connect to database
railway connect postgres

# Query news articles
SELECT COUNT(*) FROM news_articles;
SELECT DISTINCT source FROM news_articles LIMIT 20;
```

## Service Networking

Railway services can communicate internally using:

1. **Private DNS**: `http://service-name.railway.internal:port`
2. **Service URLs**: Railway provides `RAILWAY_PRIVATE_DOMAIN`
3. **Environment Variables**: Reference other services via `RAILWAY_*` variables

For RSSHub, the web/worker services should use:

```
RSSHUB_URL=http://rsshub.railway.internal:1200
```

Or if Railway provides service-specific URLs:

```
RSSHUB_URL=${RAILWAY_RSSHUB_URL}
```

## Continuous Deployment

Railway automatically deploys on git push if connected to GitHub:

1. Connect your GitHub repo to Railway
2. Railway will detect `railway.json` for default service configuration
3. Each service can have its own deployment settings
4. Environment variables are managed per-service

## Monitoring

### Health Checks

- **Web**: `https://your-app.railway.app/api/health`
- **Worker**: No HTTP endpoint (background service)
- **RSSHub**: `http://rsshub-url/`

### Logs

```bash
# Real-time logs
railway logs --service web --follow
railway logs --service worker --follow
railway logs --service rsshub --follow

# Filter by RSS
railway logs --service worker --follow | grep "RSS"
```

### Metrics

Monitor in Railway dashboard:
- Service uptime
- Request rates (web)
- Error rates
- Database connections
- Redis memory usage

## Troubleshooting

### RSSHub Not Accessible

1. Check RSSHub service is running: `railway logs --service rsshub`
2. Verify RSSHUB_URL is set correctly in web/worker services
3. Check Railway networking allows inter-service communication
4. Verify Redis connection for RSSHub cache

### RSS Feeds Not Syncing

1. Check worker logs: `railway logs --service worker | grep RSS`
2. Verify `RSS_ENABLE_BRIEF360_FEEDS=true`
3. Check `RSSHUB_URL` is correct
4. Verify Redis is accessible from worker
5. Check feed URLs are accessible (some may require authentication)

### Build Failures

1. Check Dockerfile builds correctly locally
2. Verify build args: `SERVICE=web` or `SERVICE=worker`
3. Check Railway build logs in dashboard
4. Ensure all dependencies are in package.json

## Next Steps

After setup:

1. ✅ All services deployed and running
2. ✅ RSSHub accessible from web/worker
3. ✅ RSS feeds syncing on schedule
4. ✅ Database receiving articles
5. ✅ Web interface showing news articles

## References

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [RSSHub Documentation](https://docs.rsshub.app)
- Railway Project: **consailt** (ID: 88196c0b-74a3-4682-acd4-8d89d9f7799b)

