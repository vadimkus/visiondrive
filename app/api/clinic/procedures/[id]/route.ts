import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  normalizeBookingPolicyType,
  normalizeCancellationWindowHours,
  normalizeMoneyCents,
  normalizePercent,
} from '@/lib/clinic/booking-policy'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await prisma.clinicProcedure.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: {
    name?: string
    defaultDurationMin?: number
    bufferAfterMinutes?: number
    basePriceCents?: number
    currency?: string
    bookingPolicyType?: ReturnType<typeof normalizeBookingPolicyType>
    depositAmountCents?: number
    depositPercent?: number
    cancellationWindowHours?: number
    lateCancelFeeCents?: number
    noShowFeeCents?: number
    bookingPolicyText?: string | null
    active?: boolean
  } = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    data.name = name
  }
  if (body.defaultDurationMin !== undefined) {
    const defaultDurationMin = Number(body.defaultDurationMin)
    if (!Number.isFinite(defaultDurationMin) || defaultDurationMin < 5 || defaultDurationMin > 24 * 60) {
      return NextResponse.json({ error: 'defaultDurationMin must be between 5 and 1440' }, { status: 400 })
    }
    data.defaultDurationMin = Math.round(defaultDurationMin)
  }
  if (body.bufferAfterMinutes !== undefined) {
    const bufferAfterMinutes = Number(body.bufferAfterMinutes)
    if (!Number.isFinite(bufferAfterMinutes) || bufferAfterMinutes < 0 || bufferAfterMinutes > 60) {
      return NextResponse.json({ error: 'bufferAfterMinutes must be between 0 and 60' }, { status: 400 })
    }
    data.bufferAfterMinutes = Math.round(bufferAfterMinutes)
  }
  if (body.basePriceCents !== undefined) {
    const basePriceCents = Number(body.basePriceCents)
    if (!Number.isFinite(basePriceCents) || basePriceCents < 0) {
      return NextResponse.json({ error: 'basePriceCents must be a non-negative number' }, { status: 400 })
    }
    data.basePriceCents = Math.round(basePriceCents)
  }
  if (body.currency !== undefined) {
    data.currency = String(body.currency).trim().toUpperCase().slice(0, 8) || 'AED'
  }
  if (body.bookingPolicyType !== undefined) {
    data.bookingPolicyType = normalizeBookingPolicyType(body.bookingPolicyType)
  }
  if (body.depositAmountCents !== undefined) {
    data.depositAmountCents = normalizeMoneyCents(body.depositAmountCents)
  }
  if (body.depositPercent !== undefined) {
    data.depositPercent = normalizePercent(body.depositPercent)
  }
  if (body.cancellationWindowHours !== undefined) {
    data.cancellationWindowHours = normalizeCancellationWindowHours(body.cancellationWindowHours)
  }
  if (body.lateCancelFeeCents !== undefined) {
    data.lateCancelFeeCents = normalizeMoneyCents(body.lateCancelFeeCents)
  }
  if (body.noShowFeeCents !== undefined) {
    data.noShowFeeCents = normalizeMoneyCents(body.noShowFeeCents)
  }
  if (body.bookingPolicyText !== undefined) {
    data.bookingPolicyText =
      body.bookingPolicyText == null ? null : String(body.bookingPolicyText).trim() || null
  }
  if (body.active !== undefined) {
    data.active = body.active === true
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const procedure = await prisma.clinicProcedure.update({
    where: { id },
    data,
  })

  return NextResponse.json({ procedure })
}
