'use client'

import { useCallback, useEffect, useState, type ComponentType } from 'react'
import Link from 'next/link'
import { BarChart3, CalendarCheck2, Eye, MessageCircle, MousePointerClick, RefreshCw } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type BookingFunnelOverview = {
  range: { start: string; end: string; days: number }
  totals: {
    views: number
    serviceSelections: number
    slotSelections: number
    formStarts: number
    formSubmissions: number
    bookings: number
    bookingCompletionRatePct: number
  }
  stages: Array<{
    eventType: string
    events: number
    sessions: number
    conversionFromViewsPct: number
    dropoffFromPreviousPct: number
  }>
  procedures: Array<{
    procedureId: string | null
    procedureName: string
    selectedSessions: number
    completedSessions: number
    completionRatePct: number
  }>
  sources: Array<{
    sourceKey: string
    sourceLabel: string
    sessions: number
    bookings: number
    completionRatePct: number
  }>
  abandonedSessions: Array<{
    sessionId: string
    sourceLabel: string
    lastEventType: string
    lastOccurredAt: string
    procedureName: string | null
    startsAt: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    email: string | null
    followUpMessage: string
    whatsappUrl: string | null
  }>
  daily: Array<{ date: string; views: number; bookings: number }>
}

function pct(value: number, numberLocale: string) {
  return `${value.toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%`
}

