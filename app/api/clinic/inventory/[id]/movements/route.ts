import { NextRequest, NextResponse } from 'next/server'
import type { ClinicStockMovementType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import { isClinicStockLow } from '@/lib/clinic/inventory'
import { getClinicSession } from '@/lib/clinic/session'

function parseMovementType(v: string): ClinicStockMovementType | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicStockMovementType[] = ['RECEIPT', 'ADJUSTMENT', 'CONSUMPTION', 'RETURN']
  return allowed.includes(u as ClinicStockMovementType) ? (u as ClinicStockMovementType) : null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: stockItemId } = await context.params

  const item = await prisma.clinicStockItem.findFirst({
    where: { id: stockItemId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const limit = Math.min(200, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 50))

  const movements = await prisma.clinicStockMovement.findMany({
    where: { stockItemId, tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ movements })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: stockItemId } = await context.params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const type = parseMovementType(String(body.type ?? ''))
  if (!type) {
    return NextResponse.json({ error: 'Invalid movement type' }, { status: 400 })
  }

  const quantityDelta = Number(body.quantityDelta)
  if (!Number.isFinite(quantityDelta) || quantityDelta === 0 || !Number.isInteger(quantityDelta)) {
    return NextResponse.json({ error: 'quantityDelta must be a non-zero integer' }, { status: 400 })
  }

  const note = body.note != null ? String(body.note).trim() || null : null
  const reference = body.reference != null ? String(body.reference).trim() || null : null

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      const row = await tx.clinicStockItem.findFirst({
        where: { id: stockItemId, tenantId: session.tenantId },
      })
      if (!row) {
        return { kind: 'not_found' as const }
      }

      const nextQty = row.quantityOnHand + quantityDelta
      if (nextQty < 0) {
        return {
          kind: 'negative' as const,
          quantityOnHand: row.quantityOnHand,
        }
      }

      const movement = await tx.clinicStockMovement.create({
        data: {
          tenantId: session.tenantId,
          stockItemId,
          type,
          quantityDelta,
          note,
          reference,
        },
      })

      const updated = await tx.clinicStockItem.update({
        where: { id: stockItemId },
        data: { quantityOnHand: nextQty },
        include: { procedure: { select: { id: true, name: true } } },
      })

      return { kind: 'ok' as const, movement, item: updated }
    })

    if (txResult.kind === 'not_found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (txResult.kind === 'negative') {
      return NextResponse.json(
        { error: `Insufficient stock (on hand: ${txResult.quantityOnHand})` },
        { status: 400 }
      )
    }

    void handleLowStockNotificationsForItem(stockItemId).catch((err) =>
      console.error('low-stock notify', err)
    )

    return NextResponse.json(
      {
        movement: txResult.movement,
        item: { ...txResult.item, lowStock: isClinicStockLow(txResult.item) },
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('POST /api/clinic/inventory/[id]/movements', e)
    return NextResponse.json({ error: 'Failed to record movement' }, { status: 500 })
  }
}
