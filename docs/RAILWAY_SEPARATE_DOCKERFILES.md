# Railway Setup with Separate Dockerfiles

This setup uses separate deployment directories, each with its own Dockerfile, allowing Railway to handle multiple services from a single repository.

## Project Structure

```
projectmanager/
├── deploy/
│   ├── web/
│   │   ├── Dockerfile       # Web service Dockerfile
│   │   └── .dockerignore
│   └── worker/
│       ├── Dockerfile       # Worker service Dockerfile
│       └── .dockerignore
├── apps/
│   ├── web/                # Next.js application
│   └── worker/             # Background job processor
└── packages/               # Shared packages
```

## Railway Configuration

### Web Service Setup

1. **Create Web Service in Railway**
   - Name: `web`
   - Connect to GitHub repository

2. **Configure Build Settings**
   - Go to Settings → General
   - **Root Directory**: Leave empty (use repo root)
   - **Dockerfile Path**: `deploy/web/Dockerfile`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

### Worker Service Setup

1. **Create Worker Service in Railway**
   - Name: `worker`
   - Connect to same GitHub repository

2. **Configure Build Settings**
   - Go to Settings → General
   - **Root Directory**: Leave empty (use repo root)
   - **Dockerfile Path**: `deploy/worker/Dockerfile`

3. **Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```

## How It Works

1. **Context Handling**: Even though the Dockerfile is in `deploy/web/`, Railway uses the repository root as the Docker build context. This allows the Dockerfile to access all monorepo files.

2. **Path Resolution**: The Dockerfiles use paths relative to the repository root:
   ```dockerfile
   COPY apps/web/package.json ./apps/web/
   COPY packages/ui/package.json ./packages/ui/
   ```

3. **Separate Builds**: Each service builds independently with its own Dockerfile, avoiding conflicts.

## Advantages

- ✅ **True separation**: Each service has its own Dockerfile
- ✅ **Railway native**: Uses Railway's root directory feature
- ✅ **No hacks needed**: Clean, straightforward setup
- ✅ **Independent deployments**: Services can be deployed separately
- ✅ **Monorepo friendly**: Shares code while maintaining isolation

## Testing Locally

To test the Docker builds locally:

```bash
# Build web service (from repo root)
docker build -f deploy/web/Dockerfile -t web-service .

# Build worker service (from repo root)
docker build -f deploy/worker/Dockerfile -t worker-service .
```

## Important Notes

1. **Always run Docker commands from repository root**, not from deploy directories
2. **Railway automatically uses repo root as context**, even when root directory is set to `/deploy/web`
3. **The Dockerfile paths are relative to the context** (repo root), not the Dockerfile location

## Troubleshooting

### "File not found" errors
- Ensure Docker build context is repository root
- Check that paths in Dockerfile are relative to repo root

### Environment variables not working
- Use Railway's reference syntax: `${{ServiceName.VARIABLE_NAME}}`
- Ensure services are in the same Railway project

### Build failing
- Check Railway logs for detailed error messages
- Verify root directory is set correctly in Railway settings
- Ensure Dockerfile path is relative to the root directory setting