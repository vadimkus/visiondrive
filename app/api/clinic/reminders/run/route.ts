import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicAppointmentEventType,
  ClinicAppointmentStatus,
  ClinicCrmActivityType,
  ClinicReminderKind,
  ClinicReminderStatus,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import { phoneForWhatsapp, whatsappUrl } from '@/lib/clinic/reminders'
import { writeAppointmentEvent } from '@/lib/clinic/appointments'

const UPCOMING_APPOINTMENT_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
]

function authorized(request: NextRequest) {
  const session = getClinicSession(request)
  if (session) return session
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret')
  if (secret && header === secret) return { tenantId: null, userId: null }
  return null
}

async function runDueReminders(tenantId?: string | null) {
  const now = new Date()
  const due = await prisma.clinicReminderDelivery.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      status: ClinicReminderStatus.SCHEDULED,
      scheduledFor: { lte: now },
    },
    orderBy: { scheduledFor: 'asc' },
    take: 50,
  })

  const prepared: string[] = []
  for (const reminder of due) {
    if (reminder.kind === ClinicReminderKind.REBOOKING_FOLLOW_UP && reminder.patientId) {
      const futureAppointment = await prisma.clinicAppointment.findFirst({
        where: {
          tenantId: reminder.tenantId,
          patientId: reminder.patientId,
          ...(reminder.appointmentId ? { id: { not: reminder.appointmentId } } : {}),
          startsAt: { gt: now },
          status: { in: UPCOMING_APPOINTMENT_STATUSES },
        },
        select: { id: true },
      })
      if (futureAppointment) {
        await prisma.clinicReminderDelivery.update({
          where: { id: reminder.id },
          data: {
            status: ClinicReminderStatus.SKIPPED,
            error: 'Future appointment already booked',
          },
        })
        continue
      }
    }

    const appointment = reminder.appointmentId
      ? await prisma.clinicAppointment.findFirst({
          where: { id: reminder.appointmentId, tenantId: reminder.tenantId },
          include: { patient: { select: { id: true, phone: true } } },
        })
      : null
    const url = whatsappUrl(appointment?.patient.phone, reminder.body)

    await prisma.$transaction(async (tx) => {
      await tx.clinicReminderDelivery.update({
        where: { id: reminder.id },
        data: {
          status: ClinicReminderStatus.PREPARED,
          preparedAt: now,
          whatsappUrl: url,
          error: phoneForWhatsapp(appointment?.patient.phone) ? null : 'Missing WhatsApp phone number',
        },
      })
      if (reminder.patientId) {
        await tx.clinicCrmActivity.create({
          data: {
            tenantId: reminder.tenantId,
            patientId: reminder.patientId,
            type: ClinicCrmActivityType.WHATSAPP,
            body: `Reminder prepared: ${reminder.body}`,
            occurredAt: now,
            createdByUserId: reminder.createdByUserId,
          },
        })
      }
      if (reminder.appointmentId) {
        await writeAppointmentEvent(tx, {
          tenantId: reminder.tenantId,
          appointmentId: reminder.appointmentId,
          type: ClinicAppointmentEventType.REMINDER_PREPARED,
          message: 'Scheduled WhatsApp reminder prepared',
          after: { reminderDeliveryId: reminder.id },
          createdByUserId: reminder.createdByUserId,
        })
      }
    })
    prepared.push(reminder.id)
  }

  return { prepared, count: prepared.length }
}

export async function GET(request: NextRequest) {
  const auth = authorized(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await runDueReminders(auth.tenantId)
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const auth = authorized(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await runDueReminders(auth.tenantId)
  return NextResponse.json(result)
}
