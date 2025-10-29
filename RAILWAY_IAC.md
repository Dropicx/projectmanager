# Railway Infrastructure as Code (IAC) for Consailt

This document provides Infrastructure as Code configuration for the Consailt Railway project, including all services: Web, Worker, and the new RSSHub service.

## Project Information

- **Project Name**: consailt
- **Project ID**: 88196c0b-74a3-4682-acd4-8d89d9f7799b
- **Environment**: production

## Service Architecture

```
Railway Project: consailt
├── Web Service (Next.js 15)
│   ├── Port: 3000
│   ├── Health: /api/health
│   ├── Dockerfile: dockerfiles/Dockerfile.web
│   ├── Build Config: RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.web
│   └── Start: cd /app/web && node server.js
├── Worker Service (Background Jobs)
│   ├── No HTTP port
│   ├── Dockerfile: dockerfiles/Dockerfile.worker
│   ├── Build Config: RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.worker
│   ├── Start: cd /app/worker && node dist/index.js
│   └── Jobs: RSS sync, AI processing, cron jobs
├── RSSHub Service (NEW - RSS Aggregator)
│   ├── Dockerfile: dockerfiles/Dockerfile.rsshub
│   ├── Build Config: RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub
│   ├── Port: 1200
│   ├── Cache: Redis (DB 3)
│   └── Purpose: Self-hosted RSSHub for brief360 feeds
├── PostgreSQL Database
│   └── Auto-managed by Railway
└── Redis Database
    └── Auto-managed by Railway
```

## Configuration Files

### 1. dockerfiles/ Directory

Service-specific Dockerfiles:

- **`dockerfiles/Dockerfile.web`** - Web service (Next.js)
- **`dockerfiles/Dockerfile.worker`** - Worker service (background jobs)
- **`dockerfiles/Dockerfile.rsshub`** - RSSHub service (RSS aggregator)

Each Railway service uses `RAILWAY_DOCKERFILE_PATH` to specify its Dockerfile:

```bash
# Web service
RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.web

# Worker service
RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.worker

# RSSHub service
RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub
```

### 3. railway-services.json

Comprehensive service definitions (reference/documentation):

**Location**: `/railway-services.json`

**⚠️ Important:** Railway does NOT automatically read or apply this file. It serves as:
- Documentation of desired service state
- Reference for manual setup
- Input for automation scripts

**Why Railway can't create services from IAC files:**
Railway's `railway.json` only configures existing services, not creates them. Service creation must be done via:
- Railway Dashboard (UI)
- Railway CLI (`railway add --service <name>`)
- Railway API (GraphQL)

See `RAILWAY_IAC_LIMITATIONS.md` for details and workarounds.

## Automated Setup

### Quick Setup Script

### IAC Synchronization

Run the synchronization script that scans your environment and creates missing services:

```bash
cd /path/to/projectmanager
./scripts/railway-iac-sync.sh
```

This script will:
1. ✅ Scan your Railway environment
2. ✅ Compare with `railway-services.json`
3. ✅ Create missing databases (PostgreSQL, Redis)
4. ✅ Create missing services (web, worker, rsshub)
5. ✅ Configure all environment variables
6. ✅ Update existing services to match IAC
7. ✅ Fully idempotent (safe to run multiple times)

### Manual Setup Steps

If you prefer manual setup or need to customize:

#### Step 1: Link Project

```bash
railway login
railway link
# Select: consailt (88196c0b-74a3-4682-acd4-8d89d9f7799b)
```

#### Step 2: Add Databases

```bash
# PostgreSQL (if not already added)
railway add postgresql

# Redis (if not already added)
railway add redis
```

#### Step 3: Configure Web Service

The web service uses `railway.json` as default. Additional variables:

