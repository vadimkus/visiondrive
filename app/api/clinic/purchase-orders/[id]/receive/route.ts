import { NextRequest, NextResponse } from 'next/server'
import { ClinicPurchaseOrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { getClinicSession } from '@/lib/clinic/session'

function statusAfterReceive(
  previous: ClinicPurchaseOrderStatus,
  lines: { quantityOrdered: number; quantityReceived: number }[]
): ClinicPurchaseOrderStatus {
  if (lines.length === 0) return previous
  const allFull = lines.every((l) => l.quantityReceived >= l.quantityOrdered)
  if (allFull) return ClinicPurchaseOrderStatus.RECEIVED
  const anyRecv = lines.some((l) => l.quantityReceived > 0)
  if (anyRecv) return ClinicPurchaseOrderStatus.PARTIALLY_RECEIVED
  if (previous === ClinicPurchaseOrderStatus.DRAFT) return ClinicPurchaseOrderStatus.DRAFT
  return ClinicPurchaseOrderStatus.ORDERED
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

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const receiptNote = body.receiptNote != null ? String(body.receiptNote).trim() || null : null
  const rawItems = Array.isArray(body.items) ? body.items : []
  if (rawItems.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 })
  }

  type Recv = { lineId: string; quantity: number }
  const items: Recv[] = []
  for (const row of rawItems) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    const lineId = String(r.lineId ?? '').trim()
    const quantity = Number(r.quantity)
    if (!lineId || !Number.isFinite(quantity) || quantity < 1 || quantity > 1_000_000_000) {
      return NextResponse.json({ error: 'Each item needs lineId and quantity ≥ 1' }, { status: 400 })
    }
    items.push({ lineId, quantity: Math.floor(quantity) })
  }

  if (items.length === 0) {
    return NextResponse.json({ error: 'At least one receive line is required' }, { status: 400 })
  }
  const mergedItems = [...items.reduce((acc, item) => {
    acc.set(item.lineId, (acc.get(item.lineId) ?? 0) + item.quantity)
    return acc
  }, new Map<string, number>())].map(([lineId, quantity]) => ({ lineId, quantity }))

  const affectedItemIds: string[] = []

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.clinicPurchaseOrder.findFirst({
        where: { id, tenantId: session.tenantId },
        include: { supplier: { select: { id: true, name: true } }, lines: true },
      })
      if (!order) {
        return { error: 'Not found' as const, status: 404 as const }
      }
      if (order.status === ClinicPurchaseOrderStatus.CANCELLED) {
        return { error: 'Cannot receive on a cancelled order' as const, status: 400 as const }
      }

      const lineById = new Map(order.lines.map((l) => [l.id, l]))

      for (const { lineId, quantity } of mergedItems) {
        const line = lineById.get(lineId)
        if (!line) {
          return { error: 'Unknown line id for this order' as const, status: 400 as const }
        }
        const nextRecv = line.quantityReceived + quantity
        if (nextRecv > line.quantityOrdered) {
          return {
            error: `Line exceeds ordered quantity (${line.quantityReceived} already received + ${quantity} > ${line.quantityOrdered})`,
            status: 400 as const,
          }
        }
      }

      const refLabel = order.reference?.trim() || order.id

      for (const { lineId, quantity } of mergedItems) {
        const line = lineById.get(lineId)!
        const stockItem = await tx.clinicStockItem.findFirst({
          where: { id: line.stockItemId, tenantId: session.tenantId },
          select: { id: true },
        })
        if (!stockItem) {
          return { error: 'Stock item missing' as const, status: 400 as const }
        }

        const lineUpdated = await tx.clinicPurchaseOrderLine.updateMany({
          where: {
            id: lineId,
            purchaseOrderId: id,
            quantityReceived: { lte: line.quantityOrdered - quantity },
          },
          data: { quantityReceived: { increment: quantity } },
        })
        if (lineUpdated.count !== 1) {
          return { error: 'Receive quantity is no longer available for this line' as const, status: 409 as const }
        }

        const noteParts = [`PO receive`, refLabel]
        if (receiptNote) noteParts.push(receiptNote)
        await tx.clinicStockMovement.create({
          data: {
            tenantId: session.tenantId,
            stockItemId: line.stockItemId,
            type: 'RECEIPT',
            quantityDelta: quantity,
            note: noteParts.join(' · '),
            reference: `PO:${order.id}`,
            createdByUserId: session.userId,
          },
        })
        await tx.clinicStockItem.updateMany({
          where: { id: line.stockItemId, tenantId: session.tenantId },
          data: { quantityOnHand: { increment: quantity } },
        })
        affectedItemIds.push(line.stockItemId)
      }

      const freshLines = await tx.clinicPurchaseOrderLine.findMany({
        where: { purchaseOrderId: id },
      })
      const headerStatus = statusAfterReceive(order.status, freshLines)

      const updated = await tx.clinicPurchaseOrder.update({
        where: { id },
        data: { status: headerStatus },
        include: {
          supplier: { select: { id: true, name: true } },
          lines: {
            include: {
              stockItem: { select: { id: true, name: true, unit: true, sku: true } },
            },
          },
        },
      })

      return { order: updated }
    })

    if ('error' in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    for (const itemId of [...new Set(affectedItemIds)]) {
      void handleLowStockNotificationsForItem(itemId).catch((e) => console.error(e))
    }

    return NextResponse.json({ order: result.order })
  } catch (e) {
    console.error('POST receive PO', e)
    return NextResponse.json({ error: 'Failed to record receipt' }, { status: 500 })
  }
}
