import { describe, expect, it } from 'vitest'
import { buildLoyaltyRows, loyaltyTier, summarizeLoyalty } from '@/lib/clinic/loyalty'

describe('loyalty helpers', () => {
  it('calculates spend, repeat visit, package, and referral points', () => {
    const rows = buildLoyaltyRows({
      patients: [
        {
          id: 'p1',
          firstName: 'Ladi',
          lastName: 'A',
          phone: '+971500000001',
          payments: [
            { amountCents: 100000, status: 'PAID' },
            { amountCents: 50000, status: 'PAID', reference: 'PACKAGE:pkg1' },
          ],
          appointments: [{ status: 'COMPLETED' }, { status: 'COMPLETED' }, { status: 'SCHEDULED' }],
          packages: [{ id: 'pkg1' }],
        },
      ],
      referralCounts: new Map([['p1', 2]]),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0].totalPoints).toBe(1900)
    expect(rows[0].tier).toBe('Gold')
    expect(rows[0].whatsappUrl).toContain('wa.me')
  })

  it('assigns tiers and summary counts', () => {
    expect(loyaltyTier(100)).toBe('Bronze')
    expect(loyaltyTier(500)).toBe('Silver')
    expect(loyaltyTier(1500)).toBe('Gold')
    expect(loyaltyTier(3000)).toBe('VIP')

    const rows = buildLoyaltyRows({
      patients: [
        { id: 'p1', firstName: 'A', lastName: 'One', payments: [{ amountCents: 300000, status: 'PAID' }] },
        { id: 'p2', firstName: 'B', lastName: 'Two', payments: [{ amountCents: 50000, status: 'PAID' }] },
      ],
    })

    expect(summarizeLoyalty(rows)).toMatchObject({ members: 2, vip: 1, totalPoints: 3500 })
  })
})
