import { describe, expect, it } from 'vitest'
import {
  appointmentOccupiedUntil,
  normalizeBufferMinutes,
  rangesOverlap,
} from './appointments'

describe('clinic appointment scheduling helpers', () => {
  it('clamps buffer minutes to the supported technical-break range', () => {
    expect(normalizeBufferMinutes(-5)).toBe(0)
    expect(normalizeBufferMinutes(15.4)).toBe(15)
    expect(normalizeBufferMinutes(120)).toBe(60)
    expect(normalizeBufferMinutes('bad', 10)).toBe(10)
  })

  it('extends occupied time by the hidden buffer', () => {
    const startsAt = new Date('2026-04-26T10:00:00.000Z')
    const endsAt = new Date('2026-04-26T11:00:00.000Z')
    expect(appointmentOccupiedUntil(startsAt, endsAt, 60, 20).toISOString()).toBe(
      '2026-04-26T11:20:00.000Z'
    )
  })

  it('treats touching intervals as available and real overlaps as conflicts', () => {
    const ten = new Date('2026-04-26T10:00:00.000Z')
    const eleven = new Date('2026-04-26T11:00:00.000Z')
    const noon = new Date('2026-04-26T12:00:00.000Z')

    expect(rangesOverlap(ten, eleven, eleven, noon)).toBe(false)
    expect(rangesOverlap(ten, noon, eleven, new Date('2026-04-26T11:30:00.000Z'))).toBe(true)
  })
})
