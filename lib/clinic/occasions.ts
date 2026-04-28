import { whatsappUrl } from './reminders'

export const OCCASION_RANGES = [7, 30, 90] as const

export type OccasionLocale = 'en' | 'ru'

export type OccasionPatientLike = {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  email?: string | null
  dateOfBirth: Date
}

export type BirthdayOccasionRow = {
  patientId: string
  patientName: string
  firstName: string
  phone: string | null
  email: string | null
  dateOfBirth: Date
  nextBirthdayAt: Date
  daysUntil: number
  turningAge: number
}

const DAY_MS = 24 * 60 * 60 * 1000

export function normalizeOccasionRange(value: unknown, fallback = 30) {
  const n = Number(value ?? fallback)
  if (!Number.isFinite(n)) return fallback
  return OCCASION_RANGES.includes(n as (typeof OCCASION_RANGES)[number]) ? n : fallback
}

export function normalizeOccasionLocale(value: unknown): OccasionLocale {
  return value === 'ru' ? 'ru' : 'en'
}

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
}

function birthdayForYear(dateOfBirth: Date, year: number) {
  const month = dateOfBirth.getUTCMonth()
  const day = dateOfBirth.getUTCDate()
  const candidate = new Date(Date.UTC(year, month, day))
  // Non-leap years cannot represent Feb 29. Treat it as Feb 28 for outreach.
  if (candidate.getUTCMonth() !== month) return new Date(Date.UTC(year, 1, 28))
  return candidate
}

export function nextBirthday(dateOfBirth: Date, now = new Date()) {
  const today = startOfUtcDay(now)
  let next = birthdayForYear(dateOfBirth, today.getUTCFullYear())
  if (next < today) next = birthdayForYear(dateOfBirth, today.getUTCFullYear() + 1)
  return {
    nextBirthdayAt: next,
    daysUntil: Math.round((next.getTime() - today.getTime()) / DAY_MS),
    turningAge: next.getUTCFullYear() - dateOfBirth.getUTCFullYear(),
  }
}

export function buildBirthdayOccasionRows(
  patients: OccasionPatientLike[],
  now = new Date(),
  days = 30
): BirthdayOccasionRow[] {
  return patients
    .map((patient) => {
      const birthday = nextBirthday(patient.dateOfBirth, now)
      return {
        patientId: patient.id,
        patientName: `${patient.lastName}, ${patient.firstName}`.trim(),
        firstName: patient.firstName,
        phone: patient.phone ?? null,
        email: patient.email ?? null,
        dateOfBirth: patient.dateOfBirth,
        ...birthday,
      }
    })
    .filter((row) => row.daysUntil <= days)
    .sort((a, b) => a.daysUntil - b.daysUntil || a.patientName.localeCompare(b.patientName))
}

export function buildBirthdayMessage(
  patient: Pick<BirthdayOccasionRow, 'firstName' | 'daysUntil'>,
  locale: OccasionLocale = 'en'
) {
  const firstName = patient.firstName.trim() || (locale === 'ru' ? 'Здравствуйте' : 'there')
  if (locale === 'ru') {
    if (patient.daysUntil === 0) {
      return `Здравствуйте, ${firstName}. С днем рождения! Желаю вам красивого, спокойного дня и всего самого доброго.`
    }
    return `Здравствуйте, ${firstName}. Увидела, что у вас скоро день рождения, и хотела заранее пожелать вам красивого, спокойного дня. Если захотите запланировать уход для себя, напишите сюда.`
  }

  if (patient.daysUntil === 0) {
    return `Hi ${firstName}, happy birthday. Wishing you a calm, beautiful day and all the best.`
  }
  return `Hi ${firstName}, I noticed your birthday is coming up and wanted to wish you a calm, beautiful day in advance. If you would like to plan a little self-care, reply here.`
}

export function buildBirthdayWhatsappUrl(
  patient: Pick<BirthdayOccasionRow, 'firstName' | 'daysUntil' | 'phone'>,
  locale: OccasionLocale = 'en'
) {
  return whatsappUrl(patient.phone, buildBirthdayMessage(patient, locale))
}
