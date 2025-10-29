#!/bin/bash

# Development Environment Startup Script
# Starts all services, runs migrations, and seeds the database
# Usage: ./start-dev.sh [--build]
#   --build    Rebuild Docker images before starting

set -e  # Exit on error

# Parse command-line arguments
BUILD_FLAG=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--build"
            shift
            ;;
        -h|--help)
            echo "Usage: ./start-dev.sh [--build]"
            echo ""
            echo "Options:"
            echo "  --build    Rebuild Docker images before starting containers"
            echo "  -h, --help Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Development Environment${NC}"
if [ -n "$BUILD_FLAG" ]; then
    echo -e "${YELLOW}  (Rebuilding Docker images)${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Warning: .env.local not found${NC}"
    echo "Creating from .env.local.example..."

    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓ Created .env.local${NC}"
        echo -e "${YELLOW}Please edit .env.local with your actual credentials before continuing${NC}"
        exit 0
    else
        echo -e "${RED}Error: .env.local.example not found${NC}"
        exit 1
    fi
fi

# Check if .env exists (needed for docker-compose variable substitution)
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env from .env.local...${NC}"
    cp .env.local .env
    echo -e "${GREEN}✓ Created .env${NC}"
fi

# Step 1: Start services
echo -e "${BLUE}[1/5] Starting Docker services...${NC}"
if [ -n "$BUILD_FLAG" ]; then
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker compose up -d --build
else
    docker compose up -d
fi

# Step 2: Wait for database to be healthy
echo -e "${BLUE}[2/5] Waiting for PostgreSQL to be ready...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose exec -T postgres pg_isready -U consulting > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}Error: PostgreSQL failed to start${NC}"
        docker compose logs postgres
        exit 1
    fi

    echo -n "."
    sleep 1
done
echo ""

# Step 3: Wait for Redis to be healthy
echo -e "${BLUE}[3/5] Waiting for Redis to be ready...${NC}"
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is ready${NC}"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}Error: Redis failed to start${NC}"
        docker compose logs redis
        exit 1
    fi

    echo -n "."
    sleep 1
done
echo ""

# Step 4: Run database migrations
echo -e "${BLUE}[4/5] Running database migrations...${NC}"

