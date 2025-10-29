-- Essential schema for consulting platform
-- This is a minimal schema to get started - Drizzle will handle the rest

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'consultant',
  expertise JSONB DEFAULT '[]',
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Engagements/Projects table
CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  client_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'prospect',
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  content TEXT,
  knowledge_type TEXT,
  tags TEXT[],
  file_path TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id),
  organization_id UUID REFERENCES organizations(id),
  insight_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  impact_score REAL,
  status TEXT DEFAULT 'active',
  ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  link TEXT UNIQUE,
  source TEXT,
  categories TEXT[],
  tags TEXT[],
  published_at TIMESTAMP,
  fetched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO engagements (id, organization_id, client_name, name, description, status, start_date, end_date, budget, currency)
VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Acme Corp', 'E-Commerce Platform Redesign', 'Complete overhaul of online shopping experience with modern UI/UX', 'active', '2025-01-15', '2025-06-30', 50000, 'USD'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'TechStart Inc', 'Mobile App Development', 'Native iOS and Android app for customer engagement', 'prospect', '2025-03-01', '2025-09-30', 75000, 'USD'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'DataCo Solutions', 'Data Analytics Dashboard', 'Real-time business intelligence dashboard', 'completed', '2024-09-01', '2024-12-31', 40000, 'EUR'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Cloud Systems Ltd', 'API Integration Project', 'Third-party API integrations and microservices', 'on-hold', '2025-02-01', '2025-05-31', 30000, 'USD')
ON CONFLICT (id) DO NOTHING;

SELECT 'Sample projects created' as status;
