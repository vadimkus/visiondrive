import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildBookingFunnelProcedureSummary,
  buildBookingFunnelSummary,
  type BookingFunnelEventInput,
} from '@/lib/clinic/booking-funnel'
import { getClinicSession } from '@/lib/clinic/session'

function defaultRange(range: string | null) {
  const end = new Date()
  const days = range === '90d' ? 90 : range === '7d' ? 7 : 30
  return { start: new Date(end.getTime() - days * 24 * 60 * 60 * 1000), end, days }
}

function parseDate(input: string | null, fallback: Date) {
  if (!input) return fallback
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
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

  const events = await prisma.clinicBookingFunnelEvent.findMany({
    where: {
      tenantId: session.tenantId,
      occurredAt: { gte: start, lte: end },
    },
    select: {
      id: true,
      sessionId: true,
      eventType: true,
      occurredAt: true,
      procedureId: true,
      procedure: { select: { name: true } },
    },
    orderBy: { occurredAt: 'asc' },
    take: 10000,
  })

  const funnelEvents: BookingFunnelEventInput[] = events.map((event) => ({
    sessionId: event.sessionId,
    eventType: event.eventType,
    procedureId: event.procedureId,
    procedureName: event.procedure?.name ?? null,
    occurredAt: event.occurredAt,
  }))

  const summary = buildBookingFunnelSummary(funnelEvents)
  const procedures = buildBookingFunnelProcedureSummary(funnelEvents).slice(0, 12)

  const daily = new Map<string, { date: string; views: Set<string>; bookings: Set<string> }>()
  for (const event of events) {
    const key = dayKey(event.occurredAt)
    const row = daily.get(key) ?? { date: key, views: new Set<string>(), bookings: new Set<string>() }
    if (event.eventType === 'LINK_VIEW') row.views.add(event.sessionId)
    if (event.eventType === 'BOOKING_COMPLETED') row.bookings.add(event.sessionId)
    daily.set(key, row)
  }

  return NextResponse.json({
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      days: Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
    },
    ...summary,
    procedures,
    daily: [...daily.values()].map((row) => ({
      date: row.date,
      views: row.views.size,
      bookings: row.bookings.size,
    })),
  })
}
