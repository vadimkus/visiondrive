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

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const statusFilter = request.nextUrl.searchParams.get('status')?.trim()
  const where: { tenantId: string; status?: ClinicPurchaseOrderStatus } = {
    tenantId: session.tenantId,
  }
  if (statusFilter) {
    const st = parseStatus(statusFilter)
    if (st) where.status = st
  }

  const orders = await prisma.clinicPurchaseOrder.findMany({
    where,
    orderBy: { orderedAt: 'desc' },
    include: {
      supplier: { select: { id: true, name: true } },
      lines: {
        include: {
          stockItem: { select: { id: true, name: true, unit: true, sku: true } },
        },
      },
    },
  })

  return NextResponse.json({ orders })
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

  const supplierName = String(body.supplierName ?? '').trim()
  const supplierId = body.supplierId != null ? String(body.supplierId).trim() || null : null
  if (!supplierName && !supplierId) {
    return NextResponse.json({ error: 'supplierName is required' }, { status: 400 })
  }

  let supplier: { id: string; name: string } | null = null
  if (supplierId) {
    supplier = await prisma.clinicSupplier.findFirst({
      where: { id: supplierId, tenantId: session.tenantId, active: true },
      select: { id: true, name: true },
    })
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 400 })
    }
  }

  const reference = body.reference != null ? String(body.reference).trim() || null : null
  const notes = body.notes != null ? String(body.notes).trim() || null : null
  let expectedAt: Date | null = null
  if (body.expectedAt != null && String(body.expectedAt).trim()) {
    const d = new Date(String(body.expectedAt))
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'expectedAt must be a valid ISO datetime' }, { status: 400 })
    }
    expectedAt = d
  }

  let status: ClinicPurchaseOrderStatus = ClinicPurchaseOrderStatus.DRAFT
  if (body.status !== undefined) {
    const st = parseStatus(String(body.status))
    if (!st) {
      return NextResponse.json({ error: 'Invalid status (use DRAFT, ORDERED, or CANCELLED)' }, { status: 400 })
    }
    status = st
  }

  const rawLines = Array.isArray(body.lines) ? body.lines : []
  if (rawLines.length === 0) {
    return NextResponse.json({ error: 'At least one line is required' }, { status: 400 })
  }

  type LineIn = { stockItemId: string; quantityOrdered: number; unitCostCents?: number | null }
  const lines: LineIn[] = []
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
        return NextResponse.json({ error: 'unitCostCents must be a non-negative integer' }, { status: 400 })
      }
      unitCostCents = Math.floor(c)
    }
    lines.push({ stockItemId, quantityOrdered: Math.floor(qty), unitCostCents })
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: 'At least one valid line is required' }, { status: 400 })
  }

  const stockIds = [...new Set(lines.map((l) => l.stockItemId))]
  const items = await prisma.clinicStockItem.findMany({
    where: { tenantId: session.tenantId, id: { in: stockIds } },
    select: { id: true },
  })
  if (items.length !== stockIds.length) {
    return NextResponse.json({ error: 'One or more stock items were not found' }, { status: 400 })
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.clinicPurchaseOrder.create({
        data: {
          tenantId: session.tenantId,
          supplierId: supplier?.id ?? null,
          supplierName: supplier?.name ?? supplierName,
          reference,
          notes,
          expectedAt,
          status,
          lines: {
            create: lines.map((l) => ({
              stockItemId: l.stockItemId,
              quantityOrdered: l.quantityOrdered,
              unitCostCents: l.unitCostCents,
            })),
          },
        },
        include: {
          supplier: { select: { id: true, name: true } },
          lines: {
            include: {
              stockItem: { select: { id: true, name: true, unit: true, sku: true } },
            },
          },
        },
      })
      return created
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (e) {
    console.error('POST /api/clinic/purchase-orders', e)
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 })
  }
}
