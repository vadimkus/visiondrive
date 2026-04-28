'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, MapPin, RefreshCw, Users, type LucideIcon } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type ServiceAreaOverview = {
  range: {
    days: number
    from: string
    to: string
  }
  totals: {
    areas: number
    assignedPatients: number
    unassignedPatients: number
    upcomingAppointments: number
    completedLast90: number
  }
  areas: Array<{
    area: string
    patientCount: number
    upcomingAppointments: number
    completedLast90: number
    nextVisitAt: string | null
    nextVisitPatient: string | null
    nextVisitService: string | null
  }>
}

export default function ClinicServiceAreasPage() {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [range, setRange] = useState<'30d' | '90d'>('30d')
  const [overview, setOverview] = useState<ServiceAreaOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/service-areas/overview?range=${range}`, {
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

  const busiestAreas = useMemo(() => overview?.areas.slice(0, 5) ?? [], [overview?.areas])

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.serviceAreas}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.serviceAreasIntro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['30d', t.serviceAreasNext30Days],
              ['90d', t.serviceAreasNext90Days],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as '30d' | '90d')}
                className={`min-h-11 rounded-2xl px-4 text-sm font-semibold ${
                  range === value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'border border-orange-100 bg-white text-orange-800 hover:bg-orange-50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 text-sm font-semibold text-orange-800 hover:bg-orange-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={MapPin} label={t.serviceAreasAreas} value={String(overview?.totals.areas ?? 0)} />
        <MetricCard icon={Users} label={t.serviceAreasAssignedPatients} value={String(overview?.totals.assignedPatients ?? 0)} />
        <MetricCard icon={CalendarClock} label={t.serviceAreasUpcomingVisits} value={String(overview?.totals.upcomingAppointments ?? 0)} />
        <MetricCard
          icon={Users}
          label={t.serviceAreasMissingArea}
          value={String(overview?.totals.unassignedPatients ?? 0)}
          hint={t.serviceAreasMissingAreaHint}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-blue-950">
          <div className="flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4" aria-hidden />
            {t.serviceAreasBusiest}
          </div>
          <div className="mt-4 space-y-3">
            {busiestAreas.length === 0 ? (
              <p className="text-sm text-blue-900">{t.serviceAreasNoAreas}</p>
            ) : (
              busiestAreas.map((area) => (
                <div key={area.area} className="rounded-2xl bg-white/70 p-3">
                  <p className="font-semibold">{area.area}</p>
                  <p className="mt-1 text-sm text-blue-800">
                    {area.upcomingAppointments} {t.serviceAreasUpcomingVisits.toLowerCase()} · {area.patientCount}{' '}
                    {t.serviceAreasPatients}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-amber-950">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4" aria-hidden />
            {t.serviceAreasDataQuality}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-amber-900">{t.serviceAreasDataQualityHint}</p>
          <p className="mt-5 text-4xl font-semibold tabular-nums">{overview?.totals.unassignedPatients ?? 0}</p>
          <p className="mt-1 text-sm text-amber-900">{t.serviceAreasPatientsWithoutArea}</p>
          <Link href="/clinic/patients" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-white px-3 text-sm font-semibold text-amber-900 hover:bg-amber-100">
            {t.patients}
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{t.serviceAreasByArea}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.serviceAreasByAreaHint}</p>
          </div>
          <Link href="/clinic/occupancy" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
            {t.occupancyReport}
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {(overview?.areas ?? []).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
              {t.serviceAreasNoAreas}
            </p>
          ) : (
            overview?.areas.map((area) => (
              <article key={area.area} className="rounded-3xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-950">{area.area}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {area.patientCount} {t.serviceAreasPatients} · {area.completedLast90}{' '}
                      {t.serviceAreasCompletedLast90}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm">
                    {area.upcomingAppointments} {t.serviceAreasUpcomingShort}
                  </span>
                </div>
                {area.nextVisitAt && (
                  <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-gray-700">
                    {t.serviceAreasNextVisit}:{' '}
                    {new Date(area.nextVisitAt).toLocaleString(dateLocale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {area.nextVisitPatient ? ` · ${area.nextVisitPatient}` : ''}
                    {area.nextVisitService ? ` · ${area.nextVisitService}` : ''}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-orange-600" aria-hidden />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
