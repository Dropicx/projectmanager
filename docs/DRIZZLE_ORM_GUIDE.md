# 🗄️ Drizzle ORM Configuration Guide

## Overview

This guide covers configuring and using **Drizzle ORM** with **PostgreSQL** for Consailt's knowledge management platform. Drizzle provides type-safe database operations with excellent performance and developer experience, optimized for knowledge base operations and AI-powered insights.

## 🏗️ Architecture

### Database Schema Structure
```
packages/database/
├── schema.ts          # Database schema definitions
├── migrations/        # Generated migration files
├── drizzle.config.ts  # Drizzle Kit configuration
├── index.ts          # Database connection and exports
└── queries/          # Reusable query functions
```

### Technology Stack
- **ORM**: Drizzle ORM v0.44.5
- **Database**: PostgreSQL (Neon)
- **Migrations**: Drizzle Kit
- **Type Safety**: Full TypeScript support
- **Connection Pooling**: Built-in with postgres driver

## 🚀 Setup and Configuration

### 1. Package Dependencies

#### Install Required Packages
```bash
# Core Drizzle packages
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit @types/pg

# For migrations and schema management
pnpm add drizzle-kit
```

#### Package.json Scripts
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop",
    "db:check": "drizzle-kit check"
  }
}
```

### 2. Database Configuration

#### Drizzle Kit Configuration
```typescript
// packages/database/drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  dialect: 'postgresql',
  schema: './schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: 'timestamp'
  }
})
```

#### Database Connection
```typescript
// packages/database/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create connection
const connectionString = process.env.DATABASE_URL!

// Configure postgres client
const client = postgres(connectionString, {
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
})

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Export schema for type inference
export * from './schema'
export { db }
```

### 3. Schema Definition

#### Core Tables
```typescript
// packages/database/schema.ts
import { pgTable, text, timestamp, uuid, integer, jsonb, boolean, real, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Organizations table (multi-tenant root)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['individual', 'team', 'firm'] }).default('individual'),
  subscription_tier: text('tier', { enum: ['free', 'pro', 'enterprise'] }).default('free'),
  settings: jsonb('settings').default({}),
  
  // AI Budget tracking
  monthly_budget_cents: integer('monthly_budget_cents').default(10000),
  current_month_usage_cents: integer('current_month_usage_cents').default(0),
  usage_reset_date: timestamp('usage_reset_date').defaultNow(),
  daily_limit_cents: integer('daily_limit_cents').default(1000),
  current_day_usage_cents: integer('current_day_usage_cents').default(0),
  
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  organization_id: uuid('organization_id').references(() => organizations.id).notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  role: text('role', {
    enum: ['admin', 'lead_consultant', 'consultant', 'analyst', 'viewer'],
  }).default('consultant'),
  expertise: jsonb('expertise').default([]),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Engagements table (client projects)
export const engagements = pgTable('engagements', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  engagement_type: text('engagement_type', {
    enum: ['assessment', 'implementation', 'advisory', 'audit', 'training', 'support', 'other'],
  }).default('advisory'),
  status: text('status', {
    enum: ['prospect', 'active', 'on-hold', 'completed', 'archived'],
  }).default('active'),
  client_name: text('client_name').notNull(),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  budget_cents: integer('budget_cents'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Knowledge Base - Core repository
export const knowledge_base = pgTable('knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id).notNull(),
  engagement_id: uuid('engagement_id').references(() => engagements.id),
  
  // Content
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  
  // Classification
  knowledge_type: text('knowledge_type', {
    enum: ['solution', 'issue', 'decision', 'pattern', 'template', 'reference', 'insight', 'lesson_learned'],
  }).default('solution'),
  entry_type: text('entry_type', {
    enum: ['note', 'meeting', 'email', 'document', 'code', 'diagram', 'chat', 'voice_memo'],
  }).default('note'),
  
  // Visibility & Sharing
  visibility: text('visibility', {
    enum: ['private', 'team', 'organization', 'public'],
  }).default('team'),
  client_sanitized: boolean('client_sanitized').default(false),
  
  // Search & Discovery
  embedding: jsonb('embedding'),
  search_vector: text('search_vector'),
  
  // Metadata
  tags: jsonb('tags').default([]),
  technologies: jsonb('technologies').default([]),
  related_knowledge_ids: jsonb('related_knowledge_ids').default([]),
  
  // Source tracking
  source_type: text('source_type', {
    enum: ['manual', 'email', 'slack', 'meeting', 'document', 'ai_generated', 'web_clip'],
  }).default('manual'),
  source_url: text('source_url'),
  
  // Lifecycle
  is_template: boolean('is_template').default(false),
  is_archived: boolean('is_archived').default(false),
  expires_at: timestamp('expires_at'),
  
  // Analytics
  view_count: integer('view_count').default(0),
  usefulness_score: real('usefulness_score').default(0),
  last_accessed: timestamp('last_accessed'),
  
  // Authorship
  created_by: text('created_by').references(() => users.id).notNull(),
  updated_by: text('updated_by').references(() => users.id),
  
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for performance
  engagementIdx: index('knowledge_engagement_idx').on(table.engagement_id),
  typeIdx: index('knowledge_type_idx').on(table.knowledge_type),
  visibilityIdx: index('knowledge_visibility_idx').on(table.visibility),
  createdByIdx: index('knowledge_created_by_idx').on(table.created_by),
}))