```bash
# Set web service
railway service web

# Dockerfile path (IMPORTANT)
railway variables set RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.web

# Core variables
railway variables set NODE_ENV=production
railway variables set NEXT_TELEMETRY_DISABLED=1
railway variables set PORT=3000

# RSS Configuration
railway variables set RSS_ENABLE_BRIEF360_FEEDS=true
railway variables set RSS_MAX_CONCURRENT_FEEDS=10
railway variables set RSS_FETCH_TIMEOUT_MS=30000
railway variables set RSS_ENABLED_CATEGORIES="security,news,business,technology,politics,regulation"
railway variables set RSSHUB_SELF_HOSTED=true

# Budget Control
railway variables set BEDROCK_FREE_TIER_BUDGET_USD=10
railway variables set BEDROCK_PRO_TIER_BUDGET_USD=50
railway variables set BEDROCK_ENTERPRISE_BUDGET_USD=200
railway variables set BEDROCK_DAILY_LIMIT_USD=20
railway variables set BEDROCK_MONTHLY_BUDGET_USD=500
```

**Required (set these manually):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `AWS_REGION` / `BEDROCK_API_KEY`
- `RSSHUB_URL` (after RSSHub is created)

#### Step 4: Configure Worker Service

```bash
# Create worker service if it doesn't exist
railway service worker

# Dockerfile path (IMPORTANT)
railway variables set RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.worker

# Core variables
railway variables set NODE_ENV=production
railway variables set WORKER_ENABLED=true
railway variables set WORKER_CONCURRENCY=5
railway variables set MAX_RETRIES=3
railway variables set JOB_TIMEOUT_MS=300000
railway variables set LOG_LEVEL=info

# RSS Configuration
railway variables set RSS_ENABLE_BRIEF360_FEEDS=true
railway variables set RSS_MAX_CONCURRENT_FEEDS=10
railway variables set RSS_FETCH_TIMEOUT_MS=30000
railway variables set RSSHUB_SELF_HOSTED=true

# Budget Control (same as web)
railway variables set BEDROCK_FREE_TIER_BUDGET_USD=10
railway variables set BEDROCK_PRO_TIER_BUDGET_USD=50
railway variables set BEDROCK_ENTERPRISE_BUDGET_USD=200
railway variables set BEDROCK_DAILY_LIMIT_USD=20
railway variables set BEDROCK_MONTHLY_BUDGET_USD=500
```

**Required (set these manually):**
- `AWS_REGION` / `BEDROCK_API_KEY`
- `RSSHUB_URL` (after RSSHub is created)

#### Step 5: Create RSSHub Service

RSSHub must be created via Railway Dashboard:

1. **Go to Railway Dashboard**: https://railway.app
2. **Select Consailt Project**
3. **Click "New" → "Service"**
4. **Choose one of these options:**

**Option A: Deploy from Template (Recommended)**
- Select "Deploy from Template"
- Search for "RSSHub"
- Deploy template
- Configure environment variables:
  ```
  NODE_ENV=production
  PORT=1200
  CACHE_TYPE=redis
  REDIS_URL=${Redis.REDIS_URL}
  REDIS_DB=3
  ```

**Option B: Dockerfile (Recommended)**
- Select "GitHub Repo" (this repository)
- Set `RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub`
- Port: `1200`
- Set environment variables:
  ```
  NODE_ENV=production
  PORT=1200
  CACHE_TYPE=redis
  REDIS_URL=${Redis.REDIS_URL}
  REDIS_DB=3
  ```

**Option C: Railway CLI**
```bash
railway service create rsshub
railway service rsshub variables set RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub
railway service rsshub variables set NODE_ENV=production
railway service rsshub variables set PORT=1200
railway service rsshub variables set CACHE_TYPE=redis
railway service rsshub variables set REDIS_DB=3
```

5. **Get RSSHub Service URL**
   - Note the service URL (e.g., `rsshub-production.up.railway.app`)
   - Or use private DNS: `rsshub.railway.internal:1200`

#### Step 6: Connect RSSHub to Web/Worker

