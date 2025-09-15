import { drizzle } from 'drizzle-orm/neon-serverless'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })

export * from './schema'
export type Database = typeof db
