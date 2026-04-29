import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicBookingPolicyType,
  ClinicPaymentRequirementStatus,
  ClinicSavedPaymentMethodStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  normalizeSavedPaymentMethodStatus,
  parseSavedPaymentMethodInput,
} from '@/lib/clinic/saved-payment-methods'

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

  const parsed = parseSavedPaymentMethodInput(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const method = await tx.clinicSavedPaymentMethod.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        createdByUserId: session.userId,
        ...parsed.value,
      },
    })

    const pendingAppointments = await tx.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        patientId,
        bookingPolicyType: ClinicBookingPolicyType.CARD_ON_FILE,
        paymentRequirementStatus: ClinicPaymentRequirementStatus.PENDING,
      },
      select: { id: true },
    })

    if (pendingAppointments.length > 0) {
      const ids = pendingAppointments.map((appointment) => appointment.id)
      await tx.clinicAppointment.updateMany({
        where: { id: { in: ids }, tenantId: session.tenantId },
        data: { paymentRequirementStatus: ClinicPaymentRequirementStatus.PAID },
      })
      await tx.clinicAppointmentEvent.createMany({
        data: ids.map((appointmentId) => ({
          tenantId: session.tenantId,
          appointmentId,
          type: ClinicAppointmentEventType.UPDATED,
          message: 'Card-on-file requirement satisfied by saved payment method.',
          createdByUserId: session.userId,
        })),
      })
    }

    return { method, satisfiedAppointmentCount: pendingAppointments.length }
  })

  return NextResponse.json(result, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const methodId = String(body.methodId ?? '').trim()
  if (!methodId) {
    return NextResponse.json({ error: 'methodId is required' }, { status: 400 })
  }

  const status = normalizeSavedPaymentMethodStatus(body.status)
  if (status === ClinicSavedPaymentMethodStatus.ACTIVE) {
    return NextResponse.json({ error: 'Only revoke or expire actions are supported' }, { status: 400 })
  }

  const method = await prisma.clinicSavedPaymentMethod.findFirst({
    where: { id: methodId, patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!method) {
    return NextResponse.json({ error: 'Saved payment method not found' }, { status: 404 })
  }

  const updated = await prisma.clinicSavedPaymentMethod.update({
    where: { id: methodId },
    data: {
      status,
      note: body.note != null ? String(body.note).trim() || null : undefined,
    },
  })

  return NextResponse.json({ method: updated })
}