After RSSHub is created, update web and worker services:

```bash
# For Web service
railway service web
railway variables set RSSHUB_URL="http://rsshub.railway.internal:1200"
# OR use public URL if private DNS doesn't work
# railway variables set RSSHUB_URL="https://rsshub-production.up.railway.app"

# For Worker service
railway service worker
railway variables set RSSHUB_URL="http://rsshub.railway.internal:1200"
# OR use public URL
# railway variables set RSSHUB_URL="https://rsshub-production.up.railway.app"
```

## Environment Variables Reference

### Web Service

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | Yes | |
| `PORT` | `3000` | Yes | Railway auto-assigned |
| `NEXT_TELEMETRY_DISABLED` | `1` | Yes | |
| `DATABASE_URL` | `${Postgres.DATABASE_URL}` | Yes | Auto-injected by Railway |
| `REDIS_URL` | `${Redis.REDIS_URL}` | Yes | Auto-injected by Railway |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxx` | Yes | Set manually |
| `CLERK_SECRET_KEY` | `sk_live_xxx` | Yes | Set manually |
| `AWS_REGION` | `eu-central-1` | Yes | Set manually |
| `BEDROCK_API_KEY` | `xxx` | Yes | Set manually (or use AWS_ACCESS_KEY_ID/SECRET) |
| `RSSHUB_URL` | `http://rsshub.railway.internal:1200` | Yes | Set after RSSHub created |
| `RSSHUB_SELF_HOSTED` | `true` | Yes | |
| `RSS_ENABLE_BRIEF360_FEEDS` | `true` | No | Default: true |
| `RSS_MAX_CONCURRENT_FEEDS` | `10` | No | Default: 10 |
| `RSS_FETCH_TIMEOUT_MS` | `30000` | No | Default: 30000 |
| `RSS_ENABLED_CATEGORIES` | `security,news,...` | No | All categories enabled by default |

### Worker Service

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | Yes | |
| `WORKER_ENABLED` | `true` | Yes | |
| `DATABASE_URL` | `${Postgres.DATABASE_URL}` | Yes | Auto-injected |
| `REDIS_URL` | `${Redis.REDIS_URL}` | Yes | Auto-injected |
| `AWS_REGION` | `eu-central-1` | Yes | Set manually |
| `BEDROCK_API_KEY` | `xxx` | Yes | Set manually |
| `RSSHUB_URL` | `http://rsshub.railway.internal:1200` | Yes | Set after RSSHub created |
| `RSSHUB_SELF_HOSTED` | `true` | Yes | |
| `WORKER_CONCURRENCY` | `5` | No | Default: 5 |
| `MAX_RETRIES` | `3` | No | Default: 3 |
| `JOB_TIMEOUT_MS` | `300000` | No | Default: 5 minutes |
| `LOG_LEVEL` | `info` | No | Default: info |

### RSSHub Service

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `NODE_ENV` | `production` | Yes | |
| `PORT` | `1200` | Yes | |
| `CACHE_TYPE` | `redis` | Yes | |
| `REDIS_URL` | `${Redis.REDIS_URL}` | Yes | Use Railway's Redis service |
| `REDIS_DB` | `3` | Yes | Separate DB from app Redis |

## Service Communication

### Internal Networking

Railway services communicate via private networking:

- **Private DNS**: `http://service-name.railway.internal:port`
- **Service URL**: Railway provides `RAILWAY_PRIVATE_DOMAIN`
- **Environment Variables**: Reference other services

For RSSHub connection:

```bash
# Use private DNS (recommended)
RSSHUB_URL=http://rsshub.railway.internal:1200

# OR use Railway's service discovery
RSSHUB_URL=${RAILWAY_RSSHUB_PRIVATE_DOMAIN}
```

### Database Connections

Railway automatically injects:

- **PostgreSQL**: `DATABASE_URL` - Full connection string
- **Redis**: `REDIS_URL` - Redis connection string
- **Service URLs**: Available as environment variables

