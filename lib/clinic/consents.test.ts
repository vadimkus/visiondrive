import { describe, expect, it } from 'vitest'
import {
  buildConsentSnapshot,
  consentAcceptedAt,
  normalizeConsentBody,
  normalizeContraindications,
} from './consents'

describe('clinic consents', () => {
  it('normalizes contraindication text from strings or arrays', () => {
    expect(normalizeContraindications('Pregnancy, Allergy\nAllergy')).toEqual([
      'Pregnancy',
      'Allergy',
    ])
    expect(normalizeContraindications(['  Fever  ', '', 'Open wound'])).toEqual([
      'Fever',
      'Open wound',
    ])
  })

  it('trims long consent body text', () => {
    expect(normalizeConsentBody('  consent text  ')).toBe('consent text')
    expect(normalizeConsentBody('x'.repeat(10_010))).toHaveLength(10_000)
  })

  it('sets accepted timestamp only for accepted records', () => {
    expect(consentAcceptedAt({ accepted: false })).toBeNull()
    expect(consentAcceptedAt({ accepted: true, acceptedAt: '2026-04-27T08:00:00.000Z' })?.toISOString()).toBe(
      '2026-04-27T08:00:00.000Z'
    )
  })

  it('builds immutable signed consent snapshots', () => {
    const snapshot = buildConsentSnapshot({
      templateTitle: 'Skin treatment consent',
      templateBody: 'Patient agrees.',
      contraindications: ['Pregnancy', 'Allergy'],
      checkedItems: ['Allergy', 'Unknown'],
      patientName: 'Iryna Patient',
    })

    expect(snapshot.templateTitleSnapshot).toBe('Skin treatment consent')
    expect(snapshot.contraindicationsSnapshot).toEqual(['Pregnancy', 'Allergy'])
    expect(snapshot.checkedItems).toEqual(['Allergy'])
    expect(snapshot.patientNameSnapshot).toBe('Iryna Patient')
  })
})
