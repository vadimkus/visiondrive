import { describe, expect, it } from 'vitest'
import {
  buildAftercareWhatsappText,
  normalizeAftercareDocumentUrl,
  renderAftercareTemplate,
} from './aftercare'

describe('aftercare helpers', () => {
  it('renders patient and procedure placeholders', () => {
    const text = renderAftercareTemplate('Hi {{firstName}}, after {{service}} on {{date}}.', {
      patient: { firstName: 'Mira', lastName: 'Khan' },
      procedure: { name: 'Facial' },
      visitAt: new Date('2026-04-28T10:00:00Z'),
    })

    expect(text).toContain('Mira')
    expect(text).toContain('Facial')
    expect(text).toContain('28 Apr 2026')
  })

  it('accepts https and relative document references only', () => {
    expect(normalizeAftercareDocumentUrl('https://example.com/aftercare.pdf')).toBe(
      'https://example.com/aftercare.pdf'
    )
    expect(normalizeAftercareDocumentUrl('/docs/aftercare.pdf')).toBe('/docs/aftercare.pdf')
    expect(normalizeAftercareDocumentUrl('javascript:alert(1)')).toBe('')
  })

  it('builds concise WhatsApp text with document reference', () => {
    expect(
      buildAftercareWhatsappText({
        title: 'Aftercare',
        messageBody: 'Avoid sun for 48 hours.',
        documentName: 'PDF',
        documentUrl: 'https://example.com/a.pdf',
      })
    ).toBe('Aftercare\n\nAvoid sun for 48 hours.\n\nPDF: https://example.com/a.pdf')
  })
})
