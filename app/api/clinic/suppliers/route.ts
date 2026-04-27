import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  buildSupplierSettlementSummary,
  normalizeSupplierName,
  normalizeSupplierText,
} from '@/lib/clinic/suppliers'

function supplierSelect() {
  return {
    id: true,
    name: true,
    contactName: true,
    phone: true,
    email: true,
    whatsapp: true,
    address: true,
    preferredReorderNote: true,
    defaultPaymentTermsDays: true,
    notes: true,
    active: true,
    createdAt: true,
    updatedAt: true,
    purchaseOrders: {
      select: {
        id: true,
        status: true,
        orderedAt: true,
        lines: { select: { quantityOrdered: true, quantityReceived: true, unitCostCents: true } },
      },
      orderBy: { orderedAt: 'desc' as const },
    },
    settlements: {
      select: { amountCents: true },
    },
  }
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true'
  const suppliers = await prisma.clinicSupplier.findMany({
    where: { tenantId: session.tenantId, ...(includeInactive ? {} : { active: true }) },
    orderBy: { name: 'asc' },
    select: supplierSelect(),
  })

  return NextResponse.json({
    suppliers: suppliers.map((supplier) => ({
      ...supplier,
      summary: buildSupplierSettlementSummary(supplier.purchaseOrders, supplier.settlements),
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

  const name = normalizeSupplierName(body.name)
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const paymentTerms = Number(body.defaultPaymentTermsDays ?? 0)
  if (!Number.isFinite(paymentTerms) || paymentTerms < 0 || paymentTerms > 365) {
    return NextResponse.json({ error: 'defaultPaymentTermsDays must be between 0 and 365' }, { status: 400 })
  }

  try {
    const supplier = await prisma.$transaction(async (tx) => {
      const created = await tx.clinicSupplier.create({
        data: {
          tenantId: session.tenantId,
          name,
          contactName: normalizeSupplierText(body.contactName, 120),
          phone: normalizeSupplierText(body.phone, 80),
          email: normalizeSupplierText(body.email, 120),
          whatsapp: normalizeSupplierText(body.whatsapp, 80),
          address: normalizeSupplierText(body.address, 1500),
          preferredReorderNote: normalizeSupplierText(body.preferredReorderNote, 1500),
          defaultPaymentTermsDays: Math.floor(paymentTerms),
          notes: normalizeSupplierText(body.notes, 1500),
          createdByUserId: session.userId,
        },
      })

      await tx.clinicPurchaseOrder.updateMany({
        where: {
          tenantId: session.tenantId,
          supplierId: null,
          supplierName: { equals: name, mode: 'insensitive' },
        },
        data: { supplierId: created.id },
      })

      return tx.clinicSupplier.findFirstOrThrow({
        where: { id: created.id, tenantId: session.tenantId },
        select: supplierSelect(),
      })
    })

    return NextResponse.json(
      {
        supplier: {
          ...supplier,
          summary: buildSupplierSettlementSummary(supplier.purchaseOrders, supplier.settlements),
        },
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('POST /api/clinic/suppliers', e)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}
