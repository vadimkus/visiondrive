import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentMethod } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  PAYMENT_FEE_METHODS,
  normalizePaymentFeeFixedCents,
  normalizePaymentFeePercentBps,
} from '@/lib/clinic/payment-fees'
import { getClinicSession } from '@/lib/clinic/session'

function parseMethod(value: unknown): ClinicPaymentMethod | null {
  const method = String(value ?? '').trim().toUpperCase()
  return PAYMENT_FEE_METHODS.includes(method as (typeof PAYMENT_FEE_METHODS)[number])
    ? (method as ClinicPaymentMethod)
    : null
}

async function listRules(tenantId: string) {
  const existing = await prisma.clinicPaymentFeeRule.findMany({
    where: { tenantId },
    orderBy: { method: 'asc' },
  })
  const byMethod = new Map(existing.map((rule) => [rule.method, rule]))
  return PAYMENT_FEE_METHODS.map((method) => {
    const rule = byMethod.get(method as ClinicPaymentMethod)
    return (
      rule ?? {
        id: null,
        tenantId,
        method,
        percentBps: 0,
        fixedFeeCents: 0,
        active: method !== 'CASH',
        createdAt: null,
        updatedAt: null,
        createdByUserId: null,
      }
    )
  })
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ rules: await listRules(session.tenantId) })
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

  const method = parseMethod(body.method)
  if (!method) {
    return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 })
  }
  const percentBps = normalizePaymentFeePercentBps(body.percentBps)
  if (percentBps == null) {
    return NextResponse.json({ error: 'percentBps must be between 0 and 10000' }, { status: 400 })
  }
  const fixedFeeCents = normalizePaymentFeeFixedCents(body.fixedFeeCents)
  if (fixedFeeCents == null) {
    return NextResponse.json({ error: 'fixedFeeCents must be a non-negative integer' }, { status: 400 })
  }

  await prisma.clinicPaymentFeeRule.upsert({
    where: { tenantId_method: { tenantId: session.tenantId, method } },
    create: {
      tenantId: session.tenantId,
      method,
      percentBps,
      fixedFeeCents,
      active: body.active !== false,
      createdByUserId: session.userId,
    },
    update: {
      percentBps,
      fixedFeeCents,
      active: body.active !== false,
    },
  })

  return NextResponse.json({ rules: await listRules(session.tenantId) })
}
