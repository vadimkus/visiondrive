import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession, type ClinicSession } from '@/lib/clinic/session'

export const CLINIC_ADMIN_ROLES = ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'] as const
export const CLINIC_MANAGED_ROLES = ['CUSTOMER_ADMIN', 'CUSTOMER_OPS', 'CUSTOMER_ANALYST', 'USER'] as const

export type ClinicAdminRole = (typeof CLINIC_ADMIN_ROLES)[number]
export type ClinicManagedRole = (typeof CLINIC_MANAGED_ROLES)[number]

export type ClinicAdminSession = ClinicSession & {
  role: ClinicAdminRole
}

export function isClinicAdminRole(role: string | null | undefined): role is ClinicAdminRole {
  return CLINIC_ADMIN_ROLES.includes(String(role || '').toUpperCase() as ClinicAdminRole)
}

export function isClinicManagedRole(role: string | null | undefined): role is ClinicManagedRole {
  return CLINIC_MANAGED_ROLES.includes(String(role || '').toUpperCase() as ClinicManagedRole)
}

export async function requireClinicAdminSession(request: NextRequest): Promise<ClinicAdminSession> {
  const session = getClinicSession(request)
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      memberships: {
        where: { tenantId: session.tenantId, status: 'ACTIVE' },
        select: { role: true, status: true },
        take: 1,
      },
    },
  })

  if (!user || user.status !== 'ACTIVE') {
    throw new Error('UNAUTHORIZED')
  }

  const globalRole = String(user.role).toUpperCase()
  const tenantRole = user.memberships[0]?.role ? String(user.memberships[0].role).toUpperCase() : null
  const effectiveRole = globalRole === 'MASTER_ADMIN' ? 'MASTER_ADMIN' : tenantRole || globalRole

  if (!tenantRole && globalRole !== 'MASTER_ADMIN') {
    throw new Error('FORBIDDEN')
  }
  if (!isClinicAdminRole(effectiveRole)) {
    throw new Error('FORBIDDEN')
  }

  return {
    ...session,
    email: user.email,
    role: effectiveRole,
  }
}

export function clinicAdminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error'
  const status =
    message === 'UNAUTHORIZED'
      ? 401
      : message === 'FORBIDDEN'
        ? 403
        : message === 'NOT_FOUND'
          ? 404
          : message === 'LAST_ADMIN' || message === 'SELF_DELETE'
            ? 400
            : 500

  const friendly =
    message === 'UNAUTHORIZED'
      ? 'Unauthorized'
      : message === 'FORBIDDEN'
        ? 'Admin access required'
        : message === 'NOT_FOUND'
          ? 'User not found in this practice'
          : message === 'LAST_ADMIN'
            ? 'Cannot remove or demote the last active admin'
            : message === 'SELF_DELETE'
              ? 'You cannot remove or deactivate your own admin account'
              : message

  return NextResponse.json({ success: false, error: friendly }, { status })
}

export async function countOtherActiveTenantAdmins(tenantId: string, userIdToExclude: string) {
  return prisma.tenantMembership.count({
    where: {
      tenantId,
      userId: { not: userIdToExclude },
      status: 'ACTIVE',
      role: { in: [...CLINIC_ADMIN_ROLES] },
      user: { status: 'ACTIVE' },
    },
  })
}
