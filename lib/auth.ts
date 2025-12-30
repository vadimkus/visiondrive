import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from './sql'

// JWT Secret - MUST be set in production
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: JWT_SECRET environment variable must be set in production')
}
const jwtSecret = JWT_SECRET || 'dev-only-secret-do-not-use-in-production'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string, email: string, role: string, tenantId?: string | null): string {
  return jwt.sign({ userId, email, role, tenantId: tenantId || null }, jwtSecret, { expiresIn: '7d' })
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
    const rows = await sql/*sql*/`
      SELECT id, email, name, role, status, "passwordHash", "defaultTenantId"
      FROM users
      WHERE email = ${email}
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

    // Prefer membership role for the user's current/default tenant (tenant-scoped RBAC)
    let effectiveRole = user.role
    if (user.defaultTenantId) {
      const membershipRows = await sql/*sql*/`
        SELECT role, status
        FROM tenant_memberships
        WHERE "tenantId" = ${user.defaultTenantId} AND "userId" = ${user.id}
        LIMIT 1
      `
      const membership = membershipRows?.[0] || null
      if (membership?.status === 'ACTIVE' && membership?.role) {
        effectiveRole = membership.role
      }
    }

    const token = generateToken(user.id, user.email, effectiveRole, user.defaultTenantId)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        tenantId: user.defaultTenantId || null,
      },
      token,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    // Preserve the original error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    
    // Check if it's a database connection error
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
      throw new Error('Database connection failed. Please check your database configuration and ensure DATABASE_URL is set correctly.')
    }
    
    // Re-throw with more context
    throw new Error(`Authentication failed: ${errorMessage}`)
  }
}




