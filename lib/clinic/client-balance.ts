import { isPackagePaymentReference } from './patient-packages'

export const CLIENT_BALANCE_BILLABLE_APPOINTMENT_STATUSES = ['ARRIVED', 'COMPLETED'] as const

export type ClientBalanceStatus = 'CLEAR' | 'DEBT' | 'CREDIT'

export type ClientBalancePayment = {
  amountCents: number
  currency?: string | null
  status: string
  reference?: string | null
  paidAt?: Date | string | null
}

export type ClientBalanceCharge = {
  expectedCents: number
  currency?: string | null
  payments?: ClientBalancePayment[]
}

export type ClientBalanceSummary = {
  currency: string
  expectedCents: number
  paidCents: number
  refundedCents: number
  pendingCents: number
  grossDueCents: number
  dueCents: number
  creditCents: number
  balanceCents: number
  status: ClientBalanceStatus
  lastPaymentAt: string | null
}

type AppointmentForBalance = {
  status: string
  procedure?: { basePriceCents: number; currency?: string | null } | null
  visits?: Array<{ payments?: ClientBalancePayment[] }>
}

function positiveCents(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
}

function normalizeCurrency(value: string | null | undefined) {
  return value?.trim().toUpperCase() || null
}

function paymentTotals(payments: ClientBalancePayment[]) {
  let paidCents = 0
  let refundedCents = 0
  let pendingCents = 0
  let lastPaymentAt: string | null = null

  for (const payment of payments) {
    const amountCents = positiveCents(payment.amountCents)
    const status = payment.status.toUpperCase()

    if (status === 'PAID') paidCents += amountCents
    if (status === 'REFUNDED') refundedCents += amountCents
    if (status === 'PENDING') pendingCents += amountCents

    if (payment.paidAt) {
      const paidAt = payment.paidAt instanceof Date ? payment.paidAt : new Date(payment.paidAt)
      if (!Number.isNaN(paidAt.getTime())) {
        const iso = paidAt.toISOString()
        if (!lastPaymentAt || iso > lastPaymentAt) lastPaymentAt = iso
      }
    }
  }

  return { paidCents, refundedCents, pendingCents, lastPaymentAt }
}

export function buildClientBalanceSummary({
  charges,
  standalonePayments = [],
  fallbackCurrency = 'AED',
}: {
  charges: ClientBalanceCharge[]
  standalonePayments?: ClientBalancePayment[]
  fallbackCurrency?: string
}): ClientBalanceSummary {
  let currency = normalizeCurrency(fallbackCurrency) ?? 'AED'
  let expectedCents = 0
  let paidCents = 0
  let refundedCents = 0
  let pendingCents = 0
  let grossDueCents = 0
  let rawCreditCents = 0
  let lastPaymentAt: string | null = null

  for (const charge of charges) {
    const chargeExpectedCents = positiveCents(charge.expectedCents)
    const payments = charge.payments ?? []
    const totals = paymentTotals(payments)
    const chargeCurrency =
      normalizeCurrency(charge.currency) ?? normalizeCurrency(payments[0]?.currency) ?? currency

    currency = chargeCurrency
    expectedCents += chargeExpectedCents
    paidCents += totals.paidCents
    refundedCents += totals.refundedCents
    pendingCents += totals.pendingCents

    const netPaidCents = totals.paidCents - totals.refundedCents
    grossDueCents += Math.max(chargeExpectedCents - netPaidCents, totals.pendingCents)
    rawCreditCents += Math.max(netPaidCents - chargeExpectedCents, 0)

    if (totals.lastPaymentAt && (!lastPaymentAt || totals.lastPaymentAt > lastPaymentAt)) {
      lastPaymentAt = totals.lastPaymentAt
    }
  }

  const balanceStandalonePayments = standalonePayments.filter(
    (payment) => !isPackagePaymentReference(payment.reference)
  )
  const standaloneTotals = paymentTotals(balanceStandalonePayments)
  paidCents += standaloneTotals.paidCents
  refundedCents += standaloneTotals.refundedCents
  pendingCents += standaloneTotals.pendingCents
  grossDueCents += standaloneTotals.pendingCents
  rawCreditCents += Math.max(standaloneTotals.paidCents - standaloneTotals.refundedCents, 0)

  const standaloneCurrency = normalizeCurrency(balanceStandalonePayments[0]?.currency)
  if (standaloneCurrency) currency = standaloneCurrency
  if (standaloneTotals.lastPaymentAt && (!lastPaymentAt || standaloneTotals.lastPaymentAt > lastPaymentAt)) {
    lastPaymentAt = standaloneTotals.lastPaymentAt
  }

  const dueCents = Math.max(grossDueCents - rawCreditCents, 0)
  const creditCents = Math.max(rawCreditCents - grossDueCents, 0)
  const balanceCents = creditCents - dueCents
  const status: ClientBalanceStatus = dueCents > 0 ? 'DEBT' : creditCents > 0 ? 'CREDIT' : 'CLEAR'

  return {
    currency,
    expectedCents,
    paidCents,
    refundedCents,
    pendingCents,
    grossDueCents,
    dueCents,
    creditCents,
    balanceCents,
    status,
    lastPaymentAt,
  }
}

export function buildClientBalanceChargesFromAppointments(
  appointments: AppointmentForBalance[]
): ClientBalanceCharge[] {
  return appointments
    .filter((appointment) =>
      CLIENT_BALANCE_BILLABLE_APPOINTMENT_STATUSES.includes(
        appointment.status as (typeof CLIENT_BALANCE_BILLABLE_APPOINTMENT_STATUSES)[number]
      )
    )
    .map((appointment) => ({
      expectedCents: appointment.procedure?.basePriceCents ?? 0,
      currency: appointment.procedure?.currency ?? null,
      payments: appointment.visits?.flatMap((visit) => visit.payments ?? []) ?? [],
    }))
}
