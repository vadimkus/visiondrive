import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  defaultAvailabilityRules,
  generateAvailabilitySlots,
} from '@/lib/clinic/availability'
import { normalizeBufferMinutes } from '@/lib/clinic/appointments'

const ACTIVE_STATUSES = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
  ClinicAppointmentStatus.COMPLETED,
]

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const fromRaw = searchParams.get('from')
  const toRaw = searchParams.get('to')
  const procedureId = searchParams.get('procedureId')
  const durationRaw = searchParams.get('durationMinutes')
  const bufferRaw = searchParams.get('bufferAfterMinutes')

  const from = fromRaw ? new Date(fromRaw) : now
  const to = toRaw ? new Date(toRaw) : new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return NextResponse.json({ error: 'Invalid from or to datetime' }, { status: 400 })
  }

  let procedure: { defaultDurationMin: number; bufferAfterMinutes: number } | null = null
  if (procedureId) {
    procedure = await prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId, active: true },
      select: { defaultDurationMin: true, bufferAfterMinutes: true },
    })
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found or inactive' }, { status: 404 })
    }
  }

  const durationMinutes = Math.max(
    5,
    Math.min(24 * 60, Math.round(Number(durationRaw ?? procedure?.defaultDurationMin ?? 60)))
  )
  const bufferAfterMinutes = normalizeBufferMinutes(
    bufferRaw,
    procedure?.bufferAfterMinutes ?? 0
  )

  const [rulesRaw, appointments, blockedTimes] = await Promise.all([
    prisma.clinicAvailabilityRule.findMany({
      where: { tenantId: session.tenantId },
      orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
    }),
    prisma.clinicAppointment.findMany({
      where: {
        tenantId: session.tenantId,
        status: { in: ACTIVE_STATUSES },
        startsAt: { lt: to },
      },
      select: {
        startsAt: true,
        endsAt: true,
        bufferAfterMinutes: true,
        procedure: { select: { defaultDurationMin: true } },
      },
      orderBy: { startsAt: 'asc' },
      take: 500,
    }),
    prisma.clinicBlockedTime.findMany({
      where: {
        tenantId: session.tenantId,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      select: { startsAt: true, endsAt: true },
      orderBy: { startsAt: 'asc' },
      take: 500,
    }),
  ])

  const rules = rulesRaw.length > 0 ? rulesRaw : defaultAvailabilityRules()
  const slots = generateAvailabilitySlots({
    from,
    to,
    rules,
    appointments,
    blockedTimes,
    durationMinutes,
    bufferAfterMinutes,
    procedureId: procedureId || null,
    now,
  })

  return NextResponse.json({
    slots,
    range: { from: from.toISOString(), to: to.toISOString() },
    durationMinutes,
    bufferAfterMinutes,
  })
}
