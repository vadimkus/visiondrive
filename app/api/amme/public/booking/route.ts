import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createManualBooking } from '@/lib/amme/service'
import { addMinutes, venueDateTimeToUtc } from '@/lib/amme/time'
import { apiRateLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

async function venue() {
  return prisma.ammeVenue.findFirst({
    where: { tenant: { slug: 'amme' } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function GET(request: NextRequest) {
  const current = await venue()
  if (!current) return NextResponse.json({ error: 'Venue not configured' }, { status: 404 })
  const day = request.nextUrl.searchParams.get('day') || new Date().toISOString().slice(0, 10)
  const resources = await prisma.ammeResource.findMany({
    where: { venueId: current.id, kind: 'BANYA', active: true },
    orderBy: { sortOrder: 'asc' },
  })
  const slots = []
  for (let hour = current.openHour; hour < current.closeHour; hour += 1) {
    const time = `${String(hour).padStart(2, '0')}:00`
    const startsAt = venueDateTimeToUtc(day, time, current.timezone)
    for (const resource of resources) {
      const endsAt = addMinutes(startsAt, resource.sessionMinutes || current.sessionMinutes)
      const used = await prisma.ammeBookingResource.aggregate({
        where: {
          resourceId: resource.id,
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
          OR: [
            { booking: { status: { in: ['WAITING', 'CONFIRMED', 'ARRIVED'] } } },
            { visit: { closedAt: null } },
          ],
        },
        _sum: { guests: true },
      })
      const remaining = Math.max(0, resource.capacity - (used._sum.guests || 0))
      slots.push({
        resourceId: resource.id,
        resourceName: resource.name,
        time,
        remaining,
        available: remaining > 0,
      })
    }
  }
  return NextResponse.json({
    success: true,
    venue: {
      name: current.name,
      currency: current.currency,
      banyaPrice: current.banyaPrice,
      timezone: current.timezone,
      sessionMinutes: current.sessionMinutes,
    },
    day,
    slots,
  })
}

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(getClientIp(request), apiRateLimiter)
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: 'Слишком много запросов' }, { status: 429 })
  }
  const current = await venue()
  if (!current) return NextResponse.json({ error: 'Venue not configured' }, { status: 404 })
  try {
    const body = await request.json()
    if (!body.name?.trim() || !body.phone?.trim()) throw new Error('Имя и телефон обязательны')
    const guests = Math.max(1, Math.min(20, Number(body.guests) || 1))
    const depositAmount = Math.round(current.banyaPrice * guests * 0.25)
    const booking = await createManualBooking(current.id, {
      day: body.day,
      time: body.time,
      name: body.name,
      phone: body.phone,
      guests,
      banya: true,
      note: body.note,
      resourceId: body.resourceId,
      depositAmount,
      depositStatus: 'REQUIRED',
    })
    await prisma.ammeBooking.update({
      where: { id: booking.id },
      data: { source: body.source || 'public_web' },
    })
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      depositAmount,
      depositStatus: 'REQUIRED',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Booking failed' },
      { status: 400 }
    )
  }
}
