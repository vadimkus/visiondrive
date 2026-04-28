import { whatsappUrl } from './reminders'

export const REACTIVATION_THRESHOLDS = [60, 90, 120] as const

export type ReactivationLocale = 'en' | 'ru'

export type ReactivationPatientLike = {
  patientPhone?: string | null
  firstName: string
  lastProcedureName?: string | null
  daysSinceLastVisit: number
}

export function normalizeReactivationThreshold(value: unknown, fallback = 60) {
  const n = Number(value ?? fallback)
  if (!Number.isFinite(n)) return fallback
  return REACTIVATION_THRESHOLDS.includes(n as (typeof REACTIVATION_THRESHOLDS)[number])
    ? n
    : fallback
}

export function normalizeReactivationLocale(value: unknown): ReactivationLocale {
  return value === 'ru' ? 'ru' : 'en'
}

export function buildReactivationMessage(
  patient: Pick<ReactivationPatientLike, 'firstName' | 'lastProcedureName' | 'daysSinceLastVisit'>,
  locale: ReactivationLocale = 'en'
) {
  const firstName = patient.firstName.trim() || (locale === 'ru' ? 'Здравствуйте' : 'there')
  const service = patient.lastProcedureName?.trim()
  if (locale === 'ru') {
    const serviceText = service ? `после процедуры "${service}"` : 'после последнего визита'
    return `Здравствуйте, ${firstName}. Давно не виделись (${patient.daysSinceLastVisit} дн. ${serviceText}). Если хотите, я могу прислать несколько удобных вариантов для следующего визита.`
  }

  const serviceText = service ? `after your ${service}` : 'since your last visit'
  return `Hi ${firstName}, hope you are well. It has been ${patient.daysSinceLastVisit} days ${serviceText}. Reply here if you would like a few available options for your next visit.`
}

export function buildReactivationWhatsappUrl(
  patient: ReactivationPatientLike,
  locale: ReactivationLocale = 'en'
) {
  return whatsappUrl(patient.patientPhone, buildReactivationMessage(patient, locale))
}
