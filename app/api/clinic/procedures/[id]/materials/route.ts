import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  normalizeMaterialQuantity,
  normalizeMaterialSortOrder,
  normalizeUnitCostCents,
} from '@/lib/clinic/procedure-materials'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: procedureId } = await context.params
  const procedure = await prisma.clinicProcedure.findFirst({
    where: { id: procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!procedure) {
    return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
  }

  const materials = await prisma.clinicProcedureMaterial.findMany({
    where: { tenantId: session.tenantId, procedureId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      stockItem: { select: { id: true, name: true, unit: true, quantityOnHand: true, active: true } },
    },
  })

  return NextResponse.json({ materials })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id: procedureId } = await context.params
  const stockItemId = String(body.stockItemId ?? '').trim()
  if (!stockItemId) {
    return NextResponse.json({ error: 'stockItemId is required' }, { status: 400 })
  }

  const [procedure, stockItem] = await Promise.all([
    prisma.clinicProcedure.findFirst({
      where: { id: procedureId, tenantId: session.tenantId },
      select: { id: true },
    }),
    prisma.clinicStockItem.findFirst({
      where: { id: stockItemId, tenantId: session.tenantId, active: true },
      select: { id: true },
    }),
  ])
  if (!procedure) {
    return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
  }
  if (!stockItem) {
    return NextResponse.json({ error: 'Stock item not found' }, { status: 400 })
  }

  const quantityPerVisit = normalizeMaterialQuantity(body.quantityPerVisit, 1)
  const unitCostCents = normalizeUnitCostCents(body.unitCostCents, 0)
  const sortOrder = normalizeMaterialSortOrder(body.sortOrder, 0)
  const active = body.active !== false
  const note = body.note != null ? String(body.note).trim().slice(0, 2000) || null : null

  try {
    const material = await prisma.clinicProcedureMaterial.upsert({
      where: { procedureId_stockItemId: { procedureId, stockItemId } },
      create: {
        tenantId: session.tenantId,
        procedureId,
        stockItemId,
        quantityPerVisit,
        unitCostCents,
        sortOrder,
        active,
        note,
        createdByUserId: session.userId,
      },
      update: {
        quantityPerVisit,
        unitCostCents,
        sortOrder,
        active,
        note,
      },
      include: {
        stockItem: { select: { id: true, name: true, unit: true, quantityOnHand: true, active: true } },
      },
    })

    return NextResponse.json({ material }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Material already exists for this procedure' }, { status: 409 })
    }
    console.error('POST /api/clinic/procedures/[id]/materials', error)
    return NextResponse.json({ error: 'Failed to save material' }, { status: 500 })
  }
}
