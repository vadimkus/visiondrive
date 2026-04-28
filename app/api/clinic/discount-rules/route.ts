import { NextRequest, NextResponse } from 'next/server'
import {
  normalizeDiscountFixedCents,
  normalizeDiscountPercentBps,
  normalizeDiscountRuleName,
  normalizeDiscountRuleType,
} from '@/lib/clinic/discount-rules'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

async function listRules(tenantId: string) {
  return prisma.clinicDiscountRule.findMany({
    where: { tenantId },
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      type: true,
      percentBps: true,
      fixedCents: true,
      active: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ rules: await listRules(session.tenantId) })
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

  const name = normalizeDiscountRuleName(body.name)
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  const type = normalizeDiscountRuleType(body.type)
  if (!type) return NextResponse.json({ error: 'Unsupported discount type' }, { status: 400 })
  const percentBps = normalizeDiscountPercentBps(body.percentBps ?? 0)
  const fixedCents = normalizeDiscountFixedCents(body.fixedCents ?? 0)
  if (percentBps == null) return NextResponse.json({ error: 'percentBps must be between 0 and 10000' }, { status: 400 })
  if (fixedCents == null) return NextResponse.json({ error: 'fixedCents must be a non-negative integer' }, { status: 400 })
  if (type === 'PERCENT' && percentBps <= 0) {
    return NextResponse.json({ error: 'percentBps is required for percent discounts' }, { status: 400 })
  }
  if (type === 'FIXED' && fixedCents <= 0) {
    return NextResponse.json({ error: 'fixedCents is required for fixed discounts' }, { status: 400 })
  }

  const note = body.note != null ? String(body.note).trim() || null : null

  try {
    await prisma.clinicDiscountRule.create({
      data: {
        tenantId: session.tenantId,
        name,
        type,
        percentBps: type === 'PERCENT' ? percentBps : 0,
        fixedCents: type === 'FIXED' ? fixedCents : 0,
        active: body.active !== false,
        note,
        createdByUserId: session.userId,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Discount rule name already exists' }, { status: 409 })
  }

  return NextResponse.json({ rules: await listRules(session.tenantId) }, { status: 201 })
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

  const id = String(body.id ?? '').trim()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const name = normalizeDiscountRuleName(body.name)
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  const type = normalizeDiscountRuleType(body.type)
  if (!type) return NextResponse.json({ error: 'Unsupported discount type' }, { status: 400 })
  const percentBps = normalizeDiscountPercentBps(body.percentBps ?? 0)
  const fixedCents = normalizeDiscountFixedCents(body.fixedCents ?? 0)
  if (percentBps == null) return NextResponse.json({ error: 'percentBps must be between 0 and 10000' }, { status: 400 })
  if (fixedCents == null) return NextResponse.json({ error: 'fixedCents must be a non-negative integer' }, { status: 400 })

  const existing = await prisma.clinicDiscountRule.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Discount rule not found' }, { status: 404 })

  try {
    await prisma.clinicDiscountRule.update({
      where: { id },
      data: {
        name,
        type,
        percentBps: type === 'PERCENT' ? percentBps : 0,
        fixedCents: type === 'FIXED' ? fixedCents : 0,
        active: body.active !== false,
        note: body.note != null ? String(body.note).trim() || null : null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Discount rule name already exists' }, { status: 409 })
  }

  return NextResponse.json({ rules: await listRules(session.tenantId) })
}
