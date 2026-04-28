import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { hashPassword, verifyPassword } from '@/lib/auth'
import {
  DEFAULT_CLINIC_ACCOUNT_PREFERENCES,
  normalizeClinicAccountPreferences,
  normalizeClinicLocale,
} from '@/lib/clinic/account-preferences'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [user, tenant] = await Promise.all([
    prisma.user.findFirst({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        clinicUserPreferences: {
          where: { tenantId: session.tenantId },
          take: 1,
          select: {
            locale: true,
            notifyPush: true,
            notifyEmail: true,
            notifyNewBooking: true,
            notifyCancelled: true,
            notifyRescheduled: true,
            notifyReminderDue: true,
            notifyReviewRequest: true,
            notifyUnpaidVisit: true,
            notifyLowStock: true,
            notifyPackageExpiry: true,
          },
        },
      },
    }),
    prisma.tenant.findFirst({
      where: { id: session.tenantId },
      select: { id: true, name: true, slug: true },
    }),
  ])

  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!tenant) {
    return NextResponse.json({ error: 'Practice not found' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: session.role,
    },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    preferences: user.clinicUserPreferences[0] ?? DEFAULT_CLINIC_ACCOUNT_PREFERENCES,
  })
}

export async function PATCH(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const nameRaw = body.name
  const newPassword = body.newPassword != null ? String(body.newPassword) : ''
  const currentPassword = body.currentPassword != null ? String(body.currentPassword) : ''
  const localeRaw = body.locale
  const preferencesRaw = body.preferences

  const data: { name?: string | null; passwordHash?: string } = {}
  let preferencesData: ReturnType<typeof normalizeClinicAccountPreferences> | null = null

  if (nameRaw !== undefined) {
    data.name = String(nameRaw).trim() || null
  }

  if (localeRaw !== undefined || preferencesRaw !== undefined) {
    preferencesData = normalizeClinicAccountPreferences({
      ...(preferencesRaw && typeof preferencesRaw === 'object'
        ? (preferencesRaw as Record<string, unknown>)
        : {}),
      ...(localeRaw !== undefined ? { locale: normalizeClinicLocale(localeRaw) } : {}),
    })
  }

  if (newPassword.length > 0) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'currentPassword is required to set a new password' },
        { status: 400 }
      )
    }
    const row = await prisma.user.findFirst({
      where: { id: session.userId },
      select: { passwordHash: true },
    })
    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const ok = await verifyPassword(currentPassword, row.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }
    try {
      data.passwordHash = await hashPassword(newPassword)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid password'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
  }

  if (Object.keys(data).length === 0 && !preferencesData) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  await prisma.$transaction([
    ...(Object.keys(data).length > 0
      ? [
          prisma.user.update({
            where: { id: session.userId },
            data,
            select: { id: true, email: true, name: true },
          }),
        ]
      : []),
    ...(preferencesData
      ? [
          prisma.clinicUserPreference.upsert({
            where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
            create: { userId: session.userId, tenantId: session.tenantId, ...preferencesData },
            update: preferencesData,
          }),
        ]
      : []),
  ])

  return NextResponse.json({ success: true })
}
