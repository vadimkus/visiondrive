import { NextRequest, NextResponse } from 'next/server'
import type { ClinicStockCountStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

function defaultStockTakeTitle() {
  return `Stock count ${new Date().toISOString().slice(0, 10)}`
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get('status')?.toUpperCase()
  const allowedStatuses: ClinicStockCountStatus[] = ['DRAFT', 'FINALIZED', 'CANCELLED']
  const sessions = await prisma.clinicStockCountSession.findMany({
    where: {
      tenantId: session.tenantId,
      ...(status && allowedStatuses.includes(status as ClinicStockCountStatus)
        ? { status: status as ClinicStockCountStatus }
        : {}),
    },
    orderBy: { countedAt: 'desc' },
    take: 50,
    include: {
      lines: {
        select: {
          countedQuantity: true,
          varianceQuantity: true,
        },
      },
    },
  })

  return NextResponse.json({
    sessions: sessions.map((row) => ({
      ...row,
      summary: {
        lines: row.lines.length,
        counted: row.lines.filter((line) => line.countedQuantity != null).length,
        varianceLines: row.lines.filter((line) => line.varianceQuantity !== 0).length,
        totalVariance: row.lines.reduce((sum, line) => sum + line.varianceQuantity, 0),
      },
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const title = String(body.title ?? '').trim() || defaultStockTakeTitle()
  const note = body.note != null ? String(body.note).trim() || null : null

  try {
    const result = await prisma.$transaction(async (tx) => {
      const items = await tx.clinicStockItem.findMany({
        where: { tenantId: session.tenantId, active: true },
        orderBy: { name: 'asc' },
        select: { id: true, quantityOnHand: true },
      })

      if (items.length === 0) {
        return { kind: 'empty' as const }
      }

      const stockTake = await tx.clinicStockCountSession.create({
        data: {
          tenantId: session.tenantId,
          title,
          note,
          createdByUserId: session.userId,
          lines: {
            create: items.map((item) => ({
              tenantId: session.tenantId,
              stockItemId: item.id,
              expectedQuantity: item.quantityOnHand,
            })),
          },
        },
      })

      return { kind: 'ok' as const, stockTake }
    })

    if (result.kind === 'empty') {
      return NextResponse.json({ error: 'Create stock items before starting a count' }, { status: 400 })
    }

    return NextResponse.json({ stockTake: result.stockTake }, { status: 201 })
  } catch (e) {
    console.error('POST /api/clinic/stock-takes', e)
    return NextResponse.json({ error: 'Failed to start stock count' }, { status: 500 })
  }
}
