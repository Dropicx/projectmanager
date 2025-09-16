# Multi-service Dockerfile for Monorepo
ARG SERVICE=web

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

# Copy all package.json files for better caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/
COPY worker/package.json ./worker/
COPY packages/ai/package.json ./packages/ai/
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build packages first
WORKDIR /app/packages/ai
RUN echo "Building AI package..." && \
    chmod +x build.sh && \
    pnpm build && \
    echo "AI package build completed"

WORKDIR /app/packages/database
RUN echo "Building database package..." && \
    pnpm build && \
    echo "Database package built successfully" && \
    ls -la dist/ || echo "dist folder not found"

WORKDIR /app/packages/api
RUN pnpm build || true
WORKDIR /app/packages/ui
RUN pnpm build || true

# Build the specified service
ARG SERVICE
WORKDIR /app/web

# Accept Clerk keys as build arguments from Railway
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Use build args as env vars, fallback to test key if not provided
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_bm9ibGUtZG9ua2V5LTIzLmNsZXJrLmFjY291bnRzLmRldiQ}
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL}
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL}
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}

RUN if [ "$SERVICE" = "web" ]; then \
        echo "Building with Clerk key: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}..." && \
        pnpm build; \
    fi
WORKDIR /app/worker
RUN if [ "$SERVICE" = "worker" ]; then \
        echo "Building worker service..." && \
        pnpm build && \
        echo "Worker built, checking dist contents:" && \
        ls -la dist/ && \
        echo "First 30 lines of index.js:" && \
        head -n 30 dist/index.js; \
    fi
WORKDIR /app

# Production stage for web
FROM node:22-alpine AS web-runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/web/.next ./web/.next
COPY --from=builder /app/web/public ./web/public
COPY --from=builder /app/web/package.json ./web/package.json
COPY --from=builder /app/web/next.config.js ./web/next.config.js
COPY --from=builder /app/web/server.js ./web/server.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/web/node_modules ./web/node_modules
COPY --from=builder /app/packages ./packages

USER nextjs
EXPOSE 3000
ENV PORT=3000
WORKDIR /app/web
CMD ["node", "server.js"]

# Production stage for worker
FROM node:22-alpine AS worker-runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm for production dependency installation
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

# Copy package files for installation
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/worker/package.json ./worker/
COPY --from=builder /app/packages/ai/package.json ./packages/ai/
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/ui/package.json ./packages/ui/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/worker/dist ./worker/dist
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/schema.ts ./packages/database/schema.ts
COPY --from=builder /app/packages/database/index.ts ./packages/database/index.ts

# Debug: Verify the setup
RUN echo "=== Verifying worker setup ===" && \
    echo "Worker dist contents:" && ls -la /app/worker/dist/ && \
    echo "Packages AI dist:" && ls -la /app/packages/ai/dist/ && \
    echo "AI node_modules check:" && ls -la /app/packages/ai/node_modules/@aws-sdk/ | head -5 && \
    echo "Worker node_modules check:" && ls -la /app/worker/node_modules/@consulting-platform/ && \
    echo "Root node_modules check:" && ls -la /app/node_modules/@aws-sdk/ | head -5 && \
    echo "=== Setup verification complete ==="

USER worker
# Railway will provide PORT env var, expose both possible ports
EXPOSE 3000 3001
WORKDIR /app/worker
CMD ["node", "dist/index.js"]

# Final stage selector
FROM ${SERVICE}-runner AS final