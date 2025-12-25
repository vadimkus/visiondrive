import 'dotenv/config'
import postgres from 'postgres'

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

const needsSsl =
  /sslmode=require/i.test(connectionString) ||
  /tsdb\.cloud\.timescale\.com/i.test(connectionString) ||
  /timescale/i.test(connectionString)

export const sql = postgres(connectionString, {
  max: 5,
  connect_timeout: 10,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
})



