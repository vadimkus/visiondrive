import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertBarcodeAvailable, normalizeBarcode } from '@/lib/clinic/inventory-barcode'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lowOnly = request.nextUrl.searchParams.get('lowStock') === '1'
  const includeInactive = request.nextUrl.searchParams.get('includeInactive') === '1'

  const items = await prisma.clinicStockItem.findMany({
    where: {
      tenantId: session.tenantId,
      ...(includeInactive ? {} : { active: true }),
    },
    orderBy: [{ name: 'asc' }],
    include: {
      procedure: { select: { id: true, name: true } },
    },
  })

  const filtered = lowOnly ? items.filter((i) => isClinicStockLow(i)) : items

  return NextResponse.json({
    items: filtered.map((i) => ({
      ...i,
      lowStock: isClinicStockLow(i),
    })),
  })
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

  const name = String(body.name ?? '').trim()
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const sku = body.sku != null ? String(body.sku).trim() || null : null
  const unit = body.unit != null ? String(body.unit).trim() || 'unit' : 'unit'
  const reorderPoint = body.reorderPoint != null ? Number(body.reorderPoint) : 0
  if (!Number.isFinite(reorderPoint) || reorderPoint < 0 || reorderPoint > 1_000_000_000) {
    return NextResponse.json({ error: 'reorderPoint must be a non-negative number' }, { status: 400 })
  }

  let initialQuantity = body.initialQuantity != null ? Number(body.initialQuantity) : 0
  if (!Number.isFinite(initialQuantity) || initialQuantity < 0 || initialQuantity > 1_000_000_000) {
    return NextResponse.json({ error: 'initialQuantity must be a non-negative number' }, { status: 400 })
  }

  const notes = body.notes != null ? String(body.notes).trim() || null : null

  const barcode = normalizeBarcode(body.barcode)
  let consumePerVisit = body.consumePerVisit != null ? Number(body.consumePerVisit) : 0
  if (!Number.isFinite(consumePerVisit) || consumePerVisit < 0 || consumePerVisit > 1_000_000) {
    return NextResponse.json({ error: 'consumePerVisit must be between 0 and 1000000' }, { status: 400 })
  }
  consumePerVisit = Math.floor(consumePerVisit)

  try {
    await assertBarcodeAvailable(session.tenantId, barcode)
  } catch {
    return NextResponse.json({ error: 'Barcode already in use for another item' }, { status: 400 })
  }

  let procedureId: string | null = null
  if (body.procedureId !== undefined && body.procedureId !== null) {
    const pid = String(body.procedureId).trim()
    if (pid) {
      const proc = await prisma.clinicProcedure.findFirst({
        where: { id: pid, tenantId: session.tenantId, active: true },
        select: { id: true },
      })
      if (!proc) {
        return NextResponse.json({ error: 'procedure not found' }, { status: 400 })
      }
      procedureId = proc.id
    }
  }

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.clinicStockItem.create({
        data: {
          tenantId: session.tenantId,
          name,
          sku,
          unit,
          reorderPoint: Math.floor(reorderPoint),
          quantityOnHand: 0,
          notes,
          procedureId,
          barcode,
          consumePerVisit,
        },
      })

      if (initialQuantity > 0) {
        const delta = Math.floor(initialQuantity)
        await tx.clinicStockMovement.create({
          data: {
            tenantId: session.tenantId,
            stockItemId: created.id,
            type: 'RECEIPT',
            quantityDelta: delta,
            note: 'Opening balance',
          },
        })
        await tx.clinicStockItem.update({
          where: { id: created.id },
          data: { quantityOnHand: delta },
        })
      }

      const full = await tx.clinicStockItem.findFirst({
        where: { id: created.id },
        include: { procedure: { select: { id: true, name: true } } },
      })
      if (!full) throw new Error('missing stock item after create')
      return full
    })

    void handleLowStockNotificationsForItem(item.id).catch((err) =>
      console.error('low-stock notify', err)
    )

    return NextResponse.json({ item: { ...item, lowStock: isClinicStockLow(item) } }, { status: 201 })
  } catch (e) {
    console.error('POST /api/clinic/inventory', e)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
