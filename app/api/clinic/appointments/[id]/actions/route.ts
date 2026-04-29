import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentSource,
  ClinicAppointmentStatus,
  ClinicCrmActivityType,
  ClinicPaymentRequirementStatus,
  ClinicPaymentStatus,
  ClinicReminderChannel,
  ClinicReminderKind,
  ClinicReminderStatus,
  ClinicReviewStatus,
  ClinicVisitStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateProcessorFeeForPayment } from '@/lib/clinic/payment-fees'
import { getClinicSession } from '@/lib/clinic/session'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { applyProcedureLinkedInventoryDeduction } from '@/lib/clinic/inventory-visit-consume'
import { applyPatientPackageDeduction } from '@/lib/clinic/patient-packages'
import { buildAftercareWhatsappText, renderAftercareTemplate } from '@/lib/clinic/aftercare'
import {
  appointmentEnd,
  normalizeBufferMinutes,
  writeAppointmentEvent,
} from '@/lib/clinic/appointments'
import { bookingPolicyAppointmentData } from '@/lib/clinic/booking-policy'
import {
  buildDepositRequestText,
  buildDepositWhatsappUrl,
  depositPaidAppointmentPatch,
  depositPaymentReference,
  generatePaymentRequestToken,
  normalizeDepositPaymentMethod,
  paymentRequestExpiresAt,
  paymentRequestTokenHash,
} from '@/lib/clinic/deposit-requests'
import {
  followUpStartsAt,
  normalizeFollowUpWeeks,
  rebookingReminderScheduledFor,
} from '@/lib/clinic/follow-up'
import { findSchedulingConflict } from '@/lib/clinic/scheduling-guard'
import {
  DEFAULT_REMINDER_MINUTES_BEFORE,
  getReminderTemplate,
  phoneForWhatsapp,
  reminderScheduledFor,
  renderReminderTemplate,
  whatsappUrl,
} from '@/lib/clinic/reminders'

