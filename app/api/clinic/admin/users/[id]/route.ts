import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePassword } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'
import {
  clinicAdminErrorResponse,
  countOtherActiveTenantAdmins,
  isClinicAdminRole,
  isClinicManagedRole,
  requireClinicAdminSession,
} from '@/lib/clinic/admin'

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (value == null) return undefined
  const normalized = String(value).replace(/\s+/g, ' ').trim().slice(0, maxLength)
  return normalized || null
}

function generateAdminPassword() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `VD-${randomBytes(8).toString('base64url')}-${randomBytes(8).toString('base64url')}!aA1`
    if (validatePassword(candidate).isValid) {
      return candidate
    }
  }
  return `VisionDrive-${randomBytes(12).toString('hex')}!aA1`
}

async function loadTargetMembership(tenantId: string, userId: string) {
  return prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    select: {
      id: true,
      role: true,
      status: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          defaultTenantId: true,
        },
      },
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireClinicAdminSession(request)
    const { id: userId } = await params
    const target = await loadTargetMembership(session.tenantId, userId)

    if (!target) {
      throw new Error('NOT_FOUND')
    }
    if (target.user.role === 'MASTER_ADMIN' && session.role !== 'MASTER_ADMIN') {
      throw new Error('FORBIDDEN')
    }

    const body = await request.json().catch(() => ({}))
    const nextName = Object.prototype.hasOwnProperty.call(body, 'name')
      ? normalizeOptionalText(body.name, 120)
      : undefined
    const nextRoleRaw = Object.prototype.hasOwnProperty.call(body, 'role')
      ? String(body.role || '').toUpperCase()
      : undefined
    const nextMembershipStatus = Object.prototype.hasOwnProperty.call(body, 'membershipStatus')
      ? String(body.membershipStatus || '').toUpperCase()
      : undefined
    const newPassword = normalizeOptionalText(body.newPassword, 128)
    const autoGeneratePassword = body.autoGeneratePassword === true

    if (nextRoleRaw !== undefined && !isClinicManagedRole(nextRoleRaw)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }
    if (
      nextMembershipStatus !== undefined &&
      nextMembershipStatus !== 'ACTIVE' &&
      nextMembershipStatus !== 'INACTIVE'
    ) {
      return NextResponse.json({ success: false, error: 'Invalid membership status' }, { status: 400 })
    }

    const deactivatesMembership = nextMembershipStatus === 'INACTIVE'
    const demotesAdmin = nextRoleRaw !== undefined && isClinicAdminRole(target.role) && !isClinicAdminRole(nextRoleRaw)
    if (userId === session.userId && (deactivatesMembership || demotesAdmin)) {
      throw new Error('SELF_DELETE')
    }

    if ((deactivatesMembership || demotesAdmin) && isClinicAdminRole(target.role)) {
      const remainingAdmins = await countOtherActiveTenantAdmins(session.tenantId, userId)
      if (remainingAdmins < 1) {
        throw new Error('LAST_ADMIN')
      }
    }

    const generatedPassword = autoGeneratePassword ? generateAdminPassword() : null
    const passwordToHash = newPassword || generatedPassword
    let passwordHash: string | null = null
    if (passwordToHash) {
      try {
        passwordHash = await hashPassword(passwordToHash)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid password'
        return NextResponse.json({ success: false, error: message }, { status: 400 })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(nextName !== undefined ? { name: nextName } : {}),
          ...(passwordHash ? { passwordHash } : {}),
          ...(nextMembershipStatus === 'ACTIVE' ? { status: 'ACTIVE' } : {}),
          ...(nextRoleRaw && target.user.role !== 'MASTER_ADMIN' ? { role: nextRoleRaw } : {}),
        },
        select: { id: true, email: true, name: true, status: true },
      })

      const membership = await tx.tenantMembership.update({
        where: { tenantId_userId: { tenantId: session.tenantId, userId } },
        data: {
          ...(nextRoleRaw ? { role: nextRoleRaw } : {}),
          ...(nextMembershipStatus ? { status: nextMembershipStatus } : {}),
        },
        select: { id: true, role: true, status: true },
      })

      return { user, membership }
    })

    await writeAuditLog({
      request,
      session,
      action: 'CLINIC_ADMIN_USER_UPDATE',
      entityType: 'TenantMembership',
      entityId: `${session.tenantId}:${userId}`,
      before: {
        userId,
        email: target.user.email,
        name: target.user.name,
        role: target.role,
        status: target.status,
      },
      after: {
        userId,
        email: result.user.email,
        name: result.user.name,
        role: result.membership.role,
        status: result.membership.status,
        passwordReset: Boolean(passwordHash),
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        userStatus: result.user.status,
        tenantRole: result.membership.role,
        membershipStatus: result.membership.status,
      },
      generatedPassword,
    })
  } catch (error) {
    return clinicAdminErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireClinicAdminSession(request)
    const { id: userId } = await params
    const target = await loadTargetMembership(session.tenantId, userId)

    if (!target) {
      throw new Error('NOT_FOUND')
    }
    if (target.user.role === 'MASTER_ADMIN' && session.role !== 'MASTER_ADMIN') {
      throw new Error('FORBIDDEN')
    }
    if (userId === session.userId) {
      throw new Error('SELF_DELETE')
    }
    if (target.status === 'ACTIVE' && isClinicAdminRole(target.role)) {
      const remainingAdmins = await countOtherActiveTenantAdmins(session.tenantId, userId)
      if (remainingAdmins < 1) {
        throw new Error('LAST_ADMIN')
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.tenantMembership.update({
        where: { tenantId_userId: { tenantId: session.tenantId, userId } },
        data: { status: 'INACTIVE' },
      })

      const nextActiveMembership = await tx.tenantMembership.findFirst({
        where: { userId, tenantId: { not: session.tenantId }, status: 'ACTIVE' },
        select: { tenantId: true },
        orderBy: { updatedAt: 'desc' },
      })

      await tx.user.update({
        where: { id: userId },
        data: {
          status: nextActiveMembership ? 'ACTIVE' : 'INACTIVE',
          defaultTenantId: nextActiveMembership?.tenantId || null,
        },
      })
    })

    await writeAuditLog({
      request,
      session,
      action: 'CLINIC_ADMIN_USER_REMOVE',
      entityType: 'TenantMembership',
      entityId: `${session.tenantId}:${userId}`,
      before: {
        userId,
        email: target.user.email,
        name: target.user.name,
        role: target.role,
        status: target.status,
      },
      after: {
        userId,
        email: target.user.email,
        role: target.role,
        status: 'INACTIVE',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return clinicAdminErrorResponse(error)
  }
}
