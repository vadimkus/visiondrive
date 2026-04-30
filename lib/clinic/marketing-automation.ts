import { whatsappUrl } from './reminders'
import { nextBirthday } from './occasions'

export type MarketingSegmentKey =
  | 'tag'
  | 'service'
  | 'last_visit'
  | 'package_balance'
  | 'birthday'
  | 'dormant'
  | 'no_show'

export type MarketingLocale = 'en' | 'ru'

export type MarketingPatientInput = {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  email?: string | null
  tags?: string[]
  dateOfBirth?: Date | null
  appointments?: Array<{
    startsAt: Date
    status: string
    procedure?: { id: string; name: string } | null
    titleOverride?: string | null
  }>
  packages?: Array<{
    name: string
    status: string
    remainingSessions: number
    procedure?: { id: string; name: string } | null
  }>
}

type MarketingAppointmentInput = NonNullable<MarketingPatientInput['appointments']>[number]

export type MarketingSegmentOptions = {
  segment: MarketingSegmentKey
  locale?: MarketingLocale
  tag?: string | null
  procedureId?: string | null
  days?: number
  now?: Date
}

export type MarketingSegmentRow = {
  patientId: string
  patientName: string
  firstName: string
  phone: string | null
  email: string | null
  reason: string
  message: string
  whatsappUrl: string | null
  actionHref: string
  lastVisitAt: string | null
  lastProcedureName: string | null
  daysSinceLastVisit: number | null
  packageRemainingSessions: number | null
  daysUntilBirthday: number | null
}

const DEFAULT_DAYS: Record<MarketingSegmentKey, number> = {
  tag: 30,
  service: 90,
  last_visit: 45,
  package_balance: 30,
  birthday: 30,
  dormant: 90,
  no_show: 120,
}

export const MARKETING_SEGMENTS: MarketingSegmentKey[] = [
  'tag',
  'service',
  'last_visit',
  'package_balance',
  'birthday',
  'dormant',
  'no_show',
]

export function normalizeMarketingSegment(value: unknown): MarketingSegmentKey {
  const text = String(value ?? '').trim()
  return MARKETING_SEGMENTS.includes(text as MarketingSegmentKey) ? (text as MarketingSegmentKey) : 'dormant'
}

export function normalizeMarketingLocale(value: unknown): MarketingLocale {
  return value === 'ru' ? 'ru' : 'en'
}

export function normalizeMarketingDays(segment: MarketingSegmentKey, value: unknown) {
  const parsed = Number(value ?? DEFAULT_DAYS[segment])
  if (!Number.isFinite(parsed)) return DEFAULT_DAYS[segment]
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

function patientName(patient: Pick<MarketingPatientInput, 'firstName' | 'lastName'>) {
  return `${patient.lastName}, ${patient.firstName}`.trim()
}

function activeFutureAppointment(patient: MarketingPatientInput, now: Date) {
  return (patient.appointments ?? []).some(
    (appointment) =>
      appointment.startsAt >= now && ['SCHEDULED', 'CONFIRMED', 'ARRIVED'].includes(appointment.status)
  )
}

function completedAppointments(patient: MarketingPatientInput) {
  return [...(patient.appointments ?? [])]
    .filter((appointment) => appointment.status === 'COMPLETED')
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
}

function lastCompletedAppointment(patient: MarketingPatientInput) {
  return completedAppointments(patient)[0] ?? null
}

function appointmentServiceName(appointment: MarketingAppointmentInput | null | undefined) {
  return appointment?.procedure?.name ?? appointment?.titleOverride ?? null
}

function daysBetween(from: Date, to: Date) {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000))
}

function buildMarketingMessage({
  segment,
  firstName,
  locale,
  reason,
  lastProcedureName,
  packageRemainingSessions,
}: {
  segment: MarketingSegmentKey
  firstName: string
  locale: MarketingLocale
  reason: string
  lastProcedureName: string | null
  packageRemainingSessions: number | null
}) {
  const name = firstName.trim() || (locale === 'ru' ? 'добрый день' : 'there')
  if (locale === 'ru') {
    if (segment === 'birthday') {
      return `Здравствуйте, ${name}. Увидела повод написать: ${reason}. Если хотите запланировать уход для себя, ответьте здесь.`
    }
    if (segment === 'package_balance') {
      return `Здравствуйте, ${name}. Напоминаю, что у вас осталось ${packageRemainingSessions ?? 0} сеанс(ов) в пакете. Хотите подобрать удобное время для следующего визита?`
    }
    if (segment === 'no_show') {
      return `Здравствуйте, ${name}. Мы не смогли встретиться в прошлый раз. Если хотите, я помогу спокойно подобрать новое время.`
    }
    if (segment === 'service') {
      return `Здравствуйте, ${name}. Пишу по поводу ${lastProcedureName ?? 'вашей процедуры'}. Если хотите повторить или обсудить следующий шаг, ответьте здесь.`
    }
    return `Здравствуйте, ${name}. ${reason}. Если хотите, я могу предложить несколько удобных вариантов для следующего визита.`
  }

  if (segment === 'birthday') {
    return `Hi ${name}, I noticed a personal occasion: ${reason}. If you would like to plan a little self-care, reply here.`
  }
  if (segment === 'package_balance') {
    return `Hi ${name}, quick reminder that you still have ${packageRemainingSessions ?? 0} session(s) left in your package. Would you like me to suggest a convenient next slot?`
  }
  if (segment === 'no_show') {
    return `Hi ${name}, we missed you last time. If you would like, I can help find a new time calmly.`
  }
  if (segment === 'service') {
    return `Hi ${name}, checking in after your ${lastProcedureName ?? 'treatment'}. Reply here if you would like to repeat it or discuss the next step.`
  }
  return `Hi ${name}, ${reason}. Reply here if you would like a few convenient options for your next visit.`
}

