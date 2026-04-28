import { Prisma } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  buildPhotoProtocolJson,
  normalizeMarketingConsent,
  normalizePhotoProtocolChecked,
  normalizePhotoProtocolText,
  photoProtocolCompletion,
} from './photo-protocol'

describe('clinic photo protocol', () => {
  it('normalizes checklist ids from JSON, comma strings, and arrays', () => {
    expect(normalizePhotoProtocolChecked('["same_lighting","bad","same_angle","same_angle"]')).toEqual([
      'same_lighting',
      'same_angle',
    ])
    expect(normalizePhotoProtocolChecked('same_distance, clean_background')).toEqual([
      'same_distance',
      'clean_background',
    ])
    expect(normalizePhotoProtocolChecked(['area_label', 'unknown'])).toEqual(['area_label'])
  })

  it('normalizes text and marketing consent flags', () => {
    expect(normalizePhotoProtocolText('  HydraFacial  ')).toBe('HydraFacial')
    expect(normalizePhotoProtocolText('')).toBeNull()
    expect(normalizeMarketingConsent('on')).toBe(true)
    expect(normalizeMarketingConsent('false')).toBe(false)
  })

  it('builds compact protocol JSON only when useful data exists', () => {
    expect(
      buildPhotoProtocolJson({
        checkedItems: [],
        procedureName: null,
        note: null,
      })
    ).toBe(Prisma.JsonNull)

    expect(
      buildPhotoProtocolJson({
        checkedItems: ['same_lighting', 'same_angle'],
        procedureName: 'Peel',
        note: 'Signed consent in chart',
      })
    ).toEqual({
      version: 1,
      checkedItems: ['same_lighting', 'same_angle'],
      procedureName: 'Peel',
      note: 'Signed consent in chart',
    })
  })

  it('calculates checklist completion', () => {
    expect(photoProtocolCompletion(['same_lighting', 'same_angle'])).toMatchObject({
      completed: 2,
      total: 5,
      complete: false,
    })
  })
})
