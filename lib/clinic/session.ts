import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export type ClinicSession = {
  userId: string
  email: string
  role: string
  tenantId: string
}

/**
 * Resolves the signed-in clinic user and tenant from cookies.
 * Requires `portal=clinic` and JWT with non-null tenantId (practice isolation).
 */
export function getClinicSession(request: NextRequest): ClinicSession | null {
  const token = request.cookies.get('authToken')?.value
  const portal = request.cookies.get('portal')?.value
  if (!token || portal !== 'clinic') {
    return null
  }
  const decoded = verifyToken(token)
  if (!decoded?.userId || !decoded.tenantId) {
    return null
  }
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    tenantId: decoded.tenantId,
  }
}
