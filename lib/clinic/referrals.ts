export const REFERRAL_RANGES = ['30d', '90d', 'year', 'all'] as const

export type ReferralRange = (typeof REFERRAL_RANGES)[number]

export type ReferralPatientLike = {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  email?: string | null
  createdAt: Date
  referredByName?: string | null
  referralNote?: string | null
  completedAppointments?: number
}

export type ReferralSourceSummary = {
  sourceKey: string
  sourceLabel: string
  referredPatients: number
  completedAppointments: number
}

export function normalizeReferralText(value: unknown, max = 240) {
  if (value == null) return null
  const text = String(value).trim().replace(/\s+/g, ' ')
  return text ? text.slice(0, max) : null
}

export function normalizeReferralNote(value: unknown) {
  return normalizeReferralText(value, 1000)
}

export function normalizeReferralRange(value: unknown): ReferralRange {
  return REFERRAL_RANGES.includes(value as ReferralRange) ? (value as ReferralRange) : '90d'
}

export function referralRangeStart(range: ReferralRange, now = new Date()) {
  if (range === 'all') return null
  const days = range === 'year' ? 365 : range === '30d' ? 30 : 90
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export function referralSourceKey(source: string) {
  return source.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown'
}

export function buildReferralSourceSummary(
  patients: ReferralPatientLike[]
): ReferralSourceSummary[] {
  const rows = new Map<string, ReferralSourceSummary>()

  for (const patient of patients) {
    const source = normalizeReferralText(patient.referredByName)
    if (!source) continue
    const key = referralSourceKey(source)
    const existing =
      rows.get(key) ??
      {
        sourceKey: key,
        sourceLabel: source,
        referredPatients: 0,
        completedAppointments: 0,
      }
    existing.referredPatients += 1
    existing.completedAppointments += patient.completedAppointments ?? 0
    rows.set(key, existing)
  }

  return [...rows.values()].sort(
    (a, b) =>
      b.referredPatients - a.referredPatients ||
      b.completedAppointments - a.completedAppointments ||
      a.sourceLabel.localeCompare(b.sourceLabel)
  )
}

export function referralPatientName(patient: Pick<ReferralPatientLike, 'firstName' | 'lastName'>) {
  return `${patient.lastName}, ${patient.firstName}`.trim()
}
