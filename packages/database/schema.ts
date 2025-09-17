/**
 * Database Schema - Consultant Knowledge Management System
 *
 * This schema defines the complete database structure for a consultant knowledge
 * management platform. It's designed to capture, organize, and leverage
 * consulting expertise across organizations and engagements.
 *
 * Key Design Principles:
 * - Multi-tenant architecture with organization-based isolation
 * - Rich knowledge capture with semantic search capabilities
 * - AI-powered insights and recommendations
 * - Comprehensive audit trails and analytics
 * - Flexible engagement and project management
 *
 * Core Entities:
 * - Organizations: Consulting firms or individual consultants
 * - Users: Individual consultants with roles and expertise
 * - Engagements: Client projects and consulting work
 * - Knowledge Base: The central repository of consulting knowledge
 * - AI Interactions: Tracking and analytics for AI usage
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ==========================================
// CORE TABLES - Consultant Knowledge System
// ==========================================

/**
 * Organizations Table - Multi-tenant Root Entity
 *
 * Represents consulting firms, teams, or individual consultants.
 * Each organization is isolated and has its own knowledge base,
 * users, and AI usage tracking.
 *
 * Key Features:
 * - Multi-tenant isolation
 * - AI budget management and usage tracking
 * - Subscription tier management
 * - Flexible organization types (individual, team, firm)
 */
export const organizations = pgTable("organizations", {
  // Primary identification
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),

  // Organization classification
  type: text("type", { enum: ["individual", "team", "firm"] }).default("individual"),
  subscription_tier: text("tier", { enum: ["free", "pro", "enterprise"] }).default("free"),

  // Configuration and settings
  settings: jsonb("settings").default({}),

  // AI Budget Management - Critical for cost control
  monthly_budget_cents: integer("monthly_budget_cents").default(10000), // $100 default
  current_month_usage_cents: integer("current_month_usage_cents").default(0),
  usage_reset_date: timestamp("usage_reset_date").defaultNow(),
  daily_limit_cents: integer("daily_limit_cents").default(1000), // $10 daily limit
  current_day_usage_cents: integer("current_day_usage_cents").default(0),

  // Audit fields
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Users (Consultants)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  organization_id: uuid("organization_id").references(() => organizations.id),
  email: text("email").notNull().unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  role: text("role", {
    enum: ["admin", "lead_consultant", "consultant", "analyst", "viewer"],
  }).default("consultant"),
  expertise: jsonb("expertise").default([]), // ["AWS", "Security", "DevOps"]
  avatar_url: text("avatar_url"),
  preferences: jsonb("preferences").default({}),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Client Engagements (formerly projects)
export const engagements = pgTable("engagements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id").references(() => organizations.id),

  // Client Information
  client_name: text("client_name").notNull(),
  client_industry: text("client_industry"), // "Finance", "Healthcare", "Retail"
  client_size: text("client_size", { enum: ["startup", "smb", "mid_market", "enterprise"] }),

  // Engagement Details
  name: text("name").notNull(), // "AWS Migration Assessment"
  description: text("description"),
  engagement_type: text("engagement_type", {
    enum: ["assessment", "implementation", "advisory", "audit", "training", "support", "other"],
  }).default("advisory"),

  status: text("status", {
    enum: ["prospect", "active", "on-hold", "completed", "archived"],
  }).default("active"),

  // Technical Context
  technologies: jsonb("technologies").default([]), // ["AWS", "Kubernetes", "PostgreSQL"]
  deliverables: jsonb("deliverables").default([]), // Expected outputs

  // Financials
  budget: integer("budget"),
  hourly_rate: integer("hourly_rate"),

  // Dates
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),

  // AI Insights
  ai_insights: jsonb("ai_insights"),
  risk_assessment: jsonb("risk_assessment"),

  metadata: jsonb("metadata").default({}),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Knowledge Base - The Core Value Store
