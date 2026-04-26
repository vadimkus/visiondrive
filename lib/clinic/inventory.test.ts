import { describe, expect, it } from 'vitest'
import { isClinicStockLow } from '@/lib/clinic/inventory'

describe('isClinicStockLow', () => {
  it('is false when reorderPoint is 0', () => {
    expect(isClinicStockLow({ active: true, quantityOnHand: 0, reorderPoint: 0 })).toBe(false)
  })

  it('is true when at threshold', () => {
    expect(isClinicStockLow({ active: true, quantityOnHand: 3, reorderPoint: 5 })).toBe(true)
  })

  it('is false when above threshold', () => {
    expect(isClinicStockLow({ active: true, quantityOnHand: 10, reorderPoint: 5 })).toBe(false)
  })

  it('is false when inactive', () => {
    expect(isClinicStockLow({ active: false, quantityOnHand: 0, reorderPoint: 5 })).toBe(false)
  })
})
