import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  calendarFeedFromSettings,
  generateCalendarFeedToken,
  hashCalendarFeedToken,
} from '@/lib/clinic/calendar-feed'
import { getClinicSession } from '@/lib/clinic/session'

function asSettings(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function feedUrl(request: NextRequest, token: string) {
  return new URL(`/calendar/clinic/${token}`, request.url).toString()
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.tenantSetting.findUnique({
    where: { tenantId: session.tenantId },
    select: { thresholds: true },
  })
  const feed = calendarFeedFromSettings(settings?.thresholds)
  return NextResponse.json({
    active: Boolean(feed.tokenHash && !feed.revokedAt),
    tokenLastFour: feed.tokenLastFour ?? null,
    createdAt: feed.createdAt ?? null,
    revokedAt: feed.revokedAt ?? null,
  })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = generateCalendarFeedToken()
  const existing = await prisma.tenantSetting.findUnique({
    where: { tenantId: session.tenantId },
    select: { thresholds: true },
  })
  const thresholds = asSettings(existing?.thresholds)
  const next = {
    ...thresholds,
    calendarFeed: {
      tokenHash: hashCalendarFeedToken(token),
      tokenLastFour: token.slice(-4),
      createdAt: new Date().toISOString(),
      revokedAt: null,
    },
  }

  await prisma.tenantSetting.upsert({
    where: { tenantId: session.tenantId },
    create: { tenantId: session.tenantId, thresholds: next },
    update: { thresholds: next },
  })

  return NextResponse.json({
    active: true,
    tokenLastFour: token.slice(-4),
    url: feedUrl(request, token),
  })
}

export async function DELETE(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.tenantSetting.findUnique({
    where: { tenantId: session.tenantId },
    select: { thresholds: true },
  })
  const thresholds = asSettings(existing?.thresholds)
  const currentFeed = calendarFeedFromSettings(existing?.thresholds)
  const next = {
    ...thresholds,
    calendarFeed: {
      ...currentFeed,
      revokedAt: new Date().toISOString(),
    },
  }

  await prisma.tenantSetting.upsert({
    where: { tenantId: session.tenantId },
    create: { tenantId: session.tenantId, thresholds: next },
    update: { thresholds: next },
  })

  return NextResponse.json({ active: false })
}
