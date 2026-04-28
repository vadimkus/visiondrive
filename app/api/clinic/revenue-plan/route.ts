import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentStatus, ClinicVisitStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

type ClinicSettings = {
  revenuePlan?: {
    monthlyTargetCents?: number
    averageVisitCents?: number
  }
}

function asSettings(value: unknown): ClinicSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as ClinicSettings
}

function positiveCents(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0
}

function currentMonthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return {
    start,
    end: now,
    daysInMonth,
    elapsedDays: now.getDate(),
    remainingDays: Math.max(0, daysInMonth - now.getDate()),
  }
}

async function buildRevenuePlan(tenantId: string) {
  const range = currentMonthRange()
  const [settings, paid, refunded, completedVisits] = await Promise.all([
    prisma.tenantSetting.findUnique({
      where: { tenantId },
      select: { thresholds: true },
    }),
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId,
        status: ClinicPaymentStatus.PAID,
        paidAt: { gte: range.start, lte: range.end },
      },
      _sum: { amountCents: true },
    }),
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId,
        status: ClinicPaymentStatus.REFUNDED,
        paidAt: { gte: range.start, lte: range.end },
      },
      _sum: { amountCents: true },
    }),
    prisma.clinicVisit.count({
      where: {
        tenantId,
        status: ClinicVisitStatus.COMPLETED,
        visitAt: { gte: range.start, lte: range.end },
      },
    }),
  ])

  const configured = asSettings(settings?.thresholds).revenuePlan ?? {}
  const monthlyTargetCents = positiveCents(configured.monthlyTargetCents)
  const paidRevenueCents = paid._sum.amountCents ?? 0
  const refundsCents = refunded._sum.amountCents ?? 0
  const achievedRevenueCents = paidRevenueCents - refundsCents
  const actualAverageVisitCents =
    completedVisits > 0 ? Math.round(Math.max(0, achievedRevenueCents) / completedVisits) : 0
  const averageVisitCents = positiveCents(configured.averageVisitCents) || actualAverageVisitCents
  const gapCents = Math.max(0, monthlyTargetCents - achievedRevenueCents)
  const dailyPaceCents = range.elapsedDays > 0 ? Math.round(achievedRevenueCents / range.elapsedDays) : 0
  const requiredDailyPaceCents =
    range.remainingDays > 0 ? Math.ceil(gapCents / range.remainingDays) : gapCents
  const projectedRevenueCents = dailyPaceCents * range.daysInMonth

  return {
    range: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      daysInMonth: range.daysInMonth,
      elapsedDays: range.elapsedDays,
      remainingDays: range.remainingDays,
    },
    plan: {
      monthlyTargetCents,
      averageVisitCents,
      configuredAverageVisitCents: positiveCents(configured.averageVisitCents),
    },
    actuals: {
      paidRevenueCents,
      refundsCents,
      achievedRevenueCents,
      completedVisits,
      actualAverageVisitCents,
      gapCents,
      progressPct:
        monthlyTargetCents > 0
          ? Number(((achievedRevenueCents / monthlyTargetCents) * 100).toFixed(1))
          : 0,
      dailyPaceCents,
      requiredDailyPaceCents,
      projectedRevenueCents,
      requiredVisits: averageVisitCents > 0 ? Math.ceil(gapCents / averageVisitCents) : 0,
    },
  }
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(await buildRevenuePlan(session.tenantId))
}

export async function PATCH(request: NextRequest) {
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

  const monthlyTargetCents = positiveCents(body.monthlyTargetCents)
  const averageVisitCents = positiveCents(body.averageVisitCents)

  const existing = await prisma.tenantSetting.findUnique({
    where: { tenantId: session.tenantId },
    select: { thresholds: true },
  })
  const next = {
    ...asSettings(existing?.thresholds),
    revenuePlan: {
      monthlyTargetCents,
      averageVisitCents,
    },
  }

  await prisma.tenantSetting.upsert({
    where: { tenantId: session.tenantId },
    create: { tenantId: session.tenantId, thresholds: next },
    update: { thresholds: next },
  })

  return NextResponse.json(await buildRevenuePlan(session.tenantId))
}
