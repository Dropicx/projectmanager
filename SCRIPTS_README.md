# 🚀 Development Scripts Overview

Quick reference for the automated development environment scripts.

## 📦 What Was Created

Four powerful scripts to manage your local Docker development environment:

| Script | Purpose | Usage |
|--------|---------|-------|
| `start-dev.sh` | Complete startup with DB seeding | `./start-dev.sh [--build]` |
| `stop-dev.sh` | Stop services (with cleanup option) | `./stop-dev.sh [--clean]` |
| `reset-dev.sh` | Full reset with fresh data | `./reset-dev.sh` |
| `logs-dev.sh` | View service logs easily | `./logs-dev.sh [service]` |

---

## ⚡ Quick Start

### First Time Setup
```bash
# 1. Copy environment template
cp .env.local.example .env.local

# 2. Edit .env.local with your credentials:
#    - Clerk keys (for auth)
#    - AWS Bedrock keys (for AI features)

# 3. Start everything!
./start-dev.sh
```

That's it! The script handles everything:
- ✅ Starts all Docker services
- ✅ Waits for services to be healthy
- ✅ Runs database migrations
- ✅ Seeds sample data
- ✅ Shows you how to access everything

---

## 🎯 Daily Workflow

```bash
# Morning: Start your environment
./start-dev.sh              # Normal startup

# After pulling code changes:
./start-dev.sh --build      # Rebuild with latest changes

# Development: View logs when needed
./logs-dev.sh web           # Just web app
./logs-dev.sh all           # All services

# Evening: Stop services
./stop-dev.sh               # Keep data
# or
./stop-dev.sh --clean       # Remove data
```

---

## 📝 Detailed Script Features

### `start-dev.sh` - Smart Startup

**Usage:**
```bash
./start-dev.sh          # Normal startup (use cached images)
./start-dev.sh --build  # Rebuild Docker images before starting
./start-dev.sh --help   # Show help message
```

**Automatically handles:**
1. Docker validation
2. Environment file setup
3. Service orchestration (with optional rebuild)
4. Health checks (waits for ready state)
5. Database migrations (only if needed)
6. Sample data seeding (only for fresh DB)

**When to use `--build`:**
- After making changes to Dockerfile or docker-compose.yml
- When package dependencies have changed significantly
- After pulling major updates from Git
- When troubleshooting image-related issues
- To ensure you're running the latest code changes

**Sample Data Included:**
- **4 Projects:** E-Commerce redesign, Mobile app, Analytics dashboard, API integration
- **Knowledge Base:** Technical docs, meeting notes, requirements, design system
- **AI Insights:** Risks, opportunities, trends, success metrics
- **News Articles:** Sample tech and business news
- **User Settings:** Pre-configured for test users

**Output:**
```
========================================
  Development Environment Ready!
========================================

Service Status:
  ✓ consulting-platform-web (healthy)
  ✓ consulting-platform-worker (healthy)
  ✓ consulting-platform-postgres (healthy)
  ✓ consulting-platform-redis (healthy)

Access Points:
  Web Application:  http://localhost:3000
  PostgreSQL:       localhost:5432
  Redis:            localhost:6379
  Worker Health:    http://localhost:3001/health

Sample Projects:
  • E-Commerce Platform Redesign (in progress)
  • Mobile App Development (planning)
  • Data Analytics Dashboard (completed)
  • API Integration Project (on hold)
```

---

### `stop-dev.sh` - Graceful Shutdown

**Basic Stop:**
```bash
./stop-dev.sh
```
- Stops all containers
- Preserves volumes (data safe!)
- Fast restart capability

**Clean Stop:**
```bash
./stop-dev.sh --clean
```
- Stops all containers
- Removes volumes (deletes database!)
- Cleans up dangling images
- Use when you want fresh start

---

### `reset-dev.sh` - Fresh Start

**Interactive Process:**
```bash
./reset-dev.sh
```

1. **Confirmation:** Type "yes" to proceed
2. **Rebuild Option:** Choose to rebuild images (y/n)
3. **Complete Reset:** Removes all data, rebuilds (optional), seeds fresh data

**When to Use:**
- Database schema changed significantly
- Need completely fresh sample data
- Testing first-time user experience
- Troubleshooting persistent issues
- Weekly cleanup to avoid stale data

---

### `logs-dev.sh` - Log Viewer

**View All Services:**
```bash
./logs-dev.sh all
```

**View Specific Service:**
```bash
./logs-dev.sh web       # Next.js app
./logs-dev.sh worker    # Background jobs
./logs-dev.sh postgres  # Database
./logs-dev.sh redis     # Cache
```

**Options:**
```bash
./logs-dev.sh web --tail=100    # Last 100 lines
./logs-dev.sh worker -f          # Follow mode (default)
```

**No Arguments:** Shows help with examples

---

## 🎨 Color-Coded Output

