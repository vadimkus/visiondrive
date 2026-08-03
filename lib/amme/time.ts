const DEFAULT_TIMEZONE = 'Asia/Makassar'

function offsetFor(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  )
  return asUtc - date.getTime()
}

/** Convert venue-local YYYY-MM-DD + HH:mm to a UTC instant without server-TZ dependence. */
export function venueDateTimeToUtc(day: string, time: string, timeZone = DEFAULT_TIMEZONE) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{1,2}:\d{2}$/.test(time)) {
    throw new Error('Дата/время должны быть YYYY-MM-DD и HH:mm')
  }
  const [year, month, date] = day.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const guess = new Date(Date.UTC(year, month - 1, date, hour, minute))
  const first = new Date(guess.getTime() - offsetFor(guess, timeZone))
  return new Date(guess.getTime() - offsetFor(first, timeZone))
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

export function venueDayKey(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export { DEFAULT_TIMEZONE }
