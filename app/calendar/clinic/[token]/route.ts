import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus, TenantStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  buildClinicCalendarIcs,
  calendarFeedFromSettings,
  hashCalendarFeedToken,
  type CalendarFeedEvent,
} from '@/lib/clinic/calendar-feed'

const ACTIVE_APPOINTMENT_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
]

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const tokenHash = hashCalendarFeedToken(token)
  const settingsRows = await prisma.tenantSetting.findMany({
    where: { tenant: { status: TenantStatus.ACTIVE } },
    select: {
      tenantId: true,
      thresholds: true,
      tenant: { select: { name: true } },
    },
    take: 500,
  })
  const matched = settingsRows.find((row) => {
    const feed = calendarFeedFromSettings(row.thresholds)
    return feed.tokenHash === tokenHash && !feed.revokedAt
  })

  if (!matched) {
    return new NextResponse('Calendar feed not found', { status: 404 })
  }

  const now = new Date()
  const from = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const to = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
  const [appointments, blockedTimes] = await Promise.all([
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: matched.tenantId,
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        titleOverride: true,
        locationArea: true,
        procedure: { select: { name: true } },
      },
      take: 1000,
    }),
    prisma.clinicBlockedTime.findMany({
      where: {
        tenantId: matched.tenantId,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      orderBy: { startsAt: 'asc' },
      select: { id: true, startsAt: true, endsAt: true, reason: true },
      take: 1000,
    }),
  ])

  const events: CalendarFeedEvent[] = [
    ...appointments.map((appointment) => ({
      id: `appointment-${appointment.id}`,
      title: appointment.titleOverride || appointment.procedure?.name || 'Clinic appointment',
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt ?? new Date(appointment.startsAt.getTime() + 60 * 60 * 1000),
      description: appointment.locationArea ? `Area: ${appointment.locationArea}` : 'Practice OS appointment',
    })),
    ...blockedTimes.map((block) => ({
      id: `blocked-${block.id}`,
      title: block.reason || 'Blocked time',
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      description: 'Practice OS blocked time',
    })),
  ]

  const ics = buildClinicCalendarIcs({
    calendarName: `${matched.tenant.name} Practice OS`,
    events,
  })

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="practice-os-calendar.ics"',
      'Cache-Control': 'private, max-age=300',
    },
  })
}
