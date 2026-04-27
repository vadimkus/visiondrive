export const PATIENT_CATEGORIES = ['VIP', 'REGULAR', 'NEW', 'SENSITIVE', 'HIGH_RISK'] as const

export const PATIENT_TAGS = [
  'vip',
  'regular',
  'new',
  'sensitive',
  'high-risk',
  'follow-up-due',
  'late-payer',
] as const

export type PatientCategory = (typeof PATIENT_CATEGORIES)[number]
export type PatientTag = (typeof PATIENT_TAGS)[number]

export function normalizePatientCategory(value: unknown) {
  const normalized = String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_')
  return PATIENT_CATEGORIES.includes(normalized as PatientCategory)
    ? (normalized as PatientCategory)
    : null
}

export function normalizePatientTags(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((tag) => tag.trim())

  const seen = new Set<string>()
  const tags: PatientTag[] = []
  for (const item of raw) {
    const normalized = String(item || '').trim().toLowerCase().replace(/[\s_]+/g, '-')
    if (!PATIENT_TAGS.includes(normalized as PatientTag) || seen.has(normalized)) continue
    seen.add(normalized)
    tags.push(normalized as PatientTag)
  }
  return tags
}

export function patientTagLabel(tag: string) {
  return tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
