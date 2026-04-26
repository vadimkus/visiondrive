import { describe, expect, it } from 'vitest'
import {
  dateAtDubaiMinutes,
  defaultAvailabilityRules,
  generateAvailabilitySlots,
  normalizeAvailabilityRule,
} from './availability'

describe('availability helpers', () => {
  it('normalizes invalid rule ranges', () => {
    const rule = normalizeAvailabilityRule({
      dayOfWeek: 9,
      startMinutes: 20 * 60,
      endMinutes: 18 * 60,
      slotIntervalMinutes: 1,
      minLeadMinutes: -10,
    })

    expect(rule.dayOfWeek).toBe(7)
    expect(rule.endMinutes).toBeGreaterThan(rule.startMinutes)
    expect(rule.slotIntervalMinutes).toBe(5)
    expect(rule.minLeadMinutes).toBe(0)
  })

  it('generates slots inside working hours', () => {
    const from = new Date('2026-04-27T00:00:00.000Z')
    const to = new Date('2026-04-28T00:00:00.000Z')
    const rules = [
      {
        dayOfWeek: 1,
        startMinutes: 10 * 60,
        endMinutes: 12 * 60,
        slotIntervalMinutes: 30,
        minLeadMinutes: 0,
        active: true,
      },
    ]

    const slots = generateAvailabilitySlots({
      from,
      to,
      rules,
      appointments: [],
      blockedTimes: [],
      durationMinutes: 60,
      bufferAfterMinutes: 0,
      now: new Date('2026-04-26T00:00:00.000Z'),
    })

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      '2026-04-27T06:00:00.000Z',
      '2026-04-27T06:30:00.000Z',
      '2026-04-27T07:00:00.000Z',
    ])
  })

  it('uses procedure-specific rules when they exist for that service and day', () => {
    const from = new Date('2026-04-27T00:00:00.000Z')
    const to = new Date('2026-04-28T00:00:00.000Z')

    const slots = generateAvailabilitySlots({
      from,
      to,
      rules: [
        {
          procedureId: null,
          dayOfWeek: 1,
          startMinutes: 10 * 60,
          endMinutes: 12 * 60,
          slotIntervalMinutes: 60,
          minLeadMinutes: 0,
          active: true,
        },
        {
          procedureId: 'laser',
          dayOfWeek: 1,
          startMinutes: 14 * 60,
          endMinutes: 16 * 60,
          slotIntervalMinutes: 60,
          minLeadMinutes: 0,
          active: true,
        },
      ],
      appointments: [],
      blockedTimes: [],
      durationMinutes: 60,
      bufferAfterMinutes: 0,
      procedureId: 'laser',
      now: new Date('2026-04-26T00:00:00.000Z'),
    })

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      '2026-04-27T10:00:00.000Z',
      '2026-04-27T11:00:00.000Z',
    ])
  })

  it('excludes appointment and blocked-time conflicts including buffers', () => {
    const from = new Date('2026-04-27T00:00:00.000Z')
    const to = new Date('2026-04-28T00:00:00.000Z')
    const startsAt = dateAtDubaiMinutes('2026-04-27', 10 * 60)
    const endsAt = dateAtDubaiMinutes('2026-04-27', 11 * 60)
    const blockedStart = dateAtDubaiMinutes('2026-04-27', 12 * 60)
    const blockedEnd = dateAtDubaiMinutes('2026-04-27', 13 * 60)

    const slots = generateAvailabilitySlots({
      from,
      to,
      rules: [
        {
          dayOfWeek: 1,
          startMinutes: 10 * 60,
          endMinutes: 14 * 60,
          slotIntervalMinutes: 60,
          minLeadMinutes: 0,
          active: true,
        },
      ],
      appointments: [
        {
          startsAt,
          endsAt,
          bufferAfterMinutes: 60,
          procedure: { defaultDurationMin: 60 },
        },
      ],
      blockedTimes: [{ startsAt: blockedStart, endsAt: blockedEnd }],
      durationMinutes: 60,
      bufferAfterMinutes: 0,
      now: new Date('2026-04-26T00:00:00.000Z'),
    })

    expect(slots.map((slot) => slot.startsAt)).toEqual(['2026-04-27T09:00:00.000Z'])
  })

  it('ships weekday defaults for solo practices', () => {
    expect(defaultAvailabilityRules()).toHaveLength(5)
  })
})
