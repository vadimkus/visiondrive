import 'dotenv/config'
import postgres from 'postgres'
import { pgRejectUnauthorized, postgresUrlNeedsTls } from '@/lib/db-tls'

// Shared SQL client (used when Prisma Client adapter is unstable or for lightweight ops).
// Prefer app-specific override to avoid platform-managed locked vars.
const connectionString =
  process.env.VISIONDRIVE_DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  ''

if (!connectionString) {
  throw new Error('Database URL is missing. Set VISIONDRIVE_DATABASE_URL (preferred) or DATABASE_URL.')
}

const isProduction = process.env.NODE_ENV === 'production'
const useSsl = postgresUrlNeedsTls(connectionString)
const rejectUnauthorized = pgRejectUnauthorized(connectionString)

export const sql = postgres(connectionString, {
  max: isProduction ? 10 : 5, // Higher pool size for production
  connect_timeout: 10,
  idle_timeout: 20,
  ...(useSsl ? { ssl: { rejectUnauthorized } } : {}),
})



