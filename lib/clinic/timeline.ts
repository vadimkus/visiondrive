/**
 * Pure helpers to build a unified patient timeline for the workspace.
 * Keeps API response shaping out of React components and enables unit tests.
 */

export type TimelineFilter = 'all' | 'appointment' | 'visit' | 'payment' | 'crm'

export type TimelineItem = {
  sort: number
  kind: TimelineFilter
  label: string
  detail: string
  meta: string
}

type AppointmentInput = {
  startsAt: string
  status: string
  titleOverride: string | null
  procedure: { name: string } | null
}

type VisitInput = {
  visitAt: string
  status: string
  chiefComplaint: string | null
  procedureSummary: string | null
}

type PaymentInput = {
  paidAt: string
  status: string
  amountCents: number
  currency: string
  method: string
}

type CrmInput = {
  occurredAt: string
  type: string
  body: string
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
      label: `Appointment · ${a.status}`,
      detail: a.procedure?.name || a.titleOverride || 'Scheduled visit',
      meta: new Date(a.startsAt).toLocaleString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  }

  for (const v of visits) {
    const sort = new Date(v.visitAt).getTime()
    items.push({
      sort,
      kind: 'visit',
      label: `Visit · ${v.status}`,
      detail: v.procedureSummary || v.chiefComplaint || 'Encounter',
      meta: new Date(v.visitAt).toLocaleString(locale, {
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
    items.push({
      sort,
      kind: 'payment',
      label: `Payment · ${pmt.status}`,
      detail: `${major} ${pmt.currency} · ${pmt.method}`,
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
