import type { ClinicWaitlistStatus } from '@prisma/client'

export const WAITLIST_ACTIVE_STATUSES: ClinicWaitlistStatus[] = ['OPEN', 'CONTACTED']

export type WaitlistCandidateInput = {
  procedureId: string | null
  priority: number
  earliestAt: Date | null
  latestAt: Date | null
  createdAt: Date
}

export type WaitlistSlotInput = {
  startsAt: Date
  procedureId: string | null
}

export function normalizeWaitlistPriority(input: unknown) {
  const value = Number(input)
  if (!Number.isFinite(value)) return 2
  return Math.min(3, Math.max(1, Math.round(value)))
}

export function normalizeWaitlistStatus(input: unknown): ClinicWaitlistStatus {
  const value = String(input ?? '').trim().toUpperCase()
  if (value === 'CONTACTED' || value === 'BOOKED' || value === 'CLOSED') {
    return value
  }
  return 'OPEN'
}

export function parseOptionalDate(input: unknown) {
  if (input == null || input === '') return null
  const parsed = new Date(String(input))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function normalizePreferredDays(input: unknown) {
  const raw = Array.isArray(input) ? input : String(input ?? '').split(',')
  return raw
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 7)
}

export function waitlistMatchScore(candidate: WaitlistCandidateInput, slot: WaitlistSlotInput | null) {
  let score = 0

  score += Math.max(0, 4 - normalizeWaitlistPriority(candidate.priority)) * 12

  const daysWaiting = Math.max(0, Math.floor((Date.now() - candidate.createdAt.getTime()) / 86_400_000))
  score += Math.min(20, daysWaiting)

  if (!slot) return score

  if (candidate.procedureId && slot.procedureId && candidate.procedureId === slot.procedureId) {
    score += 40
  } else if (!candidate.procedureId) {
    score += 10
  } else if (slot.procedureId) {
    score -= 20
  }

  if (candidate.earliestAt && slot.startsAt < candidate.earliestAt) score -= 25
  if (candidate.latestAt && slot.startsAt > candidate.latestAt) score -= 25
  if (candidate.earliestAt && candidate.latestAt && slot.startsAt >= candidate.earliestAt && slot.startsAt <= candidate.latestAt) {
    score += 20
  }

  return score
}

export function buildWaitlistFillMessage({
  firstName,
  service,
  startsAt,
  locale = 'en-GB',
}: {
  firstName: string
  service: string
  startsAt: Date
  locale?: string
}) {
  const dateLocale = locale === 'ru' ? 'ru-RU' : locale
  const date = startsAt.toLocaleDateString(dateLocale, { dateStyle: 'medium', timeZone: 'Asia/Dubai' })
  const time = startsAt.toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  })
  if (locale === 'ru') {
    return `Здравствуйте, ${firstName}! Освободилось окно на ${service}: ${date} в ${time}. Хотите, я забронирую это время для вас?`
  }
  return `Hi ${firstName}, a ${service} slot opened on ${date} at ${time}. Would you like me to reserve it for you?`
}