// Knowledge Categories
export const knowledge_categories = pgTable('knowledge_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  icon: text('icon').default('Folder'),
  color: text('color').default('#6B7280'),
  parent_id: uuid('parent_id'),
  level: integer('level').default(0),
  position: integer('position').default(0),
  is_public: boolean('is_public').default(true),
  is_default: boolean('is_default').default(false),
  item_count: integer('item_count').default(0),
  created_by: text('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  category: text('category', {
    enum: ['technology', 'methodology', 'industry', 'skill', 'tool', 'framework', 'other'],
  }).default('other'),
  color: text('color').default('#6B7280'),
  description: text('description'),
  parent_id: uuid('parent_id'),
  usage_count: integer('usage_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// AI Interactions
export const ai_interactions = pgTable('ai_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => users.id).notNull(),
  organization_id: uuid('organization_id').references(() => organizations.id).notNull(),
  engagement_id: uuid('engagement_id').references(() => engagements.id),
  model: text('model').notNull(),
  action: text('action', {
    enum: ['generate', 'summarize', 'extract', 'translate', 'analyze', 'embed'],
  }).notNull(),
  input_tokens: integer('input_tokens').notNull(),
  output_tokens: integer('output_tokens').notNull(),
  cost_cents: integer('cost_cents').notNull(),
  response: jsonb('response'),
  created_at: timestamp('created_at').defaultNow(),
})

// News Articles (RSS feed content)
export const news_articles = pgTable('news_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  link: text('link').notNull().unique(),
  image_url: text('image_url'),
  thumbnail_url: text('thumbnail_url'),
  author: text('author'),
  categories: jsonb('categories').default([]),
  tags: jsonb('tags').default([]),
  source: text('source').notNull(),
  guid: text('guid'),
  published_at: timestamp('published_at').notNull(),
  fetched_at: timestamp('fetched_at').defaultNow(),
  metadata: jsonb('metadata').default({}),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})
```

#### Type Definitions
```typescript
// packages/database/types.ts
export interface OrganizationSettings {
  timezone: string
  currency: string
  workingHours: {
    start: string
    end: string
    days: number[]
  }
  features: {
    aiInsights: boolean
    realtimeCollab: boolean
    advancedAnalytics: boolean
  }
}

export interface ProjectMetadata {
  clientContact: {
    name: string
    email: string
    phone?: string
  }
  deliverables: string[]
  milestones: Array<{
    name: string
    dueDate: string
    completed: boolean
  }>
  customFields: Record<string, any>
}

export interface AIInsights {
  content: string
  model: string
  generatedAt: string
  costCents: number
  confidence: number
  categories: string[]
}

export interface RiskAssessment {
  content: string
  model: string
  assessedAt: string
  costCents: number
  riskScore: number
  risks: Array<{
    type: string
    level: 'low' | 'medium' | 'high' | 'critical'
    probability: number
    impact: number
    mitigation: string
  }>
}

export interface TaskMetadata {
  attachments: string[]
  comments: Array<{
    id: string
    content: string
    authorId: string
    createdAt: string
  }>
  customFields: Record<string, any>
}

