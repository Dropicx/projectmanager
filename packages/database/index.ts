import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// Parse connection string to handle IPv6
function getPostgresClient(url: string) {
  // For Railway internal networking with IPv6
  const isInternalRailway = url.includes('.railway.internal')

  if (isInternalRailway) {
    // Railway internal URLs need special handling
    return postgres(url, {
      ssl: false, // Internal connections don't need SSL
      connection: {
        application_name: 'consulting-platform'
      }
    })
  }

  // For external connections (with proxy.rlwy.net)
  return postgres(url, {
    ssl: 'require',
    connection: {
      application_name: 'consulting-platform'
    }
  })
}

// Create a PostgreSQL connection
const queryClient = connectionString
  ? getPostgresClient(connectionString)
  : null

// Create the drizzle instance
export const db = queryClient
  ? drizzle(queryClient, { schema })
  : {} as any // Mock for build time

export * from './schema'
export type Database = typeof db