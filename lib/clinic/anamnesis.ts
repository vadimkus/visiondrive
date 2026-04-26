import type { Prisma } from '@prisma/client'

/** Stored shape (v1). Extra keys in JSON are ignored on read. */
export type ClinicAnamnesisV1 = {
  v: 1
  allergies: string
  medications: string
  conditions: string
  social: string
}

const MAX_LEN = 8000

export function anamnesisFromJson(raw: unknown): ClinicAnamnesisV1 {
  const empty: ClinicAnamnesisV1 = {
    v: 1,
    allergies: '',
    medications: '',
    conditions: '',
    social: '',
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return empty
  const o = raw as Record<string, unknown>
  const s = (key: keyof Omit<ClinicAnamnesisV1, 'v'>): string => {
    const x = o[key]
    return typeof x === 'string' ? x : ''
  }
  return {
    v: 1,
    allergies: s('allergies'),
    medications: s('medications'),
    conditions: s('conditions'),
    social: s('social'),
  }
}

export function anamnesisToStorage(fields: {
  allergies: string
  medications: string
  conditions: string
  social: string
}): Prisma.InputJsonValue | null {
  const allergies = fields.allergies.trim()
  const medications = fields.medications.trim()
  const conditions = fields.conditions.trim()
  const social = fields.social.trim()
  if (!allergies && !medications && !conditions && !social) return null
  for (const [val, name] of [
    [allergies, 'allergies'],
    [medications, 'medications'],
    [conditions, 'conditions'],
    [social, 'social'],
  ] as const) {
    if (val.length > MAX_LEN) {
      throw new Error(`${name} exceeds ${MAX_LEN} characters`)
    }
  }
  return { v: 1, allergies, medications, conditions, social }
}

export function parseAnamnesisPatchBody(
  v: unknown
): { ok: true; value: Prisma.InputJsonValue | null } | { ok: false; error: string } {
  if (v === null) return { ok: true, value: null }
  if (typeof v !== 'object' || Array.isArray(v)) {
    return { ok: false, error: 'anamnesisJson must be an object or null' }
  }
  const o = v as Record<string, unknown>
  try {
    const value = anamnesisToStorage({
      allergies: typeof o.allergies === 'string' ? o.allergies : '',
      medications: typeof o.medications === 'string' ? o.medications : '',
      conditions: typeof o.conditions === 'string' ? o.conditions : '',
      social: typeof o.social === 'string' ? o.social : '',
    })
    return { ok: true, value }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid anamnesis'
    return { ok: false, error: msg }
  }
}
