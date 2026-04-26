import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentSource,
  ClinicAppointmentStatus,
  ClinicCrmActivityType,
  ClinicVisitStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { applyProcedureLinkedInventoryDeduction } from '@/lib/clinic/inventory-visit-consume'
import {
  appointmentEnd,
  findAppointmentConflict,
  normalizeBufferMinutes,
  writeAppointmentEvent,
} from '@/lib/clinic/appointments'

function phoneForWhatsapp(phone: string | null | undefined) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? digits : null
}

function reminderText(appointment: {
  startsAt: Date
  patient: { firstName: string; lastName: string }
  procedure: { name: string } | null
  titleOverride: string | null
}) {
  const when = appointment.startsAt.toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dubai',
  })
  const service = appointment.procedure?.name || appointment.titleOverride || 'appointment'
  return `Hi ${appointment.patient.firstName}, reminder for your ${service} on ${when}. Please reply to confirm.`
}

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
    const text = reminderText(existing)
    const phone = phoneForWhatsapp(existing.patient.phone)
    await prisma.$transaction(async (tx) => {
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
        type: ClinicAppointmentEventType.REMINDER_SENT,
        message: 'WhatsApp reminder prepared',
        after: { text },
        createdByUserId: session.userId,
      })
    })
    return NextResponse.json({
      reminderText: text,
      whatsappUrl: phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : null,
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
      const conflict = await findAppointmentConflict(tx, {
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
