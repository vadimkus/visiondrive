import { describe, expect, it } from 'vitest'
import { anamnesisFromJson, anamnesisToStorage, parseAnamnesisPatchBody } from '@/lib/clinic/anamnesis'

describe('anamnesisFromJson', () => {
  it('returns empty v1 for non-object', () => {
    expect(anamnesisFromJson(null)).toEqual({
      v: 1,
      allergies: '',
      medications: '',
      conditions: '',
      social: '',
    })
  })

  it('reads known string fields', () => {
    expect(
      anamnesisFromJson({
        v: 1,
        allergies: 'Penicillin',
        medications: 'None',
        conditions: 'HTN',
        social: 'Non-smoker',
      })
    ).toMatchObject({ allergies: 'Penicillin', conditions: 'HTN' })
  })
})

describe('anamnesisToStorage', () => {
  it('returns null when all blank', () => {
    expect(
      anamnesisToStorage({ allergies: '  ', medications: '', conditions: '', social: '' })
    ).toBeNull()
  })

  it('trims and stores', () => {
    expect(
      anamnesisToStorage({
        allergies: ' a ',
        medications: '',
        conditions: '',
        social: '',
      })
    ).toEqual({ v: 1, allergies: 'a', medications: '', conditions: '', social: '' })
  })
})

describe('parseAnamnesisPatchBody', () => {
  it('accepts null', () => {
    expect(parseAnamnesisPatchBody(null)).toEqual({ ok: true, value: null })
  })

  it('rejects non-object', () => {
    expect(parseAnamnesisPatchBody('x').ok).toBe(false)
  })
})
