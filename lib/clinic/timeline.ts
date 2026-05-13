/**
 * Pure helpers to build a unified patient timeline for the workspace.
 * Keeps API response shaping out of React components and enables unit tests.
 */

export type TimelineFilter = 'all' | 'appointment' | 'visit' | 'payment' | 'crm'

export type TimelineItem = {
  sort: number
  kind: TimelineFilter
  refId?: string
  label: string
  detail: string
  meta: string
}

type AppointmentInput = {
  id?: string
  startsAt: string
  status: string
  titleOverride: string | null
  procedure: { name: string } | null
}

type VisitInput = {
  id?: string
  visitAt: string
  status: string
  chiefComplaint: string | null
  procedureSummary: string | null
}

type PaymentInput = {
  id?: string
  paidAt: string
  status: string
  amountCents: number
  currency: string
  method: string
  reference?: string | null
}

type CrmInput = {
  id?: string
  occurredAt: string
  type: string
  body: string
}

function timelineLanguage(locale: string) {
  return locale.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

function formatStatus(status: string, locale: string) {
  const lang = timelineLanguage(locale)
  const normalized = status.toUpperCase()
  const ru: Record<string, string> = {
    ARRIVED: 'Пришёл',
    CANCELLED: 'Отменено',
    COMPLETED: 'Завершён',
    CONFIRMED: 'Подтверждено',
    NO_SHOW: 'Неявка',
    PAID: 'Оплачено',
    PENDING: 'Ожидает оплаты',
    REFUNDED: 'Возврат',
    SCHEDULED: 'Запланировано',
    VOID: 'Аннулировано',
  }
  const en: Record<string, string> = {
    ARRIVED: 'Arrived',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
    CONFIRMED: 'Confirmed',
    NO_SHOW: 'No-show',
    PAID: 'Paid',
    PENDING: 'Pending',
    REFUNDED: 'Refunded',
    SCHEDULED: 'Scheduled',
    VOID: 'Void',
  }
  return (lang === 'ru' ? ru : en)[normalized] ?? status.replace(/_/g, ' ')
}

function formatKind(kind: Exclude<TimelineFilter, 'all'>, locale: string) {
  const lang = timelineLanguage(locale)
  if (lang === 'ru') {
    if (kind === 'appointment') return 'Запись'
    if (kind === 'visit') return 'Визит'
    if (kind === 'payment') return 'Платёж'
    return 'CRM'
  }
  if (kind === 'appointment') return 'Appointment'
  if (kind === 'visit') return 'Visit'
  if (kind === 'payment') return 'Payment'
  return 'CRM'
}

function formatTimelineLabel(kind: Exclude<TimelineFilter, 'all'>, status: string, locale: string) {
  return `${formatKind(kind, locale)} · ${formatStatus(status, locale)}`
}

function formatDebtLabel(locale: string) {
  return timelineLanguage(locale) === 'ru' ? 'Долг' : 'Outstanding'
}

function formatPendingLabel(locale: string) {
  return timelineLanguage(locale) === 'ru' ? 'Ожидает оплаты' : 'Pending'
}

function isVisitCharge(reference: string | null | undefined) {
  return reference?.startsWith('VISIT_CHARGE:')
}

function visitGroupKey(visit: VisitInput) {
  const date = new Date(visit.visitAt)
  const minute = Number.isNaN(date.getTime()) ? visit.visitAt : date.toISOString().slice(0, 16)
  return `${minute}|${visit.status}`
}

function compactUnique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

export function buildTimelineItems(
  appointments: AppointmentInput[],
  visits: VisitInput[],
  payments: PaymentInput[],
  crm: CrmInput[],
  locale: string = 'en-GB'
): TimelineItem[] {
  const items: TimelineItem[] = []

  for (const a of appointments) {
    const sort = new Date(a.startsAt).getTime()
    items.push({
      sort,
      kind: 'appointment',
      refId: a.id,
      label: formatTimelineLabel('appointment', a.status, locale),
      detail: a.procedure?.name || a.titleOverride || (timelineLanguage(locale) === 'ru' ? 'Запланированный визит' : 'Scheduled visit'),
      meta: new Date(a.startsAt).toLocaleString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  }

  const visitGroups = new Map<string, VisitInput[]>()
  for (const visit of visits) {
    const key = visitGroupKey(visit)
    visitGroups.set(key, [...(visitGroups.get(key) ?? []), visit])
  }

  for (const group of visitGroups.values()) {
    const firstVisit = group[0]
    const sort = new Date(firstVisit.visitAt).getTime()
    const details = compactUnique(
      group.map((visit) => visit.procedureSummary || visit.chiefComplaint || '')
    )
    items.push({
      sort,
      kind: 'visit',
      refId: group.length === 1 ? firstVisit.id : undefined,
      label: formatTimelineLabel('visit', firstVisit.status, locale),
      detail: details.join(' · ') || (timelineLanguage(locale) === 'ru' ? 'Визит' : 'Encounter'),
      meta: new Date(firstVisit.visitAt).toLocaleString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  }

  for (const pmt of payments) {
    const sort = new Date(pmt.paidAt).getTime()
    const major = (pmt.amountCents / 100).toFixed(2)
    const amount = `${major} ${pmt.currency}`
    const detail = isVisitCharge(pmt.reference) && pmt.status.toUpperCase() === 'PENDING'
      ? `${formatPendingLabel(locale)} ${amount} · ${formatDebtLabel(locale)} ${amount}`
      : `${amount} · ${pmt.method}`
    items.push({
      sort,
      kind: 'payment',
      refId: pmt.id,
      label: formatTimelineLabel('payment', pmt.status, locale),
      detail,
      meta: new Date(pmt.paidAt).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    })
  }

  for (const c of crm) {
    const sort = new Date(c.occurredAt).getTime()
    items.push({
      sort,
      kind: 'crm',
      refId: c.id,
      label: `CRM · ${c.type}`,
      detail: c.body,
      meta: new Date(c.occurredAt).toLocaleString(locale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  }

  return items.sort((a, b) => b.sort - a.sort)
}

export function filterTimelineItems(items: TimelineItem[], filter: TimelineFilter): TimelineItem[] {
  if (filter === 'all') return items
  return items.filter((i) => i.kind === filter)
}
