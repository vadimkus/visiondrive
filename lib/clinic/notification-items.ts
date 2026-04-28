import {
  ClinicAppointmentEventType,
  ClinicAppointmentStatus,
  ClinicPatientPackageStatus,
  ClinicReminderStatus,
  type Prisma,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import {
  appointmentDueCents,
  type NotificationCenterItem,
  type PaymentForNotification,
} from '@/lib/clinic/notification-center'

function patientName(patient: { firstName: string; lastName: string } | null | undefined) {
  if (!patient) return null
  return `${patient.lastName}, ${patient.firstName}`.trim()
}

function jsonStatus(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const status = (value as Record<string, unknown>).status
  return typeof status === 'string' ? status : null
}

export async function buildClinicNotificationItems(tenantId: string, now = new Date()) {
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const nextTwoWeeks = new Date(now)
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14)
  const financialWindow = new Date(now)
  financialWindow.setDate(financialWindow.getDate() - 180)

  const [
    reminderDeliveries,
    onlineBookings,
    appointmentEvents,
    reviewRequests,
    billableAppointments,
    stockItems,
    expiringPackages,
  ] = await Promise.all([
    prisma.clinicReminderDelivery.findMany({
      where: {
        tenantId,
        status: { in: [ClinicReminderStatus.SCHEDULED, ClinicReminderStatus.PREPARED] },
        scheduledFor: { lte: now },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 25,
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId,
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
        tenantId,
        type: { in: [ClinicAppointmentEventType.RESCHEDULED, ClinicAppointmentEventType.STATUS_CHANGED] },
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
      take: 50,
    }),
    prisma.clinicPatientReview.findMany({
      where: { tenantId, status: 'REQUESTED' },
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
        tenantId,
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
      where: { tenantId, active: true },
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
    prisma.clinicPatientPackage.findMany({
      where: {
        tenantId,
        status: ClinicPatientPackageStatus.ACTIVE,
        remainingSessions: { gt: 0 },
        expiresAt: { gte: now, lte: nextTwoWeeks },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        procedure: { select: { name: true } },
      },
      orderBy: { expiresAt: 'asc' },
      take: 25,
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
          where: { tenantId, id: { in: [...patientIds] } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [],
    appointmentIds.size
      ? prisma.clinicAppointment.findMany({
          where: { tenantId, id: { in: [...appointmentIds] } },
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

  for (const event of appointmentEvents) {
    const cancelled = event.type === ClinicAppointmentEventType.STATUS_CHANGED && jsonStatus(event.after) === ClinicAppointmentStatus.CANCELLED
    if (event.type === ClinicAppointmentEventType.STATUS_CHANGED && !cancelled) continue
    items.push({
      id: `${cancelled ? 'cancelled' : 'reschedule'}:${event.id}`,
      kind: cancelled ? 'CANCELLED' : 'RESCHEDULED',
      severity: cancelled ? 'high' : 'normal',
      subject: cancelled ? 'Appointment cancelled' : 'Appointment rescheduled',
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

  for (const pkg of expiringPackages) {
    items.push({
      id: `package-expiring:${pkg.id}`,
      kind: 'PACKAGE_EXPIRING',
      severity: 'normal',
      subject: 'Package expiring',
      detail: `${pkg.name}: ${pkg.remainingSessions}/${pkg.totalSessions} sessions left`,
      patientName: patientName(pkg.patient),
      serviceName: pkg.procedure?.name ?? null,
      dueAt: pkg.expiresAt?.toISOString() ?? null,
      actionHref: `/clinic/patients/${pkg.patientId}`,
      actionLabel: 'Open patient',
    })
  }

  return items
}
