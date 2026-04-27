import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  buildSupplierSettlementSummary,
  normalizeSupplierName,
  normalizeSupplierText,
} from '@/lib/clinic/suppliers'

const supplierInclude = {
  purchaseOrders: {
    include: {
      lines: {
        include: {
          stockItem: { select: { id: true, name: true, unit: true, sku: true } },
        },
      },
    },
    orderBy: { orderedAt: 'desc' as const },
  },
  settlements: {
    orderBy: { paidAt: 'desc' as const },
  },
}

function withSummary<T extends { purchaseOrders: Parameters<typeof buildSupplierSettlementSummary>[0]; settlements: Parameters<typeof buildSupplierSettlementSummary>[1] }>(
  supplier: T
) {
  return {
    ...supplier,
    summary: buildSupplierSettlementSummary(supplier.purchaseOrders, supplier.settlements),
  }
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
  const supplier = await prisma.clinicSupplier.findFirst({
    where: { id, tenantId: session.tenantId },
    include: supplierInclude,
  })

  if (!supplier) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ supplier: withSummary(supplier) })
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
  const existing = await prisma.clinicSupplier.findFirst({
    where: { id, tenantId: session.tenantId },
    select: { id: true },
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
    contactName?: string | null
    phone?: string | null
    email?: string | null
    whatsapp?: string | null
    address?: string | null
    preferredReorderNote?: string | null
    defaultPaymentTermsDays?: number
    notes?: string | null
    active?: boolean
  } = {}

  if (body.name !== undefined) {
    const name = normalizeSupplierName(body.name)
    if (!name) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    data.name = name
  }
  if (body.contactName !== undefined) data.contactName = normalizeSupplierText(body.contactName, 120)
  if (body.phone !== undefined) data.phone = normalizeSupplierText(body.phone, 80)
  if (body.email !== undefined) data.email = normalizeSupplierText(body.email, 120)
  if (body.whatsapp !== undefined) data.whatsapp = normalizeSupplierText(body.whatsapp, 80)
  if (body.address !== undefined) data.address = normalizeSupplierText(body.address, 1500)
  if (body.preferredReorderNote !== undefined) {
    data.preferredReorderNote = normalizeSupplierText(body.preferredReorderNote, 1500)
  }
  if (body.defaultPaymentTermsDays !== undefined) {
    const paymentTerms = Number(body.defaultPaymentTermsDays)
    if (!Number.isFinite(paymentTerms) || paymentTerms < 0 || paymentTerms > 365) {
      return NextResponse.json({ error: 'defaultPaymentTermsDays must be between 0 and 365' }, { status: 400 })
    }
    data.defaultPaymentTermsDays = Math.floor(paymentTerms)
  }
  if (body.notes !== undefined) data.notes = normalizeSupplierText(body.notes, 1500)
  if (body.active !== undefined) data.active = Boolean(body.active)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const supplier = await prisma.$transaction(async (tx) => {
      const updated = await tx.clinicSupplier.update({
        where: { id },
        data,
      })

      if (data.name) {
        await tx.clinicPurchaseOrder.updateMany({
          where: {
            tenantId: session.tenantId,
            supplierId: null,
            supplierName: { equals: data.name, mode: 'insensitive' },
          },
          data: { supplierId: updated.id },
        })
      }

      return tx.clinicSupplier.findFirstOrThrow({
        where: { id: updated.id, tenantId: session.tenantId },
        include: supplierInclude,
      })
    })

    return NextResponse.json({ supplier: withSummary(supplier) })
  } catch (e) {
    console.error('PATCH /api/clinic/suppliers/[id]', e)
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
  }
}
