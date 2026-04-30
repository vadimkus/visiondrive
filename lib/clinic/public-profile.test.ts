import { describe, expect, it } from 'vitest'
import {
  publicMediaUrl,
  publicReviewName,
  publicServicePolicyLabel,
  publicServicePrice,
} from './public-profile-format'

describe('public profile helpers', () => {
  it('anonymizes public review names', () => {
    expect(publicReviewName({ firstName: 'Leila', lastName: 'Haddad' })).toBe('Leila H.')
    expect(publicReviewName({ firstName: '', lastName: '' })).toBe('Client')
  })

  it('builds consent-gated public media URLs', () => {
    expect(publicMediaUrl('abc 123')).toBe('/api/public/clinic/media/abc%20123')
  })

  it('formats public service price and policy labels', () => {
    expect(publicServicePrice(45000, 'AED')).toBe('450 AED')
    expect(
      publicServicePolicyLabel({
        currency: 'AED',
        bookingPolicyType: 'DEPOSIT',
        depositAmountCents: 10000,
        depositPercent: 0,
      })
    ).toBe('Deposit 100 AED')
  })
})
