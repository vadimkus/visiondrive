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

const isProduction = process.env.NODE_ENV === 'production'

// SSL Configuration:
// - Production: Validate certificates for security (rejectUnauthorized: true)
// - Development: Allow self-signed certs for local testing (rejectUnauthorized: false)
// Set DISABLE_SSL_VALIDATION=true only if you have a specific reason (e.g., corporate proxy)
const disableSslValidation = process.env.DISABLE_SSL_VALIDATION === 'true'

export const sql = postgres(connectionString, {
  max: isProduction ? 10 : 5,  // Higher pool size for production
  connect_timeout: 10,
  idle_timeout: 20,
  ...(needsSsl ? { 
    ssl: { 
      rejectUnauthorized: isProduction && !disableSslValidation 
    } 
  } : {}),
})



