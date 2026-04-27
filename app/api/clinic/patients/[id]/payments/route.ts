import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateProcessorFeeForPayment, PAYMENT_FEE_METHODS } from '@/lib/clinic/payment-fees'
import { getClinicSession } from '@/lib/clinic/session'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'

function parseMethod(v: string): ClinicPaymentMethod | null {
  const u = v.toUpperCase().trim()
  const allowed = PAYMENT_FEE_METHODS
  return allowed.includes(u as ClinicPaymentMethod) ? (u as ClinicPaymentMethod) : null
}

function parsePayStatus(v: string): ClinicPaymentStatus | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicPaymentStatus[] = ['PAID', 'PENDING', 'REFUNDED', 'VOID']
  return allowed.includes(u as ClinicPaymentStatus) ? (u as ClinicPaymentStatus) : null
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const amountCents = Number(body.amountCents)
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: 'amountCents must be a positive integer' }, { status: 400 })
  }
  const discountCents = Number(body.discountCents ?? 0)
  if (!Number.isInteger(discountCents) || discountCents < 0) {
    return NextResponse.json({ error: 'discountCents must be a non-negative integer' }, { status: 400 })
  }
  const feeCents = Number(body.feeCents ?? 0)
  if (!Number.isInteger(feeCents) || feeCents < 0) {
    return NextResponse.json({ error: 'feeCents must be a non-negative integer' }, { status: 400 })
  }

  const currency = body.currency != null ? String(body.currency).trim().toUpperCase() || 'AED' : 'AED'
  const method = parseMethod(String(body.method ?? 'OTHER')) ?? ClinicPaymentMethod.OTHER
  const status = parsePayStatus(String(body.status ?? 'PAID')) ?? ClinicPaymentStatus.PAID
  const feeRule = await prisma.clinicPaymentFeeRule.findUnique({
    where: { tenantId_method: { tenantId: session.tenantId, method } },
    select: { percentBps: true, fixedFeeCents: true, active: true },
  })
  const processorFeeCents = calculateProcessorFeeForPayment({ amountCents, status, rule: feeRule })

  const paidAtRaw = String(body.paidAt ?? '')
  const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date()
  if (Number.isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: 'paidAt must be a valid ISO datetime' }, { status: 400 })
  }

  const reference = body.reference != null ? String(body.reference).trim() || null : null
  const note = body.note != null ? String(body.note).trim() || null : null
  const visitId =
    body.visitId != null && String(body.visitId).trim() ? String(body.visitId).trim() : null
  const requestedAppointmentId =
    body.appointmentId != null && String(body.appointmentId).trim()
      ? String(body.appointmentId).trim()
      : null

  let appointmentId: string | null = requestedAppointmentId
  if (visitId) {
    const visit = await prisma.clinicVisit.findFirst({
      where: { id: visitId, patientId, tenantId: session.tenantId },
      select: { id: true, appointmentId: true },
    })
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found for this patient' }, { status: 400 })
    }
    appointmentId = appointmentId ?? visit.appointmentId
  }

  if (appointmentId) {
    const appointment = await prisma.clinicAppointment.findFirst({
      where: { id: appointmentId, patientId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found for this patient' }, { status: 400 })
    }
  }

  const payment = await prisma.$transaction(async (tx) => {
    const payment = await tx.clinicPatientPayment.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        visitId,
        appointmentId,
        amountCents,
        discountCents,
        feeCents,
        processorFeeCents,
        currency,
        method,
        status,
        reference,
        note,
        paidAt,
        createdByUserId: session.userId,
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
    if (appointmentId) {
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId,
        type: ClinicAppointmentEventType.PAYMENT_RECORDED,
        message: `Payment recorded: ${(amountCents / 100).toFixed(2)} ${currency}`,
        after: { paymentId: payment.id, amountCents, discountCents, feeCents, processorFeeCents, currency, status },
        createdByUserId: session.userId,
      })
    }
    return payment
  })

  return NextResponse.json({ payment }, { status: 201 })
}
