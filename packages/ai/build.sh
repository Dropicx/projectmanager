#!/bin/sh
# Build script for AI package that handles Docker environment

echo "Starting AI package build..."

# Remove old dist
rm -rf dist

# Run TypeScript compiler
pnpm tsc

# Check if we have the nested structure (happens in Docker)
if [ -d "dist/ai" ]; then
    echo "Detected nested build structure, restructuring..."

    # Move AI package files to root
    if [ -d "dist/ai" ]; then
        mv dist/ai/* dist/ 2>/dev/null || true
    fi

    # Clean up empty directories
    rm -rf dist/ai dist/database 2>/dev/null || true

    echo "Restructuring complete"
fi

# Verify the build
if [ -f "dist/index.js" ]; then
    echo "✓ Build successful - index.js found"
    ls -la dist/
    exit 0
else
    echo "✗ Build failed - index.js not found"
    echo "dist contents:"
    ls -la dist/
    exit 1
fi