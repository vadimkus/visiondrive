import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { getClinicSession } from '@/lib/clinic/session'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const adjustedItemIds: string[] = []

  try {
    const result = await prisma.$transaction(async (tx) => {
      const stockTake = await tx.clinicStockCountSession.findFirst({
        where: { id, tenantId: session.tenantId },
        include: {
          lines: {
            include: {
              stockItem: {
                select: {
                  id: true,
                  name: true,
                  quantityOnHand: true,
                },
              },
            },
          },
        },
      })

      if (!stockTake) return { kind: 'not_found' as const }
      if (stockTake.status !== 'DRAFT') return { kind: 'not_draft' as const }
      if (stockTake.lines.length === 0) return { kind: 'empty' as const }

      const uncounted = stockTake.lines.find((line) => line.countedQuantity == null)
      if (uncounted) return { kind: 'uncounted' as const, itemName: uncounted.stockItem.name }

      const missingReason = stockTake.lines.find(
        (line) => line.varianceQuantity !== 0 && !line.reason
      )
      if (missingReason) return { kind: 'missing_reason' as const, itemName: missingReason.stockItem.name }

      for (const line of stockTake.lines) {
        const countedQuantity = line.countedQuantity ?? line.expectedQuantity
        const quantityDelta = countedQuantity - line.stockItem.quantityOnHand
        if (quantityDelta === 0) continue

        const movement = await tx.clinicStockMovement.create({
          data: {
            tenantId: session.tenantId,
            stockItemId: line.stockItemId,
            type: 'ADJUSTMENT',
            quantityDelta,
            reference: `STOCK_COUNT:${stockTake.id}`,
            note: [
              `Stock count: ${stockTake.title}`,
              `Expected ${line.expectedQuantity}, counted ${countedQuantity}`,
              line.reason ? `Reason: ${line.reason}` : null,
              line.note ? `Note: ${line.note}` : null,
            ]
              .filter(Boolean)
              .join(' | '),
            createdByUserId: session.userId,
          },
        })

        await tx.clinicStockItem.update({
          where: { id: line.stockItemId },
          data: { quantityOnHand: countedQuantity },
        })

        await tx.clinicStockCountLine.update({
          where: { id: line.id },
          data: { movementId: movement.id },
        })

        adjustedItemIds.push(line.stockItemId)
      }

      const finalized = await tx.clinicStockCountSession.update({
        where: { id: stockTake.id },
        data: {
          status: 'FINALIZED',
          finalizedAt: new Date(),
          finalizedByUserId: session.userId,
        },
      })

      return { kind: 'ok' as const, stockTake: finalized, adjustments: adjustedItemIds.length }
    })

    if (result.kind === 'not_found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (result.kind === 'not_draft') {
      return NextResponse.json({ error: 'Only draft stock counts can be finalized' }, { status: 400 })
    }
    if (result.kind === 'empty') {
      return NextResponse.json({ error: 'Stock count has no lines' }, { status: 400 })
    }
    if (result.kind === 'uncounted') {
      return NextResponse.json({ error: `Missing count for ${result.itemName}` }, { status: 400 })
    }
    if (result.kind === 'missing_reason') {
      return NextResponse.json({ error: `Variance reason is required for ${result.itemName}` }, { status: 400 })
    }

    void Promise.all(
      adjustedItemIds.map((stockItemId) =>
        handleLowStockNotificationsForItem(stockItemId).catch((err) =>
          console.error('stock-count low-stock notify', err)
        )
      )
    )

    return NextResponse.json({ stockTake: result.stockTake, adjustments: result.adjustments })
  } catch (e) {
    console.error('POST /api/clinic/stock-takes/[id]/finalize', e)
    return NextResponse.json({ error: 'Failed to finalize stock count' }, { status: 500 })
  }
}
