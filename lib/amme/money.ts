export function formatIdr(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n))
}

export function todayDateUTC(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

export function parseDayKey(day?: string | null): Date {
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, dd] = day.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, dd))
  }
  return todayDateUTC()
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}