export const knowledge_base = pgTable(
  "knowledge_base",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    engagement_id: uuid("engagement_id").references(() => engagements.id), // Optional - can be global

    // Content
    title: text("title").notNull(),
    content: text("content").notNull(),
    summary: text("summary"), // AI-generated summary

    // Classification
    knowledge_type: text("knowledge_type", {
      enum: [
        "solution",
        "issue",
        "decision",
        "pattern",
        "template",
        "reference",
        "insight",
        "lesson_learned",
      ],
    }).default("solution"),

    entry_type: text("entry_type", {
      enum: ["note", "meeting", "email", "document", "code", "diagram", "chat", "voice_memo"],
    }).default("note"),

    // Visibility & Sharing
    visibility: text("visibility", {
      enum: ["private", "team", "organization", "public"],
    }).default("team"),

    client_sanitized: boolean("client_sanitized").default(false), // Safe to share across clients

    // Search & Discovery
    embedding: jsonb("embedding"), // Vector for semantic search
    search_vector: text("search_vector"), // For full-text search (will use GIN index)

    // Metadata
    tags: text("tags").array(),
    technologies: jsonb("technologies").default([]),
    related_knowledge_ids: jsonb("related_knowledge_ids").default([]),

    // Source tracking
    source_type: text("source_type", {
      enum: ["manual", "email", "slack", "meeting", "document", "ai_generated", "web_clip"],
    }).default("manual"),
    source_url: text("source_url"),

    // Lifecycle
    is_template: boolean("is_template").default(false),
    is_archived: boolean("is_archived").default(false),
    expires_at: timestamp("expires_at"), // For time-sensitive knowledge

    // Analytics
    view_count: integer("view_count").default(0),
    usefulness_score: real("usefulness_score").default(0), // 0-5 rating
    last_accessed: timestamp("last_accessed"),

    // Additional fields
    // All knowledge is private to the organization - no public sharing
    is_public: boolean("is_public").default(false).notNull(),
    metadata: jsonb("metadata").default({}),

    // Authorship
    created_by: text("created_by")
      .references(() => users.id)
      .notNull(),
    updated_by: text("updated_by").references(() => users.id),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Indexes for performance
    engagementIdx: index("knowledge_engagement_idx").on(table.engagement_id),
    typeIdx: index("knowledge_type_idx").on(table.knowledge_type),
    visibilityIdx: index("knowledge_visibility_idx").on(table.visibility),
    createdByIdx: index("knowledge_created_by_idx").on(table.created_by),
  })
);

// Knowledge Templates
export const knowledge_templates = pgTable("knowledge_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id").references(() => organizations.id),

  name: text("name").notNull(), // "Architecture Review Template"
  description: text("description"),
  category: text("category", {
    enum: [
      "architecture_review",
      "security_audit",
      "performance_assessment",
      "migration_plan",
      "training_material",
      "proposal",
      "report",
      "checklist",
    ],
  }).notNull(),

  // Template Structure
  structure: jsonb("structure").notNull(), // Fields, sections, prompts
  example_content: text("example_content"),

  // All templates are private to the organization
  is_public: boolean("is_public").default(false).notNull(),
  is_verified: boolean("is_verified").default(false), // Admin-approved

  // Analytics
  usage_count: integer("usage_count").default(0),
  rating: real("rating").default(0),

  // Metadata
  tags: jsonb("tags").default([]),
  technologies: jsonb("technologies").default([]),
  metadata: jsonb("metadata").default({}), // Additional metadata like view counts

  created_by: text("created_by")
    .references(() => users.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Knowledge Categories (for organizing knowledge base)
export const knowledge_categories = pgTable(
  "knowledge_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id").references(() => organizations.id),

    name: text("name").notNull(),
    slug: text("slug").notNull(), // URL-safe version
    description: text("description"),

    // Visual customization
    icon: text("icon").default("Folder"), // Lucide icon name
    color: text("color").default("#6B7280"), // Hex color

    // Hierarchy
    parent_id: uuid("parent_id"),
    level: integer("level").default(0), // 0 = root, 1 = child, 2 = grandchild

    // Ordering
    position: integer("position").default(0), // For manual ordering

    // Permissions - all categories are private to the organization
    is_public: boolean("is_public").default(false).notNull(), // Always private to org
    is_default: boolean("is_default").default(false), // System default categories

    // Analytics
    item_count: integer("item_count").default(0), // Cached count of items

    created_by: text("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Indexes for performance
    orgIdx: index("category_org_idx").on(table.organization_id),
    parentIdx: index("category_parent_idx").on(table.parent_id),
    slugIdx: index("category_slug_idx").on(table.organization_id, table.slug),
  })
);

