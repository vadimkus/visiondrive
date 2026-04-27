import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  normalizeMaterialQuantity,
  normalizeMaterialSortOrder,
  normalizeUnitCostCents,
} from '@/lib/clinic/procedure-materials'
import { getClinicSession } from '@/lib/clinic/session'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; materialId: string }> }
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

  const { id: procedureId, materialId } = await context.params
  const existing = await prisma.clinicProcedureMaterial.findFirst({
    where: { id: materialId, procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 })
  }

  const data: Prisma.ClinicProcedureMaterialUpdateInput = {}
  if (body.quantityPerVisit !== undefined) {
    data.quantityPerVisit = normalizeMaterialQuantity(body.quantityPerVisit, 1)
  }
  if (body.unitCostCents !== undefined) {
    data.unitCostCents = normalizeUnitCostCents(body.unitCostCents, 0)
  }
  if (body.sortOrder !== undefined) {
    data.sortOrder = normalizeMaterialSortOrder(body.sortOrder, 0)
  }
  if (body.active !== undefined) {
    data.active = Boolean(body.active)
  }
  if (body.note !== undefined) {
    data.note = body.note == null ? null : String(body.note).trim().slice(0, 2000) || null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const material = await prisma.clinicProcedureMaterial.update({
    where: { id: materialId },
    data,
    include: {
      stockItem: { select: { id: true, name: true, unit: true, quantityOnHand: true, active: true } },
    },
  })

  return NextResponse.json({ material })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; materialId: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: procedureId, materialId } = await context.params
  const existing = await prisma.clinicProcedureMaterial.findFirst({
    where: { id: materialId, procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 })
  }

  await prisma.clinicProcedureMaterial.delete({ where: { id: materialId } })
  return NextResponse.json({ ok: true })
}
