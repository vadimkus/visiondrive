import { describe, expect, it } from 'vitest'
import {
  addDays,
  endOfWeekExclusive,
  isSameLocalDay,
  isSameLocalMonth,
  monthGridFrom,
  startOfMonth,
  startOfWeekMonday,
} from '@/lib/clinic/week'

describe('startOfWeekMonday', () => {
  it('returns Monday for a Wednesday', () => {
    const wed = new Date(2026, 3, 15, 15, 0, 0)
    const mon = startOfWeekMonday(wed)
    expect(mon.getDay()).toBe(1)
    expect(mon.getDate()).toBe(13)
    expect(mon.getHours()).toBe(0)
  })
})

describe('addDays', () => {
  it('adds calendar days in local TZ', () => {
    const d = new Date(2026, 0, 1)
    const next = addDays(d, 7)
    expect(next.getDate()).toBe(8)
  })
})

describe('isSameLocalDay', () => {
  it('matches same calendar day', () => {
    const a = new Date(2026, 5, 1, 8, 0)
    const b = new Date(2026, 5, 1, 22, 0)
    expect(isSameLocalDay(a, b)).toBe(true)
  })

  it('rejects different days', () => {
    const a = new Date(2026, 5, 1, 23, 0)
    const b = new Date(2026, 5, 2, 1, 0)
    expect(isSameLocalDay(a, b)).toBe(false)
  })
})

describe('endOfWeekExclusive', () => {
  it('is seven days after week start', () => {
    const start = new Date(2026, 3, 13)
    const end = endOfWeekExclusive(start)
    expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
  })
})

describe('monthGridFrom', () => {
  it('returns 42 days starting Monday on/before month start', () => {
    const anchor = new Date(2026, 3, 15)
    const grid = monthGridFrom(anchor)
    expect(grid).toHaveLength(42)
    expect(grid[0].getDay()).toBe(1)
    const first = startOfMonth(anchor)
    expect(grid[0].getTime()).toBeLessThanOrEqual(first.getTime())
    expect(grid.some((d) => d.getMonth() === 3 && d.getDate() === 1)).toBe(true)
    expect(grid.filter((d) => isSameLocalMonth(d, anchor))).toHaveLength(30)
  })
})
