import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  buildSupplierSettlementSummary,
  normalizeSupplierMoneyCents,
  normalizeSupplierText,
} from '@/lib/clinic/suppliers'

const supplierInclude = {
  purchaseOrders: {
    include: {
      lines: {
        include: {
          stockItem: { select: { id: true, name: true, unit: true, sku: true } },
        },
      },
    },
    orderBy: { orderedAt: 'desc' as const },
  },
  settlements: {
    orderBy: { paidAt: 'desc' as const },
  },
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const supplier = await prisma.clinicSupplier.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!supplier) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const amountCents = normalizeSupplierMoneyCents(body.amountCents)
  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ error: 'amountCents must be greater than 0' }, { status: 400 })
  }

  let paidAt = new Date()
  if (body.paidAt != null && String(body.paidAt).trim()) {
    const parsed = new Date(String(body.paidAt))
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: 'paidAt must be a valid ISO datetime' }, { status: 400 })
    }
    paidAt = parsed
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicSupplierSettlement.create({
        data: {
          tenantId: session.tenantId,
          supplierId: id,
          amountCents,
          currency: normalizeSupplierText(body.currency, 12) ?? 'AED',
          method: normalizeSupplierText(body.method, 80),
          reference: normalizeSupplierText(body.reference, 120),
          note: normalizeSupplierText(body.note, 1000),
          paidAt,
          createdByUserId: session.userId,
        },
      })

      return tx.clinicSupplier.findFirstOrThrow({
        where: { id, tenantId: session.tenantId },
        include: supplierInclude,
      })
    })

    return NextResponse.json({
      supplier: {
        ...updated,
        summary: buildSupplierSettlementSummary(updated.purchaseOrders, updated.settlements),
      },
    })
  } catch (e) {
    console.error('POST /api/clinic/suppliers/[id]/settlements', e)
    return NextResponse.json({ error: 'Failed to record supplier settlement' }, { status: 500 })
  }
}