export interface KnowledgeMetadata {
  fileSize?: number
  fileType?: string
  downloadCount: number
  rating?: number
  categories: string[]
}

export interface AIResponse {
  content: string
  model: string
  tokensUsed: number
  costCents: number
  finishReason: string
}

export interface AuditMetadata {
  ipAddress: string
  userAgent: string
  sessionId: string
}
```

#### Table Relations
```typescript
// packages/database/relations.ts
import { relations } from 'drizzle-orm'
import { organizations, users, projects, tasks, knowledgeBase, aiInteractions, auditLogs } from './schema'

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  knowledgeBase: many(knowledgeBase),
  auditLogs: many(auditLogs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  managedProjects: many(projects),
  assignedTasks: many(tasks),
  createdKnowledge: many(knowledgeBase),
  aiInteractions: many(aiInteractions),
  auditLogs: many(auditLogs),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  projectManager: one(users, {
    fields: [projects.projectManagerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  knowledgeBase: many(knowledgeBase),
  aiInteractions: many(aiInteractions),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
}))

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  organization: one(organizations, {
    fields: [knowledgeBase.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [knowledgeBase.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [knowledgeBase.createdById],
    references: [users.id],
  }),
}))
```

## 🔄 Migrations

### Generate Migrations
```bash
# Generate migration files
pnpm db:generate

# This creates files in packages/database/migrations/
# Example: 20240120123456_add_projects_table.sql
```

### Apply Migrations
```bash
# Push schema changes directly (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate
```

### Migration Examples
```sql
-- packages/database/migrations/20240120123456_add_projects_table.sql
CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'planning' NOT NULL,
  "client" text NOT NULL,
  "start_date" timestamp,
  "end_date" timestamp,
  "budget" decimal(12,2),
  "progress" integer DEFAULT 0 NOT NULL,
  "organization_id" uuid NOT NULL,
  "project_manager_id" uuid,
  "metadata" jsonb,
  "ai_insights" jsonb,
  "risk_assessment" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" 
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_id_users_id_fk" 
  FOREIGN KEY ("project_manager_id") REFERENCES "users"("id");

-- Create indexes
CREATE INDEX "projects_organization_id_idx" ON "projects" ("organization_id");
CREATE INDEX "projects_status_idx" ON "projects" ("status");
CREATE INDEX "projects_created_at_idx" ON "projects" ("created_at");
```

## 🔍 Query Examples

### Basic Queries
```typescript
// packages/database/queries/knowledge.ts
import { db } from '../index'
import { knowledge_base, users, organizations, engagements, tags } from '../schema'
import { eq, and, desc, asc, like, gte, lte, ilike, sql } from 'drizzle-orm'

export class KnowledgeQueries {
  // Get all knowledge entries for an organization
  static async getKnowledgeByOrganization(organizationId: string, limit = 20, offset = 0) {
    return await db
      .select({
        id: knowledge_base.id,
        title: knowledge_base.title,
        content: knowledge_base.content,
        summary: knowledge_base.summary,
        knowledge_type: knowledge_base.knowledge_type,
        entry_type: knowledge_base.entry_type,
        visibility: knowledge_base.visibility,
        tags: knowledge_base.tags,
        technologies: knowledge_base.technologies,
        view_count: knowledge_base.view_count,
        usefulness_score: knowledge_base.usefulness_score,
        created_at: knowledge_base.created_at,
        updated_at: knowledge_base.updated_at,
        created_by: {
          id: users.id,
          first_name: users.first_name,
          last_name: users.last_name,
        }
      })
      .from(knowledge_base)
      .leftJoin(users, eq(knowledge_base.created_by, users.id))
      .where(eq(knowledge_base.organization_id, organizationId))
      .orderBy(desc(knowledge_base.created_at))
      .limit(limit)
      .offset(offset)
  }

  // Get knowledge entry with full details
  static async getKnowledgeById(knowledgeId: string) {
    const result = await db
      .select()
      .from(knowledge_base)
      .where(eq(knowledge_base.id, knowledgeId))
      .limit(1)

    return result[0]
  }

