import { NextRequest, NextResponse } from 'next/server'
import { ClinicPaymentStatus, ClinicVisitStatus, ExpenseCategory } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isProductSalePaymentReference } from '@/lib/clinic/product-sales'
import { PACKAGE_PAYMENT_REFERENCE_PREFIX } from '@/lib/clinic/patient-packages'
import { buildProcedureProfitability } from '@/lib/clinic/profitability'
import { getClinicSession } from '@/lib/clinic/session'

function parseDate(input: string | null, fallback: Date) {
  if (!input) return fallback
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? fallback : d
}

function defaultRange(range: string | null) {
  const end = new Date()
  if (range === 'month') {
    return { start: new Date(end.getFullYear(), end.getMonth(), 1), end }
  }
  return { start: new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000), end }
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fallback = defaultRange(searchParams.get('range'))
  const start = parseDate(searchParams.get('start'), fallback.start)
  const end = parseDate(searchParams.get('end'), fallback.end)

  const [
    paid,
    refunded,
    pending,
    discounts,
    processorFees,
    expenses,
    expenseBreakdown,
    recentExpenses,
    productSales,
    packageDiscounts,
    recentDiscounts,
    giftCardSales,
    giftCardRedemptions,
    giftCardOutstanding,
    recentGiftCards,
    completedVisits,
  ] = await Promise.all([
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId: session.tenantId,
        status: ClinicPaymentStatus.PAID,
        paidAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId: session.tenantId,
        status: ClinicPaymentStatus.REFUNDED,
        paidAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId: session.tenantId,
        status: ClinicPaymentStatus.PENDING,
        paidAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId: session.tenantId,
        discountCents: { gt: 0 },
        paidAt: { gte: start, lte: end },
        NOT: { reference: { startsWith: PACKAGE_PAYMENT_REFERENCE_PREFIX } },
      },
      _sum: { discountCents: true },
      _count: { _all: true },
    }),
    prisma.clinicPatientPayment.aggregate({
      where: {
        tenantId: session.tenantId,
        status: { in: [ClinicPaymentStatus.PAID, ClinicPaymentStatus.REFUNDED] },
        paidAt: { gte: start, lte: end },
      },
      _sum: { processorFeeCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        tenantId: session.tenantId,
        occurredAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: {
        tenantId: session.tenantId,
        occurredAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
      orderBy: { _sum: { amountCents: 'desc' } },
    }),
    prisma.expense.findMany({
      where: {
        tenantId: session.tenantId,
        occurredAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        category: true,
        vendor: true,
        description: true,
        amountCents: true,
        currency: true,
        occurredAt: true,
        createdAt: true,
      },
      orderBy: { occurredAt: 'desc' },
      take: 8,
    }),
    prisma.clinicProductSale.findMany({
      where: {
        tenantId: session.tenantId,
        soldAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        totalCents: true,
        discountCents: true,
        paymentStatus: true,
        lines: {
          select: {
            quantity: true,
            unitCostCents: true,
          },
        },
      },
    }),
    prisma.clinicPatientPackage.aggregate({
      where: {
        tenantId: session.tenantId,
        discountCents: { gt: 0 },
        purchasedAt: { gte: start, lte: end },
      },
      _sum: { discountCents: true },
      _count: { _all: true },
    }),
    prisma.clinicPatientPayment.findMany({
      where: {
        tenantId: session.tenantId,
        discountCents: { gt: 0 },
        paidAt: { gte: start, lte: end },
        NOT: { reference: { startsWith: PACKAGE_PAYMENT_REFERENCE_PREFIX } },
      },
      select: {
        id: true,
        amountCents: true,
        discountCents: true,
        discountName: true,
        discountReason: true,
        currency: true,
        status: true,
        paidAt: true,
        patient: { select: { firstName: true, lastName: true } },
      },
      orderBy: { paidAt: 'desc' },
      take: 8,
    }),
    prisma.clinicGiftCard.aggregate({
      where: {
        tenantId: session.tenantId,
        paymentStatus: ClinicPaymentStatus.PAID,
        purchasedAt: { gte: start, lte: end },
      },
      _sum: { initialBalanceCents: true, processorFeeCents: true },
      _count: { _all: true },
    }),
    prisma.clinicGiftCardRedemption.aggregate({
      where: {
        tenantId: session.tenantId,
        redeemedAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
      _count: { _all: true },
    }),
    prisma.clinicGiftCard.aggregate({
      where: {
        tenantId: session.tenantId,
        status: { in: ['ACTIVE', 'PENDING'] },
        remainingBalanceCents: { gt: 0 },
      },
      _sum: { remainingBalanceCents: true },
      _count: { _all: true },
    }),
    prisma.clinicGiftCard.findMany({
      where: {
        tenantId: session.tenantId,
        purchasedAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        code: true,
        buyerName: true,
        recipientName: true,
        initialBalanceCents: true,
        remainingBalanceCents: true,
        currency: true,
        status: true,
        paymentStatus: true,
        purchasedAt: true,
      },
      orderBy: { purchasedAt: 'desc' },
      take: 8,
    }),
    prisma.clinicVisit.findMany({
      where: {
        tenantId: session.tenantId,
        status: ClinicVisitStatus.COMPLETED,
        visitAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        appointment: {
          select: {
            payments: {
              select: {
                id: true,
                amountCents: true,
                discountCents: true,
                processorFeeCents: true,
                status: true,
                reference: true,
              },
            },
            procedure: {
              select: {
                id: true,
                name: true,
                defaultDurationMin: true,
                basePriceCents: true,
                materials: {
                  select: {
                    quantityPerVisit: true,
                    unitCostCents: true,
                    active: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amountCents: true,
            discountCents: true,
            processorFeeCents: true,
            status: true,
            reference: true,
          },
        },
      },
    }),
  ])

  const paidRevenueCents = paid._sum.amountCents ?? 0
  const refundsCents = refunded._sum.amountCents ?? 0
  const paymentDiscountCents = discounts._sum.discountCents ?? 0
  const packageDiscountCents = packageDiscounts._sum.discountCents ?? 0
  const productSaleDiscountCents = productSales.reduce((sum, sale) => sum + sale.discountCents, 0)
  const netRevenueCents = paidRevenueCents - refundsCents
  const productSalesRevenueCents = productSales
    .filter((sale) => sale.paymentStatus === ClinicPaymentStatus.PAID)
    .reduce((sum, sale) => sum + sale.totalCents, 0)
  const productSalesCostCents = productSales.reduce(
    (sum, sale) =>
      sum +
      sale.lines.reduce((lineSum, line) => lineSum + line.quantity * line.unitCostCents, 0),
    0
  )
  const procedureProfitability = buildProcedureProfitability(
    completedVisits.map((visit) => {
      const procedure = visit.appointment?.procedure
      const linkedPayments = [...(visit.appointment?.payments ?? []), ...visit.payments].filter(
        (payment) => !isProductSalePaymentReference(payment.reference)
      )
      return {
        procedureId: procedure?.id ?? null,
        procedureName: procedure?.name ?? 'Unassigned',
        durationMinutes: procedure?.defaultDurationMin ?? 0,
        expectedRevenueCents: procedure?.basePriceCents ?? 0,
        materials: procedure?.materials ?? [],
        payments: linkedPayments,
      }
    })
  )
  const procedureMaterialCostCents = procedureProfitability.reduce(
    (sum, row) => sum + row.materialCostCents,
    0
  )
  const processorFeeCents = processorFees._sum.processorFeeCents ?? 0
  const giftCardProcessorFeeCents = giftCardSales._sum.processorFeeCents ?? 0
  const directCostCents =
    procedureMaterialCostCents + productSalesCostCents + processorFeeCents + giftCardProcessorFeeCents
  const grossProfitCents = netRevenueCents - directCostCents
  const expensesCents = expenses._sum.amountCents ?? 0
  const profitCents = grossProfitCents - expensesCents
  const marginPct = netRevenueCents > 0 ? Number(((profitCents / netRevenueCents) * 100).toFixed(1)) : 0

  return NextResponse.json({
    range: { start: start.toISOString(), end: end.toISOString() },
    kpis: {
      paidRevenueCents,
      refundsCents,
      netRevenueCents,
      paymentDiscountCents,
      packageDiscountCents,
      productSaleDiscountCents,
      totalDiscountCents: paymentDiscountCents + packageDiscountCents + productSaleDiscountCents,
      productSalesRevenueCents,
      giftCardSalesCents: giftCardSales._sum.initialBalanceCents ?? 0,
      giftCardRedeemedCents: giftCardRedemptions._sum.amountCents ?? 0,
      giftCardOutstandingCents: giftCardOutstanding._sum.remainingBalanceCents ?? 0,
      procedureMaterialCostCents,
      productSalesCostCents,
      processorFeeCents,
      giftCardProcessorFeeCents,
      directCostCents,
      grossProfitCents,
      pendingCents: pending._sum.amountCents ?? 0,
      expensesCents,
      profitCents,
      marginPct,
      paidPayments: paid._count._all,
      refundedPayments: refunded._count._all,
      pendingPayments: pending._count._all,
      discountedPayments: discounts._count._all,
      discountedPackages: packageDiscounts._count._all,
      giftCardsSold: giftCardSales._count._all,
      giftCardsRedeemed: giftCardRedemptions._count._all,
      giftCardsOpen: giftCardOutstanding._count._all,
      expenseCount: expenses._count._all,
      completedVisits: completedVisits.length,
      productSales: productSales.length,
    },
    breakdown: {
      expensesByCategory: expenseBreakdown.map((row) => ({
        category: row.category,
        amountCents: row._sum.amountCents ?? 0,
      })),
      allExpenseCategories: Object.values(ExpenseCategory),
      procedureProfitability,
    },
    recentDiscounts: recentDiscounts.map((payment) => ({
      id: payment.id,
      amountCents: payment.amountCents,
      discountCents: payment.discountCents,
      discountName: payment.discountName,
      discountReason: payment.discountReason,
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt.toISOString(),
      patientName: `${payment.patient.lastName}, ${payment.patient.firstName}`.trim(),
    })),
    recentGiftCards: recentGiftCards.map((card) => ({
      ...card,
      purchasedAt: card.purchasedAt.toISOString(),
    })),
    recentExpenses: recentExpenses.map((expense) => ({
      ...expense,
      occurredAt: expense.occurredAt.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    })),
  })
}
