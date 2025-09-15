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
RUN pnpm build && ls -la dist/
WORKDIR /app/packages/database
RUN pnpm build || true
WORKDIR /app/packages/api
RUN pnpm build || true
WORKDIR /app/packages/ui
RUN pnpm build || true

# Build the specified service
ARG SERVICE
WORKDIR /app/web
RUN if [ "$SERVICE" = "web" ]; then \
        pnpm build; \
    fi
WORKDIR /app/worker
RUN if [ "$SERVICE" = "worker" ]; then \
        pnpm build; \
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

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

COPY --from=builder /app/worker/dist ./worker/dist
COPY --from=builder /app/worker/package.json ./worker/package.json
COPY --from=builder /app/node_modules ./node_modules
# Copy packages to root packages directory
COPY --from=builder /app/packages ./packages
# Copy worker node_modules but replace symlinks with actual packages
COPY --from=builder /app/worker/node_modules ./worker/node_modules
# Ensure the AI package is properly linked by copying it directly
COPY --from=builder /app/packages/ai ./worker/node_modules/@consulting-platform/ai
COPY --from=builder /app/packages/database ./worker/node_modules/@consulting-platform/database

USER worker
WORKDIR /app/worker
CMD ["node", "dist/index.js"]

# Final stage selector
FROM ${SERVICE}-runner AS final