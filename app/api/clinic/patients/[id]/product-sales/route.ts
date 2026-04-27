import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentMethod, ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { handleLowStockNotificationsForItem } from '@/lib/clinic/inventory-low-stock-notify'
import {
  normalizeSalePriceCents,
  normalizeSaleQuantity,
  productSalePaymentReference,
  productSaleTotalCents,
} from '@/lib/clinic/product-sales'
import { getClinicSession } from '@/lib/clinic/session'

function parseMethod(v: string): ClinicPaymentMethod | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicPaymentMethod[] = ['CASH', 'CARD', 'TRANSFER', 'POS', 'OTHER']
  return allowed.includes(u as ClinicPaymentMethod) ? (u as ClinicPaymentMethod) : null
}

function parsePayStatus(v: string): ClinicPaymentStatus | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicPaymentStatus[] = ['PAID', 'PENDING', 'REFUNDED', 'VOID']
  return allowed.includes(u as ClinicPaymentStatus) ? (u as ClinicPaymentStatus) : null
}

type IncomingLine = {
  stockItemId?: unknown
  quantity?: unknown
  unitPriceCents?: unknown
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const sales = await prisma.clinicProductSale.findMany({
    where: { tenantId: session.tenantId, patientId },
    orderBy: { soldAt: 'desc' },
    take: 80,
    include: {
      payment: {
        select: { id: true, status: true, amountCents: true, method: true, paidAt: true },
      },
      visit: { select: { id: true, visitAt: true } },
      appointment: { select: { id: true, startsAt: true } },
      lines: {
        include: {
          stockItem: { select: { id: true, name: true, sku: true, unit: true } },
        },
      },
    },
  })

  return NextResponse.json({ sales })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: patientId } = await context.params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patient = await prisma.clinicPatient.findFirst({
    where: { id: patientId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const visitId =
    body.visitId != null && String(body.visitId).trim() ? String(body.visitId).trim() : null
  const requestedAppointmentId =
    body.appointmentId != null && String(body.appointmentId).trim()
      ? String(body.appointmentId).trim()
      : null

  let appointmentId = requestedAppointmentId
  if (visitId) {
    const visit = await prisma.clinicVisit.findFirst({
      where: { id: visitId, patientId, tenantId: session.tenantId },
      select: { id: true, appointmentId: true },
    })
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found for this patient' }, { status: 400 })
    }
    appointmentId = appointmentId ?? visit.appointmentId
  }

  if (appointmentId) {
    const appointment = await prisma.clinicAppointment.findFirst({
      where: { id: appointmentId, patientId, tenantId: session.tenantId },
      select: { id: true },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found for this patient' }, { status: 400 })
    }
  }

  const rawLines = Array.isArray(body.lines) ? (body.lines as IncomingLine[]) : []
  if (rawLines.length === 0) {
    return NextResponse.json({ error: 'At least one product line is required' }, { status: 400 })
  }
  if (rawLines.length > 20) {
    return NextResponse.json({ error: 'Too many product lines' }, { status: 400 })
  }

  const normalizedLines = rawLines.map((line) => ({
    stockItemId: String(line.stockItemId ?? '').trim(),
    quantity: normalizeSaleQuantity(line.quantity),
    unitPriceCents: normalizeSalePriceCents(line.unitPriceCents),
  }))
  if (normalizedLines.some((line) => !line.stockItemId)) {
    return NextResponse.json({ error: 'stockItemId is required for every line' }, { status: 400 })
  }

  const discountCents = normalizeSalePriceCents(body.discountCents ?? 0)
  const currency = body.currency != null ? String(body.currency).trim().toUpperCase() || 'AED' : 'AED'
  const paymentMethod = parseMethod(String(body.paymentMethod ?? 'OTHER')) ?? ClinicPaymentMethod.OTHER
  const paymentStatus = parsePayStatus(String(body.paymentStatus ?? 'PAID')) ?? ClinicPaymentStatus.PAID
  const note = body.note != null ? String(body.note).trim() || null : null
  const soldAtRaw = String(body.soldAt ?? '')
  const soldAt = soldAtRaw ? new Date(soldAtRaw) : new Date()
  if (Number.isNaN(soldAt.getTime())) {
    return NextResponse.json({ error: 'soldAt must be a valid ISO datetime' }, { status: 400 })
  }

  const adjustedItemIds: string[] = []

  try {
    const result = await prisma.$transaction(async (tx) => {
      const stockItems = await tx.clinicStockItem.findMany({
        where: {
          tenantId: session.tenantId,
          id: { in: normalizedLines.map((line) => line.stockItemId) },
          active: true,
        },
        select: { id: true, name: true, sku: true, unit: true, quantityOnHand: true },
      })
      const stockById = new Map(stockItems.map((item) => [item.id, item]))

      for (const line of normalizedLines) {
        const stockItem = stockById.get(line.stockItemId)
        if (!stockItem) return { kind: 'missing_item' as const }
        if (stockItem.quantityOnHand < line.quantity) {
          return {
            kind: 'insufficient' as const,
            itemName: stockItem.name,
            quantityOnHand: stockItem.quantityOnHand,
          }
        }
      }

      const totals = productSaleTotalCents(normalizedLines, discountCents)
      const sale = await tx.clinicProductSale.create({
        data: {
          tenantId: session.tenantId,
          patientId,
          visitId,
          appointmentId,
          soldAt,
          subtotalCents: totals.subtotalCents,
          discountCents: totals.discountCents,
          totalCents: totals.totalCents,
          currency,
          paymentMethod,
          paymentStatus,
          note,
          createdByUserId: session.userId,
        },
      })

      for (const line of normalizedLines) {
        const stockItem = stockById.get(line.stockItemId)
        if (!stockItem) throw new Error('stock item disappeared')
        const updatedStock = await tx.clinicStockItem.updateMany({
          where: {
            id: line.stockItemId,
            tenantId: session.tenantId,
            quantityOnHand: { gte: line.quantity },
          },
          data: { quantityOnHand: { decrement: line.quantity } },
        })
        if (updatedStock.count !== 1) {
          throw new Error(`PRODUCT_SALE_INSUFFICIENT:${stockItem.name}`)
        }
        const movement = await tx.clinicStockMovement.create({
          data: {
            tenantId: session.tenantId,
            stockItemId: line.stockItemId,
            type: 'CONSUMPTION',
            quantityDelta: -line.quantity,
            reference: productSalePaymentReference(sale.id),
            note: `Product sale: ${stockItem.name}`,
            createdByUserId: session.userId,
          },
        })
        await tx.clinicProductSaleLine.create({
          data: {
            tenantId: session.tenantId,
            productSaleId: sale.id,
            stockItemId: line.stockItemId,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            lineTotalCents: line.quantity * line.unitPriceCents,
            movementId: movement.id,
          },
        })
        adjustedItemIds.push(line.stockItemId)
      }

      let payment = null
      if (totals.totalCents > 0) {
        payment = await tx.clinicPatientPayment.create({
          data: {
            tenantId: session.tenantId,
            patientId,
            amountCents: totals.totalCents,
            currency,
            method: paymentMethod,
            status: paymentStatus,
            reference: productSalePaymentReference(sale.id),
            note: note ? `Product sale: ${note}` : 'Product sale',
            paidAt: soldAt,
            createdByUserId: session.userId,
          },
        })
        await tx.clinicProductSale.update({
          where: { id: sale.id },
          data: { paymentId: payment.id },
        })
      }

      const fullSale = await tx.clinicProductSale.findUniqueOrThrow({
        where: { id: sale.id },
        include: {
          payment: {
            select: { id: true, status: true, amountCents: true, method: true, paidAt: true },
          },
          visit: { select: { id: true, visitAt: true } },
          appointment: { select: { id: true, startsAt: true } },
          lines: {
            include: {
              stockItem: { select: { id: true, name: true, sku: true, unit: true } },
            },
          },
        },
      })

      return { kind: 'ok' as const, sale: fullSale }
    })

    if (result.kind === 'missing_item') {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 400 })
    }
    if (result.kind === 'insufficient') {
      return NextResponse.json(
        { error: `Insufficient stock for ${result.itemName} (on hand: ${result.quantityOnHand})` },
        { status: 400 }
      )
    }

    void Promise.all(
      adjustedItemIds.map((stockItemId) =>
        handleLowStockNotificationsForItem(stockItemId).catch((err) =>
          console.error('product-sale low-stock notify', err)
        )
      )
    )

    return NextResponse.json({ sale: result.sale }, { status: 201 })
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('PRODUCT_SALE_INSUFFICIENT:')) {
      return NextResponse.json(
        { error: `Insufficient stock for ${e.message.replace('PRODUCT_SALE_INSUFFICIENT:', '')}` },
        { status: 400 }
      )
    }
    console.error('POST /api/clinic/patients/[id]/product-sales', e)
    return NextResponse.json({ error: 'Failed to record product sale' }, { status: 500 })
  }
}
