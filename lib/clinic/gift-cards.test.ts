import { ClinicGiftCardStatus, ClinicPaymentStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  deriveGiftCardStatus,
  generateGiftCardCode,
  giftCardPaymentReference,
  isGiftCardPaymentReference,
  normalizeGiftCardAmountCents,
  normalizeGiftCardCode,
  validateGiftCardRedemption,
} from './gift-cards'

describe('clinic gift cards', () => {
  it('normalizes and generates gift card codes', () => {
    expect(normalizeGiftCardCode(' gc 123 !@# ')).toBe('GC123')
    expect(generateGiftCardCode(() => 0)).toBe('GC-AAAAAAAA')
  })

  it('normalizes gift card amounts in cents', () => {
    expect(normalizeGiftCardAmountCents(15000.4)).toBe(15000)
    expect(normalizeGiftCardAmountCents(-1)).toBe(0)
    expect(normalizeGiftCardAmountCents('bad')).toBe(0)
  })

  it('identifies gift card payment references', () => {
    const reference = giftCardPaymentReference('gift_123')
    expect(reference).toBe('GIFT_CARD:gift_123')
    expect(isGiftCardPaymentReference(reference)).toBe(true)
    expect(isGiftCardPaymentReference('PACKAGE:abc')).toBe(false)
  })

  it('derives status from payment, balance, and expiry', () => {
    expect(
      deriveGiftCardStatus({
        paymentStatus: ClinicPaymentStatus.PENDING,
        remainingBalanceCents: 1000,
      })
    ).toBe(ClinicGiftCardStatus.PENDING)
    expect(
      deriveGiftCardStatus({
        paymentStatus: ClinicPaymentStatus.PAID,
        remainingBalanceCents: 0,
      })
    ).toBe(ClinicGiftCardStatus.REDEEMED)
    expect(
      deriveGiftCardStatus({
        paymentStatus: ClinicPaymentStatus.PAID,
        remainingBalanceCents: 1000,
        expiresAt: new Date(Date.now() - 1000),
      })
    ).toBe(ClinicGiftCardStatus.EXPIRED)
    expect(
      deriveGiftCardStatus({
        paymentStatus: ClinicPaymentStatus.PAID,
        remainingBalanceCents: 1000,
      })
    ).toBe(ClinicGiftCardStatus.ACTIVE)
  })

  it('validates redemption amount and available balance', () => {
    expect(
      validateGiftCardRedemption({
        amountCents: 500,
        remainingBalanceCents: 1000,
        status: ClinicGiftCardStatus.ACTIVE,
      })
    ).toBeNull()
    expect(
      validateGiftCardRedemption({
        amountCents: 1500,
        remainingBalanceCents: 1000,
        status: ClinicGiftCardStatus.ACTIVE,
      })
    ).toBe('Gift card balance is too low')
    expect(
      validateGiftCardRedemption({
        amountCents: 500,
        remainingBalanceCents: 1000,
        status: ClinicGiftCardStatus.PENDING,
      })
    ).toBe('Gift card is not active')
  })
})