// Junction table for knowledge items to categories (many-to-many)
export const knowledge_to_categories = pgTable(
  "knowledge_to_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledge_id: uuid("knowledge_id")
      .references(() => knowledge_base.id)
      .notNull(),
    category_id: uuid("category_id")
      .references(() => knowledge_categories.id)
      .notNull(),

    // Primary category flag
    is_primary: boolean("is_primary").default(false),

    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Composite unique constraint
    uniqueKnowledgeCategory: index("unique_knowledge_category").on(
      table.knowledge_id,
      table.category_id
    ),
    // Indexes
    knowledgeIdx: index("ktc_knowledge_idx").on(table.knowledge_id),
    categoryIdx: index("ktc_category_idx").on(table.category_id),
  })
);

// Tags (Normalized for better management)
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id").references(() => organizations.id),

    name: text("name").notNull(),
    slug: text("slug").notNull(), // URL-safe version
    category: text("category", {
      enum: ["technology", "methodology", "industry", "skill", "tool", "framework", "other"],
    }).default("other"),

    color: text("color").default("#6B7280"),
    description: text("description"),

    // Hierarchy
    parent_id: uuid("parent_id"), // For nested tags

    // Analytics
    usage_count: integer("usage_count").default(0),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Unique constraint on slug per organization
    uniqueSlug: index("unique_org_tag_slug").on(table.organization_id, table.slug),
  })
);

// Knowledge-Tag Junction Table
export const knowledge_tags = pgTable(
  "knowledge_tags",
  {
    knowledge_id: uuid("knowledge_id")
      .references(() => knowledge_base.id)
      .notNull(),
    tag_id: uuid("tag_id")
      .references(() => tags.id)
      .notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Composite primary key
    pk: index("knowledge_tags_pk").on(table.knowledge_id, table.tag_id),
  })
);

// AI-Generated Insights
export const knowledge_insights = pgTable("knowledge_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  engagement_id: uuid("engagement_id").references(() => engagements.id),

  type: text("type", {
    enum: ["pattern", "trend", "recommendation", "summary", "anomaly", "opportunity"],
  }).notNull(),

  title: text("title").notNull(),
  content: text("content").notNull(),

  // Confidence & Relevance
  confidence_score: real("confidence_score").default(0), // 0-1
  relevance_score: real("relevance_score").default(0), // 0-1

  // Related Knowledge
  source_knowledge_ids: jsonb("source_knowledge_ids").default([]),
  related_engagement_ids: jsonb("related_engagement_ids").default([]),

  // Action Items
  action_items: jsonb("action_items").default([]),

  // Lifecycle
  is_acknowledged: boolean("is_acknowledged").default(false),
  acknowledged_by: text("acknowledged_by").references(() => users.id),
  acknowledged_at: timestamp("acknowledged_at"),

  expires_at: timestamp("expires_at"),

  generated_at: timestamp("generated_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

// Search History (for improving search and recommendations)
export const search_history = pgTable("search_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),

  query: text("query").notNull(),
  filters: jsonb("filters").default({}),

  results_count: integer("results_count").default(0),
  clicked_results: jsonb("clicked_results").default([]),

  // Context
  engagement_id: uuid("engagement_id").references(() => engagements.id),
  source_page: text("source_page"),

  created_at: timestamp("created_at").defaultNow(),
});

// AI Interactions (Track AI usage for analytics and billing)
export const ai_interactions = pgTable("ai_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),

  engagement_id: uuid("engagement_id").references(() => engagements.id),
  knowledge_id: uuid("knowledge_id").references(() => knowledge_base.id),

  // AI Details
  model: text("model").notNull(), // "gpt-4", "claude-3", "nova-pro"
  action: text("action", {
    enum: ["generate", "summarize", "extract", "translate", "analyze", "embed"],
  }).notNull(),

  // Request/Response
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),

  // Usage Metrics
  tokens_used: integer("tokens_used"),
  cost_cents: integer("cost_cents"),
  latency_ms: integer("latency_ms"),

  // Quality Metrics
  user_rating: integer("user_rating"), // 1-5
  was_helpful: boolean("was_helpful"),

  metadata: jsonb("metadata").default({}),
  created_at: timestamp("created_at").defaultNow(),
});

