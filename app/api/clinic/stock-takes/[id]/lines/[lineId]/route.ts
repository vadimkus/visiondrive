import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  isVarianceReasonRequired,
  normalizeCountedQuantity,
  normalizeVarianceReason,
  stockVarianceQuantity,
} from '@/lib/clinic/stock-taking'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, lineId } = await context.params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const line = await prisma.clinicStockCountLine.findFirst({
    where: {
      id: lineId,
      sessionId: id,
      tenantId: session.tenantId,
      session: { status: 'DRAFT' },
    },
    include: { session: { select: { status: true } } },
  })

  if (!line) {
    return NextResponse.json({ error: 'Draft line not found' }, { status: 404 })
  }

  const countedQuantity = normalizeCountedQuantity(body.countedQuantity)
  if (countedQuantity == null) {
    return NextResponse.json({ error: 'Counted quantity must be a non-negative integer' }, { status: 400 })
  }

  const varianceQuantity = stockVarianceQuantity(line.expectedQuantity, countedQuantity)
  const reason = normalizeVarianceReason(body.reason)
  if (isVarianceReasonRequired(varianceQuantity) && !reason) {
    return NextResponse.json({ error: 'Variance reason is required' }, { status: 400 })
  }
  const note = body.note != null ? String(body.note).trim() || null : null

  const updated = await prisma.clinicStockCountLine.update({
    where: { id: lineId },
    data: {
      countedQuantity,
      varianceQuantity,
      reason: varianceQuantity === 0 ? null : reason,
      note,
    },
    include: {
      stockItem: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
          quantityOnHand: true,
          active: true,
        },
      },
    },
  })

  return NextResponse.json({ line: updated })
}
