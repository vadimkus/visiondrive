import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { appointmentOccupiedUntil } from '@/lib/clinic/appointments'
import {
  applicableRulesForDay,
  dateAtDubaiMinutes,
  defaultAvailabilityRules,
  dubaiDayKey,
  dubaiDayOfWeek,
  eachDubaiDay,
} from '@/lib/clinic/availability'
import { getClinicSession } from '@/lib/clinic/session'

const ACTIVE_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
  ClinicAppointmentStatus.COMPLETED,
]

type Interval = {
  start: Date
  end: Date
}

function clampRange(daysRaw: string | null) {
  const days = daysRaw === '14d' ? 14 : 7
  const now = new Date()
  const from = dateAtDubaiMinutes(dubaiDayKey(now), 0)
  const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
  return { days, from, to }
}

function minutesBetween(start: Date, end: Date) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000))
}

function overlap(a: Interval, b: Interval): Interval | null {
  const start = new Date(Math.max(a.start.getTime(), b.start.getTime()))
  const end = new Date(Math.min(a.end.getTime(), b.end.getTime()))
  return end > start ? { start, end } : null
}

function mergeIntervals(intervals: Interval[]) {
  const sorted = intervals
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const merged: Interval[] = []

  for (const interval of sorted) {
    const last = merged[merged.length - 1]
    if (!last || interval.start > last.end) {
      merged.push({ ...interval })
      continue
    }
    if (interval.end > last.end) last.end = interval.end
  }

  return merged
}

function clippedUnionMinutes(intervals: Interval[], windows: Interval[]) {
  const clipped = intervals.flatMap((interval) =>
    windows.map((window) => overlap(interval, window)).filter((item): item is Interval => !!item)
  )
  return mergeIntervals(clipped).reduce((sum, interval) => sum + minutesBetween(interval.start, interval.end), 0)
}

