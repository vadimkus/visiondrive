import { describe, expect, it } from 'vitest'
import { buildPatientSafeExportPdf } from '@/lib/clinic/patient-safe-export-pdf'

describe('buildPatientSafeExportPdf', () => {
  it('outputs a PDF with patient-facing sections', () => {
    const ab = buildPatientSafeExportPdf({
      practiceName: 'Test Clinic',
      generatedAt: new Date('2026-04-28T10:00:00Z'),
      patient: {
        firstName: 'Jane',
        lastName: 'Doe',
        middleName: null,
        dateOfBirth: new Date('1990-01-01T00:00:00Z'),
        phone: '+971500000000',
        email: 'jane@example.test',
      },
      anamnesis: {
        v: 1,
        allergies: 'None',
        medications: '',
        conditions: '',
        social: '',
      },
      visits: [
        {
          visitAt: new Date('2026-04-27T12:00:00Z'),
          label: 'Facial',
          procedureSummary: 'Treatment completed.',
          nextSteps: 'Hydrate skin.',
          aftercareTitle: 'Aftercare',
          aftercareText: 'Avoid direct sun.',
          aftercareDocumentName: 'PDF',
          aftercareDocumentUrl: 'https://example.test/aftercare.pdf',
        },
      ],
      payments: [
        {
          paidAt: new Date('2026-04-27T12:30:00Z'),
          label: 'Facial',
          amountCents: 45000,
          currency: 'AED',
          method: 'CARD',
          status: 'PAID',
          reference: 'AUTH-1',
        },
      ],
      consents: [
        {
          title: 'Consent',
          body: 'I accept the procedure.',
          procedureName: 'Facial',
          contraindications: ['Pregnancy'],
          checkedItems: ['Pregnancy'],
          patientName: 'Jane Doe',
          signatureText: 'Jane Doe',
          acceptedAt: new Date('2026-04-27T11:00:00Z'),
          aftercareAcknowledged: true,
        },
      ],
    })

    expect(ab.byteLength).toBeGreaterThan(1000)
    const head = new TextDecoder('latin1').decode(ab.slice(0, 5))
    expect(head.startsWith('%PDF')).toBe(true)
  })
})
