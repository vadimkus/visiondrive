import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicPaymentCorrectionType,
  ClinicPaymentMethod,
  ClinicPaymentStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'
import {
  canVoidPayment,
  normalizeCorrectionAmountCents,
  normalizeCorrectionNote,
  normalizeCorrectionReason,
  paymentRefundReference,
  refundableCentsForPayment,
} from '@/lib/clinic/payment-corrections'
import { PAYMENT_FEE_METHODS } from '@/lib/clinic/payment-fees'
import { getClinicSession } from '@/lib/clinic/session'

function parsePayStatus(value: string): ClinicPaymentStatus | null {
  const status = value.toUpperCase().trim()
  const allowed: ClinicPaymentStatus[] = ['PAID', 'PENDING', 'REFUNDED', 'VOID']
  return allowed.includes(status as ClinicPaymentStatus) ? (status as ClinicPaymentStatus) : null
}

function parseMethod(value: string): ClinicPaymentMethod | null {
  const method = value.toUpperCase().trim()
  return PAYMENT_FEE_METHODS.includes(method as ClinicPaymentMethod) ? (method as ClinicPaymentMethod) : null
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
  const reason = normalizeCorrectionReason(body.reason)

  const existing = await prisma.clinicPatientPayment.findFirst({
    where: { id: paymentId, patientId, tenantId: session.tenantId },
    select: {
      id: true,
      patientId: true,
      tenantId: true,
      visitId: true,
      amountCents: true,
      currency: true,
      method: true,
      status: true,
      appointmentId: true,
      reference: true,
      paidAt: true,
      productSale: { select: { id: true } },
      correctionsAsOriginal: {
        select: {
          type: true,
          amountCents: true,
        },
      },
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  if (status === ClinicPaymentStatus.REFUNDED) {
    const correctionReason = reason
    if (!correctionReason) {
      return NextResponse.json({ error: 'Refund reason is required' }, { status: 400 })
    }
    const remainingRefundableCents = refundableCentsForPayment(existing)
    if (remainingRefundableCents <= 0) {
      return NextResponse.json({ error: 'Payment has no refundable amount left' }, { status: 409 })
    }
    const requestedAmountCents = normalizeCorrectionAmountCents(body.amountCents)
    const refundAmountCents = requestedAmountCents ?? remainingRefundableCents
    if (refundAmountCents > remainingRefundableCents) {
      return NextResponse.json({ error: 'Refund amount exceeds remaining paid amount' }, { status: 400 })
    }
    const refundMethod = parseMethod(String(body.method ?? existing.method)) ?? existing.method
    const correctionNote = normalizeCorrectionNote(body.note)
    const refundPaidAtRaw = String(body.paidAt ?? '')
    const refundPaidAt = refundPaidAtRaw ? new Date(refundPaidAtRaw) : new Date()
    if (Number.isNaN(refundPaidAt.getTime())) {
      return NextResponse.json({ error: 'paidAt must be a valid ISO datetime' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const adjustmentPayment = await tx.clinicPatientPayment.create({
        data: {
          tenantId: session.tenantId,
          patientId,
          visitId: existing.visitId,
          appointmentId: existing.appointmentId,
          amountCents: refundAmountCents,
          currency: existing.currency,
          method: refundMethod,
          status: ClinicPaymentStatus.REFUNDED,
          reference: paymentRefundReference(existing.id),
          note: correctionNote ? `${correctionReason} - ${correctionNote}` : correctionReason,
          paidAt: refundPaidAt,
          createdByUserId: session.userId,
        },
      })

      if (existing.productSale && refundAmountCents === remainingRefundableCents) {
        await tx.clinicProductSale.update({
          where: { id: existing.productSale.id },
          data: { paymentStatus: ClinicPaymentStatus.REFUNDED },
        })
      }

      const correction = await tx.clinicPaymentCorrection.create({
        data: {
          tenantId: session.tenantId,
          patientId,
          originalPaymentId: existing.id,
          adjustmentPaymentId: adjustmentPayment.id,
          type: ClinicPaymentCorrectionType.REFUND,
          amountCents: refundAmountCents,
          currency: existing.currency,
          method: refundMethod,
          reason: correctionReason,
          note: correctionNote,
          correctedAt: refundPaidAt,
          createdByUserId: session.userId,
        },
      })

      if (existing.appointmentId) {
        await writeAppointmentEvent(tx, {
          tenantId: session.tenantId,
          appointmentId: existing.appointmentId,
          type: ClinicAppointmentEventType.PAYMENT_RECORDED,
          message: `Payment refunded: ${(refundAmountCents / 100).toFixed(2)} ${existing.currency}`,
          before: { paymentId: existing.id, status: existing.status },
          after: {
            paymentId: existing.id,
            correctionId: correction.id,
            adjustmentPaymentId: adjustmentPayment.id,
            status: ClinicPaymentStatus.REFUNDED,
            amountCents: refundAmountCents,
            method: refundMethod,
            reason: correctionReason,
          },
          createdByUserId: session.userId,
        })
      }

      return { adjustmentPayment, correction }
    })

    return NextResponse.json(result)
  }

  if (status === ClinicPaymentStatus.VOID) {
    const correctionReason = reason
    if (!correctionReason) {
      return NextResponse.json({ error: 'Void reason is required' }, { status: 400 })
    }
    if (!canVoidPayment(existing)) {
      return NextResponse.json({ error: 'Payment with refunds cannot be voided' }, { status: 409 })
    }
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
        correctionsAsOriginal: {
          select: {
            id: true,
            type: true,
            amountCents: true,
            currency: true,
            method: true,
            reason: true,
            note: true,
            correctedAt: true,
            adjustmentPaymentId: true,
          },
          orderBy: { correctedAt: 'desc' },
        },
      },
    })

    if (status === ClinicPaymentStatus.VOID) {
      if (existing.productSale) {
        await tx.clinicProductSale.update({
          where: { id: existing.productSale.id },
          data: { paymentStatus: ClinicPaymentStatus.VOID },
        })
      }
      await tx.clinicPaymentCorrection.create({
        data: {
          tenantId: session.tenantId,
          patientId,
          originalPaymentId: existing.id,
          type: ClinicPaymentCorrectionType.VOID,
          amountCents: existing.amountCents,
          currency: existing.currency,
          method: existing.method,
          reason: reason!,
          note: note ?? null,
          createdByUserId: session.userId,
        },
      })
    }

    if (existing.appointmentId) {
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: existing.appointmentId,
        type: ClinicAppointmentEventType.PAYMENT_RECORDED,
        message: `Payment ${status.toLowerCase()}: ${(existing.amountCents / 100).toFixed(2)} ${existing.currency}`,
        before: { paymentId: existing.id, status: existing.status },
        after: { paymentId: existing.id, status, reason },
        createdByUserId: session.userId,
      })
    }

    return payment
  })

  return NextResponse.json({ payment })
}
