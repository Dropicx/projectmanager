# Railway IAC Setup - Summary

## ✅ Files Created

### Configuration Files

1. **`railway.json`** - Primary service configuration
   - Configures the default web service
   - Uses `dockerfiles/Dockerfile.web`
   - Used by Railway for automatic deployments

2. **`railway-services.json`** - Complete service reference
   - Documents all services (web, worker, rsshub)
   - Includes all environment variables
   - Shows `RAILWAY_DOCKERFILE_PATH` for each service
   - Reference for manual setup

3. **`dockerfiles/Dockerfile.web`** - Web service Dockerfile
   - Optimized build for Next.js application
   - No SERVICE build arg needed

4. **`dockerfiles/Dockerfile.worker`** - Worker service Dockerfile
   - Optimized build for background jobs
   - Includes all necessary packages

5. **`dockerfiles/Dockerfile.rsshub`** - RSSHub service Dockerfile
   - Builds RSSHub from source
   - Includes all dependencies

6. **`dockerfiles/README.md`** - Dockerfiles documentation

### Documentation

7. **`RAILWAY_SETUP.md`** - Step-by-step setup guide
   - Detailed instructions for each service
   - Environment variable reference
   - Troubleshooting guide

8. **`RAILWAY_IAC.md`** - Infrastructure as Code documentation
   - Complete service architecture
   - Environment variables reference table
   - Service communication details

### Scripts

9. **`scripts/setup-railway.sh`** - Automated setup script
   - Links to Railway project
   - Adds databases (PostgreSQL, Redis)
   - Configures web and worker services with `RAILWAY_DOCKERFILE_PATH`
   - Provides RSSHub setup instructions

10. **`scripts/apply-railway-config.sh`** - Configuration application
    - Helper script for applying configurations
    - Service verification

## 🏗️ Services Configured

### ✅ Web Service
- **Dockerfile**: `dockerfiles/Dockerfile.web`
- **RAILWAY_DOCKERFILE_PATH**: `dockerfiles/Dockerfile.web`
- **Start Command**: `cd /app/web && node server.js`
- **Health Check**: `/api/health`
- **Port**: 3000

### ✅ Worker Service
- **Dockerfile**: `dockerfiles/Dockerfile.worker`
- **RAILWAY_DOCKERFILE_PATH**: `dockerfiles/Dockerfile.worker`
- **Start Command**: `cd /app/worker && node dist/index.js`
- **Jobs**: RSS sync, AI processing, cron schedules

### ⚠️ RSSHub Service (manual via dashboard)
- **Dockerfile**: `dockerfiles/Dockerfile.rsshub`
- **RAILWAY_DOCKERFILE_PATH**: `dockerfiles/Dockerfile.rsshub`
- **Port**: 1200
- **Cache**: Redis (DB 3)
- **Purpose**: Self-hosted RSS aggregator for brief360 feeds

### ✅ PostgreSQL (auto-managed)
- Railway automatically provisions
- Connection via `DATABASE_URL` env var

### ✅ Redis (auto-managed)
- Railway automatically provisions
- Connection via `REDIS_URL` env var

## 🔑 Key Configuration: RAILWAY_DOCKERFILE_PATH

Each service uses the `RAILWAY_DOCKERFILE_PATH` environment variable:

```bash
# Web service
RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.web

# Worker service
RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.worker

# RSSHub service
RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd /path/to/projectmanager
./scripts/setup-railway.sh
```

The script will:
1. Link to Railway project
2. Set `RAILWAY_DOCKERFILE_PATH` for web and worker
3. Add PostgreSQL and Redis if needed
4. Configure all environment variables
5. Provide instructions for RSSHub setup

### Option 2: Manual Setup

1. Link to Railway:
   ```bash
   railway login
   railway link
   # Select: consailt
   ```

2. Configure Web Service:
   ```bash
   railway service web
   railway variables set RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.web
   # ... (see RAILWAY_SETUP.md for full list)
   ```

3. Configure Worker Service:
   ```bash
   railway service worker
   railway variables set RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.worker
   # ... (see RAILWAY_SETUP.md for full list)
   ```

4. Create RSSHub Service:
   ```bash
   railway service create rsshub
   railway service rsshub variables set RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub
   railway service rsshub variables set NODE_ENV=production
   railway service rsshub variables set PORT=1200
   railway service rsshub variables set CACHE_TYPE=redis
   railway service rsshub variables set REDIS_DB=3
   ```

## 📋 What's Changed from Previous Setup

1. **Separate Dockerfiles** - Each service has its own Dockerfile in `dockerfiles/`
2. **RAILWAY_DOCKERFILE_PATH** - Uses Railway's native multi-service Dockerfile support
3. **No Build Args** - Removed `SERVICE` build arg approach
4. **Added RSSHub Service** - New service with Dockerfile in `dockerfiles/`
5. **Updated Environment Variables** - All RSS-related vars added
6. **Multi-frequency Scheduling** - Worker now has 15min, 30min, 60min, 120min cron jobs
7. **100+ RSS Feeds** - Brief360 feeds integrated

## 📚 Documentation

- **RAILWAY_SETUP.md** - Detailed setup instructions
- **RAILWAY_IAC.md** - Complete IAC documentation with `RAILWAY_DOCKERFILE_PATH` details
- **railway.json** - Primary service configuration
- **railway-services.json** - Complete service reference
- **dockerfiles/README.md** - Dockerfiles documentation

## ✨ Ready to Deploy!

All Infrastructure as Code files are ready with proper `RAILWAY_DOCKERFILE_PATH` configuration. Run the setup script to apply configurations to your Railway project!