All scripts use color-coding for easy scanning:
- 🔵 **Blue:** Section headers and information
- 🟢 **Green:** Success messages and confirmations
- 🟡 **Yellow:** Warnings and optional actions
- 🔴 **Red:** Errors and critical issues

---

## 🗄️ Database Features

### Automatic Seeding

**Sample Projects:**
1. **E-Commerce Platform Redesign**
   - Status: In Progress
   - Budget: $50,000 USD
   - Timeline: Jan - Jun 2025

2. **Mobile App Development**
   - Status: Planning
   - Budget: $75,000 USD
   - Timeline: Mar - Sep 2025

3. **Data Analytics Dashboard**
   - Status: Completed
   - Budget: €40,000 EUR
   - Completed: Dec 2024

4. **API Integration Project**
   - Status: On Hold
   - Budget: $30,000 USD
   - Timeline: Feb - May 2025

**Knowledge Base Entries:**
- Technical architecture documentation
- Meeting notes with action items
- Requirements documents
- Design system specifications

**AI-Generated Insights:**
- Timeline risk alerts
- Performance optimization opportunities
- Resource utilization trends
- Success milestone tracking

**News Articles:**
- Tech industry trends
- Project management best practices
- Cybersecurity alerts

---

## 🔧 Advanced Usage

### Database Management
```bash
# Open Drizzle Studio (database GUI)
docker compose exec web pnpm db:studio

# Direct PostgreSQL access
docker compose exec postgres psql -U consulting -d consulting_platform

# Run custom migrations
docker compose exec web pnpm db:push
```

### Container Access
```bash
# Web container shell
docker compose exec web sh

# Run commands in container
docker compose exec web pnpm type-check
docker compose exec web pnpm lint
```

### Health Checks
```bash
# All services status
docker compose ps

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3001/health
```

---

## 🐛 Troubleshooting

### Scripts Won't Execute
```bash
# Fix permissions
chmod +x *.sh

# Or run with bash directly
bash start-dev.sh
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000  # Web
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop and try again
./stop-dev.sh --clean
./start-dev.sh
```

### Docker Issues
```bash
# Verify Docker is running
docker info

# Check available resources
docker system df

# Clean up space
docker system prune -a
```

### Database Problems
```bash
# Complete reset
./reset-dev.sh

# Manual database check
docker compose exec postgres psql -U consulting -d consulting_platform
```

---

## 📚 Documentation

- **Quick Reference:** This file (SCRIPTS_README.md)
- **Developer Guide:** [DEV.md](./DEV.md) - Comprehensive developer guide
- **Docker Details:** [DOCKER.md](./DOCKER.md) - Full Docker setup guide
- **Main README:** [README.md](./README.md) - Project overview

---

## ✨ Tips & Best Practices

### Daily Development
1. Start with `./start-dev.sh` every morning
2. Use `./logs-dev.sh` to debug issues
3. Stop with `./stop-dev.sh` at end of day (preserves data)

### Weekly Cleanup
```bash
# Every week, reset for fresh data
./reset-dev.sh
```
Benefits:
- No stale data accumulation
- Database schema stays current
- Sample data is fresh
- Tests first-time experience

### Before Commits
```bash
# Always check before committing
docker compose exec web pnpm type-check
docker compose exec web pnpm lint
docker compose build  # Ensure it builds
```

### Working with Multiple Branches
```bash
# Switching branches with schema changes?
./reset-dev.sh

# This ensures clean database for new branch
```

---

## 🎓 Script Behavior Summary

| Scenario | start-dev.sh | start-dev.sh --build | stop-dev.sh | stop-dev.sh --clean | reset-dev.sh |
|----------|--------------|---------------------|-------------|---------------------|--------------|
| **Start services** | ✅ | ✅ | ❌ | ❌ | ✅ (after cleanup) |
| **Stop services** | ❌ | ❌ | ✅ | ✅ | ✅ (during reset) |
| **Keep data** | N/A | N/A | ✅ | ❌ | ❌ |
| **Remove volumes** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Run migrations** | ✅ (if needed) | ✅ (if needed) | ❌ | ❌ | ✅ (fresh DB) |
| **Seed data** | ✅ (if empty DB) | ✅ (if empty DB) | ❌ | ❌ | ✅ (fresh data) |
| **Rebuild images** | ❌ | ✅ | ❌ | ❌ | ⚠️ (optional prompt) |
| **User interaction** | ❌ | ❌ | ❌ | ❌ | ✅ (confirmation) |

---

## 🚀 Next Steps

1. **Read the docs:**
   - [DEV.md](./DEV.md) - Complete developer guide
   - [DOCKER.md](./DOCKER.md) - Docker setup details

2. **Start developing:**
   ```bash
   ./start-dev.sh
   # Visit http://localhost:3000
   ```

3. **Join the team:**
   - Check out sample projects
   - Explore the knowledge base
   - Review AI insights

**Happy coding! 🎉**
