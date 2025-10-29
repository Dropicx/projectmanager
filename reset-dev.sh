#!/bin/bash

# Development Environment Reset Script
# Complete cleanup and fresh start with database seeding

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Reset Development Environment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${RED}WARNING: This will delete all data!${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo -e "  • All database tables and data"
echo -e "  • Redis cache"
echo -e "  • Docker volumes"
echo ""

# Confirm reset
read -p "Are you sure you want to reset? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Reset cancelled${NC}"
    exit 0
fi

echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Step 1: Stop and clean
echo -e "${BLUE}[1/3] Stopping services and removing volumes...${NC}"
docker compose down -v

# Remove any cached images
docker compose rm -f > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 2: Rebuild images (optional - only if code changed)
REBUILD=false
read -p "Rebuild Docker images? (recommended if code changed) (y/n): " REBUILD_CONFIRM
if [ "$REBUILD_CONFIRM" = "y" ] || [ "$REBUILD_CONFIRM" = "Y" ]; then
    REBUILD=true
fi

if [ "$REBUILD" = true ]; then
    echo -e "${BLUE}[2/3] Rebuilding Docker images...${NC}"
    docker compose build --no-cache
    echo -e "${GREEN}✓ Images rebuilt${NC}"
    echo ""
else
    echo -e "${BLUE}[2/3] Skipping image rebuild${NC}"
    echo ""
fi

# Step 3: Start with fresh data
echo -e "${BLUE}[3/3] Starting fresh environment...${NC}"
echo ""

# Run the start script which will seed the database
./start-dev.sh

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Reset Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
