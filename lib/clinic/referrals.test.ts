import { describe, expect, it } from 'vitest'
import {
  buildReferralSourceSummary,
  normalizeReferralNote,
  normalizeReferralRange,
  normalizeReferralText,
  referralPatientName,
  referralRangeStart,
} from './referrals'

describe('clinic referral tracking', () => {
  it('normalizes referral text and notes', () => {
    expect(normalizeReferralText('  Instagram   DM  ')).toBe('Instagram DM')
    expect(normalizeReferralText('')).toBeNull()
    expect(normalizeReferralNote('  reward after next visit  ')).toBe('reward after next visit')
  })

  it('normalizes report ranges and builds start dates', () => {
    const now = new Date('2026-04-28T00:00:00Z')

    expect(normalizeReferralRange('30d')).toBe('30d')
    expect(normalizeReferralRange('bad')).toBe('90d')
    expect(referralRangeStart('all', now)).toBeNull()
    expect(referralRangeStart('30d', now)?.toISOString().slice(0, 10)).toBe('2026-03-29')
  })

  it('summarizes referred patients by source', () => {
    const result = buildReferralSourceSummary([
      {
        id: 'p1',
        firstName: 'Amina',
        lastName: 'Saleh',
        createdAt: new Date(),
        referredByName: 'Nora',
        completedAppointments: 2,
      },
      {
        id: 'p2',
        firstName: 'Maya',
        lastName: 'Ali',
        createdAt: new Date(),
        referredByName: 'Nora',
        completedAppointments: 1,
      },
      {
        id: 'p3',
        firstName: 'Sara',
        lastName: 'Khan',
        createdAt: new Date(),
        referredByName: 'Instagram',
        completedAppointments: 0,
      },
      {
        id: 'p4',
        firstName: 'Lina',
        lastName: 'Omar',
        createdAt: new Date(),
        referredByName: null,
        completedAppointments: 5,
      },
    ])

    expect(result).toEqual([
      {
        sourceKey: 'nora',
        sourceLabel: 'Nora',
        referredPatients: 2,
        completedAppointments: 3,
      },
      {
        sourceKey: 'instagram',
        sourceLabel: 'Instagram',
        referredPatients: 1,
        completedAppointments: 0,
      },
    ])
  })

  it('formats patient names for reports', () => {
    expect(referralPatientName({ firstName: 'Amina', lastName: 'Saleh' })).toBe('Saleh, Amina')
  })
})
