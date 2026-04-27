import { describe, expect, it } from 'vitest'
import {
  materialLineCostCents,
  normalizeMaterialQuantity,
  normalizeUnitCostCents,
  procedureMaterialCostCents,
} from './procedure-materials'

describe('procedure materials', () => {
  it('normalizes material quantities and costs', () => {
    expect(normalizeMaterialQuantity('0')).toBe(1)
    expect(normalizeMaterialQuantity('3.8')).toBe(3)
    expect(normalizeMaterialQuantity('bad', 2)).toBe(2)
    expect(normalizeUnitCostCents('-1')).toBe(0)
    expect(normalizeUnitCostCents('123.6')).toBe(124)
  })

  it('computes active line and procedure material cost', () => {
    expect(materialLineCostCents({ quantityPerVisit: 3, unitCostCents: 250 })).toBe(750)
    expect(materialLineCostCents({ quantityPerVisit: 3, unitCostCents: 250, active: false })).toBe(0)
    expect(
      procedureMaterialCostCents([
        { quantityPerVisit: 2, unitCostCents: 100 },
        { quantityPerVisit: 1, unitCostCents: 50 },
        { quantityPerVisit: 99, unitCostCents: 500, active: false },
      ])
    ).toBe(250)
  })
})
