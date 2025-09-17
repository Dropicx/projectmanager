const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:vtwyKVDTWAyWySGhzxYJpBpEJPjsiiLN@crossover.proxy.rlwy.net:39737/railway";

async function pushSchema() {
  console.log("Connecting to database...");
  const client = postgres(DATABASE_URL);

  try {
    console.log("Creating tables...");

    // Create tables without foreign keys first
    await client`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "tier" text DEFAULT 'free',
        "settings" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "organization_id" uuid,
        "email" text NOT NULL,
        "first_name" text,
        "last_name" text,
        "role" text DEFAULT 'consultant',
        "avatar_url" text,
        "preferences" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "users_email_unique" UNIQUE("email")
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "organization_id" uuid,
        "name" text NOT NULL,
        "description" text,
        "status" text DEFAULT 'planning',
        "budget" integer,
        "timeline" jsonb,
        "ai_insights" jsonb,
        "risk_assessment" jsonb,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "project_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "project_id" uuid NOT NULL,
        "user_id" text NOT NULL,
        "role" text DEFAULT 'member',
        "joined_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "project_id" uuid NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "status" text DEFAULT 'todo',
        "priority" text DEFAULT 'medium',
        "assignee_id" text,
        "due_date" timestamp,
        "estimated_hours" integer,
        "actual_hours" integer,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "ai_interactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "project_id" uuid,
        "model" text NOT NULL,
        "prompt" text NOT NULL,
        "response" text NOT NULL,
        "tokens_used" integer,
        "cost_cents" integer,
        "latency_ms" integer,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "files" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "organization_id" uuid NOT NULL,
        "project_id" uuid,
        "name" text NOT NULL,
        "url" text NOT NULL,
        "size" integer NOT NULL,
        "mime_type" text NOT NULL,
        "uploaded_by" text NOT NULL,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "knowledge_base" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "organization_id" uuid NOT NULL,
        "project_id" uuid,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "embedding" jsonb,
        "metadata" jsonb DEFAULT '{}'::jsonb,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "is_public" boolean DEFAULT false,
        "created_by" text NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "type" text NOT NULL,
        "title" text NOT NULL,
        "message" text NOT NULL,
        "data" jsonb DEFAULT '{}'::jsonb,
        "read" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      )
    `;

    console.log("Tables created successfully!");

    // Add new columns to organizations table if they don't exist
    console.log("Adding budget tracking columns...");

    const alterCommands = [
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "monthly_budget_cents" integer DEFAULT 10000`,
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "current_month_usage_cents" integer DEFAULT 0`,
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "usage_reset_date" timestamp DEFAULT now()`,
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "daily_limit_cents" integer DEFAULT 1000`,
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "current_day_usage_cents" integer DEFAULT 0`,
    ];

    for (const alterCmd of alterCommands) {
      try {
        await client.unsafe(alterCmd);
        console.log(`✓ ${alterCmd.split('"')[3]} column added`);
      } catch (err) {
        if (err.message.includes("already exists")) {
          console.log(`✓ ${alterCmd.split('"')[3]} column already exists`);
        } else {
          console.warn(`Warning: ${err.message}`);
        }
      }
    }

    // Now add foreign keys
    console.log("Adding foreign key constraints...");

    // Only add constraints if they don't exist
    const constraints = [
      `ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "files" ADD CONSTRAINT "files_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "files" ADD CONSTRAINT "files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`,
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action`,
    ];

    for (const constraint of constraints) {
      try {
        await client.unsafe(constraint);
      } catch (err) {
        // Ignore if constraint already exists
        if (!err.message.includes("already exists")) {
          console.warn(`Warning: ${err.message}`);
        }
      }
    }

    console.log("Foreign key constraints added!");
    console.log("✅ Database schema pushed successfully!");
  } catch (error) {
    console.error("Error pushing schema:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

pushSchema();
