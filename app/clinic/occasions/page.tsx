'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Cake, Gift, MessageCircle, RefreshCw } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type OccasionOverview = {
  range: { start: string; end: string; days: number }
  summary: {
    upcomingBirthdays: number
    withWhatsapp: number
    missingWhatsapp: number
  }
  birthdays: Array<{
    patientId: string
    patientName: string
    firstName: string
    phone: string | null
    email: string | null
    dateOfBirth: string
    nextBirthdayAt: string
    daysUntil: number
    turningAge: number
    birthdayMessage: string
    whatsappUrl: string | null
    actionHref: string
  }>
}

export default function ClinicOccasionsPage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const numberLocale = isRu ? 'ru-RU' : 'en-US'
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [overview, setOverview] = useState<OccasionOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedPatientId, setCopiedPatientId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/occasions/overview?range=${range}&locale=${locale}`, {
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-semibold text-orange-800">
              <Gift className="h-3.5 w-3.5" aria-hidden />
              {t.occasions}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.upcomingBirthdays}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{t.occasionsIntro}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              [7, t.occasionNext7Days],
              [30, t.occasionNext30Days],
              [90, t.occasionNext90Days],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as 7 | 30 | 90)}
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
          icon={Cake}
          label={t.upcomingBirthdays}
          value={(overview?.summary.upcomingBirthdays ?? 0).toLocaleString(numberLocale)}
        />
        <Metric
          icon={MessageCircle}
          label={t.birthdaysWithWhatsapp}
          value={(overview?.summary.withWhatsapp ?? 0).toLocaleString(numberLocale)}
        />
        <Metric
          icon={Gift}
          label={t.reactivationNoWhatsappPhone}
          value={(overview?.summary.missingWhatsapp ?? 0).toLocaleString(numberLocale)}
        />
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{t.upcomingBirthdays}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.upcomingBirthdaysHint}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(overview?.birthdays.length ?? 0) > 0 ? (
            overview?.birthdays.map((patient) => {
              const birthdayLabel =
                patient.daysUntil === 0
                  ? t.birthdayToday
                  : t.birthdayInDays.replace('{days}', patient.daysUntil.toLocaleString(numberLocale))
              return (
                <article key={patient.patientId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{patient.patientName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(patient.nextBirthdayAt).toLocaleDateString(dateLocale, {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        · {t.turningAge.replace('{age}', patient.turningAge.toLocaleString(numberLocale))}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
                      {birthdayLabel}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl border border-white bg-white p-3 text-xs leading-relaxed text-gray-700">
                    <p className="mb-1 font-semibold text-gray-900">{t.birthdayMessage}</p>
                    <p>{patient.birthdayMessage}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={patient.actionHref}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                    >
                      {t.viewPatientChart}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(patient.birthdayMessage)
                        setCopiedPatientId(patient.patientId)
                      }}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                    >
                      {copiedPatientId === patient.patientId ? t.patientPortalCopied : t.copy}
                    </button>
                    {patient.whatsappUrl ? (
                      <a
                        href={patient.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                        {t.openWhatsApp}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-50 px-3 text-xs font-semibold text-amber-800">
                        {t.reactivationNoWhatsappPhone}
                      </span>
                    )}
                  </div>
                </article>
              )
            })
          ) : (
            <div className="lg:col-span-2">
              <ClinicEmptyState title={t.noUpcomingBirthdays} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gift
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
