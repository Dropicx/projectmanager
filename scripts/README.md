# Railway Setup Scripts

This directory contains scripts for managing Railway infrastructure as code.

## Scripts Overview

### 🚀 `railway-iac-sync.sh` (Main Script)

**The primary Railway IAC script** - Scans environment, compares with IAC files, and creates/updates missing services.

**Features:**
- ✅ Scans current Railway environment
- ✅ Discovers existing services and databases
- ✅ Compares with `railway-services.json`
- ✅ Creates missing databases (PostgreSQL, Redis)
- ✅ Creates missing services (web, worker, rsshub)
- ✅ Configures all environment variables
- ✅ Updates existing services to match IAC
- ✅ Fully idempotent (safe to run multiple times)
- ✅ Colorized output with progress indicators

**Usage:**
```bash
./scripts/railway-iac-sync.sh
```

**Prerequisites:**
- Railway CLI installed
- Logged into Railway (`railway login`)
- Linked to Railway project (`railway link`)
- `jq` installed (recommended) or `python3` available

### 📡 `sync-rss-feeds.ts` (RSS Feed Sync)

Manual RSS feed synchronization script for testing and debugging.

**Features:**
- Syncs all configured RSS feeds
- Shows detailed sync results
- Useful for testing feed configurations
- Can be run independently of the worker service

**Usage:**
```bash
# Via npm script
pnpm sync:rss

# Or directly
tsx scripts/sync-rss-feeds.ts
```

## Quick Start

### First Time Setup

1. **Login to Railway:**
   ```bash
   railway login
   ```

2. **Link to project:**
   ```bash
   railway link
   # Select: consailt
   ```

3. **Run IAC sync:**
   ```bash
   ./scripts/railway-iac-sync.sh
   ```

The script will:
- Discover what's already in your Railway environment
- Create missing databases (PostgreSQL, Redis)
- Create missing services (web, worker, rsshub)
- Configure all environment variables from `railway-services.json`
- Show a summary of what was created/updated

### Subsequent Runs

Just run the sync script again - it's idempotent:

```bash
./scripts/railway-iac-sync.sh
```

It will:
- Skip existing services/databases
- Update environment variables to match IAC
- Only create what's missing

## How It Works

### 1. Environment Discovery

The script discovers:
- Existing services by trying to switch to common service names
- Existing databases by checking for `DATABASE_URL` and `REDIS_URL`

### 2. IAC Comparison

The script reads `railway-services.json` and compares:
- Desired services vs existing services
- Desired databases vs existing databases

### 3. Synchronization

For each missing item:
- **Databases:** Creates via `railway add --database <type>`
- **Services:** Creates via `railway add --service <name>`
  - Uses Dockerfile if `RAILWAY_DOCKERFILE_PATH` is specified
  - Uses Docker image if specified (e.g., RSSHub)
  - Falls back to repository-based creation

### 4. Configuration

For each service:
- Switches to service context
- Sets all environment variables from IAC
- Skips variables with `${}` references (handled by Railway)

## IAC File Structure

The script reads from `railway-services.json`:

```json
{
  "services": {
    "web": {
      "environmentVariables": {
        "RAILWAY_DOCKERFILE_PATH": "dockerfiles/Dockerfile.web",
        "NODE_ENV": "production",
        ...
      }
    },
    ...
  },
  "databases": {
    "postgres": { ... },
    "redis": { ... }
  }
}
```

## Troubleshooting

### Script fails to find services

The script discovers services by attempting to switch to them. If a service exists but isn't detected:

1. Manually verify: `railway status`
2. Try switching: `railway service <name>`
3. Re-run the sync script

### Variables not being set

Some variables may fail to set because:
- They contain `${}` references (intentional - handled by Railway)
- Service doesn't exist yet (service must be created first)
- Railway CLI requires service context

Solution: Run script again after services are created.

### jq not found

The script will use Python fallback, but `jq` is recommended:
```bash
# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq

# Or use Python fallback (already built-in)
```

## Advanced Usage

### Dry Run Mode

To see what would be created without making changes:

```bash
# The script shows what it will do, but you can add --dry-run if needed
# (Currently not implemented, but planned)
```

### Specific Service Sync

To sync only specific services, modify the script or run:

```bash
railway service web
railway variables set ...
```

### CI/CD Integration

The script can be run in CI/CD:

```yaml
# .github/workflows/railway-iac.yml
- name: Sync Railway IAC
  run: ./scripts/railway-iac-sync.sh
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## See Also

- `RAILWAY_IAC.md` - Complete IAC documentation
- `RAILWAY_IAC_LIMITATIONS.md` - Railway IAC limitations and workarounds
- `railway-services.json` - Service definitions
- `railway.json` - Default service configuration

