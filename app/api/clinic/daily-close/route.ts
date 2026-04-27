import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus, ClinicDailyCloseStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  DAILY_CLOSE_PAYMENT_METHODS,
  buildDailyCloseSummary,
  businessDateFromInput,
  businessDayRange,
  emptyDailyCloseMethodTotals,
  formatBusinessDate,
  normalizeDailyCloseCents,
  type DailyClosePaymentMethod,
} from '@/lib/clinic/daily-close'
import { getClinicSession } from '@/lib/clinic/session'

function countedFromClose(close: {
  countedCashCents: number
  countedCardCents: number
  countedTransferCents: number
  countedPosCents: number
  countedStripeCents: number
  countedOtherCents: number
}) {
  return {
    CASH: close.countedCashCents,
    CARD: close.countedCardCents,
    TRANSFER: close.countedTransferCents,
    POS: close.countedPosCents,
    STRIPE: close.countedStripeCents,
    OTHER: close.countedOtherCents,
  }
}

function countedFromBody(input: unknown) {
  const totals = emptyDailyCloseMethodTotals()
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  for (const method of DAILY_CLOSE_PAYMENT_METHODS) {
    totals[method] = normalizeDailyCloseCents(source[method])
  }
  return totals
}

function closeToJson(close: Awaited<ReturnType<typeof prisma.clinicDailyClose.findFirst>>) {
  if (!close) return null
  return {
    id: close.id,
    businessDate: formatBusinessDate(close.businessDate),
    status: close.status,
    expectedByMethod: {
      CASH: close.expectedCashCents,
      CARD: close.expectedCardCents,
      TRANSFER: close.expectedTransferCents,
      POS: close.expectedPosCents,
      STRIPE: close.expectedStripeCents,
      OTHER: close.expectedOtherCents,
    },
    countedByMethod: countedFromClose(close),
    discrepancyByMethod: {
      CASH: close.discrepancyCashCents,
      CARD: close.discrepancyCardCents,
      TRANSFER: close.discrepancyTransferCents,
      POS: close.discrepancyPosCents,
      STRIPE: close.discrepancyStripeCents,
      OTHER: close.discrepancyOtherCents,
    },
    paidTotalCents: close.paidTotalCents,
    refundedTotalCents: close.refundedTotalCents,
    pendingTotalCents: close.pendingTotalCents,
    processorFeeCents: close.processorFeeCents,
    appointmentCount: close.appointmentCount,
    paymentCount: close.paymentCount,
    note: close.note,
    finalizedAt: close.finalizedAt?.toISOString() ?? null,
    createdAt: close.createdAt.toISOString(),
    updatedAt: close.updatedAt.toISOString(),
  }
}

async function buildDailyCloseForDate(tenantId: string, businessDate: Date, countedByMethod = emptyDailyCloseMethodTotals()) {
  const { start, end } = businessDayRange(businessDate)
  const [payments, appointmentCount] = await Promise.all([
    prisma.clinicPatientPayment.findMany({
      where: {
        tenantId,
        paidAt: { gte: start, lt: end },
      },
      select: {
        amountCents: true,
        processorFeeCents: true,
        method: true,
        status: true,
      },
    }),
    prisma.clinicAppointment.count({
      where: {
        tenantId,
        startsAt: { gte: start, lt: end },
        status: {
          notIn: [ClinicAppointmentStatus.CANCELLED, ClinicAppointmentStatus.NO_SHOW],
        },
      },
    }),
  ])

  return buildDailyCloseSummary(payments, countedByMethod, appointmentCount)
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const businessDate = businessDateFromInput(searchParams.get('date'))
  if (!businessDate) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const [close, recentCloses] = await Promise.all([
    prisma.clinicDailyClose.findFirst({
      where: {
        tenantId: session.tenantId,
        businessDate,
      },
    }),
    prisma.clinicDailyClose.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { businessDate: 'desc' },
      take: 8,
    }),
  ])

  const summary = await buildDailyCloseForDate(
    session.tenantId,
    businessDate,
    close ? countedFromClose(close) : emptyDailyCloseMethodTotals()
  )

  return NextResponse.json({
    businessDate: formatBusinessDate(businessDate),
    methods: DAILY_CLOSE_PAYMENT_METHODS,
    summary,
    close: closeToJson(close),
    recentCloses: recentCloses.map(closeToJson).filter(Boolean),
  })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const businessDate = businessDateFromInput(typeof body.date === 'string' ? body.date : null)
  if (!businessDate) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const existing = await prisma.clinicDailyClose.findFirst({
    where: {
      tenantId: session.tenantId,
      businessDate,
    },
  })

  if (existing?.status === ClinicDailyCloseStatus.FINALIZED) {
    return NextResponse.json({ error: 'Daily close is already finalized' }, { status: 409 })
  }

  const countedByMethod = countedFromBody(body.countedByMethod)
  const summary = await buildDailyCloseForDate(session.tenantId, businessDate, countedByMethod)
  const note = typeof body.note === 'string' ? body.note.trim() || null : null
  const shouldFinalize = body.status === ClinicDailyCloseStatus.FINALIZED || body.finalize === true
  const status = shouldFinalize ? ClinicDailyCloseStatus.FINALIZED : ClinicDailyCloseStatus.DRAFT
  const finalizedAt = shouldFinalize ? new Date() : null

  const data = {
    status,
    expectedCashCents: summary.expectedByMethod.CASH,
    expectedCardCents: summary.expectedByMethod.CARD,
    expectedTransferCents: summary.expectedByMethod.TRANSFER,
    expectedPosCents: summary.expectedByMethod.POS,
    expectedStripeCents: summary.expectedByMethod.STRIPE,
    expectedOtherCents: summary.expectedByMethod.OTHER,
    countedCashCents: summary.countedByMethod.CASH,
    countedCardCents: summary.countedByMethod.CARD,
    countedTransferCents: summary.countedByMethod.TRANSFER,
    countedPosCents: summary.countedByMethod.POS,
    countedStripeCents: summary.countedByMethod.STRIPE,
    countedOtherCents: summary.countedByMethod.OTHER,
    discrepancyCashCents: summary.discrepancyByMethod.CASH,
    discrepancyCardCents: summary.discrepancyByMethod.CARD,
    discrepancyTransferCents: summary.discrepancyByMethod.TRANSFER,
    discrepancyPosCents: summary.discrepancyByMethod.POS,
    discrepancyStripeCents: summary.discrepancyByMethod.STRIPE,
    discrepancyOtherCents: summary.discrepancyByMethod.OTHER,
    paidTotalCents: summary.paidTotalCents,
    refundedTotalCents: summary.refundedTotalCents,
    pendingTotalCents: summary.pendingTotalCents,
    processorFeeCents: summary.processorFeeCents,
    appointmentCount: summary.appointmentCount,
    paymentCount: summary.paymentCount,
    note,
    finalizedAt,
    finalizedByUserId: shouldFinalize ? session.userId : null,
  }

  const close = await prisma.clinicDailyClose.upsert({
    where: {
      tenantId_businessDate: {
        tenantId: session.tenantId,
        businessDate,
      },
    },
    create: {
      tenantId: session.tenantId,
      businessDate,
      createdByUserId: session.userId,
      ...data,
    },
    update: data,
  })

  return NextResponse.json({
    businessDate: formatBusinessDate(businessDate),
    methods: DAILY_CLOSE_PAYMENT_METHODS,
    summary,
    close: closeToJson(close),
  })
}
