import { sql } from './sql'

/**
 * Database-backed rate limiter for serverless environments
 * 
 * Uses PostgreSQL to track request counts per identifier (IP, user, etc.)
 * Works reliably across serverless function invocations
 */

interface RateLimitConfig {
  /** Unique identifier for the rate limit rule (e.g., 'login', 'api') */
  name: string
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of requests remaining in the current window */
  remaining: number
  /** Timestamp when the rate limit resets (Unix epoch seconds) */
  resetAt: number
  /** Total requests made in the current window */
  current: number
}

/**
 * Check and update rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - config.windowSeconds
  const key = `${config.name}:${identifier}`

  try {
    // Use a single atomic query to check and update rate limit
    // This handles concurrent requests correctly
    const result = await sql`
      WITH cleanup AS (
        -- Clean up old entries (older than 24 hours) to prevent table bloat
        DELETE FROM rate_limits
        WHERE "updatedAt" < NOW() - INTERVAL '24 hours'
      ),
      upsert AS (
        INSERT INTO rate_limits (key, count, "windowStart", "updatedAt")
        VALUES (${key}, 1, to_timestamp(${now}), NOW())
        ON CONFLICT (key) DO UPDATE SET
          count = CASE 
            WHEN EXTRACT(EPOCH FROM rate_limits."windowStart") < ${windowStart}
            THEN 1  -- Reset count if window expired
            ELSE rate_limits.count + 1
          END,
          "windowStart" = CASE 
            WHEN EXTRACT(EPOCH FROM rate_limits."windowStart") < ${windowStart}
            THEN to_timestamp(${now})  -- Reset window if expired
            ELSE rate_limits."windowStart"
          END,
          "updatedAt" = NOW()
        RETURNING count, EXTRACT(EPOCH FROM "windowStart")::integer AS "windowStartEpoch"
      )
      SELECT count, "windowStartEpoch" FROM upsert
    `

    const row = result[0]
    const count = Number(row?.count || 1)
    const windowStartEpoch = Number(row?.windowStartEpoch || now)
    const resetAt = windowStartEpoch + config.windowSeconds

    return {
      allowed: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt,
      current: count,
    }
  } catch (error) {
    // If the rate_limits table doesn't exist, create it and allow the request
    if (error instanceof Error && error.message.includes('rate_limits')) {
      await ensureRateLimitTable()
      // On first run, allow the request
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowSeconds,
        current: 1,
      }
    }
    
    // Log error but don't block requests if rate limiting fails
    console.error('Rate limit check failed:', error)
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowSeconds,
      current: 0,
    }
  }
}

/**
 * Create the rate_limits table if it doesn't exist
 */
async function ensureRateLimitTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        "windowStart" TIMESTAMPTZ NOT NULL,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    
    // Create index for cleanup queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_updated 
      ON rate_limits ("updatedAt")
    `
  } catch (error) {
    console.error('Failed to create rate_limits table:', error)
  }
}

/**
 * Get client IP address from request headers
 * Handles various proxy configurations (Vercel, Cloudflare, nginx, etc.)
 */
export function getClientIp(request: Request): string {
  // Vercel provides the real IP in x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; the first is the client
    const firstIp = forwarded.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // Other common headers
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // Fallback
  return 'unknown'
}

// Pre-configured rate limiters for common use cases

/**
 * Rate limiter for login attempts
 * Strict: 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = {
  name: 'login',
  maxRequests: 5,
  windowSeconds: 15 * 60, // 15 minutes
}

/**
 * Rate limiter for password reset requests
 * Moderate: 3 attempts per hour per IP
 */
export const passwordResetRateLimiter = {
  name: 'password-reset',
  maxRequests: 3,
  windowSeconds: 60 * 60, // 1 hour
}

/**
 * Rate limiter for general API endpoints
 * Lenient: 100 requests per minute per IP
 */
export const apiRateLimiter = {
  name: 'api',
  maxRequests: 100,
  windowSeconds: 60, // 1 minute
}

/**
 * Rate limiter for registration
 * Moderate: 3 registrations per hour per IP
 */
export const registrationRateLimiter = {
  name: 'registration',
  maxRequests: 3,
  windowSeconds: 60 * 60, // 1 hour
}