  // Search knowledge entries
  static async searchKnowledge(organizationId: string, searchTerm: string, filters = {}) {
    const conditions = [
      eq(knowledge_base.organization_id, organizationId),
      ilike(knowledge_base.title, `%${searchTerm}%`)
    ]

    if (filters.knowledge_type) {
      conditions.push(eq(knowledge_base.knowledge_type, filters.knowledge_type))
    }

    if (filters.visibility) {
      conditions.push(eq(knowledge_base.visibility, filters.visibility))
    }

    return await db
      .select()
      .from(knowledge_base)
      .where(and(...conditions))
      .orderBy(desc(knowledge_base.created_at))
  }

  // Get knowledge by engagement
  static async getKnowledgeByEngagement(engagementId: string) {
    return await db
      .select()
      .from(knowledge_base)
      .where(eq(knowledge_base.engagement_id, engagementId))
      .orderBy(desc(knowledge_base.created_at))
  }

  // Get knowledge by tags
  static async getKnowledgeByTags(organizationId: string, tagNames: string[]) {
    return await db
      .select()
      .from(knowledge_base)
      .where(
        and(
          eq(knowledge_base.organization_id, organizationId),
          sql`${knowledge_base.tags} && ${JSON.stringify(tagNames)}`
        )
      )
      .orderBy(desc(knowledge_base.created_at))
  }

  // Get most useful knowledge entries
  static async getMostUsefulKnowledge(organizationId: string, limit = 10) {
    return await db
      .select()
      .from(knowledge_base)
      .where(eq(knowledge_base.organization_id, organizationId))
      .orderBy(desc(knowledge_base.usefulness_score))
      .limit(limit)
  }

  // Get recently accessed knowledge
  static async getRecentlyAccessedKnowledge(organizationId: string, limit = 10) {
    return await db
      .select()
      .from(knowledge_base)
      .where(
        and(
          eq(knowledge_base.organization_id, organizationId),
          sql`${knowledge_base.last_accessed} IS NOT NULL`
        )
      )
      .orderBy(desc(knowledge_base.last_accessed))
      .limit(limit)
  }
}
```

### Complex Queries with Joins
```typescript
// packages/database/queries/analytics.ts
import { db } from '../index'
import { projects, tasks, users, aiInteractions } from '../schema'
import { eq, and, desc, count, sum, avg, sql } from 'drizzle-orm'

export class AnalyticsQueries {
  // Get project KPIs
  static async getProjectKPIs(projectId: string) {
    const result = await db
      .select({
        totalTasks: count(tasks.id),
        completedTasks: count(sql`CASE WHEN ${tasks.status} = 'completed' THEN 1 END`),
        totalBudget: projects.budget,
        progress: projects.progress,
        teamSize: count(sql`DISTINCT ${tasks.assignedToId}`),
      })
      .from(projects)
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .where(eq(projects.id, projectId))
      .groupBy(projects.id, projects.budget, projects.progress)

    return result[0]
  }

  // Get AI usage statistics
  static async getAIUsageStats(organizationId: string, timeframe: string = '30d') {
    const since = new Date()
    since.setDate(since.getDate() - parseInt(timeframe))

    return await db
      .select({
        totalRequests: count(aiInteractions.id),
        totalCost: sum(aiInteractions.costCents),
        avgCostPerRequest: avg(aiInteractions.costCents),
        totalTokens: sum(sql`${aiInteractions.inputTokens} + ${aiInteractions.outputTokens}`),
        modelBreakdown: {
          model: aiInteractions.model,
          requests: count(aiInteractions.id),
          cost: sum(aiInteractions.costCents),
        }
      })
      .from(aiInteractions)
      .leftJoin(projects, eq(aiInteractions.projectId, projects.id))
      .where(
        and(
          eq(projects.organizationId, organizationId),
          gte(aiInteractions.createdAt, since)
        )
      )
      .groupBy(aiInteractions.model)
  }

