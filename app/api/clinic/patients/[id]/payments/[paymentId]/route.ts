import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'
import { getClinicSession } from '@/lib/clinic/session'

function parsePayStatus(value: string): ClinicPaymentStatus | null {
  const status = value.toUpperCase().trim()
  const allowed: ClinicPaymentStatus[] = ['PAID', 'PENDING', 'REFUNDED', 'VOID']
  return allowed.includes(status as ClinicPaymentStatus) ? (status as ClinicPaymentStatus) : null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
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

  const { id: patientId, paymentId } = await context.params
  const status = parsePayStatus(String(body.status ?? ''))
  if (!status) {
    return NextResponse.json({ error: 'Unsupported payment status' }, { status: 400 })
  }
  const note = body.note != null ? String(body.note).trim() || null : undefined

  const existing = await prisma.clinicPatientPayment.findFirst({
    where: { id: paymentId, patientId, tenantId: session.tenantId },
    select: {
      id: true,
      amountCents: true,
      currency: true,
      status: true,
      appointmentId: true,
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const payment = await prisma.$transaction(async (tx) => {
    const payment = await tx.clinicPatientPayment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(note !== undefined ? { note } : {}),
      },
      select: {
        id: true,
        amountCents: true,
        discountCents: true,
        feeCents: true,
        processorFeeCents: true,
        currency: true,
        method: true,
        status: true,
        reference: true,
        note: true,
        paidAt: true,
        visitId: true,
        appointmentId: true,
        createdAt: true,
      },
    })

    if (existing.appointmentId) {
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: existing.appointmentId,
        type: ClinicAppointmentEventType.PAYMENT_RECORDED,
        message: `Payment ${status.toLowerCase()}: ${(existing.amountCents / 100).toFixed(2)} ${existing.currency}`,
        before: { paymentId: existing.id, status: existing.status },
        after: { paymentId: existing.id, status },
        createdByUserId: session.userId,
      })
    }

    return payment
  })

  return NextResponse.json({ payment })
}
