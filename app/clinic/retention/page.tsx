'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
  MessageCircle,
  RefreshCw,
  Repeat2,
  TrendingUp,
  UserX,
} from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type RetentionOverview = {
  range: { start: string; end: string; days: number; lostAfterDays: number }
  summary: {
    completedAppointments: number
    uniqueCompletedPatients: number
    returningPatients: number
    returningRatePct: number
    rebookedCompletedAppointments: number
    rebookRatePct: number
    noShowAppointments: number
    noShowRatePct: number
    lostPatients: number
  }
  followUp: {
    rebookingReminders: number
    convertedReminders: number
    conversionRatePct: number
  }
  repeatIntervals: Array<{
    procedureId: string | null
    procedureName: string
    repeatPairs: number
    averageDays: number
  }>
  lostPatients: Array<{
    patientId: string
    patientName: string
    patientPhone: string | null
    lastVisitAt: string
    lastProcedureName: string | null
    daysSinceLastVisit: number
    whatsappUrl: string | null
    actionHref: string
  }>
}

function pct(value: number) {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
}

export default function ClinicRetentionPage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const [range, setRange] = useState<'90d' | '180d' | 'year'>('180d')
  const [overview, setOverview] = useState<RetentionOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/retention/overview?range=${range}`, {
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
  }, [range, t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  const summary = overview?.summary

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.retentionAnalytics}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.retentionAnalyticsIntro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['90d', t.retentionLast90Days],
              ['180d', t.retentionLast180Days],
              ['year', t.retentionLastYear],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as '90d' | '180d' | 'year')}
                className={`min-h-11 rounded-2xl px-4 text-sm font-semibold ${
                  range === value
                    ? 'bg-orange-500 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t.retry}
            </button>
          </div>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Repeat2}
          label={t.retentionRebookRate}
          value={pct(summary?.rebookRatePct ?? 0)}
          hint={`${summary?.rebookedCompletedAppointments ?? 0}/${summary?.completedAppointments ?? 0} ${t.financeCompletedVisits.toLowerCase()}`}
        />
        <Metric
          icon={TrendingUp}
          label={t.retentionReturningClients}
          value={pct(summary?.returningRatePct ?? 0)}
          hint={`${summary?.returningPatients ?? 0}/${summary?.uniqueCompletedPatients ?? 0} ${t.retentionClients.toLowerCase()}`}
        />
        <Metric
          icon={CalendarClock}
          label={t.retentionNoShowRate}
          value={pct(summary?.noShowRatePct ?? 0)}
          hint={`${summary?.noShowAppointments ?? 0} ${t.retentionNoShows.toLowerCase()}`}
        />
        <Metric
          icon={MessageCircle}
          label={t.retentionFollowUpConversion}
          value={pct(overview?.followUp.conversionRatePct ?? 0)}
          hint={`${overview?.followUp.convertedReminders ?? 0}/${overview?.followUp.rebookingReminders ?? 0} ${t.retentionNudges.toLowerCase()}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">{t.retentionRepeatInterval}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.retentionRepeatIntervalHint}</p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            {(overview?.repeatIntervals.length ?? 0) > 0 ? (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500">
                  <tr>
                    <th className="py-2 pr-3 font-medium">{t.procedureColName}</th>
                    <th className="px-3 py-2 font-medium">{t.retentionRepeatPairs}</th>
                    <th className="py-2 pl-3 font-medium">{t.retentionAverageInterval}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overview?.repeatIntervals.map((row) => (
                    <tr key={row.procedureId ?? row.procedureName}>
                      <td className="py-3 pr-3 font-medium text-gray-900">{row.procedureName}</td>
                      <td className="px-3 py-3 tabular-nums text-gray-700">{row.repeatPairs}</td>
                      <td className="py-3 pl-3 tabular-nums text-gray-700">
                        {row.averageDays} {t.daysAbbr.toLowerCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ClinicEmptyState title={t.retentionNoRepeatData} />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <UserX className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">{t.retentionLostPatients}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {t.retentionLostPatientsHint.replace('{days}', String(overview?.range.lostAfterDays ?? 60))}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(overview?.lostPatients.length ?? 0) > 0 ? (
              overview?.lostPatients.map((patient) => (
                <article key={patient.patientId} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{patient.patientName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {patient.daysSinceLastVisit} {t.daysAbbr.toLowerCase()} ·{' '}
                        {new Date(patient.lastVisitAt).toLocaleDateString(dateLocale)}
                      </p>
                      {patient.lastProcedureName && (
                        <p className="mt-1 text-xs text-gray-600">{patient.lastProcedureName}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={patient.actionHref}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                    >
                      {t.viewPatientChart}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    {patient.whatsappUrl && (
                      <a
                        href={patient.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <ClinicEmptyState title={t.retentionNoLostPatients} />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Repeat2
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className="h-5 w-5 text-orange-600" aria-hidden />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  )
}
