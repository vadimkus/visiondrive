import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const fromRaw = searchParams.get('from')
  const toRaw = searchParams.get('to')
  const from = fromRaw ? new Date(fromRaw) : new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const to = toRaw ? new Date(toRaw) : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return NextResponse.json({ error: 'Invalid from or to datetime' }, { status: 400 })
  }

  const blockedTimes = await prisma.clinicBlockedTime.findMany({
    where: {
      tenantId: session.tenantId,
      startsAt: { lt: to },
      endsAt: { gt: from },
    },
    orderBy: { startsAt: 'asc' },
  })

  return NextResponse.json({ blockedTimes })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const startsAt = body.startsAt != null ? new Date(String(body.startsAt)) : null
  const endsAt = body.endsAt != null ? new Date(String(body.endsAt)) : null
  const reason = body.reason != null ? String(body.reason).trim() || null : null

  if (!startsAt || !endsAt || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: 'Valid startsAt and endsAt are required' }, { status: 400 })
  }
  if (endsAt <= startsAt) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
  }

  const blockedTime = await prisma.clinicBlockedTime.create({
    data: {
      tenantId: session.tenantId,
      startsAt,
      endsAt,
      reason,
      createdByUserId: session.userId,
    },
  })

  return NextResponse.json({ blockedTime }, { status: 201 })
}
