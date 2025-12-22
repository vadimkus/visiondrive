import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/sql'

export type PortalSession = {
  userId: string
  email: string
  name: string | null
  role: string
  tenantId: string
}

export async function requirePortalSession(request: NextRequest): Promise<PortalSession> {
  const token =
    request.cookies.get('authToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  const decoded = verifyToken(token || '')
  if (!decoded?.userId) throw new Error('UNAUTHORIZED')
  if (!decoded.tenantId) throw new Error('NO_TENANT')

  const tenantId = decoded.tenantId

  const rows = await sql/*sql*/`
    SELECT
      u.id,
      u.email,
      u.name,
      u.status,
      u.role AS "globalRole",
      tm.role AS "tenantRole",
      tm.status AS "membershipStatus"
    FROM users u
    LEFT JOIN tenant_memberships tm
      ON tm."userId" = u.id
     AND tm."tenantId" = ${tenantId}
     AND tm.status = 'ACTIVE'
    WHERE u.id = ${decoded.userId}
    LIMIT 1
  `
  const u = rows?.[0] || null
  if (!u || u.status !== 'ACTIVE') throw new Error('UNAUTHORIZED')

  // Hard tenant isolation:
  // - Non-master users MUST have an ACTIVE membership for the tenantId in the token.
  // - MASTER_ADMIN is allowed to view any tenant context after a successful switch (token is signed),
  //   even if they don't have an explicit membership in that tenant.
  const globalRole = String(u.globalRole || '').toUpperCase()
  const tenantRole = u.tenantRole ? String(u.tenantRole).toUpperCase() : null
  const effectiveRole = tenantRole || globalRole
  if (!tenantRole && globalRole !== 'MASTER_ADMIN') {
    throw new Error('FORBIDDEN')
  }

  return { userId: u.id, email: u.email, name: u.name, role: effectiveRole, tenantId }
}

export function assertRole(session: PortalSession, allowed: string[]) {
  if (!allowed.includes(session.role)) {
    throw new Error('FORBIDDEN')
  }
}


