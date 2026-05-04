import {
  ClinicAppointmentStatus,
  ClinicLeadActivityDirection,
  ClinicLeadActivityType,
  ClinicLeadSource,
  ClinicLeadStage,
} from '@prisma/client'
import { buildBookingChannelUrl } from './booking-channel-links'

export type GrowthLocale = 'en' | 'ru'

export type LeadStageInput = unknown

export type GrowthProcedureInput = {
  id: string
  name: string
  basePriceCents?: number | null
  currency?: string | null
}
export type GrowthLeadInput = {
  id: string
  displayName: string
  source: ClinicLeadSource | string
  stage: ClinicLeadStage | string
  instagramHandle?: string | null
  phone?: string | null
  email?: string | null
  campaign?: string | null
  trackingCode: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date | null
  convertedAt?: Date | null
  lostAt?: Date | null
  procedure?: GrowthProcedureInput | null
  convertedAppointment?: {
    id: string
    startsAt: Date
    status: ClinicAppointmentStatus | string
    completedAt?: Date | null
    procedure?: { name: string } | null
  } | null
}

export type GrowthTask = {
  id: string
  kind: 'lead_reply' | 'booking_link' | 'aftercare' | 'rebooking' | 'package_offer' | 'membership_offer'
  title: string
  detail: string
  leadId?: string | null
  patientId?: string | null
  appointmentId?: string | null
  actionHref: string
}

export const LEAD_STAGES: ClinicLeadStage[] = [
  ClinicLeadStage.NEW,
  ClinicLeadStage.REPLIED,
  ClinicLeadStage.BOOKING_LINK_SENT,
  ClinicLeadStage.BOOKED,
  ClinicLeadStage.COMPLETED,
  ClinicLeadStage.REBOOKING_DUE,
  ClinicLeadStage.PACKAGE_OPPORTUNITY,
  ClinicLeadStage.MEMBERSHIP_OPPORTUNITY,
  ClinicLeadStage.LOST,
]

const ACTIVE_STAGE_SET = new Set<ClinicLeadStage>([
  ClinicLeadStage.NEW,
  ClinicLeadStage.REPLIED,
  ClinicLeadStage.BOOKING_LINK_SENT,
  ClinicLeadStage.BOOKED,
  ClinicLeadStage.COMPLETED,
  ClinicLeadStage.REBOOKING_DUE,
  ClinicLeadStage.PACKAGE_OPPORTUNITY,
  ClinicLeadStage.MEMBERSHIP_OPPORTUNITY,
])

export function normalizeLeadStage(
  value: LeadStageInput,
  fallback: ClinicLeadStage = ClinicLeadStage.NEW
): ClinicLeadStage {
  const stage = String(value ?? '').trim().toUpperCase()
  return LEAD_STAGES.includes(stage as ClinicLeadStage) ? (stage as ClinicLeadStage) : fallback
}

export function normalizeLeadSource(value: unknown): ClinicLeadSource {
  const source = String(value ?? '').trim().toUpperCase()
  return source in ClinicLeadSource ? (source as ClinicLeadSource) : ClinicLeadSource.INSTAGRAM
}

export function normalizeLeadActivityType(value: unknown): ClinicLeadActivityType {
  const type = String(value ?? '').trim().toUpperCase()
  return type in ClinicLeadActivityType ? (type as ClinicLeadActivityType) : ClinicLeadActivityType.NOTE
}

export function normalizeLeadActivityDirection(value: unknown): ClinicLeadActivityDirection {
  const direction = String(value ?? '').trim().toUpperCase()
  return direction in ClinicLeadActivityDirection
    ? (direction as ClinicLeadActivityDirection)
    : ClinicLeadActivityDirection.INTERNAL
}

