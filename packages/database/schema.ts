import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, vector } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Core tables
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subscription_tier: text('tier', { enum: ['free', 'pro', 'enterprise'] }).default('free'),
  settings: jsonb('settings').default({}),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  organization_id: uuid('organization_id').references(() => organizations.id),
  email: text('email').notNull().unique(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  role: text('role', { enum: ['admin', 'manager', 'consultant', 'viewer'] }).default('consultant'),
  avatar_url: text('avatar_url'),
  preferences: jsonb('preferences').default({}),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'] }).default('planning'),
  budget: integer('budget'),
  timeline: jsonb('timeline'),
  ai_insights: jsonb('ai_insights'),           // AI-generated insights
  risk_assessment: jsonb('risk_assessment'),   // AI risk analysis
  metadata: jsonb('metadata').default({}),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const project_members = pgTable('project_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').references(() => projects.id).notNull(),
  user_id: text('user_id').references(() => users.id).notNull(),
  role: text('role', { enum: ['owner', 'manager', 'member', 'viewer'] }).default('member'),
  joined_at: timestamp('joined_at').defaultNow()
})

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['todo', 'in-progress', 'review', 'completed', 'cancelled'] }).default('todo'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  assignee_id: text('assignee_id').references(() => users.id),
  due_date: timestamp('due_date'),
  estimated_hours: integer('estimated_hours'),
  actual_hours: integer('actual_hours'),
  tags: jsonb('tags').default([]),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const knowledge_base = pgTable('knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id).notNull(),
  project_id: uuid('project_id').references(() => projects.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // For RAG
  metadata: jsonb('metadata').default({}),
  tags: jsonb('tags').default([]),
  is_public: boolean('is_public').default(false),
  created_by: text('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const ai_interactions = pgTable('ai_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => users.id).notNull(),
  project_id: uuid('project_id').references(() => projects.id),
  model: text('model').notNull(),              // claude-3.7, nova-pro, etc
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  tokens_used: integer('tokens_used'),
  cost_cents: integer('cost_cents'),
  latency_ms: integer('latency_ms'),
  metadata: jsonb('metadata').default({}),
  created_at: timestamp('created_at').defaultNow()
})

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').references(() => organizations.id).notNull(),
  project_id: uuid('project_id').references(() => projects.id),
  name: text('name').notNull(),
  url: text('url').notNull(),
  size: integer('size').notNull(),
  mime_type: text('mime_type').notNull(),
  uploaded_by: text('uploaded_by').references(() => users.id).notNull(),
  metadata: jsonb('metadata').default({}),
  created_at: timestamp('created_at').defaultNow()
})

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => users.id).notNull(),
  type: text('type', { enum: ['task_assigned', 'project_update', 'ai_insight', 'deadline_reminder'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data').default({}),
  read: boolean('read').default(false),
  created_at: timestamp('created_at').defaultNow()
})

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
  knowledge_base: many(knowledge_base),
  files: many(files)
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organization_id],
    references: [organizations.id]
  }),
  project_members: many(project_members),
  tasks: many(tasks),
  knowledge_base: many(knowledge_base),
  files: many(files),
  ai_interactions: many(ai_interactions),
  notifications: many(notifications)
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organization_id],
    references: [organizations.id]
  }),
  members: many(project_members),
  tasks: many(tasks),
  knowledge_base: many(knowledge_base),
  files: many(files),
  ai_interactions: many(ai_interactions)
}))

export const projectMembersRelations = relations(project_members, ({ one }) => ({
  project: one(projects, {
    fields: [project_members.project_id],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [project_members.user_id],
    references: [users.id]
  })
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.project_id],
    references: [projects.id]
  }),
  assignee: one(users, {
    fields: [tasks.assignee_id],
    references: [users.id]
  })
}))

export const knowledgeBaseRelations = relations(knowledge_base, ({ one }) => ({
  organization: one(organizations, {
    fields: [knowledge_base.organization_id],
    references: [organizations.id]
  }),
  project: one(projects, {
    fields: [knowledge_base.project_id],
    references: [projects.id]
  }),
  created_by_user: one(users, {
    fields: [knowledge_base.created_by],
    references: [users.id]
  })
}))

export const aiInteractionsRelations = relations(ai_interactions, ({ one }) => ({
  user: one(users, {
    fields: [ai_interactions.user_id],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [ai_interactions.project_id],
    references: [projects.id]
  })
}))

export const filesRelations = relations(files, ({ one }) => ({
  organization: one(organizations, {
    fields: [files.organization_id],
    references: [organizations.id]
  }),
  project: one(projects, {
    fields: [files.project_id],
    references: [projects.id]
  }),
  uploaded_by_user: one(users, {
    fields: [files.uploaded_by],
    references: [users.id]
  })
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id]
  })
}))