export default function ClinicBookingFunnelPage() {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [overview, setOverview] = useState<BookingFunnelOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedSessionId, setCopiedSessionId] = useState('')

  const stageLabels: Record<string, string> = {
    LINK_VIEW: t.bookingFunnelViews,
    SERVICE_SELECTED: t.bookingFunnelServiceSelected,
    SLOT_SELECTED: t.bookingFunnelSlotSelected,
    FORM_STARTED: t.bookingFunnelFormStarted,
    FORM_SUBMITTED: t.bookingFunnelFormSubmitted,
    BOOKING_COMPLETED: t.bookingFunnelBookings,
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/booking-funnel/overview?range=${range}&locale=${locale}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
        return
      }
      setOverview(data)
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [locale, range, t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  const totals = overview?.totals

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.bookingFunnelAnalytics}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.bookingFunnelAnalyticsIntro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['7d', t.bookingFunnelLast7Days],
              ['30d', t.bookingFunnelLast30Days],
              ['90d', t.bookingFunnelLast90Days],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as '7d' | '30d' | '90d')}
                className={`min-h-11 rounded-2xl px-4 text-sm font-semibold ${
                  range === value
                    ? 'bg-gray-950 text-white'
                    : 'border border-orange-100 bg-white text-gray-700 hover:border-orange-200'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-orange-200"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t.refresh}
            </button>
          </div>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      {overview && totals && (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Eye} label={t.bookingFunnelViews} value={totals.views.toLocaleString(numberLocale)} />
            <MetricCard
              icon={MousePointerClick}
              label={t.bookingFunnelFormSubmitted}
              value={totals.formSubmissions.toLocaleString(numberLocale)}
            />
            <MetricCard
              icon={CalendarCheck2}
              label={t.bookingFunnelBookings}
              value={totals.bookings.toLocaleString(numberLocale)}
            />
            <MetricCard
              icon={BarChart3}
              label={t.bookingFunnelCompletionRate}
              value={pct(totals.bookingCompletionRatePct, numberLocale)}
            />
          </section>

          {totals.views === 0 ? (
            <ClinicEmptyState title={t.bookingFunnelNoData} />
          ) : (
            <section className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-950">{t.bookingFunnelAnalytics}</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="py-3 pr-4">{t.bookingFunnelStage}</th>
                      <th className="py-3 pr-4">{t.bookingFunnelSessions}</th>
                      <th className="py-3 pr-4">{t.bookingFunnelEvents}</th>
                      <th className="py-3 pr-4">{t.bookingFunnelFromViews}</th>
                      <th className="py-3">{t.bookingFunnelDropoff}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overview.stages.map((stage) => (
                      <tr key={stage.eventType}>
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {stageLabels[stage.eventType] ?? stage.eventType}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{stage.sessions}</td>
                        <td className="py-3 pr-4 text-gray-500">{stage.events}</td>
                        <td className="py-3 pr-4 text-gray-700">{pct(stage.conversionFromViewsPct, numberLocale)}</td>
                        <td className="py-3 text-gray-700">{pct(stage.dropoffFromPreviousPct, numberLocale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-gray-950">{t.bookingFunnelByProcedure}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.bookingFunnelByProcedureHint}</p>
            {overview.procedures.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">{t.bookingFunnelNoData}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="py-3 pr-4">{t.procedureColName}</th>
                      <th className="py-3 pr-4">{t.bookingFunnelServiceSelected}</th>
                      <th className="py-3 pr-4">{t.bookingFunnelBookings}</th>
                      <th className="py-3">{t.bookingFunnelCompletionRate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overview.procedures.map((procedure) => (
                      <tr key={procedure.procedureId ?? procedure.procedureName}>
                        <td className="py-3 pr-4 font-medium text-gray-900">{procedure.procedureName}</td>
                        <td className="py-3 pr-4 text-gray-700">{procedure.selectedSessions}</td>
                        <td className="py-3 pr-4 text-gray-700">{procedure.completedSessions}</td>
                        <td className="py-3 text-gray-700">{pct(procedure.completionRatePct, numberLocale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-950">{t.bookingFunnelBySource}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.bookingFunnelBySourceHint}</p>
              {overview.sources.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">{t.bookingFunnelNoData}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {overview.sources.map((source) => (
                    <div key={source.sourceKey} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">{source.sourceLabel}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {source.sessions.toLocaleString(numberLocale)} {t.bookingFunnelSessions}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-950">
                            {pct(source.completionRatePct, numberLocale)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {source.bookings.toLocaleString(numberLocale)} {t.bookingFunnelBookingsCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-950">{t.abandonedBookings}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.abandonedBookingsHint}</p>
              {overview.abandonedSessions.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">{t.noAbandonedBookings}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {overview.abandonedSessions.map((session) => (
                    <div key={session.sessionId} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">
                            {[session.firstName, session.lastName].filter(Boolean).join(' ') ||
                              t.bookingFunnelAnonymousVisitor}
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            {session.procedureName ?? t.bookingFunnelUnknownService} · {session.sourceLabel}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                          {stageLabels[session.lastEventType] ?? session.lastEventType}
                        </span>
                      </div>
                      <div className="mt-3 rounded-xl bg-white p-3 text-xs leading-relaxed text-gray-700">
                        <p className="mb-1 font-semibold text-gray-900">{t.reactivationMessagePreview}</p>
                        <p>{session.followUpMessage}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(session.followUpMessage)
                            setCopiedSessionId(session.sessionId)
                          }}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                        >
                          {copiedSessionId === session.sessionId ? t.patientPortalCopied : t.copy}
                        </button>
                        {session.whatsappUrl ? (
                          <a
                            href={session.whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                            {t.openWhatsApp}
                          </a>
                        ) : (
                          <span className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-3 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                            {t.reactivationNoWhatsappPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {overview.daily.length > 0 && (
            <section className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-gray-950">{t.bookingFunnelViews}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {overview.daily.slice(-12).map((day) => (
                  <div key={day.date} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      {new Date(`${day.date}T00:00:00`).toLocaleDateString(dateLocale, {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-950">{day.views.toLocaleString(numberLocale)}</p>
                    <p className="text-xs text-gray-500">
                      {day.bookings.toLocaleString(numberLocale)} {t.bookingFunnelBookingsCount}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
        </div>
        <span className="rounded-2xl bg-orange-50 p-3 text-orange-700">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  )
}
