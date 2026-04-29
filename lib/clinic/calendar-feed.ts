import { createHash, randomBytes } from 'crypto'
import type { Prisma } from '@prisma/client'

export type CalendarFeedSettings = {
  tokenHash?: string | null
  tokenLastFour?: string | null
  createdAt?: string | null
  revokedAt?: string | null
}

export type CalendarFeedEvent = {
  id: string
  title: string
  startsAt: Date
  endsAt: Date
  description?: string | null
}

type ClinicSettings = {
  calendarFeed?: CalendarFeedSettings
}

function asClinicSettings(value: Prisma.JsonValue | null | undefined): ClinicSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as ClinicSettings
}

export function generateCalendarFeedToken() {
  return randomBytes(24).toString('base64url')
}

export function hashCalendarFeedToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function calendarFeedFromSettings(value: Prisma.JsonValue | null | undefined): CalendarFeedSettings {
  return asClinicSettings(value).calendarFeed ?? {}
}

export function calendarFeedIsActive(settings: CalendarFeedSettings) {
  return Boolean(settings.tokenHash && !settings.revokedAt)
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function icsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function buildClinicCalendarIcs({
  calendarName,
  events,
  now = new Date(),
}: {
  calendarName: string
  events: CalendarFeedEvent[]
  now?: Date
}) {
  const rows = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VisionDrive//Practice OS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ]

  for (const event of events) {
    rows.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(event.id)}@visiondrive-clinic`,
      `DTSTAMP:${icsDate(now)}`,
      `DTSTART:${icsDate(event.startsAt)}`,
      `DTEND:${icsDate(event.endsAt)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.description ?? '')}`,
      'END:VEVENT'
    )
  }

  rows.push('END:VCALENDAR')
  return `${rows.join('\r\n')}\r\n`
}
