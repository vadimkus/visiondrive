import { describe, expect, it } from 'vitest'
import { buildPriceQuoteMessage, normalizeQuoteLine } from './price-quotes'
import { buildPriceQuotePdf } from './price-quote-pdf'

describe('price quotes', () => {
  it('normalizes lines and totals', () => {
    expect(
      normalizeQuoteLine({
        description: ' Consultation ',
        quantity: 2.2,
        unitPriceCents: 12550.4,
      })
    ).toMatchObject({
      description: 'Consultation',
      quantity: 2,
      unitPriceCents: 12550,
      totalCents: 25100,
    })
  })

  it('builds WhatsApp-ready quote text', () => {
    const message = buildPriceQuoteMessage({
      practiceName: 'Practice',
      patientName: 'Anna',
      quoteNumber: 'Q-2026-0001',
      title: 'Treatment estimate',
      currency: 'AED',
      subtotalCents: 100000,
      discountCents: 10000,
      totalCents: 90000,
      validUntil: '2026-05-05',
      lines: [{ description: 'Hydrafacial', quantity: 1, totalCents: 100000 }],
    })

    expect(message).toContain('Hydrafacial')
    expect(message).toContain('Estimated total: 900.00 AED')
    expect(message).toContain('Q-2026-0001')
  })

  it('generates a PDF buffer', () => {
    const pdf = buildPriceQuotePdf({
      practiceName: 'Practice',
      generatedAt: new Date('2026-04-28T10:00:00Z'),
      patient: { firstName: 'Anna', lastName: 'Client', phone: null, email: null },
      quote: {
        quoteNumber: 'Q-2026-0001',
        title: 'Treatment estimate',
        currency: 'AED',
        subtotalCents: 100000,
        discountCents: 0,
        totalCents: 100000,
        validUntil: new Date('2026-05-05T12:00:00Z'),
        note: null,
        terms: null,
        lines: [{ description: 'Hydrafacial', quantity: 1, unitPriceCents: 100000, totalCents: 100000 }],
      },
    })

    expect(new Uint8Array(pdf).slice(0, 4)).toEqual(new Uint8Array([0x25, 0x50, 0x44, 0x46]))
  })
})
