import { describe, expect, it } from 'vitest'
import {
  buildWaitlistFillMessage,
  normalizePreferredDays,
  normalizeWaitlistPriority,
  waitlistMatchScore,
} from '@/lib/clinic/waitlist'

describe('waitlist helpers', () => {
  it('clamps priority to the supported range', () => {
    expect(normalizeWaitlistPriority(0)).toBe(1)
    expect(normalizeWaitlistPriority(2)).toBe(2)
    expect(normalizeWaitlistPriority(10)).toBe(3)
  })

  it('normalizes preferred days from comma text', () => {
    expect(normalizePreferredDays('Mon, Wed, Friday')).toEqual(['Mon', 'Wed', 'Friday'])
  })

  it('scores exact procedure matches above mismatches', () => {
    const slot = { startsAt: new Date('2026-05-01T10:00:00Z'), procedureId: 'proc-a' }
    const base = {
      priority: 2,
      earliestAt: new Date('2026-04-30T10:00:00Z'),
      latestAt: new Date('2026-05-02T10:00:00Z'),
      createdAt: new Date(),
    }

    expect(waitlistMatchScore({ ...base, procedureId: 'proc-a' }, slot)).toBeGreaterThan(
      waitlistMatchScore({ ...base, procedureId: 'proc-b' }, slot)
    )
  })

  it('builds a patient-ready cancellation fill message', () => {
    expect(
      buildWaitlistFillMessage({
        firstName: 'Anna',
        service: 'Hydrafacial',
        startsAt: new Date('2026-05-01T10:00:00Z'),
      })
    ).toContain('Anna')
  })
})