// Engagement Stakeholders (simplified from project_members)
export const engagement_stakeholders = pgTable("engagement_stakeholders", {
  id: uuid("id").primaryKey().defaultRandom(),
  engagement_id: uuid("engagement_id")
    .references(() => engagements.id)
    .notNull(),
  user_id: text("user_id")
    .references(() => users.id)
    .notNull(),

  role: text("role", {
    enum: ["lead", "consultant", "reviewer", "observer"],
  }).default("consultant"),

  // Permissions
  can_edit: boolean("can_edit").default(true),
  can_share: boolean("can_share").default(false),

  joined_at: timestamp("joined_at").defaultNow(),
  left_at: timestamp("left_at"),
});

// Files & Attachments
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  engagement_id: uuid("engagement_id").references(() => engagements.id),
  knowledge_id: uuid("knowledge_id").references(() => knowledge_base.id),

  name: text("name").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
  mime_type: text("mime_type").notNull(),

  // File Classification
  file_type: text("file_type", {
    enum: [
      "document",
      "presentation",
      "spreadsheet",
      "diagram",
      "image",
      "code",
      "archive",
      "other",
    ],
  }).default("other"),

  // Processing Status
  processing_status: text("processing_status", {
    enum: ["pending", "processing", "completed", "failed"],
  }).default("pending"),

  extracted_text: text("extracted_text"), // For searchability

  uploaded_by: text("uploaded_by")
    .references(() => users.id)
    .notNull(),
  metadata: jsonb("metadata").default({}),
  created_at: timestamp("created_at").defaultNow(),
});

// ==========================================
// RELATIONS
// ==========================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  engagements: many(engagements),
  knowledge_base: many(knowledge_base),
  knowledge_templates: many(knowledge_templates),
  tags: many(tags),
  insights: many(knowledge_insights),
  files: many(files),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organization_id],
    references: [organizations.id],
  }),
  knowledge_base: many(knowledge_base),
  templates: many(knowledge_templates),
  search_history: many(search_history),
  ai_interactions: many(ai_interactions),
  files: many(files),
}));

export const engagementsRelations = relations(engagements, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [engagements.organization_id],
    references: [organizations.id],
  }),
  knowledge_base: many(knowledge_base),
  insights: many(knowledge_insights),
  stakeholders: many(engagement_stakeholders),
  files: many(files),
}));

export const knowledgeBaseRelations = relations(knowledge_base, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [knowledge_base.organization_id],
    references: [organizations.id],
  }),
  engagement: one(engagements, {
    fields: [knowledge_base.engagement_id],
    references: [engagements.id],
  }),
  created_by_user: one(users, {
    fields: [knowledge_base.created_by],
    references: [users.id],
  }),
  tags: many(knowledge_tags),
  files: many(files),
}));

