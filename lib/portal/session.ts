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
      COALESCE(tm.role, u.role) AS role
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

  return { userId: u.id, email: u.email, name: u.name, role: u.role, tenantId }
}

export function assertRole(session: PortalSession, allowed: string[]) {
  if (!allowed.includes(session.role)) {
    throw new Error('FORBIDDEN')
  }
}


