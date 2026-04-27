import { describe, expect, it } from 'vitest'
import {
  buildSupplierSettlementSummary,
  normalizeSupplierMoneyCents,
  normalizeSupplierName,
  normalizeSupplierText,
  supplierOrderReceivedCost,
} from './suppliers'

describe('supplier helpers', () => {
  it('normalizes supplier text fields', () => {
    expect(normalizeSupplierName('  Beauty Lab  ')).toBe('Beauty Lab')
    expect(normalizeSupplierText('  WhatsApp before delivery  ')).toBe('WhatsApp before delivery')
    expect(normalizeSupplierText('   ')).toBeNull()
  })

  it('validates money amounts in cents', () => {
    expect(normalizeSupplierMoneyCents(1299.4)).toBe(1299)
    expect(normalizeSupplierMoneyCents(-1)).toBeNull()
    expect(normalizeSupplierMoneyCents('bad')).toBeNull()
  })

  it('counts only received non-cancelled supplier cost as payable', () => {
    expect(
      supplierOrderReceivedCost({
        status: 'PARTIALLY_RECEIVED',
        lines: [
          { quantityOrdered: 10, quantityReceived: 6, unitCostCents: 1200 },
          { quantityOrdered: 3, quantityReceived: 0, unitCostCents: null },
        ],
      })
    ).toBe(7200)

    expect(
      supplierOrderReceivedCost({
        status: 'CANCELLED',
        lines: [{ quantityOrdered: 10, quantityReceived: 10, unitCostCents: 1200 }],
      })
    ).toBe(0)
  })

  it('builds settlement summary from purchase history and payments', () => {
    const summary = buildSupplierSettlementSummary(
      [
        {
          status: 'RECEIVED',
          lines: [
            { quantityOrdered: 5, quantityReceived: 5, unitCostCents: 1000 },
            { quantityOrdered: 2, quantityReceived: 1, unitCostCents: 500 },
          ],
        },
        {
          status: 'ORDERED',
          lines: [{ quantityOrdered: 10, quantityReceived: 0, unitCostCents: 200 }],
        },
      ],
      [{ amountCents: 3000 }, { amountCents: 500 }]
    )

    expect(summary).toEqual({
      orderedCents: 8000,
      receivedCents: 5500,
      paidCents: 3500,
      outstandingCents: 2000,
    })
  })
})
