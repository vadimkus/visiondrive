import type {
  ClinicAppointment,
  ClinicAvailabilityRule,
  ClinicBlockedTime,
  ClinicProcedure,
} from '@prisma/client'
import { appointmentOccupiedUntil, rangesOverlap } from './appointments'

export const CLINIC_TIME_ZONE = 'Asia/Dubai'
export const AVAILABILITY_SLOT_MODES = ['FIXED', 'DYNAMIC'] as const

export type AvailabilitySlotMode = (typeof AVAILABILITY_SLOT_MODES)[number]

export type AvailabilityRuleInput = {
  id?: string
  procedureId?: string | null
  dayOfWeek: number
  startMinutes: number
  endMinutes: number
  slotMode?: AvailabilitySlotMode | string | null
  slotIntervalMinutes?: number
  minLeadMinutes?: number
  active?: boolean
  label?: string | null
}

export type AvailabilitySlot = {
  startsAt: string
  endsAt: string
  occupiedUntil: string
  dayOfWeek: number
}

type AppointmentForAvailability = Pick<
  ClinicAppointment,
  'startsAt' | 'endsAt' | 'bufferAfterMinutes'
> & {
  procedure: Pick<ClinicProcedure, 'defaultDurationMin'> | null
}

type BlockedTimeForAvailability = Pick<ClinicBlockedTime, 'startsAt' | 'endsAt'>

type RuleForAvailability = Pick<
  ClinicAvailabilityRule,
  'dayOfWeek' | 'startMinutes' | 'endMinutes'
> & {
  procedureId?: string | null
  slotMode?: AvailabilitySlotMode | string | null
  slotIntervalMinutes?: number
  minLeadMinutes?: number
  active?: boolean
}

const weekdayMap: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
}

export function defaultAvailabilityRules(): AvailabilityRuleInput[] {
  return [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    procedureId: null,
    startMinutes: 10 * 60,
    endMinutes: 18 * 60,
    slotMode: 'FIXED',
    slotIntervalMinutes: 30,
    minLeadMinutes: 120,
    active: true,
  }))
}

export function normalizeMinutes(value: unknown, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(24 * 60, Math.round(n)))
}

export function normalizeAvailabilityRule(input: AvailabilityRuleInput): AvailabilityRuleInput {
  const dayOfWeek = Math.max(1, Math.min(7, Math.round(Number(input.dayOfWeek))))
  let startMinutes = normalizeMinutes(input.startMinutes, 10 * 60)
  let endMinutes = normalizeMinutes(input.endMinutes, 18 * 60)
  const slotMode = input.slotMode === 'DYNAMIC' ? 'DYNAMIC' : 'FIXED'
  const slotIntervalMinutes = Math.max(
    5,
    Math.min(240, Math.round(Number(input.slotIntervalMinutes ?? 30)))
  )
  const minLeadMinutes = Math.max(0, Math.min(24 * 60, Math.round(Number(input.minLeadMinutes ?? 120))))
  if (endMinutes <= startMinutes) {
    endMinutes = Math.min(24 * 60, startMinutes + 60)
  }
  if (endMinutes <= startMinutes) {
    startMinutes = Math.max(0, endMinutes - 60)
  }

  return {
    ...input,
    procedureId: input.procedureId?.trim() || null,
    dayOfWeek,
    startMinutes,
    endMinutes,
    slotMode,
    slotIntervalMinutes,
    minLeadMinutes,
    active: input.active !== false,
    label: input.label?.trim() || null,
  }
}

export function slotStepMinutes(rule: RuleForAvailability, durationMinutes: number, bufferAfterMinutes: number) {
  if (rule.slotMode === 'DYNAMIC') {
    return Math.max(5, Math.min(24 * 60, durationMinutes + bufferAfterMinutes))
  }

  return rule.slotIntervalMinutes ?? 30
}