  // Get team performance metrics
  static async getTeamPerformance(organizationId: string) {
    return await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        totalTasks: count(tasks.id),
        completedTasks: count(sql`CASE WHEN ${tasks.status} = 'completed' THEN 1 END`),
        avgCompletionTime: avg(sql`EXTRACT(EPOCH FROM (${tasks.completedAt} - ${tasks.createdAt})) / 3600`),
        totalHours: sum(tasks.actualHours),
      })
      .from(users)
      .leftJoin(tasks, eq(tasks.assignedToId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(users.organizationId, organizationId))
      .groupBy(users.id, users.firstName, users.lastName)
      .orderBy(desc(count(tasks.id)))
  }
}
```

### Transaction Examples
```typescript
// packages/database/queries/transactions.ts
import { db } from '../index'
import { projects, tasks, users } from '../schema'
import { eq } from 'drizzle-orm'

export class TransactionQueries {
  // Create project with initial tasks
  static async createProjectWithTasks(projectData: any, tasksData: any[]) {
    return await db.transaction(async (tx) => {
      // Create project
      const [project] = await tx
        .insert(projects)
        .values(projectData)
        .returning()

      // Create tasks
      const tasksWithProjectId = tasksData.map(task => ({
        ...task,
        projectId: project.id
      }))

      const createdTasks = await tx
        .insert(tasks)
        .values(tasksWithProjectId)
        .returning()

      return {
        project,
        tasks: createdTasks
      }
    })
  }

  // Update project status and related tasks
  static async updateProjectStatus(projectId: string, status: string) {
    return await db.transaction(async (tx) => {
      // Update project
      const [updatedProject] = await tx
        .update(projects)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(projects.id, projectId))
        .returning()

      // If completing project, mark all tasks as completed
      if (status === 'completed') {
        await tx
          .update(tasks)
          .set({ 
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(tasks.projectId, projectId))
      }

      return updatedProject
    })
  }
}
```

## 🚀 Performance Optimization

### Indexing Strategy
```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY "projects_organization_id_idx" ON "projects" ("organization_id");
CREATE INDEX CONCURRENTLY "projects_status_idx" ON "projects" ("status");
CREATE INDEX CONCURRENTLY "projects_created_at_idx" ON "projects" ("created_at");
CREATE INDEX CONCURRENTLY "projects_client_idx" ON "projects" ("client");

CREATE INDEX CONCURRENTLY "tasks_project_id_idx" ON "tasks" ("project_id");
CREATE INDEX CONCURRENTLY "tasks_assigned_to_id_idx" ON "tasks" ("assigned_to_id");
CREATE INDEX CONCURRENTLY "tasks_status_idx" ON "tasks" ("status");
CREATE INDEX CONCURRENTLY "tasks_due_date_idx" ON "tasks" ("due_date");

CREATE INDEX CONCURRENTLY "users_organization_id_idx" ON "users" ("organization_id");
CREATE INDEX CONCURRENTLY "users_clerk_id_idx" ON "users" ("clerk_id");

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY "projects_org_status_idx" ON "projects" ("organization_id", "status");
CREATE INDEX CONCURRENTLY "tasks_project_status_idx" ON "tasks" ("project_id", "status");
```

### Connection Pooling
```typescript
// packages/database/connection.ts
import postgres from 'postgres'

const createConnection = () => {
  return postgres(process.env.DATABASE_URL!, {
    max: 20, // Maximum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Timeout after 2s
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    prepare: false, // Disable prepared statements for better performance
  })
}

export const connection = createConnection()
```

### Query Optimization
```typescript
// packages/database/queries/optimized.ts
import { db } from '../index'
import { projects, tasks } from '../schema'
import { eq, and, desc, sql } from 'drizzle-orm'

