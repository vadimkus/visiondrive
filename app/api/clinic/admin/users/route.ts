import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePassword } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'
import {
  clinicAdminErrorResponse,
  isClinicManagedRole,
  requireClinicAdminSession,
} from '@/lib/clinic/admin'

function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (value == null) return null
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

export async function GET(request: NextRequest) {
  try {
    const session = await requireClinicAdminSession(request)

    const [tenant, memberships, patientCount, appointmentCount, completedVisitCount, auditEventCount] =
      await Promise.all([
        prisma.tenant.findFirst({
          where: { id: session.tenantId },
          select: { id: true, name: true, slug: true, status: true },
        }),
        prisma.tenantMembership.findMany({
          where: { tenantId: session.tenantId },
          orderBy: { createdAt: 'desc' },
          take: 200,
          select: {
            id: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                defaultTenantId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        }),
        prisma.clinicPatient.count({ where: { tenantId: session.tenantId } }),
        prisma.clinicAppointment.count({ where: { tenantId: session.tenantId } }),
        prisma.clinicVisit.count({ where: { tenantId: session.tenantId, status: 'COMPLETED' } }),
        prisma.auditLog.count({ where: { tenantId: session.tenantId } }),
      ])

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Practice not found' }, { status: 404 })
    }

    const users = memberships.map((membership) => ({
      id: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      globalRole: membership.user.role,
      userStatus: membership.user.status,
      defaultTenantId: membership.user.defaultTenantId,
      tenantRole: membership.role,
      membershipStatus: membership.status,
      membershipId: membership.id,
      createdAt: membership.user.createdAt.toISOString(),
      updatedAt: membership.user.updatedAt.toISOString(),
      membershipCreatedAt: membership.createdAt.toISOString(),
      membershipUpdatedAt: membership.updatedAt.toISOString(),
    }))

    const activeUsers = users.filter(
      (user) => user.userStatus === 'ACTIVE' && user.membershipStatus === 'ACTIVE'
    )
    const adminUsers = activeUsers.filter((user) =>
      ['MASTER_ADMIN', 'ADMIN', 'CUSTOMER_ADMIN'].includes(String(user.tenantRole))
    )

    return NextResponse.json({
      success: true,
      tenant,
      currentUser: { id: session.userId, email: session.email, role: session.role },
      stats: {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        inactiveUsers: users.length - activeUsers.length,
        adminUsers: adminUsers.length,
        patientCount,
        appointmentCount,
        completedVisitCount,
        auditEventCount,
      },
      users,
    })
  } catch (error) {
    return clinicAdminErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireClinicAdminSession(request)
    const body = await request.json().catch(() => ({}))

    const email = normalizeEmail(body.email)
    const name = normalizeOptionalText(body.name, 120)
    const roleRaw = String(body.role || 'CUSTOMER_OPS').toUpperCase()
    const passwordInput = normalizeOptionalText(body.password, 128)

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 })
    }
    if (!isClinicManagedRole(roleRaw)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }
    if (passwordInput) {
      const validation = validatePassword(passwordInput)
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: `Password does not meet security requirements: ${validation.errors.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
        select: { id: true, role: true, defaultTenantId: true },
      })
      const existingMembership = existingUser
        ? await tx.tenantMembership.findUnique({
            where: { tenantId_userId: { tenantId: session.tenantId, userId: existingUser.id } },
            select: { id: true },
          })
        : null

      if (existingUser?.role === 'MASTER_ADMIN' && session.role !== 'MASTER_ADMIN') {
        throw new Error('FORBIDDEN')
      }
      if (existingUser && !existingMembership && session.role !== 'MASTER_ADMIN') {
        throw new Error('FORBIDDEN')
      }

      const generatedPassword = !existingUser && !passwordInput ? generateAdminPassword() : null
      const passwordToHash = existingUser && !existingMembership ? null : passwordInput || generatedPassword
      const passwordHash = passwordToHash ? await hashPassword(passwordToHash) : null

      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: name ?? undefined,
              status: 'ACTIVE',
              defaultTenantId: existingUser.defaultTenantId || session.tenantId,
              ...(passwordHash ? { passwordHash } : {}),
              ...(existingUser.role === 'MASTER_ADMIN' ? {} : { role: roleRaw }),
            },
            select: { id: true, email: true, name: true },
          })
        : await tx.user.create({
            data: {
              email,
              passwordHash: passwordHash as string,
              name,
              role: roleRaw,
              status: 'ACTIVE',
              defaultTenantId: session.tenantId,
            },
            select: { id: true, email: true, name: true },
          })

      const membership = await tx.tenantMembership.upsert({
        where: { tenantId_userId: { tenantId: session.tenantId, userId: user.id } },
        create: {
          tenantId: session.tenantId,
          userId: user.id,
          role: roleRaw,
          status: 'ACTIVE',
        },
        update: {
          role: roleRaw,
          status: 'ACTIVE',
        },
        select: { id: true, role: true, status: true },
      })

      return {
        user,
        membership,
        generatedPassword,
        linkedExistingUser: Boolean(existingUser),
      }
    })

    await writeAuditLog({
      request,
      session,
      action: 'CLINIC_ADMIN_USER_UPSERT',
      entityType: 'TenantMembership',
      entityId: `${session.tenantId}:${result.user.id}`,
      before: null,
      after: {
        tenantId: session.tenantId,
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.membership.role,
        status: result.membership.status,
      },
    })

    return NextResponse.json({
      success: true,
      user: { ...result.user, tenantRole: result.membership.role },
      generatedPassword: result.generatedPassword,
      linkedExistingUser: result.linkedExistingUser,
    })
  } catch (error) {
    return clinicAdminErrorResponse(error)
  }
}
