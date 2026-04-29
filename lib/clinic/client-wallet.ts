import type { ClientBalanceSummary } from './client-balance'

export const PATIENT_VISIBLE_QUOTE_STATUSES = ['SENT', 'ACCEPTED', 'EXPIRED'] as const

type WalletMoney = {
  amountCents?: number | null
  remainingBalanceCents?: number | null
  status?: string | null
}

type WalletPackage = {
  remainingSessions: number
  status?: string | null
}

type WalletSavedPaymentMethod = {
  status?: string | null
}

export function isPatientVisibleQuoteStatus(status: string | null | undefined) {
  return PATIENT_VISIBLE_QUOTE_STATUSES.includes(
    String(status || '').toUpperCase() as (typeof PATIENT_VISIBLE_QUOTE_STATUSES)[number]
  )
}

function positiveCents(value: number | null | undefined) {
  return Number.isFinite(value) && Number(value) > 0 ? Math.round(Number(value)) : 0
}

export function buildClientWalletOverview({
  clientBalance,
  pendingPayments = [],
  packages = [],
  giftCards = [],
  savedPaymentMethods = [],
}: {
  clientBalance: ClientBalanceSummary
  pendingPayments?: WalletMoney[]
  packages?: WalletPackage[]
  giftCards?: WalletMoney[]
  savedPaymentMethods?: WalletSavedPaymentMethod[]
}) {
  const pendingRequestCents = pendingPayments.reduce(
    (total, payment) => total + positiveCents(payment.amountCents),
    0
  )
  const activePackageSessions = packages
    .filter((pkg) => String(pkg.status || '').toUpperCase() === 'ACTIVE')
    .reduce((total, pkg) => total + Math.max(0, Math.round(pkg.remainingSessions)), 0)
  const activeGiftCardBalanceCents = giftCards
    .filter((card) => String(card.status || '').toUpperCase() === 'ACTIVE')
    .reduce((total, card) => total + positiveCents(card.remainingBalanceCents), 0)
  const activeSavedPaymentMethods = savedPaymentMethods.filter(
    (method) => String(method.status || '').toUpperCase() === 'ACTIVE'
  ).length

  return {
    currency: clientBalance.currency,
    dueCents: clientBalance.dueCents,
    creditCents: clientBalance.creditCents,
    pendingCents: Math.max(clientBalance.pendingCents, pendingRequestCents),
    pendingRequestCents,
    activePackageSessions,
    activeGiftCardBalanceCents,
    activeSavedPaymentMethods,
    status: clientBalance.status,
  }
}
