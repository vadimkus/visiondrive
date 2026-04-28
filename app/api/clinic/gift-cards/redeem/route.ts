import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicGiftCardStatus, ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  deriveGiftCardStatus,
  giftCardPaymentReference,
  normalizeGiftCardAmountCents,
  normalizeGiftCardCode,
  validateGiftCardRedemption,
} from '@/lib/clinic/gift-cards'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'
import { getClinicSession } from '@/lib/clinic/session'

export async function POST(request: NextRequest) {
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

  const patientId = String(body.patientId ?? '').trim()
  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const code = normalizeGiftCardCode(body.code)
  const giftCardId =
    body.giftCardId != null && String(body.giftCardId).trim() ? String(body.giftCardId).trim() : null
  if (!code && !giftCardId) {
    return NextResponse.json({ error: 'Gift card code is required' }, { status: 400 })
  }

  const amountCents = normalizeGiftCardAmountCents(body.amountCents)
  const note = body.note != null ? String(body.note).trim() || null : null
  const redeemedAtRaw = body.redeemedAt != null ? String(body.redeemedAt) : ''
  const redeemedAt = redeemedAtRaw ? new Date(redeemedAtRaw) : new Date()
  if (Number.isNaN(redeemedAt.getTime())) {
    return NextResponse.json({ error: 'redeemedAt must be a valid ISO datetime' }, { status: 400 })
  }

  const visitId =
    body.visitId != null && String(body.visitId).trim() ? String(body.visitId).trim() : null
  const requestedAppointmentId =
    body.appointmentId != null && String(body.appointmentId).trim()
      ? String(body.appointmentId).trim()
      : null

  let appointmentId = requestedAppointmentId
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

  let result
  try {
    result = await prisma.$transaction(async (tx) => {
    const card = await tx.clinicGiftCard.findFirst({
      where: giftCardId
        ? { id: giftCardId, tenantId: session.tenantId }
        : { code, tenantId: session.tenantId },
      select: {
        id: true,
        code: true,
        status: true,
        paymentStatus: true,
        remainingBalanceCents: true,
        currency: true,
        expiresAt: true,
      },
    })
    if (!card) {
      throw new Error('Gift card not found')
    }

    const currentStatus = deriveGiftCardStatus({
      paymentStatus: card.paymentStatus,
      remainingBalanceCents: card.remainingBalanceCents,
      expiresAt: card.expiresAt,
    })
    if (currentStatus !== card.status) {
      await tx.clinicGiftCard.update({
        where: { id: card.id },
        data: { status: currentStatus },
      })
    }

    const redemptionError = validateGiftCardRedemption({
      amountCents,
      remainingBalanceCents: card.remainingBalanceCents,
      status: currentStatus,
      expiresAt: card.expiresAt,
    })
    if (redemptionError) {
      throw new Error(redemptionError)
    }

    const updatedCount = await tx.clinicGiftCard.updateMany({
      where: {
        id: card.id,
        tenantId: session.tenantId,
        status: ClinicGiftCardStatus.ACTIVE,
        remainingBalanceCents: { gte: amountCents },
        OR: [{ expiresAt: null }, { expiresAt: { gte: redeemedAt } }],
      },
      data: { remainingBalanceCents: { decrement: amountCents } },
    })
    if (updatedCount.count !== 1) {
      throw new Error('Gift card balance changed. Try again.')
    }

    const cardAfter = await tx.clinicGiftCard.findUniqueOrThrow({
      where: { id: card.id },
      select: { id: true, code: true, remainingBalanceCents: true, currency: true, paymentStatus: true, expiresAt: true },
    })
    const nextStatus = deriveGiftCardStatus({
      paymentStatus: cardAfter.paymentStatus,
      remainingBalanceCents: cardAfter.remainingBalanceCents,
      expiresAt: cardAfter.expiresAt,
    })
    if (nextStatus !== ClinicGiftCardStatus.ACTIVE) {
      await tx.clinicGiftCard.update({
        where: { id: card.id },
        data: { status: nextStatus },
      })
    }

    const payment = await tx.clinicPatientPayment.create({
      data: {
        tenantId: session.tenantId,
        patientId,
        appointmentId,
        visitId,
        amountCents,
        currency: cardAfter.currency,
        method: ClinicPaymentMethod.OTHER,
        status: ClinicPaymentStatus.PAID,
        reference: giftCardPaymentReference(card.id),
        note: [`Gift card ${cardAfter.code}`, note].filter(Boolean).join('. '),
        paidAt: redeemedAt,
        createdByUserId: session.userId,
      },
      select: {
        id: true,
        amountCents: true,
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

    const redemption = await tx.clinicGiftCardRedemption.create({
      data: {
        tenantId: session.tenantId,
        giftCardId: card.id,
        patientId,
        appointmentId,
        visitId,
        paymentId: payment.id,
        amountCents,
        currency: cardAfter.currency,
        note,
        redeemedAt,
        createdByUserId: session.userId,
      },
    })

    if (appointmentId) {
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId,
        type: ClinicAppointmentEventType.PAYMENT_RECORDED,
        message: `Gift card redeemed: ${(amountCents / 100).toFixed(2)} ${cardAfter.currency}`,
        after: {
          giftCardId: card.id,
          giftCardCode: cardAfter.code,
          redemptionId: redemption.id,
          paymentId: payment.id,
          amountCents,
        },
        createdByUserId: session.userId,
      })
    }

      return { card: cardAfter, payment, redemption }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gift card redemption failed' },
      { status: 400 }
    )
  }

  return NextResponse.json(result, { status: 201 })
}