# Check if database is empty (no tables)
TABLE_COUNT=$(docker compose exec -T postgres psql -U consulting -d consulting_platform -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")

if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
    echo -e "${YELLOW}Database is empty, pushing schema...${NC}"
    docker compose exec -T web pnpm db:push --force
    echo -e "${GREEN}✓ Database schema created${NC}"

    # Seed database
    echo -e "${BLUE}[5/5] Seeding database with sample data...${NC}"

    # Create seed data SQL
    cat > /tmp/seed.sql << 'EOF'
-- Seed sample data for local development

-- Create a demo organization for seed data
-- This organization will be accessible to all users in development
INSERT INTO organizations (id, name, type, subscription_tier, monthly_budget_cents, settings, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'team', 'pro', 50000, '{"demo": true}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample projects/engagements
-- NOTE: Using 'engagements' as that's the actual table name (projects is an alias)
INSERT INTO engagements (id, organization_id, client_name, name, description, status, start_date, end_date, budget, currency, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Acme Corp', 'E-Commerce Platform Redesign', 'Complete overhaul of online shopping experience with modern UI/UX', 'active', '2025-01-15', '2025-06-30', 50000, 'USD', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'TechStart Inc', 'Mobile App Development', 'Native iOS and Android app for customer engagement', 'prospect', '2025-03-01', '2025-09-30', 75000, 'USD', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'DataCo Solutions', 'Data Analytics Dashboard', 'Real-time business intelligence dashboard', 'completed', '2024-09-01', '2024-12-31', 40000, 'EUR', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Cloud Systems Ltd', 'API Integration Project', 'Third-party API integrations and microservices', 'on-hold', '2025-02-01', '2025-05-31', 30000, 'USD', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample knowledge base entries
INSERT INTO knowledge_base (id, engagement_id, organization_id, title, content, knowledge_type, tags, file_path, summary, metadata, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Project Architecture', '# Architecture Overview\n\nMicroservices-based architecture with React frontend and Node.js backend.\n\n## Key Components\n- Frontend: React 18 with TypeScript\n- Backend: Node.js + Express\n- Database: PostgreSQL 16\n- Cache: Redis\n- Queue: BullMQ', 'technical', ARRAY['architecture', 'technical'], NULL, 'Microservices architecture with modern tech stack', '{"version": "1.0", "author": "Technical Team"}', NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Meeting Notes - Jan 2025', '# Kickoff Meeting Notes\n\n**Date:** January 15, 2025\n**Attendees:** Product Manager, Tech Lead, UX Designer\n\n## Discussion Points\n1. Project scope and timeline\n2. Technology stack decisions\n3. Resource allocation\n\n## Action Items\n- [ ] Finalize design mockups\n- [ ] Set up development environment\n- [ ] Schedule sprint planning', 'meeting', ARRAY['meeting', 'planning'], NULL, 'Project kickoff meeting with key stakeholders', '{"meeting_type": "kickoff", "duration": "2 hours"}', NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Mobile App Requirements', '# Requirements Document\n\n## Functional Requirements\n1. User authentication and profiles\n2. Push notifications\n3. Offline mode support\n4. Social sharing features\n\n## Non-Functional Requirements\n- Performance: App load time < 3 seconds\n- Security: OAuth 2.0, encrypted storage\n- Accessibility: WCAG 2.1 Level AA compliance', 'requirement', ARRAY['requirements', 'mobile'], NULL, 'Detailed functional and non-functional requirements', '{"status": "draft", "version": "0.1"}', NOW(), NOW()),

  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Dashboard Design System', '# Design System Documentation\n\n## Color Palette\n- Primary: #0e7c7b (Teal)\n- Secondary: #521a70 (Purple)\n- Accent: #fee343 (Yellow)\n\n## Typography\n- Headers: Chivo\n- Body: Noto Sans\n\n## Components\n- Cards, Buttons, Forms, Charts', 'design', ARRAY['design', 'ui/ux'], NULL, 'Complete design system with colors, typography, and components', '{"design_tool": "Figma", "version": "2.0"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample insights
INSERT INTO insights (id, project_id, insight_type, title, description, impact_score, status, ai_generated, metadata, created_at, updated_at)
VALUES
  ('insight_1', 'proj_1', 'risk', 'Timeline Risk: Scope Creep Detected', 'Analysis shows 15% increase in feature requests over last month. Recommend scope freeze or timeline adjustment.', 0.75, 'active', true, '{"recommendation": "Schedule scope review meeting", "priority": "high"}', NOW(), NOW()),

  ('insight_2', 'proj_1', 'opportunity', 'Performance Optimization Opportunity', 'Code analysis identified 3 high-impact performance improvements that could reduce load time by 40%.', 0.85, 'active', true, '{"estimated_effort": "3 days", "impact": "high"}', NOW(), NOW()),

  ('insight_3', 'proj_2', 'trend', 'Resource Utilization Trend', 'Team velocity increasing steadily. Current sprint capacity at 95%, suggesting healthy project momentum.', 0.65, 'active', true, '{"velocity_increase": "12%", "confidence": "high"}', NOW(), NOW()),

  ('insight_4', 'proj_3', 'success', 'Project Milestone Achieved', 'Dashboard successfully deployed to production. User adoption rate exceeds target by 30%.', 0.90, 'archived', false, '{"completion_date": "2024-12-31", "adoption_rate": "130%"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample news articles
INSERT INTO news_articles (title, description, content, link, source, categories, tags, published_at)
VALUES
  ('Tech Industry Trends 2025', 'AI and cloud computing dominate enterprise technology investments', 'Comprehensive analysis of technology trends...', 'https://example.com/tech-trends-2025', 'TechNews', ARRAY['technology', 'business'], ARRAY['AI', 'cloud', 'enterprise'], NOW() - INTERVAL '2 days'),

  ('Project Management Best Practices', 'Agile methodologies show 40% improvement in project success rates', 'Study reveals effectiveness of agile approaches...', 'https://example.com/pm-best-practices', 'PMInsider', ARRAY['management', 'productivity'], ARRAY['agile', 'project management'], NOW() - INTERVAL '5 days'),

  ('Cybersecurity Alert: New Vulnerabilities', 'Security researchers discover critical vulnerabilities in popular frameworks', 'Important security updates for development teams...', 'https://example.com/security-alert', 'SecurityWatch', ARRAY['security', 'technology'], ARRAY['cybersecurity', 'vulnerability'], NOW() - INTERVAL '1 day')
ON CONFLICT (link) DO NOTHING;

-- Note: User settings are created automatically when users sign in via Clerk
-- The demo organization will be visible to all users once they're linked to it

EOF

    # Run seed SQL
    docker compose exec -T postgres psql -U consulting -d consulting_platform -f - < /tmp/seed.sql
    rm /tmp/seed.sql

    echo -e "${GREEN}✓ Database seeded with sample data${NC}"
else
    echo -e "${GREEN}✓ Database already initialized (found $TABLE_COUNT tables)${NC}"
    echo -e "${YELLOW}  Run './reset-dev.sh' for a fresh database${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Development Environment Ready!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Show service status
echo -e "${BLUE}Service Status:${NC}"
docker compose ps

echo ""
echo -e "${BLUE}Access Points:${NC}"
echo -e "  Web Application:  ${GREEN}http://localhost:3000${NC}"
echo -e "  PostgreSQL:       ${GREEN}localhost:5432${NC}"
echo -e "  Redis:            ${GREEN}localhost:6379${NC}"
echo -e "  Worker Health:    ${GREEN}http://localhost:3001/health${NC}"

echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo -e "  View logs:        ${YELLOW}docker compose logs -f${NC}"
echo -e "  Stop services:    ${YELLOW}./stop-dev.sh${NC}"
echo -e "  Reset database:   ${YELLOW}./reset-dev.sh${NC}"
echo -e "  Rebuild images:   ${YELLOW}./start-dev.sh --build${NC}"
echo -e "  Database studio:  ${YELLOW}docker compose exec web pnpm db:studio${NC}"

echo ""
echo -e "${BLUE}Sample Projects:${NC}"
echo -e "  • E-Commerce Platform Redesign (in progress)"
echo -e "  • Mobile App Development (planning)"
echo -e "  • Data Analytics Dashboard (completed)"
echo -e "  • API Integration Project (on hold)"

echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
