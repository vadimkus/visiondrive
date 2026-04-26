import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from './sql'
import { validatePassword, type PasswordValidationResult } from './password-policy'

// JWT Secret - MUST be set in production
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: JWT_SECRET environment variable must be set in production')
}
const jwtSecret = JWT_SECRET || 'dev-only-secret-do-not-use-in-production'

/**
 * Hash password with bcrypt (cost factor 12 for security)
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate password before hashing (VD-2026-005)
  const validation = validatePassword(password)
  if (!validation.isValid) {
    throw new Error(`Password does not meet security requirements: ${validation.errors.join(', ')}`)
  }
  return bcrypt.hash(password, 12) // Increased cost factor from 10 to 12
}

/**
 * Validate password against security policy
 * Export for use in registration/password change forms
 */
export { validatePassword, type PasswordValidationResult } from './password-policy'

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string, email: string, role: string, tenantId?: string | null): string {
  // Session timeout: 24 hours (security best practice - VD-2026-004)
  return jwt.sign({ userId, email, role, tenantId: tenantId || null }, jwtSecret, { expiresIn: '24h' })
}

export function verifyToken(token: string): { userId: string; email: string; role: string; tenantId?: string | null } | null {
  try {
    return jwt.verify(token, jwtSecret) as { userId: string; email: string; role: string; tenantId?: string | null }
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const emailNorm = String(email ?? '')
      .trim()
      .toLowerCase()
    if (!emailNorm) {
      return null
    }

    const rows = await sql/*sql*/`
      SELECT id, email, name, role, status, "passwordHash", "defaultTenantId"
      FROM users
      WHERE lower(btrim(email)) = ${emailNorm}
      LIMIT 1
    `
    const user = rows?.[0] || null

    if (!user || user.status !== 'ACTIVE') {
      return null
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return null
    }

    // Tenant for JWT: prefer defaultTenantId; otherwise first active membership (fixes clinic
    // when membership exists but defaultTenantId was never set).
    let tenantIdForToken: string | null = user.defaultTenantId || null
    if (!tenantIdForToken) {
      const fallback = await sql/*sql*/`
        SELECT "tenantId"
        FROM tenant_memberships
        WHERE "userId" = ${user.id} AND status = 'ACTIVE'
        ORDER BY "createdAt" ASC
        LIMIT 1
      `
      tenantIdForToken = fallback?.[0]?.tenantId ?? null
      if (tenantIdForToken) {
        await sql/*sql*/`
          UPDATE users
          SET "defaultTenantId" = ${tenantIdForToken}, "updatedAt" = now()
          WHERE id = ${user.id} AND "defaultTenantId" IS NULL
        `
      }
    }

    // Prefer membership role for that tenant (tenant-scoped RBAC)
    let effectiveRole = user.role
    if (tenantIdForToken) {
      const membershipRows = await sql/*sql*/`
        SELECT role, status
        FROM tenant_memberships
        WHERE "tenantId" = ${tenantIdForToken} AND "userId" = ${user.id}
        LIMIT 1
      `
      const membership = membershipRows?.[0] || null
      if (membership?.status === 'ACTIVE' && membership?.role) {
        effectiveRole = membership.role
      }
    }

    const token = generateToken(user.id, user.email, effectiveRole, tenantIdForToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        tenantId: tenantIdForToken,
      },
      token,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    // Preserve the original error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    
    // Database / network errors — avoid leaking hostnames to the browser
    const isDbUnreachable =
      errorMessage.includes('connect') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('getaddrinfo') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('certificate')
    if (isDbUnreachable) {
      throw new Error(
        'Database connection failed. The app cannot reach PostgreSQL (check Vercel env: VISIONDRIVE_DATABASE_URL or DATABASE_URL — hostname may be wrong or the database service was removed).'
      )
    }

    throw new Error(`Authentication failed: ${errorMessage}`)
  }
}




