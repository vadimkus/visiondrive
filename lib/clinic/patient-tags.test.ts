import { describe, expect, it } from 'vitest'
import {
  normalizePatientCategory,
  normalizePatientTags,
  patientTagLabel,
} from './patient-tags'

describe('clinic patient tags', () => {
  it('normalizes known patient categories', () => {
    expect(normalizePatientCategory('vip')).toBe('VIP')
    expect(normalizePatientCategory('high risk')).toBe('HIGH_RISK')
    expect(normalizePatientCategory('unknown')).toBeNull()
  })

  it('normalizes, deduplicates, and filters patient tags', () => {
    expect(normalizePatientTags(['VIP', 'follow up due', 'late_payer', 'vip', 'ignore'])).toEqual([
      'vip',
      'follow-up-due',
      'late-payer',
    ])
  })

  it('accepts comma-separated tag input', () => {
    expect(normalizePatientTags('new, sensitive, high risk')).toEqual(['new', 'sensitive', 'high-risk'])
  })

  it('formats tag labels for display', () => {
    expect(patientTagLabel('follow-up-due')).toBe('Follow Up Due')
  })
})
