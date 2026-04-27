import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicAppointmentStatus, ClinicReminderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import {
  appointmentDueCents,
  buildNotificationCenter,
  type NotificationCenterItem,
  type PaymentForNotification,
} from '@/lib/clinic/notification-center'
import { getClinicSession } from '@/lib/clinic/session'

function patientName(patient: { firstName: string; lastName: string } | null | undefined) {
  if (!patient) return null
  return `${patient.lastName}, ${patient.firstName}`.trim()
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const nextTwoWeeks = new Date(now)
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14)
  const financialWindow = new Date(now)
  financialWindow.setDate(financialWindow.getDate() - 180)

  const [
    reminderDeliveries,
    onlineBookings,
    rescheduleEvents,
    reviewRequests,
    billableAppointments,
    stockItems,
  ] = await Promise.all([
    prisma.clinicReminderDelivery.findMany({
      where: {
        tenantId: session.tenantId,
        status: { in: [ClinicReminderStatus.SCHEDULED, ClinicReminderStatus.PREPARED] },
        scheduledFor: { lte: now },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 25,
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        source: 'ONLINE',
        status: { in: [ClinicAppointmentStatus.SCHEDULED, ClinicAppointmentStatus.CONFIRMED] },
        startsAt: { gte: now, lte: nextTwoWeeks },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        procedure: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.clinicAppointmentEvent.findMany({
      where: {
        tenantId: session.tenantId,
        type: ClinicAppointmentEventType.RESCHEDULED,
        createdAt: { gte: lastWeek },
      },
      include: {
        appointment: {
          select: {
            id: true,
            startsAt: true,
            patient: { select: { id: true, firstName: true, lastName: true } },
            procedure: { select: { name: true } },
            titleOverride: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.clinicPatientReview.findMany({
      where: { tenantId: session.tenantId, status: 'REQUESTED' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        appointment: {
          select: {
            id: true,
            startsAt: true,
            procedure: { select: { name: true } },
            titleOverride: true,
          },
        },
      },
      orderBy: [{ requestedAt: 'asc' }, { createdAt: 'asc' }],
      take: 25,
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        status: { in: [ClinicAppointmentStatus.ARRIVED, ClinicAppointmentStatus.COMPLETED] },
        startsAt: { gte: financialWindow, lte: now },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        procedure: { select: { name: true, basePriceCents: true, currency: true } },
        payments: {
          select: {
            id: true,
            amountCents: true,
            discountCents: true,
            feeCents: true,
            status: true,
          },
        },
        visits: {
          select: {
            payments: {
              select: {
                id: true,
                amountCents: true,
                discountCents: true,
                feeCents: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { startsAt: 'desc' },
      take: 80,
    }),
    prisma.clinicStockItem.findMany({
      where: { tenantId: session.tenantId, active: true },
      select: {
        id: true,
        name: true,
        quantityOnHand: true,
        reorderPoint: true,
        active: true,
        unit: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
  ])

  const patientIds = new Set<string>()
  const appointmentIds = new Set<string>()
  for (const delivery of reminderDeliveries) {
    if (delivery.patientId) patientIds.add(delivery.patientId)
    if (delivery.appointmentId) appointmentIds.add(delivery.appointmentId)
  }

  const [reminderPatients, reminderAppointments] = await Promise.all([
    patientIds.size
      ? prisma.clinicPatient.findMany({
          where: { tenantId: session.tenantId, id: { in: [...patientIds] } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [],
    appointmentIds.size
      ? prisma.clinicAppointment.findMany({
          where: { tenantId: session.tenantId, id: { in: [...appointmentIds] } },
          select: {
            id: true,
            startsAt: true,
            titleOverride: true,
            procedure: { select: { name: true } },
          },
        })
      : [],
  ])
  const patientsById = new Map(reminderPatients.map((patient) => [patient.id, patient]))
  const appointmentsById = new Map(reminderAppointments.map((appointment) => [appointment.id, appointment]))

  const items: NotificationCenterItem[] = []

  for (const delivery of reminderDeliveries) {
    const appointment = delivery.appointmentId ? appointmentsById.get(delivery.appointmentId) : null
    const patient = delivery.patientId ? patientsById.get(delivery.patientId) : null
    items.push({
      id: `reminder:${delivery.id}`,
      kind: 'REMINDER_DUE',
      severity: delivery.status === 'PREPARED' ? 'high' : 'urgent',
      subject: delivery.kind.replaceAll('_', ' '),
      detail: delivery.error || delivery.body.slice(0, 180),
      patientName: patientName(patient),
      serviceName: appointment?.procedure?.name ?? appointment?.titleOverride ?? null,
      dueAt: delivery.scheduledFor.toISOString(),
      actionHref: '/clinic/reminders',
      actionLabel: delivery.whatsappUrl ? 'WhatsApp' : 'Open reminders',
    })
  }

  for (const appointment of onlineBookings) {
    items.push({
      id: `booking:${appointment.id}`,
      kind: 'NEW_BOOKING',
      severity: appointment.status === 'SCHEDULED' ? 'high' : 'normal',
      subject: 'New online booking',
      patientName: patientName(appointment.patient),
      serviceName: appointment.procedure?.name ?? appointment.titleOverride ?? null,
      occurredAt: appointment.createdAt.toISOString(),
      dueAt: appointment.startsAt.toISOString(),
      actionHref: `/clinic/appointments/${appointment.id}`,
      actionLabel: 'Open booking',
    })
  }

  for (const event of rescheduleEvents) {
    items.push({
      id: `reschedule:${event.id}`,
      kind: 'RESCHEDULED',
      severity: 'normal',
      subject: 'Appointment rescheduled',
      detail: event.message,
      patientName: patientName(event.appointment.patient),
      serviceName: event.appointment.procedure?.name ?? event.appointment.titleOverride ?? null,
      occurredAt: event.createdAt.toISOString(),
      dueAt: event.appointment.startsAt.toISOString(),
      actionHref: `/clinic/appointments/${event.appointment.id}`,
      actionLabel: 'Open appointment',
    })
  }

  for (const review of reviewRequests) {
    items.push({
      id: `review:${review.id}`,
      kind: 'REVIEW_REQUEST',
      severity: 'normal',
      subject: 'Review request waiting',
      patientName: patientName(review.patient),
      serviceName: review.appointment?.procedure?.name ?? review.appointment?.titleOverride ?? null,
      occurredAt: (review.requestedAt ?? review.createdAt).toISOString(),
      actionHref: '/clinic/reputation',
      actionLabel: 'Open reputation',
    })
  }

  for (const appointment of billableAppointments) {
    const payments: PaymentForNotification[] = [
      ...appointment.payments,
      ...appointment.visits.flatMap((visit) => visit.payments),
    ]
    const due = appointmentDueCents(appointment.procedure?.basePriceCents ?? 0, payments)
    if (due <= 0) continue
    items.push({
      id: `unpaid:${appointment.id}`,
      kind: 'UNPAID_VISIT',
      severity: appointment.status === 'COMPLETED' ? 'urgent' : 'high',
      subject: 'Unpaid visit',
      patientName: patientName(appointment.patient),
      serviceName: appointment.procedure?.name ?? appointment.titleOverride ?? null,
      amountCents: due,
      currency: appointment.procedure?.currency ?? 'AED',
      occurredAt: appointment.startsAt.toISOString(),
      actionHref: `/clinic/appointments/${appointment.id}`,
      actionLabel: 'Collect payment',
    })
  }

  for (const item of stockItems.filter((stockItem) => isClinicStockLow(stockItem)).slice(0, 25)) {
    items.push({
      id: `stock:${item.id}`,
      kind: 'LOW_STOCK',
      severity: item.quantityOnHand <= 0 ? 'urgent' : 'high',
      subject: item.name,
      detail: `${item.quantityOnHand} ${item.unit} on hand; reorder at ${item.reorderPoint}`,
      occurredAt: item.updatedAt.toISOString(),
      actionHref: `/clinic/inventory/${item.id}`,
      actionLabel: 'Open item',
    })
  }

  return NextResponse.json(buildNotificationCenter(items))
}
