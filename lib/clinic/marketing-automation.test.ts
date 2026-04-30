import { describe, expect, it } from 'vitest'
import { buildMarketingSegmentRows, normalizeMarketingSegment } from '@/lib/clinic/marketing-automation'

const now = new Date('2026-04-29T08:00:00.000Z')

describe('marketing automation helpers', () => {
  it('normalizes unknown segments to dormant', () => {
    expect(normalizeMarketingSegment('birthday')).toBe('birthday')
    expect(normalizeMarketingSegment('unknown')).toBe('dormant')
  })

  it('builds dormant rows only for clients without future appointments', () => {
    const rows = buildMarketingSegmentRows(
      [
        {
          id: 'p1',
          firstName: 'Ladi',
          lastName: 'A',
          phone: '+971500000001',
          appointments: [
            {
              startsAt: new Date('2026-01-01T08:00:00.000Z'),
              status: 'COMPLETED',
              procedure: { id: 'botox', name: 'Botox' },
            },
          ],
        },
        {
          id: 'p2',
          firstName: 'Future',
          lastName: 'Booked',
          appointments: [
            { startsAt: new Date('2026-01-01T08:00:00.000Z'), status: 'COMPLETED' },
            { startsAt: new Date('2026-05-01T08:00:00.000Z'), status: 'CONFIRMED' },
          ],
        },
      ],
      { segment: 'dormant', days: 60, now }
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].patientId).toBe('p1')
    expect(rows[0].message).toContain('Reply here')
    expect(rows[0].whatsappUrl).toContain('wa.me')
  })

  it('finds active package balances and builds Russian copy', () => {
    const rows = buildMarketingSegmentRows(
      [
        {
          id: 'p1',
          firstName: 'Лади',
          lastName: 'А',
          packages: [{ name: 'Botox course', status: 'ACTIVE', remainingSessions: 2 }],
        },
      ],
      { segment: 'package_balance', locale: 'ru', now }
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].packageRemainingSessions).toBe(2)
    expect(rows[0].message).toContain('осталось 2')
  })
})
