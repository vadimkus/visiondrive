import { describe, expect, it } from 'vitest'
import {
  buildClinicCalendarIcs,
  calendarFeedFromSettings,
  calendarFeedIsActive,
  generateCalendarFeedToken,
  hashCalendarFeedToken,
} from './calendar-feed'

describe('clinic calendar feed', () => {
  it('generates and hashes private feed tokens', () => {
    const token = generateCalendarFeedToken()
    expect(token.length).toBeGreaterThan(20)
    expect(hashCalendarFeedToken(token)).toHaveLength(64)
    expect(hashCalendarFeedToken(token)).toBe(hashCalendarFeedToken(token))
  })

  it('reads active feed settings', () => {
    expect(calendarFeedIsActive(calendarFeedFromSettings({}))).toBe(false)
    expect(
      calendarFeedIsActive(
        calendarFeedFromSettings({ calendarFeed: { tokenHash: 'abc', tokenLastFour: '1234' } })
      )
    ).toBe(true)
    expect(
      calendarFeedIsActive(
        calendarFeedFromSettings({ calendarFeed: { tokenHash: 'abc', revokedAt: '2026-04-29T00:00:00.000Z' } })
      )
    ).toBe(false)
  })

  it('builds escaped ICS events', () => {
    const ics = buildClinicCalendarIcs({
      calendarName: 'Clinic, Private',
      now: new Date('2026-04-29T10:00:00Z'),
      events: [
        {
          id: 'appt-1',
          title: 'Peel; Follow-up',
          startsAt: new Date('2026-04-30T08:00:00Z'),
          endsAt: new Date('2026-04-30T09:00:00Z'),
          description: 'No PHI\nPrivate calendar',
        },
      ],
    })

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('SUMMARY:Peel\\; Follow-up')
    expect(ics).toContain('X-WR-CALNAME:Clinic\\, Private')
    expect(ics).toContain('DESCRIPTION:No PHI\\nPrivate calendar')
  })
})
