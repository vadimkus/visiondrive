import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentSource,
  ClinicAppointmentStatus,
  ClinicCrmActivityType,
  ClinicReminderChannel,
  ClinicReminderKind,
  ClinicReminderStatus,
  ClinicVisitStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { applyProcedureLinkedInventoryDeduction } from '@/lib/clinic/inventory-visit-consume'
import {
  appointmentEnd,
  normalizeBufferMinutes,
  writeAppointmentEvent,
} from '@/lib/clinic/appointments'
import { findSchedulingConflict } from '@/lib/clinic/scheduling-guard'
import {
  DEFAULT_REMINDER_MINUTES_BEFORE,
  getReminderTemplate,
  phoneForWhatsapp,
  reminderScheduledFor,
  renderReminderTemplate,
  whatsappUrl,
} from '@/lib/clinic/reminders'

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
        },
      },
      visits: {
        select: { id: true, status: true, inventoryConsumedAt: true, visitAt: true },
        orderBy: { visitAt: 'desc' },
        take: 1,
      },
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
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
    const { visit, inventoryDeduction } = await prisma.$transaction(async (tx) => {
      let visit = existing.visits[0]
      if (visit) {
        visit = await tx.clinicVisit.update({
          where: { id: visit.id },
          data: { status: ClinicVisitStatus.COMPLETED },
          select: { id: true, status: true, visitAt: true, inventoryConsumedAt: true },
        })
      } else {
        visit = await tx.clinicVisit.create({
          data: {
            tenantId: session.tenantId,
            patientId: existing.patientId,
            appointmentId: id,
            visitAt: new Date(),
            status: ClinicVisitStatus.COMPLETED,
          },
          select: { id: true, status: true, visitAt: true, inventoryConsumedAt: true },
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

      await tx.clinicAppointment.update({
        where: { id },
        data: { status: ClinicAppointmentStatus.COMPLETED, completedAt: new Date() },
      })
      await writeAppointmentEvent(tx, {
        tenantId: session.tenantId,
        appointmentId: id,
        type: ClinicAppointmentEventType.VISIT_COMPLETED,
        message: 'Visit completed',
        after: { visitId: visit.id, deducted: inventoryDeduction.deducted.length },
        createdByUserId: session.userId,
      })
      return { visit, inventoryDeduction }
    })

    for (const d of inventoryDeduction.deducted) deductedItemIds.push(d.itemId)
    for (const itemId of deductedItemIds) {
      void handleLowStockNotificationsForItem(itemId).catch((e) => console.error(e))
    }

    return NextResponse.json({ visit, inventoryDeduction })
  }

  if (action === 'create_follow_up') {
    const weeks = Math.min(52, Math.max(1, Number(body.weeks || 4)))
    const startsAt = new Date(existing.startsAt.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)
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
