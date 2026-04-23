/**
 * Shared TLS behavior for `pg` (Prisma adapter) and `postgres.js` (lib/sql).
 * Timescale Cloud and some corporate networks present chains that fail
 * Node's default verification in development; opt into strict checks with
 * STRICT_SSL_VALIDATION=true.
 */

const MANAGED_HOST_PATTERNS = [
  /tsdb\.cloud\.timescale\.com/i,
  /neon\.tech/i,
  /supabase\.co/i,
  /railway\.app/i,
  /render\.com/i,
  /elephantsql\.com/i,
  /cockroachlabs\.cloud/i,
  /digitalocean\.com/i,
  /vercel-storage\.com/i,
] as const

export function isManagedPostgresHost(connectionString: string): boolean {
  return MANAGED_HOST_PATTERNS.some((re) => re.test(connectionString))
}

export function postgresUrlNeedsTls(connectionString: string): boolean {
  return (
    /sslmode=require/i.test(connectionString) ||
    isManagedPostgresHost(connectionString) ||
    /timescale/i.test(connectionString)
  )
}

/**
 * rejectUnauthorized=true only when we intend to verify the server cert.
 * Development defaults to false so local Next.js can reach Timescale Cloud
 * without "self-signed certificate in certificate chain" from intermediates.
 */
export function pgRejectUnauthorized(connectionString: string): boolean {
  if (process.env.STRICT_SSL_VALIDATION === 'true') {
    return true
  }
  if (process.env.NODE_ENV === 'development') {
    return false
  }
  const isProd = process.env.NODE_ENV === 'production'
  const managed = isManagedPostgresHost(connectionString)
  return isProd && !managed
}
