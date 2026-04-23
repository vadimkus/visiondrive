import { describe, expect, it } from 'vitest'
import { buildTimelineItems, filterTimelineItems } from '@/lib/clinic/timeline'

describe('buildTimelineItems', () => {
  it('merges and sorts newest first', () => {
    const items = buildTimelineItems(
      [
        {
          startsAt: '2026-01-02T10:00:00.000Z',
          status: 'SCHEDULED',
          titleOverride: null,
          procedure: { name: 'Facial' },
        },
      ],
      [
        {
          visitAt: '2026-01-10T12:00:00.000Z',
          status: 'COMPLETED',
          chiefComplaint: null,
          procedureSummary: 'Follow-up',
        },
      ],
      [
        {
          paidAt: '2026-01-05T12:00:00.000Z',
          status: 'PAID',
          amountCents: 45000,
          currency: 'AED',
          method: 'CARD',
        },
      ],
      [
        {
          occurredAt: '2026-01-03T09:00:00.000Z',
          type: 'WHATSAPP',
          body: 'Confirmed time',
        },
      ],
      'en-GB'
    )
    expect(items[0].kind).toBe('visit')
    expect(items[1].kind).toBe('payment')
    expect(items.length).toBe(4)
  })
})

describe('filterTimelineItems', () => {
  it('filters by kind', () => {
    const items = buildTimelineItems(
      [{ startsAt: '2026-01-02T10:00:00.000Z', status: 'SCHEDULED', titleOverride: null, procedure: null }],
      [{ visitAt: '2026-01-10T12:00:00.000Z', status: 'COMPLETED', chiefComplaint: 'x', procedureSummary: null }],
      [],
      [],
      'en-GB'
    )
    const appts = filterTimelineItems(items, 'appointment')
    expect(appts.length).toBe(1)
    expect(appts[0].kind).toBe('appointment')
  })
})
