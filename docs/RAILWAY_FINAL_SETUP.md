# Railway Setup - Final Working Solution

Since Railway auto-detects Dockerfiles and doesn't allow specifying custom Dockerfile paths, here's the working setup:

## Web Service (Uses Dockerfile)

1. **Create Web Service**
   - Name: `web`
   - Connect GitHub repo
   - **Root Directory**: Leave empty (uses repo root)
   - Railway will auto-detect the `Dockerfile` at root

2. **Environment Variables**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

## Worker Service (Use Build Commands, No Docker)

Since we can't have two Dockerfiles that Railway can choose between, use Railway's build commands instead:

1. **Create Worker Service**
   - Name: `worker`
   - Connect same GitHub repo
   - **Root Directory**: Leave empty (uses repo root)

2. **Override Build & Start Commands**
   In Railway Settings → Build & Deploy:

   **Build Command:**
   ```bash
   pnpm install && pnpm build:worker
   ```

   **Start Command:**
   ```bash
   cd apps/worker && pnpm start
   ```

3. **Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```

## Why This Works

- **Web**: Uses the Dockerfile at root (complex Next.js build benefits from Docker)
- **Worker**: Uses simple build commands (straightforward Node.js app doesn't need Docker)
- **No conflicts**: Only one Dockerfile in the repo
- **Both services**: Share the same monorepo codebase

## Alternative: Nixpacks Auto-Detection

If you remove the Dockerfile entirely, Railway will use Nixpacks which auto-detects:
- Next.js for the web service
- Node.js for the worker service

Then you just need to set the start commands appropriately.

## Testing Commands

To test locally before deploying:

```bash
# Test web build
pnpm build:web
cd apps/web && pnpm start

# Test worker build
pnpm build:worker
cd apps/worker && pnpm start
```

## Troubleshooting

### Worker service not starting?
- Check logs for missing environment variables
- Ensure Redis service is running
- Verify DATABASE_URL is accessible

### Web service build failing?
- Check Clerk environment variables are set
- Ensure all packages are building correctly

### Both services failing?
- Check pnpm-lock.yaml is committed
- Verify monorepo structure is intact