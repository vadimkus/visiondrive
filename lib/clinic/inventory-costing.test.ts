import { describe, expect, it } from 'vitest'
import {
  fifoCostForConsumption,
  parseInventoryCostMeta,
  stripInventoryCostMeta,
  withFifoCostMeta,
  withReceiptCostMeta,
} from './inventory-costing'

describe('inventory costing', () => {
  it('stores receipt cost metadata outside visible notes', () => {
    const note = withReceiptCostMeta('PO receive', 3, 1250)
    expect(stripInventoryCostMeta(note)).toBe('PO receive')
    expect(parseInventoryCostMeta(note)).toEqual({
      method: 'RECEIPT',
      quantity: 3,
      unitCostCents: 1250,
      totalCostCents: 3750,
      layers: undefined,
    })
  })

  it('calculates FIFO cost after previous receipts and write-offs', async () => {
    const firstReceipt = withReceiptCostMeta('R1', 5, 100)
    const secondReceipt = withReceiptCostMeta('R2', 5, 200)
    const firstWriteOff = withFifoCostMeta('C1', {
      quantity: 3,
      unitCostCents: 100,
      totalCostCents: 300,
      layers: [{ quantity: 3, unitCostCents: 100 }],
    })
    const tx = {
      clinicStockMovement: {
        findMany: async () => [
          { quantityDelta: 5, note: firstReceipt },
          { quantityDelta: 5, note: secondReceipt },
          { quantityDelta: -3, note: firstWriteOff },
        ],
      },
    }

    const fifo = await fifoCostForConsumption(tx as never, {
      tenantId: 'tenant',
      stockItemId: 'item',
      quantity: 4,
    })

    expect(fifo).toEqual({
      quantity: 4,
      unitCostCents: 150,
      totalCostCents: 600,
      layers: [
        { quantity: 2, unitCostCents: 100 },
        { quantity: 2, unitCostCents: 200 },
      ],
    })
  })
})
