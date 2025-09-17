#!/usr/bin/env node

/**
 * Migration script to transform the database to consultant-focused knowledge management schema
 * This will DROP existing tables and create new ones - make sure to backup first!
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:vtwyKVDTWAyWySGhzxYJpBpEJPjsiiLN@crossover.proxy.rlwy.net:39737/railway";

async function migrate() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🚀 Starting migration to consultant knowledge schema...\n');

    // Drop existing tables (in correct order to handle foreign keys)
    console.log('📦 Dropping old tables...');
    await pool.query(`
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS project_members CASCADE;
      DROP TABLE IF EXISTS ai_interactions CASCADE;
      DROP TABLE IF EXISTS files CASCADE;
      DROP TABLE IF EXISTS knowledge_base CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
    `);
    console.log('✅ Old tables dropped\n');

    // Create new organizations table
    console.log('🏢 Creating organizations table...');
    await pool.query(`
      CREATE TABLE organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT DEFAULT 'individual' CHECK (type IN ('individual', 'team', 'firm')),
        tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
        settings JSONB DEFAULT '{}',
        monthly_budget_cents INTEGER DEFAULT 10000,
        current_month_usage_cents INTEGER DEFAULT 0,
        usage_reset_date TIMESTAMP DEFAULT NOW(),
        daily_limit_cents INTEGER DEFAULT 1000,
        current_day_usage_cents INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Organizations table created\n');

    // Create users table
    console.log('👤 Creating users table...');
    await pool.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        organization_id UUID REFERENCES organizations(id),
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'consultant' CHECK (role IN ('admin', 'lead_consultant', 'consultant', 'analyst', 'viewer')),
        expertise JSONB DEFAULT '[]',
        avatar_url TEXT,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created\n');

    // Create engagements table (formerly projects)
    console.log('💼 Creating engagements table...');
    await pool.query(`
      CREATE TABLE engagements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id),
        client_name TEXT NOT NULL,
        client_industry TEXT,
        client_size TEXT CHECK (client_size IN ('startup', 'smb', 'mid_market', 'enterprise')),
        name TEXT NOT NULL,
        description TEXT,
        engagement_type TEXT DEFAULT 'advisory' CHECK (engagement_type IN ('assessment', 'implementation', 'advisory', 'audit', 'training', 'support', 'other')),
        status TEXT DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'on-hold', 'completed', 'archived')),
        technologies JSONB DEFAULT '[]',
        deliverables JSONB DEFAULT '[]',
        budget INTEGER,
        hourly_rate INTEGER,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        ai_insights JSONB,
        risk_assessment JSONB,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Engagements table created\n');

    // Create knowledge_base table
    console.log('📚 Creating knowledge_base table...');
    await pool.query(`
      CREATE TABLE knowledge_base (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) NOT NULL,
        engagement_id UUID REFERENCES engagements(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        knowledge_type TEXT DEFAULT 'solution' CHECK (knowledge_type IN ('solution', 'issue', 'decision', 'pattern', 'template', 'reference', 'insight', 'lesson_learned')),
        entry_type TEXT DEFAULT 'note' CHECK (entry_type IN ('note', 'meeting', 'email', 'document', 'code', 'diagram', 'chat', 'voice_memo')),
        visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'organization', 'public')),
        client_sanitized BOOLEAN DEFAULT FALSE,
        embedding JSONB,
        search_vector TEXT,
        tags JSONB DEFAULT '[]',
        technologies JSONB DEFAULT '[]',
        related_knowledge_ids JSONB DEFAULT '[]',
        source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'email', 'slack', 'meeting', 'document', 'ai_generated', 'web_clip')),
        source_url TEXT,
        is_template BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP,
        view_count INTEGER DEFAULT 0,
        usefulness_score REAL DEFAULT 0,
        last_accessed TIMESTAMP,
        created_by TEXT REFERENCES users(id) NOT NULL,
        updated_by TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Knowledge base table created\n');

    // Create indexes for knowledge_base
    console.log('🔍 Creating indexes...');
    await pool.query(`
      CREATE INDEX knowledge_engagement_idx ON knowledge_base(engagement_id);
      CREATE INDEX knowledge_type_idx ON knowledge_base(knowledge_type);
      CREATE INDEX knowledge_visibility_idx ON knowledge_base(visibility);
      CREATE INDEX knowledge_created_by_idx ON knowledge_base(created_by);
    `);
    console.log('✅ Indexes created\n');

    // Create knowledge_templates table
    console.log('📋 Creating knowledge_templates table...');
    await pool.query(`
      CREATE TABLE knowledge_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK (category IN ('architecture_review', 'security_audit', 'performance_assessment', 'migration_plan', 'training_material', 'proposal', 'report', 'checklist')),
        structure JSONB NOT NULL,
        example_content TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        usage_count INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        tags JSONB DEFAULT '[]',
        technologies JSONB DEFAULT '[]',
        created_by TEXT REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Knowledge templates table created\n');

    // Create tags table
    console.log('🏷️ Creating tags table...');
    await pool.query(`
      CREATE TABLE tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id),
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        category TEXT DEFAULT 'other' CHECK (category IN ('technology', 'methodology', 'industry', 'skill', 'tool', 'framework', 'other')),
        color TEXT DEFAULT '#6B7280',
        description TEXT,
        parent_id UUID,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX unique_org_tag_slug ON tags(organization_id, slug);
    `);
    console.log('✅ Tags table created\n');

    // Create knowledge_tags junction table
    console.log('🔗 Creating knowledge_tags table...');
    await pool.query(`
      CREATE TABLE knowledge_tags (
        knowledge_id UUID REFERENCES knowledge_base(id) NOT NULL,
        tag_id UUID REFERENCES tags(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX knowledge_tags_pk ON knowledge_tags(knowledge_id, tag_id);
    `);
    console.log('✅ Knowledge_tags table created\n');

    // Create knowledge_insights table
    console.log('💡 Creating knowledge_insights table...');
    await pool.query(`
      CREATE TABLE knowledge_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) NOT NULL,
        engagement_id UUID REFERENCES engagements(id),
        type TEXT NOT NULL CHECK (type IN ('pattern', 'trend', 'recommendation', 'summary', 'anomaly', 'opportunity')),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence_score REAL DEFAULT 0,
        relevance_score REAL DEFAULT 0,
        source_knowledge_ids JSONB DEFAULT '[]',
        related_engagement_ids JSONB DEFAULT '[]',
        action_items JSONB DEFAULT '[]',
        is_acknowledged BOOLEAN DEFAULT FALSE,
        acknowledged_by TEXT REFERENCES users(id),
        acknowledged_at TIMESTAMP,
        expires_at TIMESTAMP,
        generated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Knowledge insights table created\n');

    // Create search_history table
    console.log('🔍 Creating search_history table...');
    await pool.query(`
      CREATE TABLE search_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT REFERENCES users(id) NOT NULL,
        query TEXT NOT NULL,
        filters JSONB DEFAULT '{}',
        results_count INTEGER DEFAULT 0,
        clicked_results JSONB DEFAULT '[]',
        engagement_id UUID REFERENCES engagements(id),
        source_page TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Search history table created\n');

    // Create ai_interactions table
    console.log('🤖 Creating ai_interactions table...');
    await pool.query(`
      CREATE TABLE ai_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT REFERENCES users(id) NOT NULL,
        organization_id UUID REFERENCES organizations(id) NOT NULL,
        engagement_id UUID REFERENCES engagements(id),
        knowledge_id UUID REFERENCES knowledge_base(id),
        model TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('generate', 'summarize', 'extract', 'translate', 'analyze', 'embed')),
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        tokens_used INTEGER,
        cost_cents INTEGER,
        latency_ms INTEGER,
        user_rating INTEGER,
        was_helpful BOOLEAN,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ AI interactions table created\n');

    // Create engagement_stakeholders table
    console.log('👥 Creating engagement_stakeholders table...');
    await pool.query(`
      CREATE TABLE engagement_stakeholders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        engagement_id UUID REFERENCES engagements(id) NOT NULL,
        user_id TEXT REFERENCES users(id) NOT NULL,
        role TEXT DEFAULT 'consultant' CHECK (role IN ('lead', 'consultant', 'reviewer', 'observer')),
        can_edit BOOLEAN DEFAULT TRUE,
        can_share BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT NOW(),
        left_at TIMESTAMP
      );
    `);
    console.log('✅ Engagement stakeholders table created\n');

    // Create files table
    console.log('📁 Creating files table...');
    await pool.query(`
      CREATE TABLE files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) NOT NULL,
        engagement_id UUID REFERENCES engagements(id),
        knowledge_id UUID REFERENCES knowledge_base(id),
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        file_type TEXT DEFAULT 'other' CHECK (file_type IN ('document', 'presentation', 'spreadsheet', 'diagram', 'image', 'code', 'archive', 'other')),
        processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
        extracted_text TEXT,
        uploaded_by TEXT REFERENCES users(id) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Files table created\n');

    // Create compatibility aliases
    console.log('🔄 Creating compatibility aliases...');
    await pool.query(`
      CREATE VIEW projects AS SELECT * FROM engagements;
      CREATE VIEW project_members AS SELECT * FROM engagement_stakeholders;
    `);
    console.log('✅ Compatibility aliases created\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('📝 New schema features:');
    console.log('   - Client engagements instead of projects');
    console.log('   - Enhanced knowledge base with types and visibility');
    console.log('   - Knowledge templates for reusable content');
    console.log('   - Normalized tags system');
    console.log('   - AI insights tracking');
    console.log('   - Search history for better recommendations');
    console.log('   - File attachments with text extraction\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
migrate();