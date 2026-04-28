import { describe, expect, it } from 'vitest'
import {
  buildReactivationMessage,
  buildReactivationWhatsappUrl,
  normalizeReactivationLocale,
  normalizeReactivationThreshold,
} from './reactivation'

describe('clinic reactivation helpers', () => {
  it('normalizes supported dormant thresholds only', () => {
    expect(normalizeReactivationThreshold('60')).toBe(60)
    expect(normalizeReactivationThreshold(90)).toBe(90)
    expect(normalizeReactivationThreshold('120')).toBe(120)
    expect(normalizeReactivationThreshold('30')).toBe(60)
    expect(normalizeReactivationThreshold('bad', 90)).toBe(90)
  })

  it('builds localized low-pressure messages', () => {
    expect(
      buildReactivationMessage(
        { firstName: 'Anna', lastProcedureName: 'Facial', daysSinceLastVisit: 93 },
        'en'
      )
    ).toContain('It has been 93 days after your Facial')

    expect(
      buildReactivationMessage(
        { firstName: 'Анна', lastProcedureName: 'чистка', daysSinceLastVisit: 120 },
        'ru'
      )
    ).toContain('120 дн. после процедуры "чистка"')
  })

  it('creates WhatsApp links only when phone exists', () => {
    const patient = {
      firstName: 'Anna',
      patientPhone: '+971 50 123 4567',
      lastProcedureName: null,
      daysSinceLastVisit: 60,
    }

    expect(normalizeReactivationLocale('ru')).toBe('ru')
    expect(normalizeReactivationLocale('en')).toBe('en')
    expect(buildReactivationWhatsappUrl(patient, 'en')).toContain('https://wa.me/971501234567')
    expect(buildReactivationWhatsappUrl({ ...patient, patientPhone: null }, 'en')).toBeNull()
  })
})
