import type { Prisma } from '@prisma/client'
import {
  appointmentOccupiedUntil,
  findAppointmentConflict,
  type AppointmentConflict,
} from './appointments'
import {
  dubaiDayKey,
  dubaiDayOfWeek,
  dubaiMinutesSinceMidnight,
  defaultAvailabilityRules,
  applicableRulesForDay,
} from './availability'

type PrismaLike = Prisma.TransactionClient

export type SchedulingConflict =
  | (AppointmentConflict & { type: 'APPOINTMENT' })
  | {
      type: 'BLOCKED_TIME'
      id: string
      startsAt: string
      endsAt: string
      reason: string | null
    }
  | {
      type: 'WORKING_HOURS'
      startsAt: string
      occupiedUntil: string
      dayOfWeek: number
      message: string
    }
  | {
      type: 'LEAD_TIME'
      startsAt: string
      minLeadMinutes: number
      message: string
    }

export async function findSchedulingConflict(
  db: PrismaLike,
  params: {
    tenantId: string
    startsAt: Date
    endsAt: Date | null
    bufferAfterMinutes: number
    procedureId?: string | null
    excludeAppointmentId?: string
    now?: Date
  }
): Promise<SchedulingConflict | null> {
  const appointmentConflict = await findAppointmentConflict(db, {
    tenantId: params.tenantId,
    startsAt: params.startsAt,
    endsAt: params.endsAt,
    bufferAfterMinutes: params.bufferAfterMinutes,
    excludeAppointmentId: params.excludeAppointmentId,
  })
  if (appointmentConflict) {
    return { ...appointmentConflict, type: 'APPOINTMENT' }
  }

  const occupiedUntil = appointmentOccupiedUntil(
    params.startsAt,
    params.endsAt,
    60,
    params.bufferAfterMinutes
  )

  const blocked = await db.clinicBlockedTime.findFirst({
    where: {
      tenantId: params.tenantId,
      startsAt: { lt: occupiedUntil },
      endsAt: { gt: params.startsAt },
    },
    orderBy: { startsAt: 'asc' },
  })
  if (blocked) {
    return {
      type: 'BLOCKED_TIME',
      id: blocked.id,
      startsAt: blocked.startsAt.toISOString(),
      endsAt: blocked.endsAt.toISOString(),
      reason: blocked.reason,
    }
  }

  const rulesRaw = await db.clinicAvailabilityRule.findMany({
    where: { tenantId: params.tenantId },
    orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
  })
  const rules = rulesRaw.length > 0 ? rulesRaw : defaultAvailabilityRules()
  const dayKey = dubaiDayKey(params.startsAt)
  const occupiedDayKey = dubaiDayKey(occupiedUntil)
  const dayOfWeek = dubaiDayOfWeek(params.startsAt)
  const startMinutes = dubaiMinutesSinceMidnight(params.startsAt)
  const endMinutes = dubaiMinutesSinceMidnight(occupiedUntil)

  const activeRules = applicableRulesForDay(rules, dayOfWeek, params.procedureId)
  const coveringRule =
    dayKey === occupiedDayKey
      ? activeRules.find(
          (rule) => startMinutes >= rule.startMinutes && endMinutes <= rule.endMinutes
        )
      : null

  if (!coveringRule) {
    return {
      type: 'WORKING_HOURS',
      startsAt: params.startsAt.toISOString(),
      occupiedUntil: occupiedUntil.toISOString(),
      dayOfWeek,
      message: 'Appointment falls outside working hours',
    }
  }

  const minLeadMinutes = coveringRule.minLeadMinutes ?? 0
  const now = params.now ?? new Date()
  if (params.startsAt.getTime() < now.getTime() + minLeadMinutes * 60 * 1000) {
    return {
      type: 'LEAD_TIME',
      startsAt: params.startsAt.toISOString(),
      minLeadMinutes,
      message: 'Appointment is inside the minimum lead time',
    }
  }

  return null
}

export function normalizeOverrideReason(value: unknown) {
  return value == null ? null : String(value).trim().slice(0, 1000) || null
}

export function overrideAllowed(params: {
  conflict: SchedulingConflict | null
  allowConflictOverride: boolean
  overrideReason: string | null
}) {
  if (!params.conflict) return true
  return params.allowConflictOverride && !!params.overrideReason
}
