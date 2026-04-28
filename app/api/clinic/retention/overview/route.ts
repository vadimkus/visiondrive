import { NextRequest, NextResponse } from 'next/server'
import { ClinicReminderKind } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  buildFollowUpConversion,
  buildProcedureRepeatIntervals,
  buildRetentionSummary,
  type RetentionAppointment,
} from '@/lib/clinic/retention'
import {
  buildReactivationMessage,
  buildReactivationWhatsappUrl,
  normalizeReactivationLocale,
  normalizeReactivationThreshold,
} from '@/lib/clinic/reactivation'
import { getClinicSession } from '@/lib/clinic/session'

function defaultRange(range: string | null) {
  const end = new Date()
  const days = range === 'year' ? 365 : range === '90d' ? 90 : 180
  return { start: new Date(end.getTime() - days * 24 * 60 * 60 * 1000), end, days }
}

function parseDate(input: string | null, fallback: Date) {
  if (!input) return fallback
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function patientName(patient: { firstName: string; lastName: string }) {
  return `${patient.lastName}, ${patient.firstName}`.trim()
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fallback = defaultRange(searchParams.get('range'))
  const start = parseDate(searchParams.get('start'), fallback.start)
  const end = parseDate(searchParams.get('end'), fallback.end)
  const now = new Date()
  const historyStart = new Date(Math.min(start.getTime(), now.getTime() - 540 * 24 * 60 * 60 * 1000))
  const futureEnd = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
  const lostAfterDays = normalizeReactivationThreshold(searchParams.get('lostAfterDays'))
  const reactivationLocale = normalizeReactivationLocale(searchParams.get('locale'))

  const [appointments, reminders] = await Promise.all([
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        startsAt: { gte: historyStart, lte: futureEnd },
      },
      select: {
        id: true,
        startsAt: true,
        status: true,
        patientId: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        procedure: {
          select: {
            id: true,
            name: true,
          },
        },
        titleOverride: true,
      },
      orderBy: { startsAt: 'asc' },
      take: 5000,
    }),
    prisma.clinicReminderDelivery.findMany({
      where: {
        tenantId: session.tenantId,
        kind: ClinicReminderKind.REBOOKING_FOLLOW_UP,
        scheduledFor: { gte: start, lte: end },
      },
      select: {
        id: true,
        patientId: true,
        scheduledFor: true,
        status: true,
      },
      orderBy: { scheduledFor: 'asc' },
      take: 1000,
    }),
  ])

  const retentionAppointments: RetentionAppointment[] = appointments.map((appointment) => ({
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: patientName(appointment.patient),
    patientPhone: appointment.patient.phone,
    procedureId: appointment.procedure?.id ?? null,
    procedureName: appointment.procedure?.name ?? appointment.titleOverride ?? null,
    startsAt: appointment.startsAt,
    status: appointment.status,
  }))

  const { summary, lostPatients } = buildRetentionSummary(
    retentionAppointments,
    start,
    end,
    now,
    lostAfterDays
  )
  const followUp = buildFollowUpConversion(reminders, retentionAppointments, start, end)
  const repeatIntervals = buildProcedureRepeatIntervals(
    retentionAppointments.filter((appointment) => appointment.startsAt >= historyStart && appointment.startsAt <= end)
  ).slice(0, 12)

  const patientFirstNames = new Map(appointments.map((appointment) => [appointment.patientId, appointment.patient.firstName]))

  return NextResponse.json({
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      days: Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
      lostAfterDays,
    },
    summary,
    followUp,
    repeatIntervals,
    lostPatients: lostPatients.slice(0, 25).map((patient) => {
      const firstName = patientFirstNames.get(patient.patientId) ?? patient.patientName.split(',').at(1)?.trim() ?? ''
      const message = buildReactivationMessage(
        {
          firstName: firstName || patient.patientName,
          lastProcedureName: patient.lastProcedureName,
          daysSinceLastVisit: patient.daysSinceLastVisit,
        },
        reactivationLocale
      )
      return {
        ...patient,
        lastVisitAt: patient.lastVisitAt.toISOString(),
        reactivationMessage: message,
        whatsappUrl: buildReactivationWhatsappUrl(
          {
            firstName: firstName || patient.patientName,
            patientPhone: patient.patientPhone,
            lastProcedureName: patient.lastProcedureName,
            daysSinceLastVisit: patient.daysSinceLastVisit,
          },
          reactivationLocale
        ),
        actionHref: `/clinic/patients/${patient.patientId}`,
      }
    }),
  })
}