## Verification & Testing

### 1. Check Service Status

```bash
# List all services
railway status

# Check specific service
railway service web
railway service worker
railway service rsshub
```

### 2. Verify Environment Variables

```bash
# Web service
railway variables --service web

# Worker service
railway variables --service worker

# RSSHub service
railway variables --service rsshub
```

### 3. Check Logs

```bash
# Real-time logs
railway logs --service web --follow
railway logs --service worker --follow
railway logs --service rsshub --follow

# Filter RSS-related logs
railway logs --service worker | grep "RSS SYNC"
```

### 4. Test RSSHub Connection

From web/worker service, RSSHub should be accessible at:
- `http://rsshub.railway.internal:1200` (internal)
- Or public URL if configured

### 5. Verify RSS Feed Syncing

Check worker logs for:

```
[RSS SYNC] Starting 15-minute RSS feed sync
[RSS SYNC] Starting 30-minute RSS feed sync
[RSS SYNC] Starting 60-minute RSS feed sync
[RSS SYNC] Starting 120-minute RSS feed sync
[RSS SYNC] Starting scheduled daily full RSS feed sync
```

## Deployment

### Automated Deployment

Railway automatically deploys on git push if:

1. GitHub repo is connected to Railway
2. `railway.json` is in root directory
3. Each service has proper configuration

### Manual Deployment

```bash
# Deploy default service (web)
railway up

# Deploy specific service
railway up --service web
railway up --service worker
```

## Monitoring

### Health Checks

- **Web**: `https://your-app.railway.app/api/health`
- **Worker**: No HTTP endpoint (background service)
- **RSSHub**: `http://rsshub-url/` (health endpoint if available)

### Logs & Metrics

Access via Railway Dashboard:
- Service metrics (CPU, memory, requests)
- Build logs
- Deployment history
- Error tracking

## Troubleshooting

### RSSHub Connection Issues

1. **Verify RSSHub is running**
   ```bash
   railway logs --service rsshub
   ```

2. **Check RSSHUB_URL is set correctly**
   ```bash
   railway variables get RSSHUB_URL --service web
   railway variables get RSSHUB_URL --service worker
   ```

3. **Test connectivity**
   - Try private DNS: `rsshub.railway.internal:1200`
   - Try public URL: `https://rsshub-production.up.railway.app`
   - Update `RSSHUB_URL` accordingly

### RSS Feeds Not Syncing

1. **Check worker logs**
   ```bash
   railway logs --service worker | grep "RSS"
   ```

2. **Verify environment variables**
   ```bash
   railway variables --service worker | grep RSS
   ```

3. **Check feed enablement**
   - Ensure `RSS_ENABLE_BRIEF360_FEEDS=true`
   - Verify feeds are enabled in `brief360-feeds.ts`

### Build Failures

1. **Check build logs in Railway Dashboard**
2. **Verify Dockerfile builds locally**
   ```bash
   docker build --build-arg SERVICE=web -t test-web .
   docker build --build-arg SERVICE=worker -t test-worker .
   ```

3. **Verify build args are passed**
   - Web: `SERVICE=web`
   - Worker: `SERVICE=worker`

## Next Steps After Setup

1. ✅ All services deployed
2. ✅ RSSHub accessible
3. ✅ RSS feeds syncing (check worker logs)
4. ✅ Database receiving articles
5. ✅ Web interface showing news

## Files Created

- `railway.json` - Primary service configuration (web)
- `railway-services.json` - Complete service reference
- `scripts/setup-railway.sh` - Automated setup script
- `RAILWAY_SETUP.md` - Detailed setup guide
- `RAILWAY_IAC.md` - This file (IAC documentation)

## References

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [RSSHub Documentation](https://docs.rsshub.app)
- Railway Project: **consailt** (ID: 88196c0b-74a3-4682-acd4-8d89d9f7799b)

