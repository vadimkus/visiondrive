import { describe, expect, it } from 'vitest'
import {
  calculateDiscountCents,
  discountRuleSummary,
  normalizeDiscountFixedCents,
  normalizeDiscountPercentBps,
  normalizeDiscountReason,
  normalizeDiscountRuleName,
  normalizeDiscountRuleType,
  validateDiscountApplication,
} from './discount-rules'

describe('clinic discount rules', () => {
  it('normalizes rule fields', () => {
    expect(normalizeDiscountRuleName('  Friend   referral  ')).toBe('Friend referral')
    expect(normalizeDiscountRuleName('')).toBeNull()
    expect(normalizeDiscountRuleType('fixed')).toBe('FIXED')
    expect(normalizeDiscountRuleType('bad')).toBeNull()
    expect(normalizeDiscountPercentBps(1500.4)).toBe(1500)
    expect(normalizeDiscountPercentBps(10_001)).toBeNull()
    expect(normalizeDiscountFixedCents(2500.2)).toBe(2500)
    expect(normalizeDiscountFixedCents(-1)).toBeNull()
    expect(normalizeDiscountReason('  launch   campaign  ')).toBe('launch campaign')
  })

  it('calculates percent and fixed discounts capped to base', () => {
    expect(calculateDiscountCents(10_000, { type: 'PERCENT', percentBps: 1500, fixedCents: 0, active: true })).toBe(1500)
    expect(calculateDiscountCents(10_000, { type: 'FIXED', percentBps: 0, fixedCents: 12_000, active: true })).toBe(10_000)
    expect(calculateDiscountCents(10_000, { type: 'PERCENT', percentBps: 5000, fixedCents: 0, active: false })).toBe(0)
  })

  it('summarizes rules compactly', () => {
    expect(discountRuleSummary({ type: 'PERCENT', percentBps: 1250, fixedCents: 0, active: true })).toBe('12.50%')
    expect(discountRuleSummary({ type: 'FIXED', percentBps: 0, fixedCents: 7500, active: true })).toBe('75.00')
    expect(discountRuleSummary({ type: 'PERCENT', percentBps: 0, fixedCents: 0, active: false })).toBe('Off')
  })

  it('requires reason when a discount is applied', () => {
    expect(validateDiscountApplication({ discountCents: 0, discountReason: null })).toBeNull()
    expect(validateDiscountApplication({ discountCents: 500, discountReason: '' })).toBe('discountReason is required when discount is applied')
    expect(validateDiscountApplication({ discountCents: 500, discountReason: 'birthday promo' })).toBeNull()
  })
})
