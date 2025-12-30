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

// Managed database providers that use certificates which may include self-signed certs
// These are trusted services where we can safely skip strict validation
const isManagedDbProvider =
  /tsdb\.cloud\.timescale\.com/i.test(connectionString) ||  // Timescale Cloud
  /neon\.tech/i.test(connectionString) ||                    // Neon
  /supabase\.co/i.test(connectionString) ||                  // Supabase
  /railway\.app/i.test(connectionString) ||                  // Railway
  /render\.com/i.test(connectionString) ||                   // Render
  /elephantsql\.com/i.test(connectionString) ||              // ElephantSQL
  /cockroachlabs\.cloud/i.test(connectionString) ||          // CockroachDB Cloud
  /digitalocean\.com/i.test(connectionString)                // DigitalOcean

// SSL Configuration:
// - Managed DB providers: Allow their certificates (they use internal CAs)
// - Other production DBs: Validate certificates strictly
// - Development: Allow self-signed certs for local testing
// Override with STRICT_SSL_VALIDATION=true to force validation even for managed providers
const forceStrictSsl = process.env.STRICT_SSL_VALIDATION === 'true'
const shouldValidateCerts = forceStrictSsl || (isProduction && !isManagedDbProvider)

export const sql = postgres(connectionString, {
  max: isProduction ? 10 : 5,  // Higher pool size for production
  connect_timeout: 10,
  idle_timeout: 20,
  ...(needsSsl ? { 
    ssl: { 
      rejectUnauthorized: shouldValidateCerts
    } 
  } : {}),
})



