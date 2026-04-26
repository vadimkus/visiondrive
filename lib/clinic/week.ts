/** Monday-based week (ISO-style) in local timezone. */

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d)
  const day = x.getDay()
  const diff = (day + 6) % 7
  x.setDate(x.getDate() - diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function endOfWeekExclusive(weekStart: Date): Date {
  const x = new Date(weekStart)
  x.setDate(x.getDate() + 7)
  return x
}

/** Day boundaries [start, end) for a calendar day in local time. */
export function localDayRange(day: Date): { start: Date; end: Date } {
  const start = new Date(day)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function startOfMonth(d: Date): Date {
  const x = new Date(d)
  x.setDate(1)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

/** True when both dates fall in the same calendar month (local). */
export function isSameLocalMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** Six weeks (42 days), Monday-first, covering the month that contains `monthAnchor`. */
export function monthGridFrom(monthAnchor: Date): Date[] {
  const monthStart = startOfMonth(monthAnchor)
  const gridStart = startOfWeekMonday(monthStart)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}
