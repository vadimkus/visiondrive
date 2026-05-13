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

  it('combines same-time visit procedures into one timeline row', () => {
    const items = buildTimelineItems(
      [],
      [
        {
          id: 'visit-1',
          visitAt: '2026-05-12T14:17:00.000Z',
          status: 'COMPLETED',
          chiefComplaint: null,
          procedureSummary: 'Radiesse средняя треть и нижняя треть',
        },
        {
          id: 'visit-2',
          visitAt: '2026-05-12T14:17:00.000Z',
          status: 'COMPLETED',
          chiefComplaint: null,
          procedureSummary: 'Fibro NCT 135 HA лицо',
        },
      ],
      [],
      [],
      'ru-RU'
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      kind: 'visit',
      refId: undefined,
      label: 'Визит · Завершён',
      detail: 'Radiesse средняя треть и нижняя треть · Fibro NCT 135 HA лицо',
    })
  })

  it('shows pending visit charges as outstanding debt in Russian history', () => {
    const items = buildTimelineItems(
      [],
      [],
      [
        {
          id: 'charge-visit-1',
          paidAt: '2026-05-13T09:00:00.000Z',
          status: 'PENDING',
          amountCents: 80000,
          currency: 'AED',
          method: 'OTHER',
          reference: 'VISIT_CHARGE:visit-1',
        },
      ],
      [],
      'ru-RU'
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      kind: 'payment',
      label: 'Платёж · Ожидает оплаты',
      detail: 'Ожидает оплаты 800.00 AED · Долг 800.00 AED',
    })
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
