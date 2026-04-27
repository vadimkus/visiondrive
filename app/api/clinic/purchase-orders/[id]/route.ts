import { NextRequest, NextResponse } from 'next/server'
import { ClinicPurchaseOrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

function parseStatus(s: string): ClinicPurchaseOrderStatus | null {
  const u = s.toUpperCase().trim()
  if (u === 'DRAFT' || u === 'ORDERED' || u === 'CANCELLED') {
    return u as ClinicPurchaseOrderStatus
  }
  return null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const order = await prisma.clinicPurchaseOrder.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      supplier: { select: { id: true, name: true } },
      lines: {
        include: {
          stockItem: { select: { id: true, name: true, unit: true, sku: true } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const existing = await prisma.clinicPurchaseOrder.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { lines: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: {
    supplierName?: string
    supplierId?: string | null
    reference?: string | null
    notes?: string | null
    expectedAt?: Date | null
    status?: ClinicPurchaseOrderStatus
  } = {}

  if (body.supplierName !== undefined) {
    const v = String(body.supplierName).trim()
    if (!v) return NextResponse.json({ error: 'supplierName cannot be empty' }, { status: 400 })
    data.supplierName = v
  }
  if (body.supplierId !== undefined) {
    if (body.supplierId == null || !String(body.supplierId).trim()) {
      data.supplierId = null
    } else {
      const supplier = await prisma.clinicSupplier.findFirst({
        where: { id: String(body.supplierId), tenantId: session.tenantId, active: true },
        select: { id: true, name: true },
      })
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 400 })
      }
      data.supplierId = supplier.id
      data.supplierName = supplier.name
    }
  }
  if (body.reference !== undefined) {
    data.reference = body.reference == null ? null : String(body.reference).trim() || null
  }
  if (body.notes !== undefined) {
    data.notes = body.notes == null ? null : String(body.notes).trim() || null
  }
  if (body.expectedAt !== undefined) {
    if (body.expectedAt === null || !String(body.expectedAt).trim()) {
      data.expectedAt = null
    } else {
      const d = new Date(String(body.expectedAt))
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'expectedAt must be a valid ISO datetime' }, { status: 400 })
      }
      data.expectedAt = d
    }
  }

  if (body.status !== undefined) {
    const st = parseStatus(String(body.status))
    if (!st) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (
      existing.status === ClinicPurchaseOrderStatus.RECEIVED ||
      existing.status === ClinicPurchaseOrderStatus.PARTIALLY_RECEIVED
    ) {
      return NextResponse.json(
        { error: 'Cannot change status after goods have been received; use adjustments if needed.' },
        { status: 400 }
      )
    }
    if (st === ClinicPurchaseOrderStatus.CANCELLED) {
      const anyReceived = existing.lines.some((l) => l.quantityReceived > 0)
      if (anyReceived) {
        return NextResponse.json({ error: 'Cannot cancel: stock already received for this order' }, { status: 400 })
      }
    }
    data.status = st
  }

  const rawLines = body.lines
  let lineReplace:
    | { stockItemId: string; quantityOrdered: number; unitCostCents: number | null }[]
    | undefined

  if (rawLines !== undefined) {
    if (existing.status !== ClinicPurchaseOrderStatus.DRAFT) {
      return NextResponse.json({ error: 'Lines can only be edited while the order is in DRAFT' }, { status: 400 })
    }
    if (!Array.isArray(rawLines)) {
      return NextResponse.json({ error: 'lines must be an array' }, { status: 400 })
    }
    lineReplace = []
    for (const row of rawLines) {
      if (!row || typeof row !== 'object') continue
      const r = row as Record<string, unknown>
      const stockItemId = String(r.stockItemId ?? '').trim()
      const qty = Number(r.quantityOrdered)
      if (!stockItemId || !Number.isFinite(qty) || qty < 1 || qty > 1_000_000_000) {
        return NextResponse.json({ error: 'Each line needs stockItemId and quantityOrdered ≥ 1' }, { status: 400 })
      }
      let unitCostCents: number | null = null
      if (r.unitCostCents !== undefined && r.unitCostCents !== null) {
        const c = Number(r.unitCostCents)
        if (!Number.isFinite(c) || c < 0 || c > 1_000_000_000) {
          return NextResponse.json({ error: 'unitCostCents invalid' }, { status: 400 })
        }
        unitCostCents = Math.floor(c)
      }
      lineReplace.push({ stockItemId, quantityOrdered: Math.floor(qty), unitCostCents })
    }
    if (lineReplace.length === 0) {
      return NextResponse.json({ error: 'At least one line is required' }, { status: 400 })
    }
    const stockIds = [...new Set(lineReplace.map((l) => l.stockItemId))]
    const items = await prisma.clinicStockItem.findMany({
      where: { tenantId: session.tenantId, id: { in: stockIds } },
      select: { id: true },
    })
    if (items.length !== stockIds.length) {
      return NextResponse.json({ error: 'One or more stock items were not found' }, { status: 400 })
    }
  }

  if (Object.keys(data).length === 0 && !lineReplace) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      if (lineReplace) {
        await tx.clinicPurchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } })
        for (const l of lineReplace) {
          await tx.clinicPurchaseOrderLine.create({
            data: {
              purchaseOrderId: id,
              stockItemId: l.stockItemId,
              quantityOrdered: l.quantityOrdered,
              quantityReceived: 0,
              unitCostCents: l.unitCostCents,
            },
          })
        }
      }
      return tx.clinicPurchaseOrder.update({
        where: { id },
        data,
        include: {
          supplier: { select: { id: true, name: true } },
          lines: {
            include: {
              stockItem: { select: { id: true, name: true, unit: true, sku: true } },
            },
          },
        },
      })
    })

    return NextResponse.json({ order })
  } catch (e) {
    console.error('PATCH /api/clinic/purchase-orders/[id]', e)
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 })
  }
}
