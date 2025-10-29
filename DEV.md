# 🛠️ Developer Quick Reference

Essential commands and workflows for local development with Docker.

## 📚 Table of Contents
- [Quick Start](#quick-start)
- [Development Scripts](#development-scripts)
- [Database Management](#database-management)
- [Debugging](#debugging)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Copy environment template
cp .env.local.example .env.local

# 2. Add your credentials to .env.local
# - Clerk keys: https://dashboard.clerk.com
# - AWS Bedrock keys (for AI features)

# 3. Start everything
./start-dev.sh
```

### Daily Development
```bash
# Start services
./start-dev.sh

# View logs (follow mode)
./logs-dev.sh all

# Stop when done
./stop-dev.sh
```

---

## 🎬 Development Scripts

### `./start-dev.sh`
**Purpose:** Complete environment startup with database seeding

**What it does:**
- ✅ Validates Docker is running
- ✅ Creates `.env` from `.env.local` if needed
- ✅ Starts all Docker services (web, worker, postgres, redis)
- ✅ Waits for services to be healthy
- ✅ Runs database migrations (if needed)
- ✅ Seeds sample data (projects, knowledge, insights, news)
- ✅ Shows service status and access points

**Output:**
```
Service Status:
  Web Application:  http://localhost:3000
  PostgreSQL:       localhost:5432
  Redis:            localhost:6379
  Worker Health:    http://localhost:3001/health
```

**Sample Data Includes:**
- 4 sample projects (various statuses)
- Knowledge base entries (technical docs, meeting notes, requirements)
- AI-generated insights (risks, opportunities, trends)
- News articles for testing

---

### `./stop-dev.sh [--clean]`
**Purpose:** Stop services with optional cleanup

**Usage:**
```bash
# Stop services, keep data
./stop-dev.sh

# Stop services and remove all data
./stop-dev.sh --clean
```

**Options:**
- No flags: Stops containers, preserves volumes
- `--clean` or `-c`: Removes volumes and dangling images

---

### `./reset-dev.sh`
**Purpose:** Complete reset for fresh start

**What it does:**
- ⚠️ Stops all services
- ⚠️ Removes all volumes (deletes database)
- 🔄 Optionally rebuilds Docker images
- ✅ Starts fresh with new seeded data

**When to use:**
- Database schema changed
- Need completely fresh data
- Testing onboarding flows
- Troubleshooting persistent issues

**Interactive prompts:**
1. Confirmation (type "yes")
2. Rebuild images (y/n)

---

### `./logs-dev.sh [service] [options]`
**Purpose:** Quick access to service logs

**Usage:**
```bash
# View all logs (follow mode)
./logs-dev.sh all

# View specific service
./logs-dev.sh web

# Show last 100 lines
./logs-dev.sh worker --tail=100

# No arguments shows help
./logs-dev.sh
```

**Services:**
- `web` - Next.js application
- `worker` - Background job processor
- `postgres` - Database
- `redis` - Cache/queue
- `all` - All services

---

## 🗄️ Database Management

### Migrations
```bash
# Push schema changes
docker compose exec web pnpm db:push

# Generate migration
docker compose exec web pnpm db:generate

# Apply migrations
docker compose exec web pnpm db:migrate
```

### Drizzle Studio (Database GUI)
```bash
# Start database studio
docker compose exec web pnpm db:studio

# Opens at: https://local.drizzle.studio
```

### Direct Database Access
```bash
# PostgreSQL CLI
docker compose exec postgres psql -U consulting -d consulting_platform

# Common queries
\dt                    # List tables
\d projects           # Describe table
SELECT COUNT(*) FROM projects;
```

### Backup & Restore
```bash
# Backup database
docker compose exec postgres pg_dump -U consulting consulting_platform > backup.sql

# Restore database
docker compose exec -T postgres psql -U consulting -d consulting_platform < backup.sql
```

---

## 🐛 Debugging

### View Logs
```bash
# Real-time logs for all services
docker compose logs -f

# Specific service
docker compose logs -f web

# Last 100 lines
docker compose logs --tail=100 worker
```

### Service Status
```bash
# Check service health
docker compose ps

# Detailed service info
docker compose exec web node --version
docker compose exec postgres psql --version
```

### Execute Commands in Containers
```bash
# Access web container shell
docker compose exec web sh

# Run TypeScript check
docker compose exec web pnpm type-check

# Run linter
docker compose exec web pnpm lint
```

### Redis Debugging
```bash
# Redis CLI
docker compose exec redis redis-cli

# Common Redis commands
PING                   # Test connection
KEYS *                 # List all keys
GET key_name          # Get value
FLUSHALL              # Clear all data
```

---

## 🔄 Common Workflows

### Frontend Development
```bash
# Start services
./start-dev.sh

# In another terminal, view web logs
./logs-dev.sh web

# Make code changes (hot reload enabled in dev)
# View http://localhost:3000

# Check TypeScript
docker compose exec web pnpm type-check

# Run linter
docker compose exec web pnpm lint
```

### Backend/API Development
```bash
# Start services
./start-dev.sh

# View worker logs
./logs-dev.sh worker

# Test API endpoints
curl http://localhost:3000/api/health

# Access database
docker compose exec postgres psql -U consulting -d consulting_platform
```

### Database Schema Changes
```bash
# 1. Modify packages/database/schema.ts

# 2. Generate migration
docker compose exec web pnpm db:generate

# 3. Apply changes
docker compose exec web pnpm db:push

# 4. Verify in Drizzle Studio
docker compose exec web pnpm db:studio
```

### Testing New Features
```bash
# 1. Reset for fresh data
./reset-dev.sh

# 2. Test feature with clean slate

# 3. Check logs for errors
./logs-dev.sh all
```

---

## 🔧 Troubleshooting

### Services Won't Start
```bash
# Check if ports are in use
lsof -i :3000  # Web
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Force stop and restart
./stop-dev.sh --clean
./start-dev.sh
```

### Database Connection Issues
```bash
# Check PostgreSQL health
docker compose exec postgres pg_isready -U consulting

# View database logs
docker compose logs postgres

# Reset database
./reset-dev.sh
```

### Build Failures
```bash
# Clean rebuild
./stop-dev.sh --clean
docker compose build --no-cache
./start-dev.sh
```

### Out of Memory
```bash
# Check Docker resource usage
docker stats

# Increase Docker Desktop memory:
# Settings → Resources → Memory (recommend 8GB)
```

### Permission Issues
```bash
# Fix script permissions
chmod +x *.sh

# Reset file ownership (if needed)
sudo chown -R $USER:$USER .
```

### Clerk Authentication Issues
```bash
# Verify Clerk keys in .env.local
cat .env.local | grep CLERK

# Check middleware is working
curl http://localhost:3000/api/health

# View web logs for Clerk errors
./logs-dev.sh web
```

---

## 📊 Monitoring

### Service Health Checks
```bash
# All services status
docker compose ps

# Web health
curl http://localhost:3000/api/health

# Worker health
curl http://localhost:3001/health

# PostgreSQL health
docker compose exec postgres pg_isready -U consulting

# Redis health
docker compose exec redis redis-cli ping
```

### Resource Usage
```bash
# Real-time container stats
docker stats

# Disk usage
docker system df
```

### Cleanup Unused Resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

---

## 🎯 Best Practices

### Daily Workflow
1. **Start:** `./start-dev.sh`
2. **Develop:** Make changes, hot reload works
3. **Test:** Check logs with `./logs-dev.sh`
4. **Stop:** `./stop-dev.sh` (preserves data)

### Weekly Cleanup
```bash
# Reset for fresh start
./reset-dev.sh

# This ensures:
# - No stale data accumulation
# - Database schema is current
# - Sample data is fresh
```

### Before Commits
```bash
# Type check
docker compose exec web pnpm type-check

# Lint
docker compose exec web pnpm lint

# Test (when available)
docker compose exec web pnpm test

# Build check
docker compose build
```

---

## 📝 Quick Reference

### Essential Commands
| Command | Purpose |
|---------|---------|
| `./start-dev.sh` | Start everything |
| `./stop-dev.sh` | Stop, keep data |
| `./stop-dev.sh --clean` | Stop, remove data |
| `./reset-dev.sh` | Fresh start |
| `./logs-dev.sh all` | View all logs |
| `docker compose ps` | Service status |
| `docker compose exec web pnpm db:studio` | Database GUI |

### Access Points
| Service | URL/Connection |
|---------|----------------|
| Web App | http://localhost:3000 |
| Worker Health | http://localhost:3001/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Drizzle Studio | Run `pnpm db:studio` |

### Environment Files
| File | Purpose |
|------|---------|
| `.env.local` | Your local credentials (not committed) |
| `.env` | Auto-generated from `.env.local` |
| `.env.local.example` | Template with all variables |

---

## 🆘 Getting Help

### Check Logs First
```bash
./logs-dev.sh all
```

### Verify Service Health
```bash
docker compose ps
curl http://localhost:3000/api/health
```

### Try Complete Reset
```bash
./reset-dev.sh
```

### Still Having Issues?
1. Check DOCKER.md for detailed troubleshooting
2. Review error logs carefully
3. Verify environment variables in `.env.local`
4. Ensure Docker Desktop has sufficient resources (4GB+ RAM)

---

**Happy Coding! 🚀**

For more details, see [DOCKER.md](./DOCKER.md)
