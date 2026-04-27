export const DEFAULT_CONTRAINDICATIONS = [
  'Pregnancy or breastfeeding',
  'Active infection, fever, or open wound',
  'Known allergy to treatment ingredients or medication',
  'Recent surgery, filler, laser, peel, or injectable treatment',
  'Blood thinner use or bleeding disorder',
] as const

export function normalizeContraindications(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\n|,/)
      : []

  const seen = new Set<string>()
  const normalized: string[] = []
  for (const item of raw) {
    const text = String(item ?? '').trim().replace(/\s+/g, ' ')
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(text.slice(0, 200))
  }
  return normalized.slice(0, 30)
}

export function normalizeConsentBody(value: unknown) {
  return String(value ?? '').trim().slice(0, 10_000)
}

export function consentAcceptedAt(params: { accepted: boolean; acceptedAt?: Date | string | null }) {
  if (!params.accepted) return null
  if (!params.acceptedAt) return new Date()
  const date = params.acceptedAt instanceof Date ? params.acceptedAt : new Date(params.acceptedAt)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export function buildConsentSnapshot(params: {
  templateTitle: string
  templateBody: string
  contraindications?: string[]
  checkedItems?: string[]
  patientName: string
}) {
  const contraindications = normalizeContraindications(params.contraindications ?? [])
  const allowed = new Set(contraindications.map((item) => item.toLowerCase()))
  const checkedItems = normalizeContraindications(params.checkedItems ?? []).filter((item) =>
    allowed.has(item.toLowerCase())
  )

  return {
    templateTitleSnapshot: params.templateTitle.trim().slice(0, 240),
    templateBodySnapshot: normalizeConsentBody(params.templateBody),
    contraindicationsSnapshot: contraindications,
    checkedItems,
    patientNameSnapshot: params.patientName.trim().slice(0, 240),
  }
}
