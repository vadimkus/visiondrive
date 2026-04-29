import { describe, expect, it } from 'vitest'
import { ClinicSavedPaymentMethodStatus } from '@prisma/client'
import {
  normalizeCardLast4,
  normalizeSavedPaymentMethodProvider,
  normalizeSavedPaymentMethodStatus,
  parseSavedPaymentMethodInput,
  savedPaymentMethodDisplayName,
} from '@/lib/clinic/saved-payment-methods'

describe('saved payment methods', () => {
  it('normalizes provider and card tail safely', () => {
    expect(normalizeSavedPaymentMethodProvider(' Stripe UAE! ')).toBe('stripeuae')
    expect(normalizeCardLast4('**** 4242')).toBe('4242')
    expect(normalizeCardLast4('42')).toBeNull()
  })

  it('parses provider-ready metadata without raw card data', () => {
    const parsed = parseSavedPaymentMethodInput({
      provider: 'stripe',
      brand: ' Visa ',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2030',
      consentText: 'Client agreed to no-show card policy.',
    })

    expect(parsed).toEqual({
      value: {
        provider: 'stripe',
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2030,
        consentText: 'Client agreed to no-show card policy.',
        providerRef: null,
        note: null,
      },
    })
  })

  it('builds concise display labels', () => {
    expect(
      savedPaymentMethodDisplayName({
        brand: 'Mastercard',
        last4: '1881',
        expiryMonth: 4,
        expiryYear: 2029,
      })
    ).toBe('Mastercard ending 1881 exp 04/29')
  })

  it('defaults unknown statuses to active', () => {
    expect(normalizeSavedPaymentMethodStatus('revoked')).toBe(
      ClinicSavedPaymentMethodStatus.REVOKED
    )
    expect(normalizeSavedPaymentMethodStatus('bad')).toBe(
      ClinicSavedPaymentMethodStatus.ACTIVE
    )
  })
})
