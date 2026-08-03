import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { AmmeStaffRole } from '@prisma/client'

export type AmmeSession = {
  userId: string
  email: string
  role: string
  tenantId: string
  staffRole: AmmeStaffRole
  venueId: string
  name: string | null
}

export function getAmmeTokenSession(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value
  const portal = request.cookies.get('portal')?.value
  if (!token || portal !== 'amme') return null
  const decoded = verifyToken(token)
  if (!decoded?.userId || !decoded.tenantId) return null
  return decoded
}

export async function getAmmeSession(request: NextRequest): Promise<AmmeSession | null> {
  const decoded = getAmmeTokenSession(request)
  if (!decoded?.tenantId) return null

  const [venue, profile, user] = await Promise.all([
    prisma.ammeVenue.findUnique({ where: { tenantId: decoded.tenantId } }),
    prisma.ammeStaffProfile.findUnique({ where: { userId: decoded.userId } }),
    prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, status: true },
    }),
  ])

  if (!venue || !user || user.status !== 'ACTIVE') return null

  return {
    userId: user.id,
    email: user.email,
    role: decoded.role,
    tenantId: decoded.tenantId,
    staffRole: profile?.staffRole ?? 'ADMIN',
    venueId: venue.id,
    name: user.name,
  }
}
