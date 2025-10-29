#!/bin/bash

# Development Environment Shutdown Script
# Stops all services with optional cleanup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Stopping Development Environment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check for cleanup flag
CLEANUP=false
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    CLEANUP=true
    echo -e "${YELLOW}Cleanup mode: Will remove volumes and data${NC}"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if services are running
if ! docker compose ps | grep -q "consulting-platform"; then
    echo -e "${YELLOW}No services are currently running${NC}"
    exit 0
fi

# Show current status
echo -e "${BLUE}Current Services:${NC}"
docker compose ps
echo ""

# Stop services
echo -e "${BLUE}Stopping Docker services...${NC}"
docker compose down

if [ "$CLEANUP" = true ]; then
    echo -e "${YELLOW}Removing volumes and data...${NC}"
    docker compose down -v

    # Remove any dangling images
    echo -e "${YELLOW}Cleaning up Docker images...${NC}"
    docker image prune -f > /dev/null 2>&1 || true

    echo -e "${GREEN}✓ Complete cleanup finished${NC}"
else
    echo -e "${GREEN}✓ Services stopped (data preserved)${NC}"
    echo -e "${YELLOW}  Use './stop-dev.sh --clean' to remove all data${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Development Environment Stopped${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${BLUE}Quick Commands:${NC}"
echo -e "  Start services:   ${YELLOW}./start-dev.sh${NC}"
echo -e "  Clean shutdown:   ${YELLOW}./stop-dev.sh --clean${NC}"
echo -e "  Reset database:   ${YELLOW}./reset-dev.sh${NC}"

echo ""
