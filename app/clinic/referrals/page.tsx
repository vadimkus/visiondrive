'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, RefreshCw, Share2, Users } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type ReferralOverview = {
  range: { start: string | null; end: string; range: '30d' | '90d' | 'year' | 'all' }
  summary: {
    referredPatients: number
    referralSources: number
    completedAppointments: number
  }
  sources: Array<{
    sourceKey: string
    sourceLabel: string
    referredPatients: number
    completedAppointments: number
  }>
  recentPatients: Array<{
    patientId: string
    patientName: string
    phone: string | null
    email: string | null
    createdAt: string
    referredByName: string | null
    referralNote: string | null
    completedAppointments: number
    actionHref: string
  }>
}

type ReferralRange = ReferralOverview['range']['range']

export default function ClinicReferralsPage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const numberLocale = isRu ? 'ru-RU' : 'en-US'
  const [range, setRange] = useState<ReferralRange>('90d')
  const [overview, setOverview] = useState<ReferralOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/referrals/overview?range=${range}`, {
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-semibold text-orange-800">
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              {t.referrals}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.referralReport}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{t.referralsIntro}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['30d', t.referralLast30Days],
              ['90d', t.referralLast90Days],
              ['year', t.referralLastYear],
              ['all', t.referralAllTime],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as ReferralRange)}
                className={`min-h-11 rounded-2xl px-4 text-sm font-semibold ${
                  range === value
                    ? 'bg-orange-500 text-white'
                    : 'border border-orange-100 bg-white text-gray-700 hover:border-orange-200'
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
              {t.refresh}
            </button>
          </div>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          icon={Users}
          label={t.referredPatients}
          value={(overview?.summary.referredPatients ?? 0).toLocaleString(numberLocale)}
        />
        <Metric
          icon={Share2}
          label={t.referralSources}
          value={(overview?.summary.referralSources ?? 0).toLocaleString(numberLocale)}
        />
        <Metric
          icon={ArrowRight}
          label={t.completedVisitsFromReferrals}
          value={(overview?.summary.completedAppointments ?? 0).toLocaleString(numberLocale)}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{t.referralSources}</h2>
          <p className="mt-1 text-sm text-gray-500">{t.referralReportHint}</p>
          {overview?.sources.length ? (
            <div className="mt-4 space-y-3">
              {overview.sources.map((source) => (
                <div key={source.sourceKey} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{source.sourceLabel}</p>
                      <p className="mt-1 text-xs text-gray-500">{t.referralSource}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-950">
                        {source.referredPatients.toLocaleString(numberLocale)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{t.referredPatients}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-600">
                    {source.completedAppointments.toLocaleString(numberLocale)} {t.completedVisitsFromReferrals}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <ClinicEmptyState title={t.noReferralData} />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{t.recentReferredPatients}</h2>
          {overview?.recentPatients.length ? (
            <div className="mt-4 space-y-3">
              {overview.recentPatients.map((patient) => (
                <article key={patient.patientId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{patient.patientName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(patient.createdAt).toLocaleDateString(dateLocale)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
                      {patient.referredByName}
                    </span>
                  </div>
                  {patient.referralNote && (
                    <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-relaxed text-gray-700">
                      {patient.referralNote}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 ring-1 ring-gray-100">
                      {patient.completedAppointments.toLocaleString(numberLocale)} {t.completedVisitsFromReferrals}
                    </span>
                    <Link
                      href={patient.actionHref}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                    >
                      {t.viewPatientChart}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <ClinicEmptyState title={t.noReferralData} />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className="h-5 w-5 text-orange-600" aria-hidden />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-950">{value}</p>
    </div>
  )
}
