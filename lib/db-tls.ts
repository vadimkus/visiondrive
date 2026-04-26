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

/**
 * `pg` v8+ maps `sslmode=require` to `verify-full`, which ignores
 * `ssl: { rejectUnauthorized: false }`. Those modes live in the URL query
 * string, which is also sent to the server — so we must not use client-only
 * hacks like `uselibpqcompat` in the URL.
 *
 * When TLS verification is intentionally relaxed, strip SSL-related query
 * parameters and rely on explicit `ssl: { rejectUnauthorized: false }` on the
 * pool / `postgres.js` client instead.
 */
export function postgresUrlForNodePgWhenRelaxedTls(connectionString: string): string {
  if (pgRejectUnauthorized(connectionString)) {
    return connectionString
  }
  if (!postgresUrlNeedsTls(connectionString)) {
    return connectionString
  }
  try {
    const normalized = connectionString
      .replace(/^postgresql:/i, 'http:')
      .replace(/^postgres:/i, 'http:')
    const u = new URL(normalized)
    for (const key of [
      'sslmode',
      'ssl',
      'sslrootcert',
      'sslcert',
      'sslkey',
      'uselibpqcompat',
    ]) {
      u.searchParams.delete(key)
    }
    const protocol = /^postgresql:/i.test(connectionString) ? 'postgresql:' : 'postgres:'
    const host = u.hostname
    const port = u.port ? `:${u.port}` : ''
    const path = u.pathname || '/'
    const qs = u.searchParams.toString()
    const query = qs ? `?${qs}` : ''
    const user = u.username ? encodeURIComponent(u.username) : ''
    const password = u.password ? `:${encodeURIComponent(u.password)}` : ''
    const auth = user ? `${user}${password}@` : ''
    return `${protocol}//${auth}${host}${port}${path}${query}`
  } catch {
    return connectionString
  }
}
