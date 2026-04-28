import { describe, expect, it } from 'vitest'
import {
  buildBirthdayMessage,
  buildBirthdayOccasionRows,
  buildBirthdayWhatsappUrl,
  nextBirthday,
  normalizeOccasionRange,
} from './occasions'

describe('clinic occasion messages', () => {
  it('normalizes supported ranges', () => {
    expect(normalizeOccasionRange('7')).toBe(7)
    expect(normalizeOccasionRange('90')).toBe(90)
    expect(normalizeOccasionRange('365')).toBe(30)
  })

  it('calculates the next birthday across year boundaries', () => {
    const result = nextBirthday(new Date('1990-01-05T00:00:00Z'), new Date('2026-12-28T12:00:00Z'))

    expect(result.nextBirthdayAt.toISOString().slice(0, 10)).toBe('2027-01-05')
    expect(result.daysUntil).toBe(8)
    expect(result.turningAge).toBe(37)
  })

  it('maps leap-day birthdays to Feb 28 in non-leap years', () => {
    const result = nextBirthday(new Date('1992-02-29T00:00:00Z'), new Date('2026-02-20T12:00:00Z'))

    expect(result.nextBirthdayAt.toISOString().slice(0, 10)).toBe('2026-02-28')
    expect(result.daysUntil).toBe(8)
  })

  it('returns upcoming birthday rows within range', () => {
    const rows = buildBirthdayOccasionRows(
      [
        {
          id: 'p1',
          firstName: 'Amina',
          lastName: 'Saleh',
          phone: '+971500000000',
          email: null,
          dateOfBirth: new Date('1990-05-02T00:00:00Z'),
        },
        {
          id: 'p2',
          firstName: 'Nora',
          lastName: 'Ali',
          phone: null,
          email: null,
          dateOfBirth: new Date('1991-06-20T00:00:00Z'),
        },
      ],
      new Date('2026-04-28T09:00:00Z'),
      7
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      patientId: 'p1',
      patientName: 'Saleh, Amina',
      daysUntil: 4,
      turningAge: 36,
    })
  })

  it('builds localized low-pressure birthday copy and WhatsApp links', () => {
    expect(buildBirthdayMessage({ firstName: 'Amina', daysUntil: 0 }, 'en')).toContain('happy birthday')
    expect(buildBirthdayMessage({ firstName: 'Амина', daysUntil: 3 }, 'ru')).toContain('скоро день рождения')
    expect(buildBirthdayWhatsappUrl({ firstName: 'Amina', daysUntil: 1, phone: '+971 50 000 0000' }, 'en')).toContain(
      'https://wa.me/971500000000'
    )
  })
})
