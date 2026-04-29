import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  getPublicBookingSettings,
  normalizePublicBookingConfirmationMode,
  setPublicBookingSettings,
} from '@/lib/clinic/public-booking-settings'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await getPublicBookingSettings(prisma, session.tenantId)
  return NextResponse.json(settings)
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

  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'enabled must be boolean' }, { status: 400 })
  }
  if (body.enabled === undefined && body.confirmationMode === undefined) {
    return NextResponse.json({ error: 'enabled or confirmationMode is required' }, { status: 400 })
  }

  const settings = await setPublicBookingSettings(prisma, session.tenantId, {
    enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
    confirmationMode:
      body.confirmationMode !== undefined
        ? normalizePublicBookingConfirmationMode(body.confirmationMode)
        : undefined,
  })
  return NextResponse.json(settings)
}
