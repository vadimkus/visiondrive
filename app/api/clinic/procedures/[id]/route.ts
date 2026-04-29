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
    bookingPolicyType?: ReturnType<typeof normalizeBookingPolicyType>
    depositAmountCents?: number
    depositPercent?: number
    cancellationWindowHours?: number
    lateCancelFeeCents?: number
    noShowFeeCents?: number
    bookingPolicyText?: string | null
  } = {}

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

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const procedure = await prisma.clinicProcedure.update({
    where: { id },
    data,
  })

  return NextResponse.json({ procedure })
}