export function applicableRulesForDay(
  rules: RuleForAvailability[],
  dayOfWeek: number,
  procedureId?: string | null
) {
  const dayRules = rules.filter((rule) => rule.dayOfWeek === dayOfWeek)
  if (procedureId) {
    const procedureRules = dayRules.filter((rule) => rule.procedureId === procedureId)
    if (procedureRules.length > 0) {
      return procedureRules.filter((rule) => rule.active !== false)
    }
  }

  return dayRules.filter((rule) => !rule.procedureId && rule.active !== false)
}

export function minutesToHHMM(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function hhmmToMinutes(value: string, fallback: number) {
  const [hRaw, mRaw] = value.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw)
  if (!Number.isInteger(h) || !Number.isInteger(m)) return fallback
  return normalizeMinutes(h * 60 + m, fallback)
}

export function dubaiDayKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function dubaiDayOfWeek(date: Date) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'short',
  }).format(date)
  return weekdayMap[weekday] ?? 1
}

export function dubaiMinutesSinceMidnight(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

export function dateAtDubaiMinutes(dayKey: string, minutes: number) {
  const utcMidnight = new Date(`${dayKey}T00:00:00.000Z`)
  // Dubai is UTC+4 year-round; construct UTC equivalent for a Dubai local time.
  return new Date(utcMidnight.getTime() + (minutes - 4 * 60) * 60 * 1000)
}

export function eachDubaiDay(from: Date, to: Date) {
  const days: string[] = []
  let cursor = new Date(`${dubaiDayKey(from)}T00:00:00.000Z`)
  const endKey = dubaiDayKey(to)
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    days.push(key)
    if (key >= endKey) break
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  }
  return days
}

export function generateAvailabilitySlots(params: {
  from: Date
  to: Date
  rules: RuleForAvailability[]
  appointments: AppointmentForAvailability[]
  blockedTimes: BlockedTimeForAvailability[]
  durationMinutes: number
  bufferAfterMinutes: number
  procedureId?: string | null
  now?: Date
}): AvailabilitySlot[] {
  const now = params.now ?? new Date()
  const result: AvailabilitySlot[] = []

  for (const dayKey of eachDubaiDay(params.from, params.to)) {
    const dayStart = dateAtDubaiMinutes(dayKey, 0)
    const dayOfWeek = dubaiDayOfWeek(dayStart)
    const rules = applicableRulesForDay(params.rules, dayOfWeek, params.procedureId)

    for (const rule of rules) {
      const earliest = new Date(now.getTime() + (rule.minLeadMinutes ?? 120) * 60 * 1000)
      const stepMinutes = slotStepMinutes(rule, params.durationMinutes, params.bufferAfterMinutes)
      for (
        let minute = rule.startMinutes;
        minute + params.durationMinutes <= rule.endMinutes;
        minute += stepMinutes
      ) {
        const startsAt = dateAtDubaiMinutes(dayKey, minute)
        const endsAt = new Date(startsAt.getTime() + params.durationMinutes * 60 * 1000)
        const occupiedUntil = new Date(
          endsAt.getTime() + params.bufferAfterMinutes * 60 * 1000
        )

        if (startsAt < params.from || startsAt >= params.to || startsAt < earliest) continue

        const appointmentConflict = params.appointments.some((appointment) => {
          const otherEnd = appointmentOccupiedUntil(
            appointment.startsAt,
            appointment.endsAt,
            appointment.procedure?.defaultDurationMin ?? 60,
            appointment.bufferAfterMinutes
          )
          return rangesOverlap(startsAt, occupiedUntil, appointment.startsAt, otherEnd)
        })
        if (appointmentConflict) continue

        const blocked = params.blockedTimes.some((block) =>
          rangesOverlap(startsAt, occupiedUntil, block.startsAt, block.endsAt)
        )
        if (blocked) continue

        result.push({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          occupiedUntil: occupiedUntil.toISOString(),
          dayOfWeek,
        })
      }
    }
  }

  return result
}
