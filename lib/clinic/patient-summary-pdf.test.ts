import { describe, expect, it } from 'vitest'
import { buildClinicPatientSummaryPdf } from '@/lib/clinic/patient-summary-pdf'

describe('buildClinicPatientSummaryPdf', () => {
  it('outputs PDF magic bytes', () => {
    const ab = buildClinicPatientSummaryPdf({
      practiceName: 'Test Clinic',
      generatedAt: new Date('2026-04-23T12:00:00Z'),
      patient: {
        firstName: 'Jane',
        lastName: 'Doe',
        middleName: null,
        dateOfBirth: new Date('1990-05-01'),
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
      upcomingAppointments: [],
      pastAppointmentSummaries: [],
      visitDates: [],
    })
    expect(ab.byteLength).toBeGreaterThan(500)
    const head = new TextDecoder('latin1').decode(ab.slice(0, 5))
    expect(head.startsWith('%PDF')).toBe(true)
  })

  it('generates a Russian-localized PDF with Cyrillic input', () => {
    const ab = buildClinicPatientSummaryPdf({
      practiceName: 'Практика Ирины',
      generatedAt: new Date('2026-05-12T12:00:00Z'),
      locale: 'ru',
      patient: {
        firstName: 'Елена',
        lastName: 'Горшунова',
        middleName: null,
        dateOfBirth: new Date('1968-05-12'),
        phone: '+971585943830',
        email: null,
      },
      anamnesis: {
        v: 1,
        allergies: 'Нет',
        medications: '',
        conditions: '',
        social: '',
      },
      upcomingAppointments: [],
      pastAppointmentSummaries: [],
      visitDates: [],
    })

    expect(ab.byteLength).toBeGreaterThan(100_000)
    const head = new TextDecoder('latin1').decode(ab.slice(0, 5))
    expect(head.startsWith('%PDF')).toBe(true)
  })
})