export class OptimizedQueries {
  // Use select to limit returned fields
  static async getProjectSummary(projectId: string) {
    return await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        progress: projects.progress,
        // Only select needed fields
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)
  }

  // Use raw SQL for complex aggregations
  static async getProjectStats(organizationId: string) {
    return await db.execute(sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        AVG(progress) as avg_progress,
        SUM(budget) as total_budget
      FROM projects 
      WHERE organization_id = ${organizationId}
    `)
  }

  // Use subqueries for better performance
  static async getProjectsWithTaskCounts(organizationId: string) {
    return await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        taskCount: sql<number>`(
          SELECT COUNT(*) 
          FROM tasks 
          WHERE project_id = ${projects.id}
        )`,
        completedTaskCount: sql<number>`(
          SELECT COUNT(*) 
          FROM tasks 
          WHERE project_id = ${projects.id} AND status = 'completed'
        )`
      })
      .from(projects)
      .where(eq(projects.organizationId, organizationId))
  }
}
```

## 🧪 Testing

### Test Database Setup
```typescript
// packages/database/__tests__/setup.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const testConnectionString = process.env.TEST_DATABASE_URL!

export const setupTestDB = async () => {
  const client = postgres(testConnectionString)
  const db = drizzle(client)
  
  // Run migrations
  await migrate(db, { migrationsFolder: './migrations' })
  
  return { db, client }
}

export const cleanupTestDB = async (client: any) => {
  await client.end()
}
```

### Unit Tests
```typescript
// packages/database/__tests__/queries.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupTestDB, cleanupTestDB } from './setup'
import { ProjectQueries } from '../queries/projects'

describe('ProjectQueries', () => {
  let db: any
  let client: any

  beforeAll(async () => {
    const setup = await setupTestDB()
    db = setup.db
    client = setup.client
  })

  afterAll(async () => {
    await cleanupTestDB(client)
  })

  it('should create a project', async () => {
    const projectData = {
      name: 'Test Project',
      client: 'Test Client',
      organizationId: 'org_123',
      status: 'planning' as const,
    }

    const result = await db.insert(projects).values(projectData).returning()
    
    expect(result[0].name).toBe('Test Project')
    expect(result[0].client).toBe('Test Client')
  })

  it('should get projects by organization', async () => {
    const projects = await ProjectQueries.getProjectsByOrganization('org_123')
    
    expect(Array.isArray(projects)).toBe(true)
  })
})
```

## 🔧 Development Tools

### Drizzle Studio
```bash
# Start Drizzle Studio
pnpm db:studio

# This opens a web interface at http://localhost:4983
# for browsing and editing your database
```

### Schema Validation
```bash
# Check schema for issues
pnpm db:check

# Generate types
pnpm db:generate
```

### Database Introspection
```bash
# Introspect existing database
drizzle-kit introspect:pg

# This generates schema from existing database
```

## 🚀 Production Deployment

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:5432/db

# Migration settings
MIGRATION_DIR=./migrations
SCHEMA_FILE=./schema.ts
```

### Railway Configuration
```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install --frozen-lockfile && pnpm db:push"

[deploy]
startCommand = "pnpm start"
```

### Migration Strategy
```bash
# Production migration process
1. Generate migration: pnpm db:generate
2. Review migration files
3. Test on staging: pnpm db:migrate
4. Deploy to production: pnpm db:migrate
```

## 📊 Monitoring and Observability

### Query Performance Monitoring
```typescript
// packages/database/monitoring.ts
import { db } from './index'

export class DatabaseMonitoring {
  static async logSlowQueries() {
    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executed:', {
        timestamp: new Date().toISOString(),
        // Add query details
      })
    }
  }

  static async getConnectionStats() {
    // Monitor connection pool
    return {
      activeConnections: db.pool?.totalCount || 0,
      idleConnections: db.pool?.idleCount || 0,
      waitingClients: db.pool?.waitingCount || 0,
    }
  }
}
```

### Health Checks
```typescript
// packages/database/health.ts
export async function checkDatabaseHealth() {
  try {
    await db.execute(sql`SELECT 1`)
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
```

## 📚 Best Practices

### Schema Design
- Use UUIDs for primary keys
- Add proper indexes for common queries
- Use JSONB for flexible metadata
- Implement soft deletes where appropriate
- Add audit fields (created_at, updated_at)

### Query Optimization
- Use select to limit returned fields
- Implement proper pagination
- Use transactions for related operations
- Avoid N+1 queries with proper joins
- Use raw SQL for complex aggregations

### Migration Management
- Always review generated migrations
- Test migrations on staging first
- Use descriptive migration names
- Keep migrations small and focused
- Never edit existing migration files

### Type Safety
- Export schema types for use in other packages
- Use Drizzle's type inference
- Validate input data with Zod
- Use proper TypeScript types for JSONB fields

## 📞 Support

- **Drizzle Docs**: [orm.drizzle.team](https://orm.drizzle.team)
- **PostgreSQL Docs**: [postgresql.org/docs](https://postgresql.org/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)

---

*Last Updated: January 2024*  
*Drizzle Version: 0.44.5*
