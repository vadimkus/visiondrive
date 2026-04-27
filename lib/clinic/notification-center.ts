export const NOTIFICATION_CENTER_KINDS = [
  'REMINDER_DUE',
  'NEW_BOOKING',
  'RESCHEDULED',
  'REVIEW_REQUEST',
  'UNPAID_VISIT',
  'LOW_STOCK',
] as const

export type NotificationCenterKind = (typeof NOTIFICATION_CENTER_KINDS)[number]
export type NotificationSeverity = 'urgent' | 'high' | 'normal'

export type NotificationCenterItem = {
  id: string
  kind: NotificationCenterKind
  severity: NotificationSeverity
  subject: string
  detail?: string | null
  patientName?: string | null
  serviceName?: string | null
  amountCents?: number | null
  currency?: string | null
  dueAt?: string | null
  occurredAt?: string | null
  actionHref: string
  actionLabel?: string | null
}

export type NotificationCenterSummary = {
  total: number
  urgent: number
  high: number
  normal: number
  byKind: Record<NotificationCenterKind, number>
}

export type PaymentForNotification = {
  id?: string | null
  amountCents: number
  discountCents?: number | null
  feeCents?: number | null
  status: string
}

function positiveCents(value: number | null | undefined) {
  return Number.isFinite(value) && (value ?? 0) > 0 ? Math.round(value ?? 0) : 0
}

export function appointmentDueCents(expectedCents: number, payments: PaymentForNotification[]) {
  let paidCents = 0
  let refundedCents = 0
  let pendingCents = 0
  let discountCents = 0
  let feeCents = 0
  const seen = new Set<string>()

  for (const payment of payments) {
    if (payment.id) {
      if (seen.has(payment.id)) continue
      seen.add(payment.id)
    }

    const status = payment.status.toUpperCase()
    const amount = positiveCents(payment.amountCents)
    discountCents += positiveCents(payment.discountCents)
    feeCents += positiveCents(payment.feeCents)
    if (status === 'PAID') paidCents += amount
    if (status === 'REFUNDED') refundedCents += amount
    if (status === 'PENDING') pendingCents += amount
  }

  const adjustedExpected = Math.max(positiveCents(expectedCents) - discountCents + feeCents, 0)
  const netPaid = paidCents - refundedCents
  return Math.max(adjustedExpected - netPaid, pendingCents, 0)
}

const severityRank: Record<NotificationSeverity, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
}

function itemSortTime(item: NotificationCenterItem) {
  const raw = item.dueAt ?? item.occurredAt
  if (!raw) return 0
  const parsed = new Date(raw).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

export function sortNotificationItems(items: NotificationCenterItem[]) {
  return [...items].sort((a, b) => {
    const severityDiff = severityRank[a.severity] - severityRank[b.severity]
    if (severityDiff !== 0) return severityDiff
    return itemSortTime(b) - itemSortTime(a)
  })
}

export function buildNotificationSummary(items: NotificationCenterItem[]): NotificationCenterSummary {
  const byKind = Object.fromEntries(NOTIFICATION_CENTER_KINDS.map((kind) => [kind, 0])) as Record<
    NotificationCenterKind,
    number
  >
  for (const item of items) {
    byKind[item.kind] += 1
  }
  return {
    total: items.length,
    urgent: items.filter((item) => item.severity === 'urgent').length,
    high: items.filter((item) => item.severity === 'high').length,
    normal: items.filter((item) => item.severity === 'normal').length,
    byKind,
  }
}

export function buildNotificationCenter(items: NotificationCenterItem[], limit = 80) {
  const sorted = sortNotificationItems(items).slice(0, Math.max(1, Math.min(limit, 200)))
  return { items: sorted, summary: buildNotificationSummary(sorted) }
}
