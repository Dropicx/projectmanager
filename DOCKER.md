# 🐳 Docker Setup Guide

Complete guide for running the Consulting Platform locally with Docker.

## 🚀 Quick Start (Recommended)

Use the automated development scripts for the fastest setup:

```bash
# Start everything (services + database seeding)
./start-dev.sh

# View logs
./logs-dev.sh [web|worker|postgres|redis|all]

# Stop services (preserve data)
./stop-dev.sh

# Stop and remove all data
./stop-dev.sh --clean

# Complete reset (fresh database)
./reset-dev.sh
```

**First Time Setup:**
1. Copy `.env.local.example` to `.env.local`
2. Add your Clerk and AWS credentials
3. Run `./start-dev.sh`

The start script automatically:
- ✅ Starts all Docker services
- ✅ Waits for database to be ready
- ✅ Runs database migrations
- ✅ Seeds sample data (projects, knowledge, insights)
- ✅ Shows service status and access points

---

## 📋 Prerequisites

- Docker Desktop 20.10+ installed
- Docker Compose V2
- At least 4GB RAM allocated to Docker
- Clerk account (for authentication)
- AWS account with Bedrock access (for AI features)

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

**Required:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from [Clerk Dashboard](https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` - Get from [Clerk Dashboard](https://dashboard.clerk.com)

**AWS Bedrock (Choose one option):**
- **Option 1 (Recommended - matches Railway production):**
  - `BEDROCK_API_KEY` - Your Bedrock API key
  - `BEDROCK_API_KEY_ID` - Your Bedrock key ID
  - `BEDROCK_API_KEY_SECRET` - Your Bedrock key secret
- **Option 2 (Standard AWS credentials):**
  - `AWS_ACCESS_KEY_ID` - AWS credentials with Bedrock access
  - `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - Default: `eu-central-1`

**Optional Budget Control:**
- `BEDROCK_FREE_TIER_BUDGET_USD` - Default: $10
- `BEDROCK_PRO_TIER_BUDGET_USD` - Default: $50
- `BEDROCK_ENTERPRISE_BUDGET_USD` - Default: $200
- `BEDROCK_DAILY_LIMIT_USD` - Default: $20
- `BEDROCK_MONTHLY_BUDGET_USD` - Default: $500

### 2. Start All Services

Build and start all services:

```bash
docker-compose up --build
```

Or run in detached mode (background):

```bash
docker-compose up -d --build
```

### 3. Database Setup

Run database migrations (first time only):

```bash
# Wait for services to be healthy, then run:
docker-compose exec web pnpm db:push
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🏗️ Services Overview

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| web | consulting-platform-web | 3000 | Next.js frontend |
| worker | consulting-platform-worker | 3001 | Background jobs (BullMQ) |
| postgres | consulting-platform-db | 5432 | PostgreSQL database |
| redis | consulting-platform-redis | 6379 | Redis for queues |

## 📝 Common Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f worker
docker-compose logs -f postgres
```

### Execute Commands
```bash
# Run pnpm commands in web container
docker-compose exec web pnpm db:studio
docker-compose exec web pnpm lint
docker-compose exec web pnpm type-check

# Access PostgreSQL
docker-compose exec postgres psql -U consulting -d consulting_platform

# Access Redis CLI
docker-compose exec redis redis-cli
```

### Database Management
```bash
# Push schema changes
docker-compose exec web pnpm db:push

# Run migrations
docker-compose exec web pnpm db:migrate

# Open Drizzle Studio
docker-compose exec web pnpm db:studio
# Then visit http://localhost:4983
```

## 🔧 Development Workflow

### Hot Reload Development

For development with hot reload, you can mount your local code:

Add this to `docker-compose.yml` under the `web` service:

```yaml
volumes:
  - ./web:/app/web
  - /app/web/node_modules
  - /app/web/.next
```

Then rebuild:

```bash
docker-compose up --build
```

### Debugging

View real-time logs:

```bash
# All services
docker-compose logs -f

# Just web app
docker-compose logs -f web

# Just worker
docker-compose logs -f worker
```

## 🐛 Troubleshooting

### Services Won't Start

Check if ports are already in use:

```bash
# Check port 3000
lsof -i :3000

# Check port 5432
lsof -i :5432

# Check port 6379
lsof -i :6379
```

Stop conflicting services or change ports in `docker-compose.yml`.

### Database Connection Issues

Ensure PostgreSQL is healthy:

```bash
docker-compose ps
docker-compose logs postgres
```

Test connection:

```bash
docker-compose exec postgres pg_isready -U consulting
```

### Redis Connection Issues

Check Redis health:

```bash
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Build Failures

Clean rebuild:

```bash
# Remove all containers and volumes
docker-compose down -v

# Remove dangling images
docker image prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### Out of Memory

Increase Docker Desktop memory:
- Mac/Windows: Docker Desktop → Settings → Resources → Memory
- Recommended: 4GB minimum, 8GB preferred

## 🧪 Testing

Run tests inside containers:

```bash
# Unit tests
docker-compose exec web pnpm test

# E2E tests
docker-compose exec web pnpm test:e2e

# Type checking
docker-compose exec web pnpm type-check

# Linting
docker-compose exec web pnpm lint
```

## 🗑️ Cleanup

### Remove Everything

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker rmi consulting-platform-web consulting-platform-worker

# Prune unused Docker resources
docker system prune -a
```

### Fresh Start

```bash
# Complete cleanup
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

## 📊 Monitoring

### Check Service Health

```bash
docker-compose ps
```

Healthy services show `(healthy)` status.

### Resource Usage

```bash
docker stats
```

Shows CPU, memory, network, and disk usage per container.

## 🔒 Security Notes

### Local Development
- Default PostgreSQL credentials are for **local development only**
- Never commit `.env.local` to version control
- Use `.env.local.example` as a template

### Production
- For production, use:
  - Managed database (Neon, Railway)
  - Managed Redis (Upstash)
  - Strong passwords
  - Encrypted connections

## 🚀 Production Deployment

Docker Compose is for **local development only**. For production:

1. Use Railway deployment:
   ```bash
   railway up
   ```

2. Or build production images:
   ```bash
   # Web service
   docker build --build-arg SERVICE=web -t consulting-platform-web:latest .

   # Worker service
   docker build --build-arg SERVICE=worker -t consulting-platform-worker:latest .
   ```

See [README.md](./README.md) for Railway deployment instructions.

## 💡 Tips

- Use `docker-compose up -d` to run in background
- Check logs with `docker-compose logs -f`
- Restart specific service: `docker-compose restart web`
- Rebuild specific service: `docker-compose up -d --build web`
- Access shell: `docker-compose exec web sh`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Project README](./README.md)

---

Built with ❤️ using Docker Compose
