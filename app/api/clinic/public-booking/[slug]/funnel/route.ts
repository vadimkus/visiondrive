import { NextRequest, NextResponse } from 'next/server'
import { ClinicBookingFunnelEventType, TenantStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isBookingFunnelStage } from '@/lib/clinic/booking-funnel'
import { getPublicBookingEnabled } from '@/lib/clinic/public-booking-settings'

async function getTenant(slug: string) {
  return prisma.tenant.findFirst({
    where: { slug, status: TenantStatus.ACTIVE },
    select: { id: true },
  })
}

function cleanText(value: unknown, max = 500) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const tenant = await getTenant(slug)
  if (!tenant) {
    return NextResponse.json({ ok: true })
  }

  const enabled = await getPublicBookingEnabled(prisma, tenant.id)
  if (!enabled) {
    return NextResponse.json({ ok: true })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const eventType = cleanText(body.eventType, 50)
  const sessionId = cleanText(body.sessionId, 120)
  if (!eventType || !sessionId || !isBookingFunnelStage(eventType)) {
    return NextResponse.json({ ok: true })
  }

  const procedureId = cleanText(body.procedureId, 120)
  const appointmentId = cleanText(body.appointmentId, 120)
  const startsAtRaw = cleanText(body.startsAt, 80)
  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null
  const safeStartsAt = startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : null
  const [procedure, appointment] = await Promise.all([
    procedureId
      ? prisma.clinicProcedure.findFirst({
          where: { id: procedureId, tenantId: tenant.id },
          select: { id: true },
        })
      : null,
    appointmentId
      ? prisma.clinicAppointment.findFirst({
          where: { id: appointmentId, tenantId: tenant.id },
          select: { id: true },
        })
      : null,
  ])

  await prisma.clinicBookingFunnelEvent.create({
    data: {
      tenantId: tenant.id,
      sessionId,
      eventType: eventType as ClinicBookingFunnelEventType,
      procedureId: procedure?.id,
      appointmentId: appointment?.id,
      startsAt: safeStartsAt,
      referrer: cleanText(request.headers.get('referer'), 1000),
      userAgent: cleanText(request.headers.get('user-agent'), 1000),
    },
  })

  return NextResponse.json({ ok: true })
}
