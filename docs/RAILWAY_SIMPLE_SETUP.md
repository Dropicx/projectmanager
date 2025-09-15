# Simple Railway Multi-Service Setup (No Multiple Dockerfiles)

Since Railway doesn't support multiple Dockerfiles, use Railway's build configuration instead:

## Web Service Setup

1. Create service named `web`
2. Connect GitHub repo
3. In Settings → Build & Deploy:
   ```
   Build Command: pnpm install && pnpm build:web
   Start Command: cd apps/web && pnpm start
   ```
4. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL` (reference from Postgres)

## Worker Service Setup

1. Create service named `worker`
2. Connect same GitHub repo
3. In Settings → Build & Deploy:
   ```
   Build Command: pnpm install && pnpm build:worker
   Start Command: cd apps/worker && pnpm start
   ```
4. Add environment variables:
   - `DATABASE_URL` (reference from Postgres)
   - `REDIS_URL` (reference from Redis)
   - AWS credentials

## Alternative: Use Nixpacks (Auto-detection)

Remove `railway.toml` and `Dockerfile`, let Railway auto-detect:

1. Web service will auto-detect Next.js
2. For worker, override with custom commands above

## Why This Works

- Railway runs build commands in monorepo root
- Each service builds only what it needs
- Start commands run from respective app directories
- No Docker complexity needed!