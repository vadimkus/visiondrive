import { describe, expect, it } from 'vitest'
import {
  canVoidPayment,
  isRefundPaymentReference,
  normalizeCorrectionAmountCents,
  normalizeCorrectionNote,
  normalizeCorrectionReason,
  paymentRefundReference,
  refundableCentsForPayment,
  refundedCentsForPayment,
} from './payment-corrections'

describe('payment corrections', () => {
  it('builds and detects refund adjustment references', () => {
    expect(paymentRefundReference('pay_123')).toBe('REFUND:pay_123')
    expect(isRefundPaymentReference('REFUND:pay_123')).toBe(true)
    expect(isRefundPaymentReference('PRODUCT_SALE:abc')).toBe(false)
  })

  it('normalizes correction reason, note, and amount', () => {
    expect(normalizeCorrectionReason('  duplicate charge  ')).toBe('duplicate charge')
    expect(normalizeCorrectionReason('')).toBeNull()
    expect(normalizeCorrectionNote('  extra context  ')).toBe('extra context')
    expect(normalizeCorrectionNote('')).toBeNull()
    expect(normalizeCorrectionAmountCents(1234.4)).toBe(1234)
    expect(normalizeCorrectionAmountCents(0)).toBeNull()
    expect(normalizeCorrectionAmountCents('abc')).toBeNull()
  })

  it('calculates remaining refundable amount from correction records', () => {
    const payment = {
      amountCents: 10000,
      status: 'PAID',
      correctionsAsOriginal: [
        { type: 'REFUND' as const, amountCents: 2500 },
        { type: 'REFUND' as const, amountCents: 1000 },
        { type: 'VOID' as const, amountCents: 0 },
      ],
    }

    expect(refundedCentsForPayment(payment)).toBe(3500)
    expect(refundableCentsForPayment(payment)).toBe(6500)
    expect(canVoidPayment(payment)).toBe(false)
  })

  it('does not refund non-paid payments', () => {
    expect(refundableCentsForPayment({ amountCents: 10000, status: 'PENDING' })).toBe(0)
    expect(canVoidPayment({ amountCents: 10000, status: 'PENDING' })).toBe(true)
  })
})
