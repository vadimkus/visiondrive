import { describe, expect, it } from 'vitest'
import { rescheduleStartsAtPreserveClock } from '@/lib/clinic/appointment-dnd'

describe('rescheduleStartsAtPreserveClock', () => {
  it('moves the date but keeps local clock', () => {
    const old = new Date(2026, 3, 15, 10, 30, 0, 0)
    const target = new Date(2026, 3, 20, 0, 0, 0, 0)
    const out = rescheduleStartsAtPreserveClock(old.toISOString(), target)
    const d = new Date(out)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(3)
    expect(d.getDate()).toBe(20)
    expect(d.getHours()).toBe(10)
    expect(d.getMinutes()).toBe(30)
  })
})
