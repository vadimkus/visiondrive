import { describe, expect, it } from 'vitest'
import {
  buildProcedureProfitability,
  materialCostPerVisit,
  paymentNetTotals,
} from './profitability'

describe('clinic profitability helpers', () => {
  it('calculates active BOM material cost per visit', () => {
    expect(
      materialCostPerVisit([
        { quantityPerVisit: 2, unitCostCents: 500, active: true },
        { quantityPerVisit: 1, unitCostCents: 1000, active: false },
        { quantityPerVisit: 3, unitCostCents: 250 },
      ])
    ).toBe(1750)
  })

  it('dedupes payment rows and calculates net revenue', () => {
    expect(
      paymentNetTotals([
        { id: 'p1', amountCents: 10000, status: 'PAID' },
        { id: 'p1', amountCents: 10000, status: 'PAID' },
        { id: 'p2', amountCents: 2500, processorFeeCents: 200, status: 'REFUNDED' },
        { id: 'p3', amountCents: 9999, status: 'PENDING' },
      ])
    ).toEqual({
      paidRevenueCents: 10000,
      refundsCents: 2500,
      processorFeeCents: 200,
      netRevenueCents: 7500,
    })
  })

  it('builds procedure-level profit, margin, and profit per hour', () => {
    const rows = buildProcedureProfitability([
      {
        procedureId: 'proc_1',
        procedureName: 'Facial',
        durationMinutes: 60,
        expectedRevenueCents: 50000,
        materials: [{ quantityPerVisit: 2, unitCostCents: 5000 }],
        payments: [{ amountCents: 50000, processorFeeCents: 1500, status: 'PAID' }],
      },
      {
        procedureId: 'proc_1',
        procedureName: 'Facial',
        durationMinutes: 30,
        expectedRevenueCents: 50000,
        materials: [{ quantityPerVisit: 1, unitCostCents: 5000 }],
        payments: [
          { amountCents: 25000, processorFeeCents: 750, status: 'PAID' },
          { amountCents: 5000, processorFeeCents: 150, status: 'REFUNDED' },
        ],
      },
    ])

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      visits: 2,
      totalMinutes: 90,
      expectedRevenueCents: 100000,
      netRevenueCents: 70000,
      materialCostCents: 15000,
      processorFeeCents: 2400,
      grossProfitCents: 52600,
      marginPct: 75.1,
      profitPerHourCents: 35067,
    })
  })
})
