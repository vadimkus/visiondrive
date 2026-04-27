export const PAYMENT_REFUND_REFERENCE_PREFIX = 'REFUND:'

export type PaymentCorrectionType = 'REFUND' | 'VOID'

export type PaymentCorrectionLike = {
  type: PaymentCorrectionType
  amountCents: number
}

export type PaymentCorrectionPaymentLike = {
  amountCents: number
  status: string
  correctionsAsOriginal?: PaymentCorrectionLike[] | null
}

export function paymentRefundReference(paymentId: string) {
  return `${PAYMENT_REFUND_REFERENCE_PREFIX}${paymentId}`
}

export function isRefundPaymentReference(reference: string | null | undefined) {
  return Boolean(reference?.startsWith(PAYMENT_REFUND_REFERENCE_PREFIX))
}

export function normalizeCorrectionReason(input: unknown) {
  const reason = typeof input === 'string' ? input.trim() : ''
  return reason.length > 0 ? reason.slice(0, 240) : null
}

export function normalizeCorrectionNote(input: unknown) {
  const note = typeof input === 'string' ? input.trim() : ''
  return note.length > 0 ? note.slice(0, 2000) : null
}

export function normalizeCorrectionAmountCents(input: unknown) {
  const value = Number(input)
  if (!Number.isFinite(value)) return null
  const cents = Math.round(value)
  return cents > 0 ? cents : null
}

export function refundedCentsForPayment(payment: PaymentCorrectionPaymentLike) {
  return (payment.correctionsAsOriginal ?? [])
    .filter((correction) => correction.type === 'REFUND')
    .reduce((sum, correction) => sum + Math.max(0, Math.round(correction.amountCents)), 0)
}

export function refundableCentsForPayment(payment: PaymentCorrectionPaymentLike) {
  if (payment.status !== 'PAID') return 0
  return Math.max(0, Math.round(payment.amountCents) - refundedCentsForPayment(payment))
}

export function canVoidPayment(payment: PaymentCorrectionPaymentLike) {
  return payment.status !== 'VOID' && refundedCentsForPayment(payment) === 0
}