function freeIntervals(windows: Interval[], unavailable: Interval[]) {
  const result: Interval[] = []
  const busy = mergeIntervals(unavailable)

  for (const window of windows) {
    let cursor = window.start
    for (const interval of busy) {
      const clipped = overlap(interval, window)
      if (!clipped) continue
      if (clipped.start > cursor) {
        result.push({ start: cursor, end: clipped.start })
      }
      if (clipped.end > cursor) cursor = clipped.end
    }
    if (cursor < window.end) {
      result.push({ start: cursor, end: window.end })
    }
  }

  return result.filter((interval) => interval.end > interval.start)
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = clampRange(searchParams.get('range'))
  const appointmentLookback = new Date(range.from.getTime() - 24 * 60 * 60 * 1000)

  const [rulesRaw, appointments, blockedTimes] = await Promise.all([
    prisma.clinicAvailabilityRule.findMany({
      where: { tenantId: session.tenantId },
      orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        status: { in: ACTIVE_STATUSES },
        startsAt: { gte: appointmentLookback, lt: range.to },
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        status: true,
        bufferAfterMinutes: true,
        travelBufferBeforeMinutes: true,
        travelBufferAfterMinutes: true,
        patient: { select: { firstName: true, lastName: true } },
        procedure: { select: { name: true, defaultDurationMin: true } },
      },
      orderBy: { startsAt: 'asc' },
      take: 500,
    }),
    prisma.clinicBlockedTime.findMany({
      where: {
        tenantId: session.tenantId,
        startsAt: { lt: range.to },
        endsAt: { gt: range.from },
      },
      select: { startsAt: true, endsAt: true, reason: true },
      orderBy: { startsAt: 'asc' },
      take: 500,
    }),
  ])

  const rules = rulesRaw.length > 0 ? rulesRaw : defaultAvailabilityRules()
  const days = eachDubaiDay(range.from, new Date(range.to.getTime() - 1))

  const dayRows = days.map((dayKey) => {
    const dayStart = dateAtDubaiMinutes(dayKey, 0)
    const dayEnd = dateAtDubaiMinutes(dayKey, 24 * 60)
    const dayOfWeek = dubaiDayOfWeek(dayStart)
    const windows = applicableRulesForDay(rules, dayOfWeek, null).map((rule) => ({
      start: dateAtDubaiMinutes(dayKey, rule.startMinutes),
      end: dateAtDubaiMinutes(dayKey, rule.endMinutes),
    }))

    const dayAppointments = appointments.filter((appointment) => {
      const serviceEnd =
        appointment.endsAt ??
        new Date(
          appointment.startsAt.getTime() + (appointment.procedure?.defaultDurationMin ?? 60) * 60_000
        )
      return appointment.startsAt < dayEnd && serviceEnd > dayStart
    })

    const appointmentIntervals = dayAppointments.map((appointment) => {
      const occupiedUntil = appointmentOccupiedUntil(
        appointment.startsAt,
        appointment.endsAt,
        appointment.procedure?.defaultDurationMin ?? 60,
        appointment.bufferAfterMinutes + appointment.travelBufferAfterMinutes
      )
      return {
        start: new Date(appointment.startsAt.getTime() - appointment.travelBufferBeforeMinutes * 60_000),
        end: occupiedUntil,
      }
    })

    const serviceIntervals = dayAppointments.map((appointment) => ({
      start: appointment.startsAt,
      end:
        appointment.endsAt ??
        new Date(
          appointment.startsAt.getTime() + (appointment.procedure?.defaultDurationMin ?? 60) * 60_000
        ),
    }))
    const blockIntervals = blockedTimes
      .filter((block) => block.startsAt < dayEnd && block.endsAt > dayStart)
      .map((block) => ({ start: block.startsAt, end: block.endsAt }))
    const unavailable = mergeIntervals([...appointmentIntervals, ...blockIntervals])
    const free = freeIntervals(windows, unavailable)
    const meaningfulFree = free.filter((interval) => minutesBetween(interval.start, interval.end) >= 30)

    const plannedMinutes = windows.reduce((sum, window) => sum + minutesBetween(window.start, window.end), 0)
    const occupiedMinutes = clippedUnionMinutes(appointmentIntervals, windows)
    const serviceMinutes = clippedUnionMinutes(serviceIntervals, windows)
    const blockedMinutes = clippedUnionMinutes(blockIntervals, windows)
    const unavailableMinutes = clippedUnionMinutes(unavailable, windows)
    const freeMinutes = Math.max(0, plannedMinutes - unavailableMinutes)
    const travelBufferMinutes = dayAppointments.reduce(
      (sum, appointment) => sum + appointment.travelBufferBeforeMinutes + appointment.travelBufferAfterMinutes,
      0
    )
    const cleanupBufferMinutes = dayAppointments.reduce(
      (sum, appointment) => sum + appointment.bufferAfterMinutes,
      0
    )

    return {
      dayKey,
      dayOfWeek,
      plannedMinutes,
      occupiedMinutes,
      serviceMinutes,
      blockedMinutes,
      freeMinutes,
      occupancyPct: plannedMinutes > 0 ? Number(((occupiedMinutes / plannedMinutes) * 100).toFixed(1)) : 0,
      appointmentCount: dayAppointments.length,
      freeSlotCount: meaningfulFree.length,
      largestFreeSlotMinutes: meaningfulFree.reduce(
        (max, interval) => Math.max(max, minutesBetween(interval.start, interval.end)),
        0
      ),
      travelBufferMinutes,
      cleanupBufferMinutes,
      travelBufferPct:
        serviceMinutes > 0 ? Number(((travelBufferMinutes / serviceMinutes) * 100).toFixed(1)) : 0,
      freeSlots: meaningfulFree.slice(0, 4).map((interval) => ({
        startsAt: interval.start.toISOString(),
        endsAt: interval.end.toISOString(),
        minutes: minutesBetween(interval.start, interval.end),
      })),
    }
  })

  const totals = dayRows.reduce(
    (acc, day) => ({
      plannedMinutes: acc.plannedMinutes + day.plannedMinutes,
      occupiedMinutes: acc.occupiedMinutes + day.occupiedMinutes,
      serviceMinutes: acc.serviceMinutes + day.serviceMinutes,
      blockedMinutes: acc.blockedMinutes + day.blockedMinutes,
      freeMinutes: acc.freeMinutes + day.freeMinutes,
      appointmentCount: acc.appointmentCount + day.appointmentCount,
      freeSlotCount: acc.freeSlotCount + day.freeSlotCount,
      travelBufferMinutes: acc.travelBufferMinutes + day.travelBufferMinutes,
      cleanupBufferMinutes: acc.cleanupBufferMinutes + day.cleanupBufferMinutes,
    }),
    {
      plannedMinutes: 0,
      occupiedMinutes: 0,
      serviceMinutes: 0,
      blockedMinutes: 0,
      freeMinutes: 0,
      appointmentCount: 0,
      freeSlotCount: 0,
      travelBufferMinutes: 0,
      cleanupBufferMinutes: 0,
    }
  )

  return NextResponse.json({
    range: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      days: range.days,
    },
    totals: {
      ...totals,
      occupancyPct:
        totals.plannedMinutes > 0
          ? Number(((totals.occupiedMinutes / totals.plannedMinutes) * 100).toFixed(1))
          : 0,
      travelBufferPct:
        totals.serviceMinutes > 0
          ? Number(((totals.travelBufferMinutes / totals.serviceMinutes) * 100).toFixed(1))
          : 0,
    },
    days: dayRows,
  })
}
