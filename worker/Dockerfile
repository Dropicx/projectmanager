# Worker Service Dockerfile
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

# Copy worker app files
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies
RUN pnpm install

# Build
ENV NODE_ENV=production
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER worker

CMD ["node", "dist/index.js"]