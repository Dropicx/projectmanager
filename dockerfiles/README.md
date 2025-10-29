# Dockerfiles Directory

This directory contains service-specific Dockerfiles for Railway deployment.

## Structure

- **`Dockerfile.web`** - Web service (Next.js application)
- **`Dockerfile.worker`** - Worker service (background jobs, RSS sync)
- **`Dockerfile.rsshub`** - RSSHub service (self-hosted RSS aggregator)

## Railway Configuration

Each service in Railway uses the `RAILWAY_DOCKERFILE_PATH` environment variable to specify which Dockerfile to use:

- **Web Service**: `RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.web`
- **Worker Service**: `RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.worker`
- **RSSHub Service**: `RAILWAY_DOCKERFILE_PATH=dockerfiles/Dockerfile.rsshub`

## Benefits of Separate Dockerfiles

1. **Clearer Build Process**: Each service has its own optimized build
2. **Better Caching**: Railway can cache builds per service
3. **Easier Maintenance**: Changes to one service don't affect others
4. **Faster Builds**: No need for conditional `SERVICE` build args
5. **Railway Native**: Uses Railway's `RAILWAY_DOCKERFILE_PATH` feature

## Local Testing

To test Dockerfiles locally:

```bash
# Test web service
docker build -f dockerfiles/Dockerfile.web -t consailt-web .

# Test worker service
docker build -f dockerfiles/Dockerfile.worker -t consailt-worker .

# Test RSSHub service
docker build -f dockerfiles/Dockerfile.rsshub -t consailt-rsshub .
```

## Legacy Dockerfile

The root `Dockerfile` (multi-service with `SERVICE` arg) is kept for backward compatibility and local docker-compose usage, but Railway services should use the files in this directory.