export const knowledgeTemplatesRelations = relations(knowledge_templates, ({ one }) => ({
  organization: one(organizations, {
    fields: [knowledge_templates.organization_id],
    references: [organizations.id],
  }),
  created_by_user: one(users, {
    fields: [knowledge_templates.created_by],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tags.organization_id],
    references: [organizations.id],
  }),
  knowledge_entries: many(knowledge_tags),
}));

export const knowledgeTagsRelations = relations(knowledge_tags, ({ one }) => ({
  knowledge: one(knowledge_base, {
    fields: [knowledge_tags.knowledge_id],
    references: [knowledge_base.id],
  }),
  tag: one(tags, {
    fields: [knowledge_tags.tag_id],
    references: [tags.id],
  }),
}));

export const knowledgeInsightsRelations = relations(knowledge_insights, ({ one }) => ({
  organization: one(organizations, {
    fields: [knowledge_insights.organization_id],
    references: [organizations.id],
  }),
  engagement: one(engagements, {
    fields: [knowledge_insights.engagement_id],
    references: [engagements.id],
  }),
  acknowledged_by_user: one(users, {
    fields: [knowledge_insights.acknowledged_by],
    references: [users.id],
  }),
}));

export const searchHistoryRelations = relations(search_history, ({ one }) => ({
  user: one(users, {
    fields: [search_history.user_id],
    references: [users.id],
  }),
  engagement: one(engagements, {
    fields: [search_history.engagement_id],
    references: [engagements.id],
  }),
}));

export const aiInteractionsRelations = relations(ai_interactions, ({ one }) => ({
  user: one(users, {
    fields: [ai_interactions.user_id],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [ai_interactions.organization_id],
    references: [organizations.id],
  }),
  engagement: one(engagements, {
    fields: [ai_interactions.engagement_id],
    references: [engagements.id],
  }),
  knowledge: one(knowledge_base, {
    fields: [ai_interactions.knowledge_id],
    references: [knowledge_base.id],
  }),
}));

export const engagementStakeholdersRelations = relations(engagement_stakeholders, ({ one }) => ({
  engagement: one(engagements, {
    fields: [engagement_stakeholders.engagement_id],
    references: [engagements.id],
  }),
  user: one(users, {
    fields: [engagement_stakeholders.user_id],
    references: [users.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  organization: one(organizations, {
    fields: [files.organization_id],
    references: [organizations.id],
  }),
  engagement: one(engagements, {
    fields: [files.engagement_id],
    references: [engagements.id],
  }),
  knowledge: one(knowledge_base, {
    fields: [files.knowledge_id],
    references: [knowledge_base.id],
  }),
  uploaded_by_user: one(users, {
    fields: [files.uploaded_by],
    references: [users.id],
  }),
}));

// News Articles - RSS Feed Storage
export const news_articles = pgTable(
  "news_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Article content
    title: text("title").notNull(),
    description: text("description"),
    content: text("content"),
    link: text("link").notNull().unique(),

    // Media
    image_url: text("image_url"),
    thumbnail_url: text("thumbnail_url"),

    // Metadata
    author: text("author"),
    categories: jsonb("categories").default([]),
    tags: jsonb("tags").default([]),

    // Source information
    source: text("source").notNull(), // RSS feed source
    guid: text("guid"), // RSS GUID for deduplication

    // Timestamps
    published_at: timestamp("published_at").notNull(),
    fetched_at: timestamp("fetched_at").defaultNow(),

    // Additional data from RSS
    metadata: jsonb("metadata").default({}),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Indexes for performance
    publishedIdx: index("news_published_idx").on(table.published_at),
    linkIdx: index("news_link_idx").on(table.link),
    sourceIdx: index("news_source_idx").on(table.source),
  })
);

// Export for backwards compatibility (will update gradually)
export const projects = engagements;
export const project_members = engagement_stakeholders;
export const tasks = null; // Removed - not needed for knowledge management
export const notifications = null; // Removed - not core to knowledge system
