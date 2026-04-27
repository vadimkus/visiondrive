export const TREATMENT_PLAN_STATUSES = ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const

export type TreatmentPlanStatus = (typeof TREATMENT_PLAN_STATUSES)[number]

export type TreatmentPlanMilestone = {
  title: string
  targetSession?: number | null
  note?: string | null
}

export function normalizeTreatmentPlanSessions(value: unknown, fallback = 4) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), 1), 60)
}

export function normalizeTreatmentPlanCadenceDays(value: unknown, fallback = 14) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), 1), 365)
}

export function normalizeTreatmentPlanStatus(
  value: unknown,
  fallback: TreatmentPlanStatus = 'ACTIVE'
): TreatmentPlanStatus {
  const status = String(value ?? '').trim().toUpperCase()
  return TREATMENT_PLAN_STATUSES.includes(status as TreatmentPlanStatus)
    ? (status as TreatmentPlanStatus)
    : fallback
}

export function normalizePhotoMilestones(value: unknown): TreatmentPlanMilestone[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\n|,/).map((title) => ({ title }))
      : []

  return raw
    .map((item): TreatmentPlanMilestone | null => {
      if (typeof item === 'string') return { title: item, targetSession: null, note: null }
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      return {
        title: String(record.title ?? '').trim(),
        targetSession:
          record.targetSession == null ? null : normalizeTreatmentPlanSessions(record.targetSession, 1),
        note: record.note == null ? null : String(record.note).trim().slice(0, 500) || null,
      }
    })
    .filter((item): item is TreatmentPlanMilestone => !!item?.title)
    .map((item) => ({
      title: item.title.slice(0, 160),
      targetSession: item.targetSession ?? null,
      note: item.note ?? null,
    }))
    .slice(0, 20)
}

export function treatmentPlanProgress(completedSessions: number, expectedSessions: number) {
  const expected = normalizeTreatmentPlanSessions(expectedSessions, 1)
  const completed = Math.min(Math.max(Math.round(completedSessions || 0), 0), expected)
  return {
    completedSessions: completed,
    expectedSessions: expected,
    percent: Math.round((completed / expected) * 100),
    remainingSessions: Math.max(expected - completed, 0),
  }
}
