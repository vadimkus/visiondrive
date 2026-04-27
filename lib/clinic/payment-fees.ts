export const PAYMENT_FEE_METHODS = ['CASH', 'CARD', 'TRANSFER', 'POS', 'STRIPE', 'OTHER'] as const

export type PaymentFeeMethod = (typeof PAYMENT_FEE_METHODS)[number]

export type PaymentFeeRuleLike = {
  method: string
  percentBps: number
  fixedFeeCents: number
  active: boolean
}

export function normalizePaymentFeePercentBps(value: unknown) {
  const percentBps = Number(value)
  if (!Number.isFinite(percentBps) || percentBps < 0 || percentBps > 10_000) return null
  return Math.round(percentBps)
}

export function normalizePaymentFeeFixedCents(value: unknown) {
  const cents = Number(value)
  if (!Number.isFinite(cents) || cents < 0 || cents > 1_000_000_000) return null
  return Math.round(cents)
}

export function calculateProcessorFeeCents(
  amountCents: number,
  rule: Pick<PaymentFeeRuleLike, 'percentBps' | 'fixedFeeCents' | 'active'> | null | undefined
) {
  if (!rule?.active) return 0
  const amount = Math.max(0, Math.round(amountCents))
  const percentBps = Math.max(0, Math.round(rule.percentBps))
  const fixedFeeCents = Math.max(0, Math.round(rule.fixedFeeCents))
  return Math.min(amount, Math.round((amount * percentBps) / 10_000) + fixedFeeCents)
}

export function calculateProcessorFeeForPayment({
  amountCents,
  status,
  rule,
}: {
  amountCents: number
  status: string
  rule?: Pick<PaymentFeeRuleLike, 'percentBps' | 'fixedFeeCents' | 'active'> | null
}) {
  return status.toUpperCase() === 'PAID' ? calculateProcessorFeeCents(amountCents, rule) : 0
}

export function paymentFeeRuleSummary(rule: PaymentFeeRuleLike) {
  if (!rule.active) return 'Off'
  const percent = (rule.percentBps / 100).toFixed(2).replace(/\.00$/, '')
  const fixed = (rule.fixedFeeCents / 100).toFixed(2)
  if (rule.percentBps > 0 && rule.fixedFeeCents > 0) return `${percent}% + ${fixed}`
  if (rule.percentBps > 0) return `${percent}%`
  if (rule.fixedFeeCents > 0) return fixed
  return '0'
}