export function buildMarketingSegmentRows(
  patients: MarketingPatientInput[],
  options: MarketingSegmentOptions
): MarketingSegmentRow[] {
  const segment = normalizeMarketingSegment(options.segment)
  const locale = options.locale ?? 'en'
  const now = options.now ?? new Date()
  const days = normalizeMarketingDays(segment, options.days)
  const tag = options.tag?.trim().toLowerCase() || null
  const procedureId = options.procedureId?.trim() || null

  const rows: MarketingSegmentRow[] = []

  for (const patient of patients) {
    const lastVisit = lastCompletedAppointment(patient)
    const lastVisitAt = lastVisit?.startsAt ?? null
    const daysSinceLastVisit = lastVisitAt ? daysBetween(lastVisitAt, now) : null
    const lastProcedureName = appointmentServiceName(lastVisit)
    const hasFuture = activeFutureAppointment(patient, now)
    const activePackage =
      (patient.packages ?? [])
        .filter((pkg) => pkg.status === 'ACTIVE' && pkg.remainingSessions > 0)
        .sort((a, b) => b.remainingSessions - a.remainingSessions)[0] ?? null
    const birthday = patient.dateOfBirth ? nextBirthday(patient.dateOfBirth, now) : null
    const recentNoShow =
      [...(patient.appointments ?? [])]
        .filter((appointment) => appointment.status === 'NO_SHOW')
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0] ?? null

    let include = false
    let reason = ''

    if (segment === 'tag') {
      include = tag ? (patient.tags ?? []).some((item) => item.toLowerCase() === tag) : (patient.tags ?? []).length > 0
      reason = tag ? `Tagged ${tag}` : `Tagged ${(patient.tags ?? []).join(', ')}`
    }
    if (segment === 'service') {
      include = completedAppointments(patient).some((appointment) =>
        procedureId ? appointment.procedure?.id === procedureId : Boolean(appointment.procedure?.id)
      )
      reason = lastProcedureName ? `Last ${lastProcedureName} visit` : 'Previous service client'
    }
    if (segment === 'last_visit') {
      include = Boolean(lastVisitAt && daysSinceLastVisit != null && daysSinceLastVisit >= days && !hasFuture)
      reason = `Last visit ${daysSinceLastVisit ?? 0} days ago`
    }
    if (segment === 'package_balance') {
      include = Boolean(activePackage)
      reason = activePackage ? `${activePackage.name}: ${activePackage.remainingSessions} session(s) left` : ''
    }
    if (segment === 'birthday') {
      include = Boolean(birthday && birthday.daysUntil <= days)
      reason = birthday?.daysUntil === 0 ? 'Birthday today' : `Birthday in ${birthday?.daysUntil ?? 0} day(s)`
    }
    if (segment === 'dormant') {
      include = Boolean(lastVisitAt && daysSinceLastVisit != null && daysSinceLastVisit >= days && !hasFuture)
      reason = `Dormant for ${daysSinceLastVisit ?? 0} days`
    }
    if (segment === 'no_show') {
      const daysSinceNoShow = recentNoShow ? daysBetween(recentNoShow.startsAt, now) : null
      include = Boolean(recentNoShow && daysSinceNoShow != null && daysSinceNoShow <= days && !hasFuture)
      reason = recentNoShow ? `No-show ${daysSinceNoShow} days ago` : ''
    }

    if (!include) continue

    const packageRemainingSessions = activePackage?.remainingSessions ?? null
    const message = buildMarketingMessage({
      segment,
      firstName: patient.firstName,
      locale,
      reason,
      lastProcedureName,
      packageRemainingSessions,
    })

    rows.push({
      patientId: patient.id,
      patientName: patientName(patient),
      firstName: patient.firstName,
      phone: patient.phone ?? null,
      email: patient.email ?? null,
      reason,
      message,
      whatsappUrl: whatsappUrl(patient.phone, message),
      actionHref: `/clinic/patients/${patient.id}`,
      lastVisitAt: lastVisitAt?.toISOString() ?? null,
      lastProcedureName,
      daysSinceLastVisit,
      packageRemainingSessions,
      daysUntilBirthday: birthday?.daysUntil ?? null,
    })
  }

  return rows.sort((a, b) => a.patientName.localeCompare(b.patientName))
}
