#!/bin/bash

# Development Environment Logs Script
# Quick access to service logs

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVICE=$1
FOLLOW=${2:-"-f"}  # Default to follow mode

# Check if service specified
if [ -z "$SERVICE" ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Development Environment Logs${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} ./logs-dev.sh [service] [options]"
    echo ""
    echo -e "${BLUE}Available Services:${NC}"
    echo -e "  ${GREEN}web${NC}      - Next.js web application"
    echo -e "  ${GREEN}worker${NC}   - Background job worker"
    echo -e "  ${GREEN}postgres${NC} - PostgreSQL database"
    echo -e "  ${GREEN}redis${NC}    - Redis cache"
    echo -e "  ${GREEN}all${NC}      - All services"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo -e "  ${YELLOW}-f${NC}       - Follow log output (default)"
    echo -e "  ${YELLOW}--tail=N${NC} - Show last N lines"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  ./logs-dev.sh web"
    echo -e "  ./logs-dev.sh worker --tail=100"
    echo -e "  ./logs-dev.sh all -f"
    echo ""
    exit 0
fi

# Show logs
if [ "$SERVICE" = "all" ]; then
    echo -e "${BLUE}Showing logs for all services...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    docker compose logs $FOLLOW
else
    echo -e "${BLUE}Showing logs for $SERVICE...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    docker compose logs $FOLLOW $SERVICE
fi
