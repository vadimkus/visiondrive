import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertBarcodeAvailable, normalizeBarcode } from '@/lib/clinic/inventory-barcode'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const item = await prisma.clinicStockItem.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      procedure: { select: { id: true, name: true } },
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  })

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    item: {
      ...item,
      lowStock: isClinicStockLow(item),
    },
  })
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

  const existing = await prisma.clinicStockItem.findFirst({
    where: { id, tenantId: session.tenantId },
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
    name?: string
    sku?: string | null
    unit?: string
    reorderPoint?: number
    active?: boolean
    notes?: string | null
    procedureId?: string | null
    barcode?: string | null
    consumePerVisit?: number
  } = {}

  if (body.name !== undefined) {
    const v = String(body.name).trim()
    if (!v) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    data.name = v
  }
  if (body.sku !== undefined) {
    data.sku = body.sku == null ? null : String(body.sku).trim() || null
  }
  if (body.unit !== undefined) {
    data.unit = String(body.unit).trim() || 'unit'
  }
  if (body.reorderPoint !== undefined) {
    const n = Number(body.reorderPoint)
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) {
      return NextResponse.json({ error: 'invalid reorderPoint' }, { status: 400 })
    }
    data.reorderPoint = Math.floor(n)
  }
  if (body.active !== undefined) {
    data.active = Boolean(body.active)
  }
  if (body.notes !== undefined) {
    data.notes = body.notes == null ? null : String(body.notes).trim() || null
  }
  if (body.procedureId !== undefined) {
    if (body.procedureId === null) {
      data.procedureId = null
    } else {
      const pid = String(body.procedureId).trim()
      if (!pid) {
        data.procedureId = null
      } else {
        const proc = await prisma.clinicProcedure.findFirst({
          where: { id: pid, tenantId: session.tenantId },
          select: { id: true },
        })
        if (!proc) {
          return NextResponse.json({ error: 'procedure not found' }, { status: 400 })
        }
        data.procedureId = proc.id
      }
    }
  }

  if (body.barcode !== undefined) {
    data.barcode = normalizeBarcode(body.barcode)
  }
  if (body.consumePerVisit !== undefined) {
    const n = Number(body.consumePerVisit)
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) {
      return NextResponse.json({ error: 'invalid consumePerVisit' }, { status: 400 })
    }
    data.consumePerVisit = Math.floor(n)
  }

  if (data.barcode !== undefined) {
    try {
      await assertBarcodeAvailable(session.tenantId, data.barcode, id)
    } catch {
      return NextResponse.json({ error: 'Barcode already in use for another item' }, { status: 400 })
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const item = await prisma.clinicStockItem.update({
    where: { id },
    data,
    include: {
      procedure: { select: { id: true, name: true } },
    },
  })

  void handleLowStockNotificationsForItem(id).catch((err) => console.error('low-stock notify', err))

  return NextResponse.json({
    item: { ...item, lowStock: isClinicStockLow(item) },
  })
}
