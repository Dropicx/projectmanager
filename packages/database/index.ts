import { drizzle } from 'drizzle-orm/neon-serverless'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// Create a mock database for build time when DATABASE_URL is not available
const createMockDb = () => {
  return {} as any
}

export const db = connectionString 
  ? drizzle(connectionString, { schema })
  : createMockDb()

export * from './schema'
export type Database = typeof db
