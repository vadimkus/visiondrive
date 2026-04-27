import { describe, expect, it } from 'vitest'
import {
  buildDailyCloseSummary,
  businessDateFromInput,
  businessDayRange,
  formatBusinessDate,
  normalizeDailyCloseCents,
} from './daily-close'

describe('daily close helpers', () => {
  it('normalizes counted money safely', () => {
    expect(normalizeDailyCloseCents(1234.4)).toBe(1234)
    expect(normalizeDailyCloseCents('1200.6')).toBe(1201)
    expect(normalizeDailyCloseCents('-20')).toBe(0)
    expect(normalizeDailyCloseCents('abc')).toBe(0)
  })

  it('parses business dates and builds a full UTC day range', () => {
    const date = businessDateFromInput('2026-04-27')
    expect(date).not.toBeNull()
    expect(formatBusinessDate(date!)).toBe('2026-04-27')
    expect(businessDayRange(date!).start.toISOString()).toBe('2026-04-27T00:00:00.000Z')
    expect(businessDayRange(date!).end.toISOString()).toBe('2026-04-28T00:00:00.000Z')
    expect(businessDateFromInput('2026-02-31')).toBeNull()
  })

  it('builds net expected totals and discrepancies by payment method', () => {
    const summary = buildDailyCloseSummary(
      [
        { amountCents: 10000, processorFeeCents: 300, method: 'CASH', status: 'PAID' },
        { amountCents: 5000, processorFeeCents: 175, method: 'CARD', status: 'PAID' },
        { amountCents: 1000, processorFeeCents: 0, method: 'CARD', status: 'REFUNDED' },
        { amountCents: 7000, processorFeeCents: 0, method: 'TRANSFER', status: 'PENDING' },
        { amountCents: 9999, processorFeeCents: 0, method: 'OTHER', status: 'VOID' },
      ],
      {
        CASH: 10000,
        CARD: 4500,
      },
      3
    )

    expect(summary.expectedByMethod.CASH).toBe(10000)
    expect(summary.expectedByMethod.CARD).toBe(4000)
    expect(summary.expectedTotalCents).toBe(14000)
    expect(summary.countedTotalCents).toBe(14500)
    expect(summary.discrepancyByMethod.CARD).toBe(500)
    expect(summary.discrepancyTotalCents).toBe(500)
    expect(summary.paidTotalCents).toBe(15000)
    expect(summary.refundedTotalCents).toBe(1000)
    expect(summary.pendingTotalCents).toBe(7000)
    expect(summary.processorFeeCents).toBe(475)
    expect(summary.paymentCount).toBe(4)
    expect(summary.appointmentCount).toBe(3)
  })
})
