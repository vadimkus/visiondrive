'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, Clock3, Gauge, MapPin, RefreshCw, TimerReset } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type OccupancyOverview = {
  range: {
    from: string
    to: string
    days: number
  }
  totals: {
    plannedMinutes: number
    occupiedMinutes: number
    serviceMinutes: number
    blockedMinutes: number
    freeMinutes: number
    appointmentCount: number
    freeSlotCount: number
    travelBufferMinutes: number
    cleanupBufferMinutes: number
    occupancyPct: number
    travelBufferPct: number
  }
  days: Array<{
    dayKey: string
    plannedMinutes: number
    occupiedMinutes: number
    serviceMinutes: number
    blockedMinutes: number
    freeMinutes: number
    occupancyPct: number
    appointmentCount: number
    freeSlotCount: number
    largestFreeSlotMinutes: number
    travelBufferMinutes: number
    cleanupBufferMinutes: number
    travelBufferPct: number
    freeSlots: Array<{
      startsAt: string
      endsAt: string
      minutes: number
    }>
  }>
}

function hours(minutes: number, locale: string) {
  return `${(Math.max(0, minutes) / 60).toLocaleString(locale, {
    maximumFractionDigits: 1,
  })}h`
}

function timeRange(start: string, end: string, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Dubai',
  })
  return `${formatter.format(new Date(start))}–${formatter.format(new Date(end))}`
}

export default function ClinicOccupancyPage() {
  const { locale, t } = useClinicLocale()
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [range, setRange] = useState<'7d' | '14d'>('7d')
  const [overview, setOverview] = useState<OccupancyOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/occupancy/overview?range=${range}`, {
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

  const bestFreeDays = useMemo(() => {
    return [...(overview?.days ?? [])]
      .filter((day) => day.freeSlotCount > 0)
      .sort((a, b) => b.freeMinutes - a.freeMinutes)
      .slice(0, 3)
  }, [overview?.days])

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.occupancyReport}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.occupancyReportIntro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['7d', t.occupancyNext7Days],
              ['14d', t.occupancyNext14Days],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as '7d' | '14d')}
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
        <MetricCard
          icon={Gauge}
          label={t.occupancyBookedTime}
          value={`${(overview?.totals.occupancyPct ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%`}
          hint={`${hours(overview?.totals.occupiedMinutes ?? 0, numberLocale)} / ${hours(overview?.totals.plannedMinutes ?? 0, numberLocale)}`}
        />
        <MetricCard
          icon={Clock3}
          label={t.occupancyFreeTime}
          value={hours(overview?.totals.freeMinutes ?? 0, numberLocale)}
          hint={t.occupancyFreeSlotsCount.replace('{count}', String(overview?.totals.freeSlotCount ?? 0))}
        />
        <MetricCard
          icon={CalendarClock}
          label={t.occupancyAppointments}
          value={String(overview?.totals.appointmentCount ?? 0)}
          hint={`${t.occupancyServiceTime}: ${hours(overview?.totals.serviceMinutes ?? 0, numberLocale)}`}
        />
        <MetricCard
          icon={MapPin}
          label={t.occupancyTravelBuffers}
          value={hours(overview?.totals.travelBufferMinutes ?? 0, numberLocale)}
          hint={`${(overview?.totals.travelBufferPct ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}% ${t.occupancyOfServiceTime}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
          <div className="flex items-center gap-2 font-semibold">
            <TimerReset className="h-4 w-4" aria-hidden />
            {t.occupancyBestFreeWindows}
          </div>
          <div className="mt-4 space-y-3">
            {bestFreeDays.length === 0 ? (
              <p>{t.occupancyNoFreeWindows}</p>
            ) : (
              bestFreeDays.map((day) => (
                <div key={day.dayKey} className="rounded-2xl bg-white/70 p-3">
                  <p className="font-semibold text-blue-950">
                    {new Date(`${day.dayKey}T00:00:00`).toLocaleDateString(dateLocale, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <p className="mt-1 text-blue-800">
                    {hours(day.freeMinutes, numberLocale)} {t.occupancyFreeTime.toLowerCase()} · {day.freeSlotCount}{' '}
                    {t.occupancySlots}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4" aria-hidden />
            {t.occupancyBufferReadout}
          </div>
          <p className="mt-3 leading-relaxed">
            {(overview?.totals.travelBufferPct ?? 0) >= 35
              ? t.occupancyBufferHeavy
              : t.occupancyBufferHealthy}
          </p>
          <p className="mt-3 text-xs text-amber-800">
            {t.occupancyCleanupBuffers}: {hours(overview?.totals.cleanupBufferMinutes ?? 0, numberLocale)} ·{' '}
            {t.occupancyBlockedTime}: {hours(overview?.totals.blockedMinutes ?? 0, numberLocale)}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{t.occupancyByDay}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.occupancyByDayHint}</p>
          </div>
          <Link href="/clinic/appointments" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
            {t.appointments}
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {(overview?.days ?? []).map((day) => {
            const dateLabel = new Date(`${day.dayKey}T00:00:00`).toLocaleDateString(dateLocale, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
            const pct = Math.max(0, Math.min(100, day.occupancyPct))
            return (
              <article key={day.dayKey} className="rounded-3xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-950">{dateLabel}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {day.appointmentCount} {t.occupancyAppointments.toLowerCase()} · {hours(day.freeMinutes, numberLocale)}{' '}
                      {t.occupancyFreeTime.toLowerCase()}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm">
                    {day.occupancyPct.toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
                  <MiniStat label={t.occupancyPlannedTime} value={hours(day.plannedMinutes, numberLocale)} />
                  <MiniStat label={t.occupancyBookedTime} value={hours(day.occupiedMinutes, numberLocale)} />
                  <MiniStat label={t.occupancyLargestGap} value={hours(day.largestFreeSlotMinutes, numberLocale)} />
                  <MiniStat label={t.occupancyTravelBuffers} value={hours(day.travelBufferMinutes, numberLocale)} />
                </div>
                {day.freeSlots.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.freeSlots.map((slot) => (
                      <span
                        key={`${day.dayKey}-${slot.startsAt}`}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                      >
                        {timeRange(slot.startsAt, slot.endsAt, dateLocale)} · {hours(slot.minutes, numberLocale)}
                      </span>
                    ))}
                  </div>
                )}
                {day.travelBufferPct >= 35 && day.travelBufferMinutes > 0 && (
                  <p className="mt-3 rounded-2xl bg-amber-100 px-3 py-2 text-xs text-amber-900">
                    {t.occupancyDayTravelHeavy}
                  </p>
                )}
              </article>
            )
          })}
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
  icon: typeof Gauge
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-gray-950">{value}</p>
    </div>
  )
}
