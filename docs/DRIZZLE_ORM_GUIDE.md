# 🗄️ Drizzle ORM Configuration Guide

## Overview

This guide covers configuring and using **Drizzle ORM** with **PostgreSQL** for Consailt's database layer. Drizzle provides type-safe database operations with excellent performance and developer experience.

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
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push:pg",
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
import { pgTable, text, timestamp, uuid, integer, jsonb, boolean, decimal } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  settings: jsonb('settings').$type<OrganizationSettings>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'),
  role: text('role', { enum: ['admin', 'manager', 'consultant', 'viewer'] }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { 
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'] 
  }).notNull().default('planning'),
  client: text('client').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  progress: integer('progress').default(0).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  projectManagerId: uuid('project_manager_id').references(() => users.id),
  metadata: jsonb('metadata').$type<ProjectMetadata>(),
  aiInsights: jsonb('ai_insights').$type<AIInsights>(),
  riskAssessment: jsonb('risk_assessment').$type<RiskAssessment>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { 
    enum: ['todo', 'in_progress', 'review', 'completed', 'cancelled'] 
  }).notNull().default('todo'),
  priority: text('priority', { 
    enum: ['low', 'medium', 'high', 'critical'] 
  }).notNull().default('medium'),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }),
  actualHours: decimal('actual_hours', { precision: 8, scale: 2 }),
  dependencies: jsonb('dependencies').$type<string[]>(),
  metadata: jsonb('metadata').$type<TaskMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Knowledge base table
export const knowledgeBase = pgTable('knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type', { 
    enum: ['document', 'lesson_learned', 'best_practice', 'template'] 
  }).notNull(),
  tags: jsonb('tags').$type<string[]>(),
  projectId: uuid('project_id').references(() => projects.id),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  metadata: jsonb('metadata').$type<KnowledgeMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// AI interactions table
export const aiInteractions = pgTable('ai_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  model: text('model').notNull(),
  taskType: text('task_type', { 
    enum: ['insights', 'risk_assessment', 'summary', 'analysis'] 
  }).notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  costCents: integer('cost_cents').notNull(),
  response: jsonb('response').$type<AIResponse>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  changes: jsonb('changes').$type<Record<string, any>>(),
  metadata: jsonb('metadata').$type<AuditMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
// packages/database/queries/projects.ts
import { db } from '../index'
import { projects, users, organizations } from '../schema'
import { eq, and, desc, asc, like, gte, lte } from 'drizzle-orm'

export class ProjectQueries {
  // Get all projects for an organization
  static async getProjectsByOrganization(organizationId: string) {
    return await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        client: projects.client,
        progress: projects.progress,
        startDate: projects.startDate,
        endDate: projects.endDate,
        budget: projects.budget,
        projectManager: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(projects)
      .leftJoin(users, eq(projects.projectManagerId, users.id))
      .where(eq(projects.organizationId, organizationId))
      .orderBy(desc(projects.createdAt))
  }

  // Get project with full details
  static async getProjectById(projectId: string) {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    return result[0]
  }

  // Search projects
  static async searchProjects(organizationId: string, searchTerm: string) {
    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.organizationId, organizationId),
          like(projects.name, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(projects.createdAt))
  }

  // Get projects by status
  static async getProjectsByStatus(organizationId: string, status: string) {
    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.organizationId, organizationId),
          eq(projects.status, status)
        )
      )
      .orderBy(asc(projects.name))
  }

  // Get projects within date range
  static async getProjectsInDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.organizationId, organizationId),
          gte(projects.startDate, startDate),
          lte(projects.endDate, endDate)
        )
      )
      .orderBy(asc(projects.startDate))
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