export function cleanInstagramHandle(value: unknown) {
  const trimmed = String(value ?? '')
    .trim()
    .replace(/^@+/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .split(/[/?#]/)[0]
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 80)
  return trimmed || null
}

export function displayNameFromLeadInput(input: {
  displayName?: unknown
  instagramHandle?: unknown
  phone?: unknown
  email?: unknown
}) {
  const explicit = String(input.displayName ?? '').trim().slice(0, 160)
  if (explicit) return explicit
  const handle = cleanInstagramHandle(input.instagramHandle)
  if (handle) return `@${handle}`
  const phone = String(input.phone ?? '').trim()
  if (phone) return phone.slice(0, 80)
  const email = String(input.email ?? '').trim()
  if (email) return email.slice(0, 120)
  return 'Instagram lead'
}

export function activeLeadStages() {
  return [...ACTIVE_STAGE_SET]
}

export function nextStageAfterActivity(type: ClinicLeadActivityType, currentStage: ClinicLeadStage) {
  if (type === ClinicLeadActivityType.BOOKING_LINK_SENT) return ClinicLeadStage.BOOKING_LINK_SENT
  if (
    (type === ClinicLeadActivityType.INSTAGRAM_DM || type === ClinicLeadActivityType.WHATSAPP) &&
    currentStage === ClinicLeadStage.NEW
  ) {
    return ClinicLeadStage.REPLIED
  }
  return currentStage
}

export function buildLeadBookingUrl({
  baseUrl,
  trackingCode,
  procedureId,
  campaign,
}: {
  baseUrl: string
  trackingCode: string
  procedureId?: string | null
  campaign?: string | null
}) {
  const url = buildBookingChannelUrl({
    baseUrl,
    channel: 'instagram',
    procedureId,
    campaign: campaign || 'instagram_dm',
  })
  const parsed = new URL(url, 'https://visiondrive.local')
  parsed.searchParams.set('lead', trackingCode)
  parsed.searchParams.set('ref', trackingCode)
  if (url.startsWith('http://') || url.startsWith('https://')) return parsed.toString()
  return `${parsed.pathname}${parsed.search}`
}

function money(cents?: number | null, currency?: string | null) {
  if (!cents || cents <= 0) return ''
  return `${(cents / 100).toFixed(0)} ${currency || 'AED'}`
}

export function buildInstagramReply({
  mode,
  locale = 'en',
  leadName,
  procedure,
  bookingUrl,
  practitionerName,
}: {
  mode: 'booking' | 'price' | 'aftercare' | 'package' | 'membership'
  locale?: GrowthLocale
  leadName?: string | null
  procedure?: GrowthProcedureInput | null
  bookingUrl?: string | null
  practitionerName?: string | null
}) {
  const name = leadName?.trim() || (locale === 'ru' ? 'добрый день' : 'there')
  const service = procedure?.name || (locale === 'ru' ? 'услуга' : 'treatment')
  const price = money(procedure?.basePriceCents, procedure?.currency)
  const signature = practitionerName?.trim() ? `\n\n${practitionerName.trim()}` : ''
  const link = bookingUrl ? `\n${bookingUrl}` : ''

  if (locale === 'ru') {
    if (mode === 'price') {
      return `Здравствуйте, ${name}. ${service}: ${price || 'стоимость зависит от консультации'}. Могу отправить ссылку, чтобы вы выбрали удобное время.${link}${signature}`
    }
    if (mode === 'aftercare') {
      return `Здравствуйте, ${name}. После ${service} важно соблюдать рекомендации по уходу. Если появятся вопросы, напишите сюда, и я помогу.${signature}`
    }
    if (mode === 'package') {
      return `Здравствуйте, ${name}. Для ${service} часто выгоднее пакет: так легче держать регулярность и фиксировать результат. Хотите, я предложу варианты?${signature}`
    }
    if (mode === 'membership') {
      return `Здравствуйте, ${name}. У нас есть регулярный формат ухода с ежемесячной оплатой. Если хотите, я расскажу, какой план подойдёт под вашу цель.${signature}`
    }
    return `Здравствуйте, ${name}. Вот приватная ссылка для записи на ${service}. Выберите удобное время, а детали попадут напрямую специалисту.${link}${signature}`
  }

  if (mode === 'price') {
    return `Hi ${name}, ${service} is ${price || 'priced after a quick consultation'}. I can send you the booking link so you can choose a convenient time.${link}${signature}`
  }
  if (mode === 'aftercare') {
    return `Hi ${name}, after ${service}, please follow the aftercare instructions carefully. If anything feels unclear, reply here and I will help.${signature}`
  }
  if (mode === 'package') {
    return `Hi ${name}, for ${service}, a package is often better value and keeps the result consistent. Would you like me to suggest the best option?${signature}`
  }
  if (mode === 'membership') {
    return `Hi ${name}, we have a recurring care membership for clients who want regular treatment and simpler monthly planning. I can explain the best fit for your goal.${signature}`
  }
  return `Hi ${name}, here is the private booking link for ${service}. Choose a time that suits you and the details will go directly to the practice.${link}${signature}`
}

export function leadStageLabel(stage: ClinicLeadStage | string) {
  switch (normalizeLeadStage(stage)) {
    case ClinicLeadStage.NEW:
      return 'New lead'
    case ClinicLeadStage.REPLIED:
      return 'Replied'
    case ClinicLeadStage.BOOKING_LINK_SENT:
      return 'Booking link sent'
    case ClinicLeadStage.BOOKED:
      return 'Booked'
    case ClinicLeadStage.COMPLETED:
      return 'Completed'
    case ClinicLeadStage.REBOOKING_DUE:
      return 'Rebooking due'
    case ClinicLeadStage.PACKAGE_OPPORTUNITY:
      return 'Package opportunity'
    case ClinicLeadStage.MEMBERSHIP_OPPORTUNITY:
      return 'Membership opportunity'
    case ClinicLeadStage.LOST:
      return 'Lost'
  }
}

export function buildLeadTasks(leads: GrowthLeadInput[], now = new Date()): GrowthTask[] {
  const tasks: GrowthTask[] = []
  for (const lead of leads) {
    const stage = normalizeLeadStage(lead.stage)
    if (stage === ClinicLeadStage.LOST) continue
    const detail = [lead.instagramHandle ? `@${lead.instagramHandle}` : null, lead.procedure?.name ?? null]
      .filter(Boolean)
      .join(' · ')
    if (stage === ClinicLeadStage.NEW) {
      tasks.push({
        id: `lead-reply:${lead.id}`,
        kind: 'lead_reply',
        title: `Reply to ${lead.displayName}`,
        detail: detail || 'New Instagram lead',
        leadId: lead.id,
        actionHref: '/clinic/growth',
      })
    }
    if (stage === ClinicLeadStage.REPLIED) {
      tasks.push({
        id: `booking-link:${lead.id}`,
        kind: 'booking_link',
        title: `Send booking link to ${lead.displayName}`,
        detail: detail || 'Lead is waiting for next step',
        leadId: lead.id,
        actionHref: '/clinic/growth',
      })
    }
    if (stage === ClinicLeadStage.COMPLETED) {
      tasks.push({
        id: `package-offer:${lead.id}`,
        kind: 'package_offer',
        title: `Offer package to ${lead.displayName}`,
        detail: lead.convertedAppointment?.procedure?.name || 'Completed appointment',
        leadId: lead.id,
        appointmentId: lead.convertedAppointment?.id ?? null,
        actionHref: '/clinic/growth',
      })
    }
    if (stage === ClinicLeadStage.BOOKED && lead.convertedAppointment && lead.convertedAppointment.startsAt < now) {
      tasks.push({
        id: `aftercare:${lead.id}`,
        kind: 'aftercare',
        title: `Check aftercare for ${lead.displayName}`,
        detail: lead.convertedAppointment.procedure?.name || 'Recent booking',
        leadId: lead.id,
        appointmentId: lead.convertedAppointment.id,
        actionHref: `/clinic/appointments/${lead.convertedAppointment.id}`,
      })
    }
  }
  return tasks
}
