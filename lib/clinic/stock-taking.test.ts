import { describe, expect, it } from 'vitest'
import {
  isVarianceReasonRequired,
  normalizeCountedQuantity,
  normalizeVarianceReason,
  stockVarianceQuantity,
} from './stock-taking'

describe('stock-taking helpers', () => {
  it('normalizes counted quantities as non-negative integers', () => {
    expect(normalizeCountedQuantity('12')).toBe(12)
    expect(normalizeCountedQuantity(0)).toBe(0)
    expect(normalizeCountedQuantity('')).toBeNull()
    expect(normalizeCountedQuantity(-1)).toBeNull()
    expect(normalizeCountedQuantity(1.5)).toBeNull()
  })

  it('calculates signed variance from expected and counted quantities', () => {
    expect(stockVarianceQuantity(10, 7)).toBe(-3)
    expect(stockVarianceQuantity(10, 13)).toBe(3)
    expect(stockVarianceQuantity(10, null)).toBe(0)
  })

  it('normalizes allowed variance reasons', () => {
    expect(normalizeVarianceReason('lost')).toBe('LOST')
    expect(normalizeVarianceReason('EXPIRED')).toBe('EXPIRED')
    expect(normalizeVarianceReason('unknown')).toBeNull()
  })

  it('requires a reason only when variance exists', () => {
    expect(isVarianceReasonRequired(0)).toBe(false)
    expect(isVarianceReasonRequired(-1)).toBe(true)
    expect(isVarianceReasonRequired(1)).toBe(true)
  })
})
