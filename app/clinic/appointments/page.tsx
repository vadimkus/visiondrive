'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import clsx from 'clsx'
import { addDays, isSameLocalDay, startOfWeekMonday } from '@/lib/clinic/week'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'

type Appointment = {
  id: string
  startsAt: string
  endsAt: string | null
  status: string
  titleOverride: string | null
  internalNotes: string | null
  patient: { id: string; firstName: string; lastName: string }
  procedure: { id: string; name: string } | null
}

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export default function ClinicAppointmentsPage() {
  const router = useRouter()
  const { locale, t } = useClinicLocale()
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [range, setRange] = useState<{ from: string; to: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dateLocale = locale === 'ar' ? 'ar-AE' : 'en-GB'

  const load = useCallback(async () => {
    const from = weekStart
    const to = addDays(from, 7)
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
      })
      const res = await fetch(`/api/clinic/appointments?${qs}`, { credentials: 'include' })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      let data: { error?: string; appointments?: Appointment[]; range?: { from: string; to: string } }
      try {
        data = await res.json()
      } catch {
        setError(
          res.ok
            ? t.networkError
            : `Server error (${res.status}). Check the terminal logs.`
        )
        setAppointments([])
        return
      }
      if (!res.ok) {
        setError(data.error || 'Failed to load')
        setAppointments([])
        return
      }
      setAppointments(data.appointments || [])
      setRange(data.range || null)
    } catch {
      setError(t.networkError)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [weekStart, router, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const byDay = useMemo(() => {
    const map = new Map<number, Appointment[]>()
    for (let i = 0; i < 7; i++) map.set(i, [])
    for (const a of appointments) {
      const s = new Date(a.startsAt)
      for (let i = 0; i < 7; i++) {
        if (isSameLocalDay(s, days[i])) {
          map.get(i)!.push(a)
          break
        }
      }
    }
    for (const list of map.values()) {
      list.sort((x, y) => new Date(x.startsAt).getTime() - new Date(y.startsAt).getTime())
    }
    return map
  }, [appointments, days])

  const isToday = (d: Date) => {
    const n = new Date()
    return isSameLocalDay(d, n)
  }

  const goPrev = () => setWeekStart((w) => addDays(w, -7))
  const goNext = () => setWeekStart((w) => addDays(w, 7))
  const goThisWeek = () => setWeekStart(startOfWeekMonday(new Date()))

  if (loading && appointments.length === 0 && !error) {
    return <ClinicSpinner label={t.loading} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.appointments}</h1>
            <p className="text-gray-600 text-sm mt-1">
              {t.thisWeek}
              {range && (
                <span className="text-gray-400">
                  {' '}
                  · {new Date(range.from).toLocaleDateString(dateLocale)} –{' '}
                  {new Date(range.to).toLocaleDateString(dateLocale)}
                </span>
              )}
            </p>
          </div>
          <Link
            href="/clinic/appointments/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden />
            {t.newAppointment}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label={t.prevWeek}
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goThisWeek}
            className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-900 hover:bg-orange-100"
          >
            {t.today}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label={t.nextWeek}
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </div>

      {error && (
        <div className="space-y-2">
          <ClinicAlert variant="error">{error}</ClinicAlert>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm font-semibold text-orange-600 min-h-11 px-2"
          >
            {t.retry}
          </button>
        </div>
      )}

      {loading && appointments.length > 0 && (
        <p className="text-xs text-gray-400" role="status">
          {t.loading}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-3">
        {days.map((day, i) => {
          const list = byDay.get(i) ?? []
          const dayLabel = t[dayKeys[i]]
          const num = day.getDate()
          const today = isToday(day)
          return (
            <div
              key={i}
              className={clsx(
                'rounded-2xl border bg-white shadow-sm flex flex-col min-h-[140px] lg:min-h-[220px]',
                today ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'
              )}
            >
              <div
                className={clsx(
                  'px-3 py-2 border-b text-center',
                  today ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
                )}
              >
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  {dayLabel}
                </p>
                <p className={clsx('text-lg font-semibold', today ? 'text-orange-900' : 'text-gray-900')}>
                  {num}
                </p>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-2">
                {list.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-4">—</p>
                ) : (
                  list.map((a) => (
                    <Link
                      key={a.id}
                      href={`/clinic/appointments/${a.id}`}
                      className="block rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-orange-50/80 hover:border-orange-100 px-2 py-2 text-left transition-colors min-h-[44px]"
                    >
                      <p className="text-[11px] font-semibold text-gray-900 leading-tight">
                        {new Date(a.startsAt).toLocaleTimeString(dateLocale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-800 mt-0.5 truncate">
                        {a.patient.lastName}, {a.patient.firstName}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {a.procedure?.name || a.titleOverride || '—'}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!loading && appointments.length === 0 && !error && (
        <ClinicEmptyState
          icon={Calendar}
          title={t.noAppointmentsWeek}
          description={t.tapDayToAdd}
          action={
            <Link
              href="/clinic/appointments/new"
              className="inline-flex w-full items-center justify-center min-h-11 rounded-xl bg-orange-500 text-white text-sm font-semibold"
            >
              {t.newAppointment}
            </Link>
          }
        />
      )}
    </div>
  )
}
