export type RetentionAppointment = {
  id?: string | null
  patientId: string
  patientName: string
  patientPhone?: string | null
  procedureId?: string | null
  procedureName?: string | null
  startsAt: Date
  status: string
}

export type RetentionReminder = {
  id?: string | null
  patientId: string | null
  scheduledFor: Date
  status: string
}

export type LostPatientRow = {
  patientId: string
  patientName: string
  patientPhone: string | null
  lastVisitAt: Date
  lastProcedureName: string | null
  daysSinceLastVisit: number
}

export type ProcedureRepeatIntervalRow = {
  procedureId: string | null
  procedureName: string
  repeatPairs: number
  averageDays: number
}

export type RetentionSummary = {
  completedAppointments: number
  uniqueCompletedPatients: number
  returningPatients: number
  returningRatePct: number
  rebookedCompletedAppointments: number
  rebookRatePct: number
  noShowAppointments: number
  noShowRatePct: number
  lostPatients: number
}

export type FollowUpConversionSummary = {
  rebookingReminders: number
  convertedReminders: number
  conversionRatePct: number
}

const ACTIVE_STATUSES = new Set(['SCHEDULED', 'CONFIRMED', 'ARRIVED'])
const COMPLETED_STATUS = 'COMPLETED'
const NO_SHOW_STATUS = 'NO_SHOW'

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0
}

function daysBetween(later: Date, earlier: Date) {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / (24 * 60 * 60 * 1000)))
}

function inRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end
}

function byTimeAsc<T extends { startsAt: Date }>(rows: T[]) {
  return [...rows].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

export function buildRetentionSummary(
  appointments: RetentionAppointment[],
  start: Date,
  end: Date,
  now = new Date(),
  lostAfterDays = 60
): { summary: RetentionSummary; lostPatients: LostPatientRow[] } {
  const completedInRange = appointments.filter(
    (appointment) => appointment.status === COMPLETED_STATUS && inRange(appointment.startsAt, start, end)
  )
  const noShowsInRange = appointments.filter(
    (appointment) => appointment.status === NO_SHOW_STATUS && inRange(appointment.startsAt, start, end)
  )

  const completedByPatient = new Map<string, RetentionAppointment[]>()
  for (const appointment of appointments.filter((row) => row.status === COMPLETED_STATUS)) {
    const existing = completedByPatient.get(appointment.patientId) ?? []
    existing.push(appointment)
    completedByPatient.set(appointment.patientId, existing)
  }

  const uniqueCompletedPatients = new Set(completedInRange.map((appointment) => appointment.patientId)).size
  const returningPatients = [...new Set(completedInRange.map((appointment) => appointment.patientId))].filter(
    (patientId) => (completedByPatient.get(patientId)?.length ?? 0) >= 2
  ).length

  const rebookedCompletedAppointments = completedInRange.filter((completed) =>
    appointments.some(
      (candidate) =>
        candidate.patientId === completed.patientId &&
        candidate.startsAt > completed.startsAt &&
        (candidate.status === COMPLETED_STATUS || ACTIVE_STATUSES.has(candidate.status))
    )
  ).length

  const lostCutoff = new Date(now.getTime() - Math.max(1, lostAfterDays) * 24 * 60 * 60 * 1000)
  const lostPatients: LostPatientRow[] = []
  for (const [patientId, completedRows] of completedByPatient.entries()) {
    const lastCompleted = byTimeAsc(completedRows).at(-1)
    if (!lastCompleted || lastCompleted.startsAt > lostCutoff) continue
    const hasFutureActive = appointments.some(
      (appointment) =>
        appointment.patientId === patientId &&
        appointment.startsAt > now &&
        ACTIVE_STATUSES.has(appointment.status)
    )
    if (hasFutureActive) continue
    lostPatients.push({
      patientId,
      patientName: lastCompleted.patientName,
      patientPhone: lastCompleted.patientPhone ?? null,
      lastVisitAt: lastCompleted.startsAt,
      lastProcedureName: lastCompleted.procedureName ?? null,
      daysSinceLastVisit: daysBetween(now, lastCompleted.startsAt),
    })
  }

  lostPatients.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit)

  const outcomeCount = completedInRange.length + noShowsInRange.length
  return {
    summary: {
      completedAppointments: completedInRange.length,
      uniqueCompletedPatients,
      returningPatients,
      returningRatePct: pct(returningPatients, uniqueCompletedPatients),
      rebookedCompletedAppointments,
      rebookRatePct: pct(rebookedCompletedAppointments, completedInRange.length),
      noShowAppointments: noShowsInRange.length,
      noShowRatePct: pct(noShowsInRange.length, outcomeCount),
      lostPatients: lostPatients.length,
    },
    lostPatients,
  }
}

export function buildProcedureRepeatIntervals(
  appointments: RetentionAppointment[]
): ProcedureRepeatIntervalRow[] {
  const grouped = new Map<string, RetentionAppointment[]>()
  for (const appointment of appointments.filter((row) => row.status === COMPLETED_STATUS)) {
    const key = `${appointment.patientId}:${appointment.procedureId ?? 'unassigned'}`
    grouped.set(key, [...(grouped.get(key) ?? []), appointment])
  }

  const procedureIntervals = new Map<string, { row: ProcedureRepeatIntervalRow; days: number[] }>()
  for (const rows of grouped.values()) {
    const sorted = byTimeAsc(rows)
    for (let i = 1; i < sorted.length; i += 1) {
      const current = sorted[i]
      const previous = sorted[i - 1]
      const key = current.procedureId ?? 'unassigned'
      const existing =
        procedureIntervals.get(key) ??
        ({
          row: {
            procedureId: current.procedureId ?? null,
            procedureName: current.procedureName ?? 'Unassigned',
            repeatPairs: 0,
            averageDays: 0,
          },
          days: [],
        } satisfies { row: ProcedureRepeatIntervalRow; days: number[] })
      existing.days.push(daysBetween(current.startsAt, previous.startsAt))
      existing.row.repeatPairs = existing.days.length
      existing.row.averageDays = Math.round(
        existing.days.reduce((sum, days) => sum + days, 0) / existing.days.length
      )
      procedureIntervals.set(key, existing)
    }
  }

  return [...procedureIntervals.values()]
    .map((entry) => entry.row)
    .sort((a, b) => b.repeatPairs - a.repeatPairs || a.averageDays - b.averageDays)
}

export function buildFollowUpConversion(
  reminders: RetentionReminder[],
  appointments: RetentionAppointment[],
  start: Date,
  end: Date
): FollowUpConversionSummary {
  const activeReminders = reminders.filter(
    (reminder) =>
      reminder.patientId &&
      inRange(reminder.scheduledFor, start, end) &&
      ['SCHEDULED', 'PREPARED', 'SENT'].includes(reminder.status)
  )
  const convertedReminders = activeReminders.filter((reminder) =>
    appointments.some(
      (appointment) =>
        appointment.patientId === reminder.patientId &&
        appointment.startsAt > reminder.scheduledFor &&
        (appointment.status === COMPLETED_STATUS || ACTIVE_STATUSES.has(appointment.status))
    )
  ).length

  return {
    rebookingReminders: activeReminders.length,
    convertedReminders,
    conversionRatePct: pct(convertedReminders, activeReminders.length),
  }
}
