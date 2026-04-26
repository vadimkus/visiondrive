import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  defaultAvailabilityRules,
  normalizeAvailabilityRule,
  type AvailabilityRuleInput,
} from '@/lib/clinic/availability'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rules = await prisma.clinicAvailabilityRule.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
  })

  return NextResponse.json({
    rules: rules.length > 0 ? rules : defaultAvailabilityRules(),
    seeded: rules.length === 0,
  })
}

export async function PATCH(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { rules?: AvailabilityRuleInput[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.rules)) {
    return NextResponse.json({ error: 'rules array is required' }, { status: 400 })
  }

  const rules = body.rules
    .slice(0, 21)
    .map((rule) => normalizeAvailabilityRule(rule))
    .filter((rule) => rule.endMinutes > rule.startMinutes)

  await prisma.$transaction(async (tx) => {
    await tx.clinicAvailabilityRule.deleteMany({ where: { tenantId: session.tenantId } })
    if (rules.length > 0) {
      await tx.clinicAvailabilityRule.createMany({
        data: rules.map((rule) => ({
          tenantId: session.tenantId,
          dayOfWeek: rule.dayOfWeek,
          startMinutes: rule.startMinutes,
          endMinutes: rule.endMinutes,
          slotIntervalMinutes: rule.slotIntervalMinutes ?? 30,
          minLeadMinutes: rule.minLeadMinutes ?? 120,
          active: rule.active !== false,
          label: rule.label ?? null,
        })),
      })
    }
  })

  const saved = await prisma.clinicAvailabilityRule.findMany({
    where: { tenantId: session.tenantId },
    orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
  })

  return NextResponse.json({ rules: saved })
}
