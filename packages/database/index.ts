/**
 * Database Package - PostgreSQL Connection and Schema Management
 * 
 * This package provides:
 * - PostgreSQL database connection with Railway-specific optimizations
 * - Drizzle ORM integration for type-safe database operations
 * - Database schema definitions for the consulting platform
 * - Connection handling for both internal and external Railway deployments
 * 
 * Key Features:
 * - IPv6 support for Railway internal networking
 * - SSL configuration for external connections
 * - Type-safe database operations with Drizzle ORM
 * - Build-time compatibility with mock database
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

/**
 * Create a PostgreSQL client with Railway-specific optimizations
 * 
 * Handles different connection scenarios:
 * - Railway internal networking (IPv6, no SSL)
 * - External connections via proxy (IPv4, SSL required)
 * 
 * @param url - Database connection string
 * @returns Configured PostgreSQL client
 */
function getPostgresClient(url: string) {
  // Detect Railway internal networking (uses IPv6 and internal domains)
  const isInternalRailway = url.includes(".railway.internal");

  if (isInternalRailway) {
    // Railway internal connections - optimized for performance
    return postgres(url, {
      ssl: false, // Internal connections don't require SSL
      connection: {
        application_name: "consulting-platform", // For connection tracking
      },
    });
  }

  // External connections (via Railway proxy) - requires SSL
  return postgres(url, {
    ssl: "require", // External connections must use SSL
    connection: {
      application_name: "consulting-platform", // For connection tracking
    },
  });
}

// Create PostgreSQL connection (null if no connection string provided)
const queryClient = connectionString ? getPostgresClient(connectionString) : null;

// Create Drizzle ORM instance with schema
// Uses mock object during build time when database is not available
export const db = queryClient ? drizzle(queryClient, { schema }) : ({} as any);

// Export all schema definitions for use throughout the application
export * from "./schema";

// Export database type for TypeScript inference
export type Database = typeof db;
