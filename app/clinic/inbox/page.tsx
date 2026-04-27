'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CreditCard,
  MessageCircle,
  Package,
  RefreshCw,
  Star,
} from 'lucide-react'
import clsx from 'clsx'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type InboxKind =
  | 'REMINDER_DUE'
  | 'NEW_BOOKING'
  | 'RESCHEDULED'
  | 'REVIEW_REQUEST'
  | 'UNPAID_VISIT'
  | 'LOW_STOCK'

type InboxItem = {
  id: string
  kind: InboxKind
  severity: 'urgent' | 'high' | 'normal'
  subject: string
  detail: string | null
  patientName: string | null
  serviceName: string | null
  amountCents: number | null
  currency: string | null
  dueAt: string | null
  occurredAt: string | null
  actionHref: string
  actionLabel: string | null
}

type InboxSummary = {
  total: number
  urgent: number
  high: number
  normal: number
  byKind: Record<InboxKind, number>
}

function formatMoney(cents: number, currency = 'AED') {
  return `${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`
}

export default function ClinicInboxPage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const [items, setItems] = useState<InboxItem[]>([])
  const [summary, setSummary] = useState<InboxSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<InboxKind | 'all'>('all')

  const labels: Record<InboxKind, string> = useMemo(
    () => ({
      REMINDER_DUE: t.inboxReminderDue,
      NEW_BOOKING: t.inboxNewBooking,
      RESCHEDULED: t.inboxRescheduled,
      REVIEW_REQUEST: t.inboxReviewRequest,
      UNPAID_VISIT: t.inboxUnpaidVisit,
      LOW_STOCK: t.inboxLowStock,
    }),
    [t]
  )

  const icons: Record<InboxKind, typeof Bell> = {
    REMINDER_DUE: MessageCircle,
    NEW_BOOKING: CalendarClock,
    RESCHEDULED: RefreshCw,
    REVIEW_REQUEST: Star,
    UNPAID_VISIT: CreditCard,
    LOW_STOCK: Package,
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/inbox', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
        return
      }
      setItems(data.items || [])
      setSummary(data.summary || null)
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = filter === 'all' ? items : items.filter((item) => item.kind === filter)

  if (loading) return <ClinicSpinner label={t.loading} />

  const filterChips: Array<{ id: InboxKind | 'all'; label: string; count: number }> = [
    { id: 'all', label: t.inboxAll, count: summary?.total ?? 0 },
    ...Object.entries(labels).map(([id, label]) => ({
      id: id as InboxKind,
      label,
      count: summary?.byKind[id as InboxKind] ?? 0,
    })),
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.notificationCenter}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.notificationCenterIntro}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t.retry}
          </button>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label={t.inboxTotal} value={summary?.total ?? 0} />
        <Metric label={t.inboxUrgent} value={summary?.urgent ?? 0} tone="urgent" />
        <Metric label={t.inboxHigh} value={summary?.high ?? 0} tone="high" />
        <Metric label={t.inboxNormal} value={summary?.normal ?? 0} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={clsx(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold',
              filter === chip.id
                ? 'border-orange-300 bg-orange-50 text-orange-900'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {chip.label}
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">{chip.count}</span>
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {filtered.length === 0 ? (
          <ClinicEmptyState title={t.noInboxItems} />
        ) : (
          filtered.map((item) => {
            const Icon = icons[item.kind]
            const date = item.dueAt ?? item.occurredAt
            return (
              <article key={item.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-3">
                    <div
                      className={clsx(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                        item.severity === 'urgent'
                          ? 'bg-red-50 text-red-700'
                          : item.severity === 'high'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                          {labels[item.kind]}
                        </p>
                        {item.severity === 'urgent' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3" aria-hidden />
                            {t.inboxUrgent}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-1 text-lg font-semibold text-gray-950">
                        {item.patientName || item.subject}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {[item.serviceName, item.patientName ? item.subject : null].filter(Boolean).join(' · ')}
                      </p>
                      {item.detail && <p className="mt-2 max-w-3xl text-sm text-gray-600">{item.detail}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:items-end">
                    {item.amountCents ? (
                      <p className="text-sm font-semibold text-red-700">
                        {t.amountDue}: {formatMoney(item.amountCents, item.currency || 'AED')}
                      </p>
                    ) : null}
                    {date && (
                      <p className="text-xs text-gray-500">
                        {item.dueAt ? t.dueAt : t.occurredAt}:{' '}
                        {new Date(date).toLocaleString(dateLocale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    )}
                    <Link
                      href={item.actionHref}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      {t.openItem}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'urgent' | 'high'
}) {
  return (
    <div
      className={clsx(
        'rounded-3xl border bg-white p-4 shadow-sm',
        tone === 'urgent' ? 'border-red-100 bg-red-50' : tone === 'high' ? 'border-amber-100 bg-amber-50' : 'border-gray-200'
      )}
    >
      <p className="text-2xl font-semibold tabular-nums text-gray-950">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  )
}
