# 🚀 Railway Services Configuration

## Current Setup

You have **2 services** connected to your GitHub repository:

### Service 1: Web Service (Main App)
- **Name**: `consailt` (or your chosen name)
- **Root Path**: `/` (root of repository)
- **Build Command**: `pnpm install --frozen-lockfile && pnpm build`
- **Start Command**: `pnpm start`
- **Port**: 3000
- **Health Check**: `/api/health`

### Service 2: Worker Service (Background Jobs)
- **Name**: `consailt-worker` (or your chosen name)
- **Root Path**: `/` (same repository)
- **Start Command**: `pnpm worker:start`
- **No Port**: Background service
- **No Health Check**: Not needed for workers

## 🔧 Service Configuration

### Web Service Settings
In Railway dashboard for your web service:

1. **Settings → Build**
   - Build Command: `pnpm install --frozen-lockfile && pnpm build`
   - Root Directory: `/` (or leave empty)

2. **Settings → Deploy**
   - Start Command: `pnpm start`
   - Health Check Path: `/api/health`
   - Health Check Timeout: 30 seconds

3. **Settings → Networking**
   - Port: 3000
   - Generate domain: Yes

### Worker Service Settings
In Railway dashboard for your worker service:

1. **Settings → Build**
   - Build Command: `pnpm install --frozen-lockfile && pnpm build`
   - Root Directory: `/` (or leave empty)

2. **Settings → Deploy**
   - Start Command: `pnpm worker:start`
   - No health check needed

3. **Settings → Networking**
   - No port needed (background service)

## 🗄️ Required Database Services

Add these services to your Railway project:

### PostgreSQL Database
1. Go to your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will auto-generate `DATABASE_URL`
4. This will be available to both web and worker services

### Redis Database
1. Go to your Railway project dashboard
2. Click "New" → "Database" → "Redis"
3. Railway will auto-generate `REDIS_URL`
4. This will be available to both web and worker services

## 🔑 Environment Variables

Set these in your Railway project (they'll be available to all services):

### Required Variables
```bash
# Authentication (get from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# AWS Bedrock (for AI features)
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

### Optional Variables
```bash
# File uploads
UPLOADTHING_SECRET=sk_xxx
UPLOADTHING_APP_ID=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LANGFUSE_PUBLIC_KEY=pk_xxx
LANGFUSE_SECRET_KEY=sk_xxx
```

## 🚀 Deployment Process

1. **Push to GitHub**: Any push to `main` branch triggers deployment
2. **Railway Builds**: Both services build automatically
3. **Railway Deploys**: Services start with their respective commands
4. **Health Checks**: Web service health check runs on `/api/health`

## 📊 Monitoring

### Web Service
- **URL**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/api/health`
- **Logs**: Available in Railway dashboard

### Worker Service
- **No URL**: Runs in background
- **Logs**: Available in Railway dashboard
- **Status**: Check Railway dashboard for running status

## 🔍 Troubleshooting

### Common Issues
1. **Build fails**: Check Node.js version (22+ required)
2. **Web service not starting**: Verify port 3000 is set
3. **Worker not starting**: Check `REDIS_URL` is available
4. **Database connection**: Verify `DATABASE_URL` is set

### Debug Commands
```bash
# Check service status
railway status

# View logs
railway logs

# View environment variables
railway variables
```

## ✅ Final Architecture

```
Railway Project
├── Web Service (Next.js)
│   ├── Port: 3000
│   ├── URL: https://your-app.railway.app
│   └── Health: /api/health
├── Worker Service (Background)
│   ├── No port
│   └── Processes: BullMQ jobs
├── PostgreSQL Database
│   └── Connection: DATABASE_URL
└── Redis Database
    └── Connection: REDIS_URL
```

## 🎯 Next Steps

1. ✅ **Services created** - Web and Worker services connected
2. ⏳ **Add databases** - PostgreSQL and Redis
3. ⏳ **Set environment variables** - Clerk, AWS, etc.
4. ⏳ **Test deployment** - Push to main branch
5. ⏳ **Verify health checks** - Check web service URL
