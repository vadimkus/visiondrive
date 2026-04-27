export const DAILY_CLOSE_PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER', 'POS', 'STRIPE', 'OTHER'] as const

export type DailyClosePaymentMethod = (typeof DAILY_CLOSE_PAYMENT_METHODS)[number]
export type DailyClosePaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'VOID'

export type DailyClosePaymentLike = {
  amountCents: number
  processorFeeCents?: number | null
  method: DailyClosePaymentMethod
  status: DailyClosePaymentStatus
}

export type DailyCloseMethodTotals = Record<DailyClosePaymentMethod, number>

export type DailyCloseSummary = {
  expectedByMethod: DailyCloseMethodTotals
  countedByMethod: DailyCloseMethodTotals
  discrepancyByMethod: DailyCloseMethodTotals
  expectedTotalCents: number
  countedTotalCents: number
  discrepancyTotalCents: number
  paidTotalCents: number
  refundedTotalCents: number
  pendingTotalCents: number
  processorFeeCents: number
  paymentCount: number
  appointmentCount: number
}

export function emptyDailyCloseMethodTotals(): DailyCloseMethodTotals {
  return DAILY_CLOSE_PAYMENT_METHODS.reduce((acc, method) => {
    acc[method] = 0
    return acc
  }, {} as DailyCloseMethodTotals)
}

export function normalizeDailyCloseCents(input: unknown) {
  const value = typeof input === 'string' ? Number(input.replace(/,/g, '.')) : Number(input)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export function businessDateFromInput(input: string | null | undefined, now = new Date()) {
  const raw = input?.trim()
  if (!raw) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

export function businessDayRange(businessDate: Date) {
  const start = new Date(
    Date.UTC(businessDate.getUTCFullYear(), businessDate.getUTCMonth(), businessDate.getUTCDate())
  )
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

export function formatBusinessDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function buildDailyCloseSummary(
  payments: DailyClosePaymentLike[],
  countedInput: Partial<Record<DailyClosePaymentMethod, number>> = {},
  appointmentCount = 0
): DailyCloseSummary {
  const expectedByMethod = emptyDailyCloseMethodTotals()
  const countedByMethod = emptyDailyCloseMethodTotals()
  const discrepancyByMethod = emptyDailyCloseMethodTotals()
  let paidTotalCents = 0
  let refundedTotalCents = 0
  let pendingTotalCents = 0
  let processorFeeCents = 0
  let paymentCount = 0

  for (const method of DAILY_CLOSE_PAYMENT_METHODS) {
    countedByMethod[method] = normalizeDailyCloseCents(countedInput[method] ?? 0)
  }

  for (const payment of payments) {
    if (!DAILY_CLOSE_PAYMENT_METHODS.includes(payment.method)) continue
    if (payment.status === 'PAID') {
      expectedByMethod[payment.method] += payment.amountCents
      paidTotalCents += payment.amountCents
      processorFeeCents += payment.processorFeeCents ?? 0
      paymentCount += 1
    } else if (payment.status === 'REFUNDED') {
      expectedByMethod[payment.method] -= payment.amountCents
      refundedTotalCents += payment.amountCents
      processorFeeCents += payment.processorFeeCents ?? 0
      paymentCount += 1
    } else if (payment.status === 'PENDING') {
      pendingTotalCents += payment.amountCents
      paymentCount += 1
    }
  }

  let expectedTotalCents = 0
  let countedTotalCents = 0
  let discrepancyTotalCents = 0

  for (const method of DAILY_CLOSE_PAYMENT_METHODS) {
    const discrepancy = countedByMethod[method] - expectedByMethod[method]
    discrepancyByMethod[method] = discrepancy
    expectedTotalCents += expectedByMethod[method]
    countedTotalCents += countedByMethod[method]
    discrepancyTotalCents += discrepancy
  }

  return {
    expectedByMethod,
    countedByMethod,
    discrepancyByMethod,
    expectedTotalCents,
    countedTotalCents,
    discrepancyTotalCents,
    paidTotalCents,
    refundedTotalCents,
    pendingTotalCents,
    processorFeeCents,
    paymentCount,
    appointmentCount,
  }
}
