export const FOLLOW_UP_WEEK_OPTIONS = [2, 4, 6, 8] as const

export function normalizeFollowUpWeeks(value: unknown, fallback = 4) {
  const parsed = Number(value ?? fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(52, Math.max(1, Math.round(parsed)))
}

export function followUpStartsAt(sourceStartsAt: Date, weeks: number) {
  return new Date(sourceStartsAt.getTime() + normalizeFollowUpWeeks(weeks) * 7 * 24 * 60 * 60 * 1000)
}

export function rebookingReminderScheduledFor(sourceStartsAt: Date, weeks: number, now = new Date()) {
  const target = followUpStartsAt(sourceStartsAt, weeks)
  return target < now ? now : target
}
