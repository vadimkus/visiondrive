import type { Prisma } from '@prisma/client'

/** Stored shape (v1). Extra keys in JSON are ignored on read. */
export type ClinicAnamnesisV1 = {
  v: 1
  allergies: string
  medications: string
  conditions: string
  social: string
  doctorQuestionnaire?: ClinicDoctorQuestionnaireV1
}

export type ClinicDoctorQuestionnaireAnswer = {
  id: string
  prompt: string
  type: 'YES_NO' | 'CHECKBOX' | 'TEXT'
  checked?: boolean
  answer?: string
}

export type ClinicDoctorQuestionnaireV1 = {
  v: 1
  title: string
  signedAt: string
  signatureText: string
  signatureDataUrl?: string
  answers: ClinicDoctorQuestionnaireAnswer[]
}

const MAX_LEN = 8000
const MAX_QUESTIONNAIRE_TEXT_LEN = 1000
const MAX_SIGNATURE_DATA_URL_LEN = 250_000
const MAX_QUESTIONNAIRE_ANSWERS = 20

export function doctorQuestionnaireFromJson(raw: unknown): ClinicDoctorQuestionnaireV1 | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const source = raw as Record<string, unknown>
  const nested = source.doctorQuestionnaire
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return null
  const o = nested as Record<string, unknown>
  const signatureText = typeof o.signatureText === 'string' ? o.signatureText.trim() : ''
  const signedAt = typeof o.signedAt === 'string' ? o.signedAt.trim() : ''
  const rawAnswers = Array.isArray(o.answers) ? o.answers : []
  if (!signatureText || !signedAt || rawAnswers.length === 0) return null

  const answers = rawAnswers.slice(0, MAX_QUESTIONNAIRE_ANSWERS).flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []
    const answer = item as Record<string, unknown>
    const id = typeof answer.id === 'string' ? answer.id.trim().slice(0, 80) : ''
    const prompt = typeof answer.prompt === 'string' ? answer.prompt.trim().slice(0, 400) : ''
    const type: ClinicDoctorQuestionnaireAnswer['type'] | null =
      answer.type === 'YES_NO'
        ? 'YES_NO'
        : answer.type === 'CHECKBOX'
          ? 'CHECKBOX'
          : answer.type === 'TEXT'
            ? 'TEXT'
            : null
    if (!id || !prompt || !type) return []
    return [{
      id,
      prompt,
      type,
      checked: type === 'YES_NO' || type === 'CHECKBOX' ? answer.checked === true : undefined,
      answer: type === 'TEXT' && typeof answer.answer === 'string'
        ? answer.answer.trim().slice(0, MAX_QUESTIONNAIRE_TEXT_LEN)
        : undefined,
    }]
  })

  if (answers.length === 0) return null

  return {
    v: 1,
    title: typeof o.title === 'string' ? o.title.trim().slice(0, 160) || 'Doctor questionnaire' : 'Doctor questionnaire',
    signedAt,
    signatureText: signatureText.slice(0, 240),
    signatureDataUrl:
      typeof o.signatureDataUrl === 'string' && o.signatureDataUrl.startsWith('data:image/')
        ? o.signatureDataUrl.slice(0, MAX_SIGNATURE_DATA_URL_LEN)
        : undefined,
    answers,
  }
}

export function normalizeDoctorQuestionnaire(value: unknown): ClinicDoctorQuestionnaireV1 | null {
  const wrapped = value && typeof value === 'object' && !Array.isArray(value) && 'doctorQuestionnaire' in value
    ? value
    : { doctorQuestionnaire: value }
  return doctorQuestionnaireFromJson(wrapped)
}

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
    doctorQuestionnaire: doctorQuestionnaireFromJson(raw) ?? undefined,
  }
}

export function anamnesisToStorage(fields: {
  allergies: string
  medications: string
  conditions: string
  social: string
  doctorQuestionnaire?: ClinicDoctorQuestionnaireV1 | null
}): Prisma.InputJsonValue | null {
  const allergies = fields.allergies.trim()
  const medications = fields.medications.trim()
  const conditions = fields.conditions.trim()
  const social = fields.social.trim()
  const doctorQuestionnaire = normalizeDoctorQuestionnaire(fields.doctorQuestionnaire)
  if (!allergies && !medications && !conditions && !social && !doctorQuestionnaire) return null
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
  const stored: Record<string, Prisma.InputJsonValue> = { v: 1, allergies, medications, conditions, social }
  if (doctorQuestionnaire) {
    stored.doctorQuestionnaire = doctorQuestionnaire as unknown as Prisma.InputJsonValue
  }
  return stored
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
      doctorQuestionnaire: normalizeDoctorQuestionnaire(o.doctorQuestionnaire),
    })
    return { ok: true, value }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid anamnesis'
    return { ok: false, error: msg }
  }
}
