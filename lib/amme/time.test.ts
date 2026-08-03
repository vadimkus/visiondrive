import { describe, expect, it } from 'vitest'
import { venueDateTimeToUtc, venueDayKey } from './time'

describe('AMMÉ Bali time', () => {
  it('converts Asia/Makassar local booking time to UTC', () => {
    expect(venueDateTimeToUtc('2026-08-03', '15:45').toISOString()).toBe(
      '2026-08-03T07:45:00.000Z'
    )
  })

  it('returns the Bali day around UTC midnight', () => {
    expect(venueDayKey(new Date('2026-08-02T18:00:00.000Z'))).toBe('2026-08-03')
  })
})
