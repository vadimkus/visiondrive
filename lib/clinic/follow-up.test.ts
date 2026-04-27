import { describe, expect, it } from 'vitest'
import {
  followUpStartsAt,
  normalizeFollowUpWeeks,
  rebookingReminderScheduledFor,
} from './follow-up'

describe('clinic follow-up automation', () => {
  it('normalizes follow-up week values safely', () => {
    expect(normalizeFollowUpWeeks(4)).toBe(4)
    expect(normalizeFollowUpWeeks('8')).toBe(8)
    expect(normalizeFollowUpWeeks(0)).toBe(1)
    expect(normalizeFollowUpWeeks(99)).toBe(52)
    expect(normalizeFollowUpWeeks('bad', 6)).toBe(6)
  })

  it('calculates repeat booking dates from the source appointment', () => {
    expect(followUpStartsAt(new Date('2026-04-27T06:30:00.000Z'), 4).toISOString()).toBe(
      '2026-05-25T06:30:00.000Z'
    )
  })

  it('does not schedule rebooking reminders in the past', () => {
    const now = new Date('2026-06-01T08:00:00.000Z')
    expect(
      rebookingReminderScheduledFor(new Date('2026-04-27T06:30:00.000Z'), 2, now).toISOString()
    ).toBe(now.toISOString())
  })
})