const FUTURE_APPOINTMENT_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
]

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const action = String(body.action || '').trim()

  const existing = await prisma.clinicAppointment.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      procedure: {
        select: {
          id: true,
          name: true,
          defaultDurationMin: true,
          bufferAfterMinutes: true,
          basePriceCents: true,
          currency: true,
          bookingPolicyType: true,
          depositAmountCents: true,
          depositPercent: true,
          cancellationWindowHours: true,
          lateCancelFeeCents: true,
          noShowFeeCents: true,
          bookingPolicyText: true,
        },
      },
      visits: {
        select: {
          id: true,
          status: true,
          inventoryConsumedAt: true,
          visitAt: true,
          aftercareTemplateId: true,
          aftercareTitleSnapshot: true,
          aftercareTextSnapshot: true,
          aftercareDocumentNameSnapshot: true,
          aftercareDocumentUrlSnapshot: true,
          aftercareSentAt: true,
        },
        orderBy: { visitAt: 'desc' },
        take: 1,
      },
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  if (action === 'prepare_deposit_request') {
    if (existing.depositRequiredCents <= 0) {
      return NextResponse.json({ error: 'This appointment does not require a deposit' }, { status: 409 })
    }
    if (existing.paymentRequirementStatus === ClinicPaymentRequirementStatus.PAID) {
      return NextResponse.json({ error: 'Deposit is already marked paid' }, { status: 409 })
    }

    const token = generatePaymentRequestToken()
    const now = new Date()
    const expiresAt = paymentRequestExpiresAt(now)
    const paymentRequestUrl = new URL(`/pay/deposit/${token}`, request.url).toString()
    const messageText = buildDepositRequestText({
      appointment: existing,
      paymentRequestUrl,
      locale: String(body.locale || 'en-GB'),
    })
    const url = buildDepositWhatsappUrl(existing, messageText)
    const reference = depositPaymentReference(existing.id)

    const payment = await prisma.$transaction(async (tx) => {
      const existingRequest = await tx.clinicPatientPayment.findFirst({
        where: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          appointmentId: existing.id,
          reference,
          status: ClinicPaymentStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      })

      const data = {
        amountCents: existing.depositRequiredCents,
        currency: existing.procedure?.currency ?? 'AED',
        method: normalizeDepositPaymentMethod(body.method),
        status: ClinicPaymentStatus.PENDING,
        reference,
        note: 'Deposit payment request',
        paidAt: now,
        paymentRequestTokenHash: paymentRequestTokenHash(token),
        paymentRequestExpiresAt: expiresAt,
        paymentRequestSentAt: now,
        createdByUserId: session.userId,
      }

      const payment = existingRequest
        ? await tx.clinicPatientPayment.update({
            where: { id: existingRequest.id },
            data,
          })
        : await tx.clinicPatientPayment.create({
            data: {
              tenantId: session.tenantId,
              patientId: existing.patientId,
              appointmentId: existing.id,
              ...data,
            },
          })

      await tx.clinicAppointment.update({
        where: { id: existing.id },
        data: { paymentRequirementStatus: ClinicPaymentRequirementStatus.PENDING },
      })
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.WHATSAPP,
          body: `Deposit request prepared: ${messageText}`,
          occurredAt: now,
          createdByUserId: session.userId,
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: existing.id,
        type: ClinicAppointmentEventType.PAYMENT_RECORDED,
        message: `Deposit request prepared: ${(existing.depositRequiredCents / 100).toFixed(2)} ${payment.currency}`,
        after: {
          paymentId: payment.id,
          amountCents: payment.amountCents,
          currency: payment.currency,
          status: payment.status,
          expiresAt: expiresAt.toISOString(),
        },
        createdByUserId: session.userId,
      })
      return payment
    })

    return NextResponse.json({
      payment,
      paymentRequestUrl,
      reminderText: messageText,
      whatsappUrl: url,
    })
  }

  if (action === 'mark_deposit_paid') {
    if (existing.depositRequiredCents <= 0) {
      return NextResponse.json({ error: 'This appointment does not require a deposit' }, { status: 409 })
    }
    const now = new Date()
    const reference = depositPaymentReference(existing.id)
    const method = normalizeDepositPaymentMethod(body.method)
    const externalReference =
      body.reference != null && String(body.reference).trim() ? String(body.reference).trim() : null
    const note =
      body.note != null && String(body.note).trim()
        ? String(body.note).trim()
        : externalReference
          ? `Deposit paid manually. Reference: ${externalReference}`
          : 'Deposit paid manually'

    const result = await prisma.$transaction(async (tx) => {
      const existingRequest = await tx.clinicPatientPayment.findFirst({
        where: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          appointmentId: existing.id,
          reference,
          status: { in: [ClinicPaymentStatus.PENDING, ClinicPaymentStatus.PAID] },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      })
      if (existingRequest?.status === ClinicPaymentStatus.PAID) {
        return { payment: existingRequest, alreadyPaid: true as const }
      }

      const feeRule = await tx.clinicPaymentFeeRule.findUnique({
        where: { tenantId_method: { tenantId: session.tenantId, method } },
        select: { percentBps: true, fixedFeeCents: true, active: true },
      })
      const processorFeeCents = calculateProcessorFeeForPayment({
        amountCents: existing.depositRequiredCents,
        status: ClinicPaymentStatus.PAID,
        rule: feeRule,
      })

      const payment = existingRequest
        ? await tx.clinicPatientPayment.update({
            where: { id: existingRequest.id },
            data: {
              amountCents: existing.depositRequiredCents,
              currency: existing.procedure?.currency ?? existingRequest.currency,
              method,
              status: ClinicPaymentStatus.PAID,
              note,
              processorFeeCents,
              paidAt: now,
              paymentRequestExpiresAt: null,
            },
          })
        : await tx.clinicPatientPayment.create({
            data: {
              tenantId: session.tenantId,
              patientId: existing.patientId,
              appointmentId: existing.id,
              amountCents: existing.depositRequiredCents,
              currency: existing.procedure?.currency ?? 'AED',
              method,
              status: ClinicPaymentStatus.PAID,
              reference,
              note,
              processorFeeCents,
              paidAt: now,
              createdByUserId: session.userId,
            },
          })

      await tx.clinicAppointment.update({
        where: { id: existing.id },
        data: depositPaidAppointmentPatch(now),
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: existing.id,
        type: ClinicAppointmentEventType.PAYMENT_RECORDED,
        message: `Deposit marked paid: ${(existing.depositRequiredCents / 100).toFixed(2)} ${payment.currency}`,
        after: {
          paymentId: payment.id,
          amountCents: payment.amountCents,
          currency: payment.currency,
          method,
          status: payment.status,
          externalReference,
        },
        createdByUserId: session.userId,
      })

      return { payment, alreadyPaid: false as const }
    })

    return NextResponse.json(result)
  }

  if (action === 'send_reminder') {
    const result = await prisma.$transaction(async (tx) => {
      const template = await getReminderTemplate(
        tx,
        session.tenantId,
        ClinicReminderKind.APPOINTMENT_REMINDER
      )
      if (!template) return { disabled: true as const }
      const text = renderReminderTemplate(template?.body || '', existing)
      const url = whatsappUrl(existing.patient.phone, text)
      const delivery = await tx.clinicReminderDelivery.create({
        data: {
          tenantId: session.tenantId,
          appointmentId: id,
          patientId: existing.patientId,
          kind: ClinicReminderKind.APPOINTMENT_REMINDER,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.PREPARED,
          scheduledFor: new Date(),
          preparedAt: new Date(),
          body: text,
          whatsappUrl: url,
          error: phoneForWhatsapp(existing.patient.phone) ? null : 'Missing WhatsApp phone number',
          createdByUserId: session.userId,
        },
      })
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.WHATSAPP,
          body: `Appointment reminder prepared: ${text}`,
          occurredAt: new Date(),
          createdByUserId: session.userId,
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.REMINDER_PREPARED,
        message: 'WhatsApp reminder prepared',
        after: { text, reminderDeliveryId: delivery.id },
        createdByUserId: session.userId,
      })
      return { text, url, delivery }
    })
    if ('disabled' in result) {
      return NextResponse.json({ error: 'Reminder template is inactive' }, { status: 409 })
    }
    return NextResponse.json({
      reminderText: result.text,
      whatsappUrl: result.url,
      delivery: result.delivery,
    })
  }

  if (action === 'schedule_reminder') {
    const minutesBefore = Math.max(0, Math.min(14 * 24 * 60, Number(body.minutesBefore || DEFAULT_REMINDER_MINUTES_BEFORE)))
    const scheduledFor = reminderScheduledFor(existing.startsAt, minutesBefore)
    const delivery = await prisma.$transaction(async (tx) => {
      const template = await getReminderTemplate(
        tx,
        session.tenantId,
        ClinicReminderKind.APPOINTMENT_REMINDER
      )
      if (!template) return { disabled: true as const }
      const text = renderReminderTemplate(template?.body || '', existing)
      const delivery = await tx.clinicReminderDelivery.create({
        data: {
          tenantId: session.tenantId,
          appointmentId: id,
          patientId: existing.patientId,
          kind: ClinicReminderKind.APPOINTMENT_REMINDER,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.SCHEDULED,
          scheduledFor,
          body: text,
          createdByUserId: session.userId,
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.REMINDER_SCHEDULED,
        message: `WhatsApp reminder scheduled ${minutesBefore} minutes before appointment`,
        after: { reminderDeliveryId: delivery.id, scheduledFor: scheduledFor.toISOString() },
        createdByUserId: session.userId,
      })
      return delivery
    })
    if ('disabled' in delivery) {
      return NextResponse.json({ error: 'Reminder template is inactive' }, { status: 409 })
    }
    return NextResponse.json({ delivery }, { status: 201 })
  }

  if (action === 'no_show_follow_up') {
    const result = await prisma.$transaction(async (tx) => {
      const template = await getReminderTemplate(
        tx,
        session.tenantId,
        ClinicReminderKind.NO_SHOW_FOLLOW_UP
      )
      if (!template) return { disabled: true as const }
      const text = renderReminderTemplate(template?.body || '', existing)
      const url = whatsappUrl(existing.patient.phone, text)
      const delivery = await tx.clinicReminderDelivery.create({
        data: {
          tenantId: session.tenantId,
          appointmentId: id,
          patientId: existing.patientId,
          kind: ClinicReminderKind.NO_SHOW_FOLLOW_UP,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.PREPARED,
          scheduledFor: new Date(),
          preparedAt: new Date(),
          body: text,
          whatsappUrl: url,
          error: phoneForWhatsapp(existing.patient.phone) ? null : 'Missing WhatsApp phone number',
          createdByUserId: session.userId,
        },
      })
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.WHATSAPP,
          body: `No-show follow-up prepared: ${text}`,
          occurredAt: new Date(),
          createdByUserId: session.userId,
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.NO_SHOW_FOLLOW_UP,
        message: 'No-show WhatsApp follow-up prepared',
        after: { text, reminderDeliveryId: delivery.id },
        createdByUserId: session.userId,
      })
      return { text, url, delivery }
    })
    if ('disabled' in result) {
      return NextResponse.json({ error: 'Reminder template is inactive' }, { status: 409 })
    }
    return NextResponse.json({
      reminderText: result.text,
      whatsappUrl: result.url,
      delivery: result.delivery,
    })
  }

  if (action === 'send_review_request') {
    if (existing.status !== ClinicAppointmentStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Complete the visit before requesting a review' },
        { status: 409 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const template = await getReminderTemplate(
        tx,
        session.tenantId,
        ClinicReminderKind.REVIEW_REQUEST
      )
      if (!template) return { disabled: true as const }

      const existingReview = await tx.clinicPatientReview.findFirst({
        where: {
          tenantId: session.tenantId,
          appointmentId: id,
          status: { not: ClinicReviewStatus.ARCHIVED },
        },
        orderBy: { createdAt: 'desc' },
      })
      if (existingReview) return { review: existingReview, alreadyRequested: true as const }

      const now = new Date()
      const text = renderReminderTemplate(template.body || '', existing)
      const url = whatsappUrl(existing.patient.phone, text)
      const delivery = await tx.clinicReminderDelivery.create({
        data: {
          tenantId: session.tenantId,
          appointmentId: id,
          patientId: existing.patientId,
          kind: ClinicReminderKind.REVIEW_REQUEST,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.PREPARED,
          scheduledFor: now,
          preparedAt: now,
          body: text,
          whatsappUrl: url,
          error: phoneForWhatsapp(existing.patient.phone) ? null : 'Missing WhatsApp phone number',
          createdByUserId: session.userId,
        },
      })
      const review = await tx.clinicPatientReview.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          appointmentId: id,
          visitId: existing.visits[0]?.id ?? null,
          reminderDeliveryId: delivery.id,
          status: ClinicReviewStatus.REQUESTED,
          requestedAt: now,
          createdByUserId: session.userId,
        },
      })
      await tx.clinicCrmActivity.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          type: ClinicCrmActivityType.WHATSAPP,
          body: `Review request prepared: ${text}`,
          occurredAt: now,
          createdByUserId: session.userId,
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.REVIEW_REQUESTED,
        message: 'Review WhatsApp request prepared',
        after: { text, reminderDeliveryId: delivery.id, reviewId: review.id },
        createdByUserId: session.userId,
      })
      return { text, url, delivery, review, alreadyRequested: false as const }
    })
    if ('disabled' in result) {
      return NextResponse.json({ error: 'Reminder template is inactive' }, { status: 409 })
    }
    if (result.alreadyRequested) {
      return NextResponse.json({ review: result.review, alreadyRequested: true })
    }
    return NextResponse.json({
      reminderText: result.text,
      whatsappUrl: result.url,
      delivery: result.delivery,
      review: result.review,
    })
  }

  if (action === 'start_visit') {
    const visit = await prisma.$transaction(async (tx) => {
      const current = existing.visits.find((v) => v.status === ClinicVisitStatus.IN_PROGRESS)
      const visit =
        current ??
        (await tx.clinicVisit.create({
          data: {
            tenantId: session.tenantId,
            patientId: existing.patientId,
            appointmentId: id,
            visitAt: new Date(),
            status: ClinicVisitStatus.IN_PROGRESS,
          },
          select: { id: true, status: true, visitAt: true },
        }))

      if (
        existing.status !== ClinicAppointmentStatus.COMPLETED &&
        existing.status !== ClinicAppointmentStatus.CANCELLED
      ) {
        await tx.clinicAppointment.update({
          where: { id },
          data: { status: ClinicAppointmentStatus.ARRIVED, arrivedAt: new Date() },
        })
      }
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.VISIT_STARTED,
        message: 'Visit started',
        after: { visitId: visit.id },
        createdByUserId: session.userId,
      })
      return visit
    })
    return NextResponse.json({ visit })
  }

  if (action === 'complete_visit') {
    const deductedItemIds: string[] = []
    const aftercareTemplateId =
      body.aftercareTemplateId != null && String(body.aftercareTemplateId).trim()
        ? String(body.aftercareTemplateId).trim()
        : null
    let aftercareText: string | null = null
    let aftercareUrl: string | null = null
    const aftercarePatch: {
      aftercareTemplateId?: string
      aftercareTitleSnapshot?: string
      aftercareTextSnapshot?: string | null
      aftercareDocumentNameSnapshot?: string | null
      aftercareDocumentUrlSnapshot?: string | null
      aftercareSentAt?: Date | null
      nextSteps?: string | null
    } = {}
    if (aftercareTemplateId) {
      const template = await prisma.clinicAftercareTemplate.findFirst({
        where: {
          id: aftercareTemplateId,
          tenantId: session.tenantId,
          active: true,
          ...(existing.procedureId
            ? { OR: [{ procedureId: existing.procedureId }, { procedureId: null }] }
            : {}),
        },
      })
      if (!template) {
        return NextResponse.json({ error: 'Aftercare template not found' }, { status: 400 })
      }
      const rendered = renderAftercareTemplate(
        template.messageBody || '',
        {
          patient: existing.patient,
          procedure: existing.procedure,
          titleOverride: existing.titleOverride,
          visitAt: new Date(),
        },
        'en-GB'
      )
      Object.assign(aftercarePatch, {
        aftercareTemplateId: template.id,
        aftercareTitleSnapshot: template.title,
        aftercareTextSnapshot: rendered || null,
        aftercareDocumentNameSnapshot: template.documentName,
        aftercareDocumentUrlSnapshot: template.documentUrl,
        aftercareSentAt: new Date(),
        nextSteps: rendered || null,
      })
      aftercareText = buildAftercareWhatsappText({
        title: template.title,
        messageBody: rendered,
        documentName: template.documentName,
        documentUrl: template.documentUrl,
      })
      aftercareUrl = whatsappUrl(existing.patient.phone, aftercareText)
    }
    const { visit, inventoryDeduction, packageDeduction } = await prisma.$transaction(async (tx) => {
      let visit = existing.visits[0]
      if (visit) {
        visit = await tx.clinicVisit.update({
          where: { id: visit.id },
          data: { status: ClinicVisitStatus.COMPLETED, ...aftercarePatch },
          select: {
            id: true,
            status: true,
            visitAt: true,
            inventoryConsumedAt: true,
            aftercareTemplateId: true,
            aftercareTitleSnapshot: true,
            aftercareTextSnapshot: true,
            aftercareDocumentNameSnapshot: true,
            aftercareDocumentUrlSnapshot: true,
            aftercareSentAt: true,
          },
        })
      } else {
        visit = await tx.clinicVisit.create({
          data: {
            tenantId: session.tenantId,
            patientId: existing.patientId,
            appointmentId: id,
            visitAt: new Date(),
            status: ClinicVisitStatus.COMPLETED,
            ...aftercarePatch,
          },
          select: {
            id: true,
            status: true,
            visitAt: true,
            inventoryConsumedAt: true,
            aftercareTemplateId: true,
            aftercareTitleSnapshot: true,
            aftercareTextSnapshot: true,
            aftercareDocumentNameSnapshot: true,
            aftercareDocumentUrlSnapshot: true,
            aftercareSentAt: true,
          },
        })
      }

      let inventoryDeduction = {
        deducted: [] as { itemId: string; name: string; qty: number }[],
        skipped: [] as { itemId: string; name: string; reason: string }[],
      }
      if (!visit.inventoryConsumedAt) {
        const claimed = await tx.clinicVisit.updateMany({
          where: { id: visit.id, tenantId: session.tenantId, inventoryConsumedAt: null },
          data: { inventoryConsumedAt: new Date() },
        })
        if (claimed.count === 1) {
          inventoryDeduction = await applyProcedureLinkedInventoryDeduction(tx, {
            tenantId: session.tenantId,
            appointmentId: id,
            createdByUserId: session.userId,
          })
        }
      }

      const packageDeduction = await applyPatientPackageDeduction(tx, {
        tenantId: session.tenantId,
        patientId: existing.patientId,
        visitId: visit.id,
        appointmentId: id,
        procedureId: existing.procedureId,
        createdByUserId: session.userId,
      })

      await tx.clinicAppointment.update({
        where: { id },
        data: { status: ClinicAppointmentStatus.COMPLETED, completedAt: new Date() },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.VISIT_COMPLETED,
        message: 'Visit completed',
        after: {
          visitId: visit.id,
          deducted: inventoryDeduction.deducted.length,
          packageDeducted: packageDeduction.deducted,
          aftercareTemplateId,
        },
        createdByUserId: session.userId,
      })
      if (aftercareText) {
        await tx.clinicCrmActivity.create({
          data: {
            tenantId: session.tenantId,
            patientId: existing.patientId,
            type: ClinicCrmActivityType.WHATSAPP,
            body: `Aftercare prepared: ${aftercareText}`,
            occurredAt: new Date(),
            createdByUserId: session.userId,
          },
        })
      }
      if (packageDeduction.deducted) {
        await writeAppointmentEvent(tx, {
          tenantId: session.tenantId,
          appointmentId: id,
          type: ClinicAppointmentEventType.PACKAGE_DEBITED,
          message: `Package session used: ${packageDeduction.deducted.name}`,
          after: packageDeduction.deducted,
          createdByUserId: session.userId,
        })
      }
      return { visit, inventoryDeduction, packageDeduction }
    })

    for (const d of inventoryDeduction.deducted) deductedItemIds.push(d.itemId)
    for (const itemId of deductedItemIds) {
      void handleLowStockNotificationsForItem(itemId).catch((e) => console.error(e))
    }

    return NextResponse.json({
      visit,
      inventoryDeduction,
      packageDeduction,
      aftercare: aftercareText ? { text: aftercareText, whatsappUrl: aftercareUrl } : null,
    })
  }

  if (action === 'schedule_rebooking_follow_up') {
    const weeks = normalizeFollowUpWeeks(body.weeks, 4)
    const now = new Date()
    const scheduledFor = rebookingReminderScheduledFor(existing.startsAt, weeks, now)

    const result = await prisma.$transaction(async (tx) => {
      const futureAppointment = await tx.clinicAppointment.findFirst({
        where: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          id: { not: id },
          startsAt: { gt: now },
          status: { in: FUTURE_APPOINTMENT_STATUSES },
        },
        select: {
          id: true,
          startsAt: true,
          procedure: { select: { name: true } },
          titleOverride: true,
        },
        orderBy: { startsAt: 'asc' },
      })
      if (futureAppointment) {
        return { skipped: true as const, reason: 'future_appointment', futureAppointment }
      }

      const template = await getReminderTemplate(
        tx,
        session.tenantId,
        ClinicReminderKind.REBOOKING_FOLLOW_UP
      )
      if (!template) return { disabled: true as const }

      const existingDelivery = await tx.clinicReminderDelivery.findFirst({
        where: {
          tenantId: session.tenantId,
          appointmentId: id,
          patientId: existing.patientId,
          kind: ClinicReminderKind.REBOOKING_FOLLOW_UP,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.SCHEDULED,
        },
        orderBy: { createdAt: 'desc' },
      })
      if (existingDelivery) {
        return { delivery: existingDelivery, alreadyScheduled: true as const }
      }

      const text = renderReminderTemplate(template.body || '', {
        ...existing,
        startsAt: scheduledFor,
      })
      const delivery = await tx.clinicReminderDelivery.create({
        data: {
          tenantId: session.tenantId,
          appointmentId: id,
          patientId: existing.patientId,
          kind: ClinicReminderKind.REBOOKING_FOLLOW_UP,
          channel: ClinicReminderChannel.WHATSAPP,
          status: ClinicReminderStatus.SCHEDULED,
          scheduledFor,
          body: text,
          createdByUserId: session.userId,
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.REMINDER_SCHEDULED,
        message: `Rebooking follow-up scheduled in ${weeks} weeks`,
        after: {
          kind: ClinicReminderKind.REBOOKING_FOLLOW_UP,
          reminderDeliveryId: delivery.id,
          scheduledFor: scheduledFor.toISOString(),
          weeks,
        },
        createdByUserId: session.userId,
      })
      return { delivery, alreadyScheduled: false as const }
    })

    if ('disabled' in result) {
      return NextResponse.json({ error: 'Reminder template is inactive' }, { status: 409 })
    }

    return NextResponse.json(result, { status: 'skipped' in result ? 200 : 201 })
  }

  if (action === 'create_follow_up') {
    const weeks = normalizeFollowUpWeeks(body.weeks, 4)
    const startsAt = followUpStartsAt(existing.startsAt, weeks)
    const endsAt = appointmentEnd(
      startsAt,
      null,
      existing.procedure?.defaultDurationMin ?? 60
    )
    const bufferAfterMinutes = normalizeBufferMinutes(
      existing.bufferAfterMinutes,
      existing.procedure?.bufferAfterMinutes ?? 0
    )

    const result = await prisma.$transaction(async (tx) => {
      const conflict = await findSchedulingConflict(tx, {
        tenantId: session.tenantId,
        startsAt,
        endsAt,
        bufferAfterMinutes,
        procedureId: existing.procedureId,
      })
      if (conflict) return { conflict }

      const followUp = await tx.clinicAppointment.create({
        data: {
          tenantId: session.tenantId,
          patientId: existing.patientId,
          procedureId: existing.procedureId,
          startsAt,
          endsAt,
          bufferAfterMinutes,
          source: ClinicAppointmentSource.FOLLOW_UP,
          titleOverride: existing.titleOverride,
          ...bookingPolicyAppointmentData(existing.procedure, false),
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          procedure: { select: { id: true, name: true } },
        },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.FOLLOW_UP_CREATED,
        message: `Follow-up created in ${weeks} weeks`,
        after: { followUpAppointmentId: followUp.id, startsAt: startsAt.toISOString() },
        createdByUserId: session.userId,
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: followUp.id,
        type: ClinicAppointmentEventType.CREATED,
        message: 'Follow-up appointment created',
        after: { sourceAppointmentId: id, weeks },
        createdByUserId: session.userId,
      })
      return { followUp }
    })

    if ('conflict' in result) {
      return NextResponse.json(
        { error: 'Follow-up conflicts with an existing booking', conflict: result.conflict },
        { status: 409 }
      )
    }

    return NextResponse.json({ appointment: result.followUp }, { status: 201 })
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
}
