import { ClinicGiftCardStatus, ClinicPaymentStatus } from '@prisma/client'

export const GIFT_CARD_PAYMENT_REFERENCE_PREFIX = 'GIFT_CARD:'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function giftCardPaymentReference(giftCardId: string) {
  return `${GIFT_CARD_PAYMENT_REFERENCE_PREFIX}${giftCardId}`
}

export function isGiftCardPaymentReference(reference: string | null | undefined) {
  return !!reference?.startsWith(GIFT_CARD_PAYMENT_REFERENCE_PREFIX)
}

export function normalizeGiftCardCode(value: unknown) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 32)
}

export function generateGiftCardCode(random = Math.random) {
  let suffix = ''
  for (let i = 0; i < 8; i += 1) {
    suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)] ?? 'X'
  }
  return `GC-${suffix}`
}

export function normalizeGiftCardAmountCents(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed)
}

export function deriveGiftCardStatus({
  paymentStatus,
  remainingBalanceCents,
  expiresAt,
}: {
  paymentStatus: ClinicPaymentStatus | string
  remainingBalanceCents: number
  expiresAt?: Date | string | null
}) {
  if (String(paymentStatus).toUpperCase() !== ClinicPaymentStatus.PAID) {
    return ClinicGiftCardStatus.PENDING
  }
  if (remainingBalanceCents <= 0) return ClinicGiftCardStatus.REDEEMED
  if (expiresAt) {
    const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return ClinicGiftCardStatus.EXPIRED
    }
  }
  return ClinicGiftCardStatus.ACTIVE
}

export function validateGiftCardRedemption({
  amountCents,
  remainingBalanceCents,
  status,
  expiresAt,
}: {
  amountCents: number
  remainingBalanceCents: number
  status: ClinicGiftCardStatus | string
  expiresAt?: Date | string | null
}) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return 'amountCents must be a positive integer'
  }
  if (String(status).toUpperCase() !== ClinicGiftCardStatus.ACTIVE) {
    return 'Gift card is not active'
  }
  if (expiresAt) {
    const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return 'Gift card is expired'
    }
  }
  if (amountCents > remainingBalanceCents) {
    return 'Gift card balance is too low'
  }
  return null
}
