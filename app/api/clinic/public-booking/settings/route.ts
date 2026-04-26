import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  getPublicBookingEnabled,
  setPublicBookingEnabled,
} from '@/lib/clinic/public-booking-settings'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const enabled = await getPublicBookingEnabled(prisma, session.tenantId)
  return NextResponse.json({ enabled })
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

  if (typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'enabled boolean is required' }, { status: 400 })
  }

  const enabled = await setPublicBookingEnabled(prisma, session.tenantId, body.enabled)
  return NextResponse.json({ enabled })
}
