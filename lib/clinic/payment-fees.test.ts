import { describe, expect, it } from 'vitest'
import {
  calculateProcessorFeeCents,
  calculateProcessorFeeForPayment,
  normalizePaymentFeeFixedCents,
  normalizePaymentFeePercentBps,
  paymentFeeRuleSummary,
} from './payment-fees'

describe('payment fee rules', () => {
  it('normalizes fee rule inputs', () => {
    expect(normalizePaymentFeePercentBps(275)).toBe(275)
    expect(normalizePaymentFeePercentBps(-1)).toBeNull()
    expect(normalizePaymentFeePercentBps(10_001)).toBeNull()
    expect(normalizePaymentFeeFixedCents(150.2)).toBe(150)
    expect(normalizePaymentFeeFixedCents('bad')).toBeNull()
  })

  it('calculates percentage plus fixed processor fees', () => {
    expect(
      calculateProcessorFeeCents(10_000, {
        percentBps: 290,
        fixedFeeCents: 100,
        active: true,
      })
    ).toBe(390)
  })

  it('does not calculate fees for inactive or unpaid payments', () => {
    expect(calculateProcessorFeeCents(10_000, { percentBps: 300, fixedFeeCents: 0, active: false })).toBe(0)
    expect(
      calculateProcessorFeeForPayment({
        amountCents: 10_000,
        status: 'PENDING',
        rule: { percentBps: 300, fixedFeeCents: 0, active: true },
      })
    ).toBe(0)
  })

  it('formats a compact rule summary', () => {
    expect(paymentFeeRuleSummary({ method: 'CARD', percentBps: 275, fixedFeeCents: 100, active: true })).toBe('2.75% + 1.00')
    expect(paymentFeeRuleSummary({ method: 'CASH', percentBps: 0, fixedFeeCents: 0, active: false })).toBe('Off')
  })
})
