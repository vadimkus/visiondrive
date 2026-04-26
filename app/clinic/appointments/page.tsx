'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import clsx from 'clsx'
import {
  addDays,
  addMonths,
  isSameLocalDay,
  isSameLocalMonth,
  monthGridFrom,
  startOfMonth,
  startOfWeekMonday,
} from '@/lib/clinic/week'
import {
  CLINIC_APPOINTMENT_DND_MIME,
  rescheduleStartsAtPreserveClock,
  type ClinicAppointmentDragPayload,
} from '@/lib/clinic/appointment-dnd'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { ClinicStrings } from '@/lib/clinic/strings'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicAppointmentDrawer } from '@/components/clinic/ClinicAppointmentDrawer'
import { ClinicRescheduleSheet } from '@/components/clinic/ClinicRescheduleSheet'

type Appointment = {
  id: string
  startsAt: string
  endsAt: string | null
  status: string
  titleOverride: string | null
  internalNotes: string | null
  bufferAfterMinutes: number
  patient: { id: string; firstName: string; lastName: string }
  procedure: { id: string; name: string; defaultDurationMin: number; basePriceCents?: number; currency?: string } | null
  visits?: { id: string; status: string; visitAt: string }[]
}

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const MAX_APPTS_VISIBLE = 3

function appointmentsOnDay(list: Appointment[], day: Date): Appointment[] {
  return list
    .filter((a) => isSameLocalDay(new Date(a.startsAt), day))
    .sort((x, y) => new Date(x.startsAt).getTime() - new Date(y.startsAt).getTime())
}

export default function ClinicAppointmentsPage() {
  const router = useRouter()
  const { locale, t } = useClinicLocale()
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [range, setRange] = useState<{ from: string; to: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [moveAppt, setMoveAppt] = useState<Appointment | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [activeOnly, setActiveOnly] = useState(true)

  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'

  useEffect(() => {
    const clearDrop = () => setDropTargetId(null)
    document.addEventListener('dragend', clearDrop)
    return () => document.removeEventListener('dragend', clearDrop)
  }, [])

  const load = useCallback(async () => {
    let from: Date
    let to: Date
    if (viewMode === 'day') {
      from = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate())
      to = addDays(from, 1)
    } else if (viewMode === 'week') {
      from = weekStart
      to = addDays(weekStart, 7)
    } else {
      from = startOfMonth(monthAnchor)
      to = addMonths(monthAnchor, 1)
    }
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
          res.ok ? t.networkError : t.serverErrorWithCode.replace('{code}', String(res.status))
        )
        setAppointments([])
        return
      }
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
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
  }, [
    viewMode,
    selectedDay,
    weekStart,
    monthAnchor,
    router,
    t.networkError,
    t.failedToLoad,
    t.serverErrorWithCode,
  ])

  useEffect(() => {
    void load()
  }, [load])

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const monthCells = useMemo(() => monthGridFrom(monthAnchor), [monthAnchor])

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

  const goPrevMonth = () => setMonthAnchor((m) => addMonths(m, -1))
  const goNextMonth = () => setMonthAnchor((m) => addMonths(m, 1))
  const goThisMonthAnchor = () => setMonthAnchor(startOfMonth(new Date()))

  const switchToWeek = () => setViewMode('week')
  const switchToDay = () => {
    setSelectedDay(new Date())
    setViewMode('day')
  }
  const switchToMonth = () => {
    setMonthAnchor(startOfMonth(weekStart))
    setViewMode('month')
  }

  const onColDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDropOnDay = async (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    setDropTargetId(null)
    const raw = e.dataTransfer.getData(CLINIC_APPOINTMENT_DND_MIME)
    if (!raw) return
    let payload: ClinicAppointmentDragPayload
    try {
      payload = JSON.parse(raw) as ClinicAppointmentDragPayload
    } catch {
      return
    }
    const startsAt = rescheduleStartsAtPreserveClock(payload.startsAt, day)
    try {
      const res = await fetch(`/api/clinic/appointments/${payload.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startsAt }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || t.rescheduleFailed)
        return
      }
      void load()
    } catch {
      alert(t.rescheduleFailed)
    }
  }

  if (loading && appointments.length === 0 && !error) {
    return <ClinicSpinner label={t.loading} />
  }

  const monthTitle = new Date(monthAnchor).toLocaleDateString(dateLocale, {
    month: 'long',
    year: 'numeric',
  })

  const activeStatuses = new Set(['SCHEDULED', 'CONFIRMED', 'ARRIVED'])
  const visibleAppointments = activeOnly
    ? appointments.filter((a) => activeStatuses.has(a.status))
    : appointments
  const visibleByDay = new Map(byDay)
  if (activeOnly) {
    for (const [key, list] of visibleByDay) {
      visibleByDay.set(key, list.filter((a) => activeStatuses.has(a.status)))
    }
  }
  const dayAppointments = appointmentsOnDay(visibleAppointments, selectedDay)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.appointments}</h1>
            <p className="text-gray-600 text-sm mt-1">
              {viewMode === 'day' ? (
                <>
                  {t.dayAgenda}
                  <span className="text-gray-400">
                    {' '}
                    · {selectedDay.toLocaleDateString(dateLocale)}
                  </span>
                </>
              ) : viewMode === 'week' ? (
                <>
                  {t.thisWeek}
                  {range && (
                    <span className="text-gray-400">
                      {' '}
                      · {new Date(range.from).toLocaleDateString(dateLocale)} –{' '}
                      {new Date(range.to).toLocaleDateString(dateLocale)}
                    </span>
                  )}
                </>
              ) : (
                <span>{monthTitle}</span>
              )}
            </p>
            <p className="text-gray-500 text-xs mt-2 max-w-xl leading-relaxed">{t.appointmentsCalendarHint}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div
              className="flex rounded-xl border border-gray-200 p-1 bg-gray-50"
              role="group"
              aria-label={t.appointments}
            >
              <button
                type="button"
                onClick={switchToDay}
                className={clsx(
                  'flex-1 min-h-11 px-3 rounded-lg text-sm font-semibold transition-colors',
                  viewMode === 'day' ? 'bg-white text-orange-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {t.viewDay}
              </button>
              <button
                type="button"
                onClick={switchToWeek}
                className={clsx(
                  'flex-1 min-h-11 px-3 rounded-lg text-sm font-semibold transition-colors',
                  viewMode === 'week' ? 'bg-white text-orange-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {t.viewWeek}
              </button>
              <button
                type="button"
                onClick={switchToMonth}
                className={clsx(
                  'flex-1 min-h-11 px-3 rounded-lg text-sm font-semibold transition-colors',
                  viewMode === 'month' ? 'bg-white text-orange-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {t.viewMonth}
              </button>
            </div>
            <Link
              href="/clinic/appointments/new"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden />
              {t.newAppointment}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode === 'day' ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedDay((d) => addDays(d, -1))}
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label={t.prevWeek}
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDay(new Date())}
                className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-900 hover:bg-orange-100"
              >
                {t.today}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDay((d) => addDays(d, 1))}
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label={t.nextWeek}
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" aria-hidden />
              </button>
            </>
          ) : viewMode === 'week' ? (
            <>
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
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goPrevMonth}
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label={t.prevMonth}
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" aria-hidden />
              </button>
              <button
                type="button"
                onClick={goThisMonthAnchor}
                className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-900 hover:bg-orange-100"
              >
                {t.thisMonth}
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label={t.nextMonth}
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" aria-hidden />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setActiveOnly((v) => !v)}
            className={clsx(
              'inline-flex items-center justify-center min-h-11 px-4 rounded-xl border text-sm font-semibold',
              activeOnly
                ? 'border-orange-200 bg-orange-50 text-orange-900'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {activeOnly ? t.activeOnly : t.showAll}
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

      {viewMode === 'day' && (
        <div
          className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
          onDragOver={onColDragOver}
          onDrop={(e) => void onDropOnDay(e, selectedDay)}
        >
          {dayAppointments.length === 0 ? (
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
          ) : (
            <div className="space-y-2">
              {dayAppointments.map((a) => (
                <AppointmentAgendaRow
                  key={a.id}
                  appointment={a}
                  dateLocale={dateLocale}
                  t={t}
                  onOpen={() => setSelectedAppointmentId(a.id)}
                  onRequestMove={() => setMoveAppt(a)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-3">
          {days.map((day, i) => {
            const list = visibleByDay.get(i) ?? []
            const dayLabel = t[dayKeys[i]]
            const num = day.getDate()
            const today = isToday(day)
            const dropId = `w-${i}`
            const dropActive = dropTargetId === dropId
            return (
              <div
                key={i}
                className={clsx(
                  'rounded-2xl border bg-white shadow-sm flex flex-col min-h-[140px] lg:min-h-[220px] transition-shadow',
                  today ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200',
                  dropActive && 'ring-2 ring-orange-400 border-orange-300 shadow-md'
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
                  <p
                    className={clsx(
                      'text-lg font-semibold',
                      today ? 'text-orange-900' : 'text-gray-900'
                    )}
                  >
                    {num}
                  </p>
                </div>
                <div
                  className="p-2 flex-1 flex flex-col gap-2 min-h-[80px]"
                  onDragOver={onColDragOver}
                  onDragEnter={(e) => {
                    if ([...e.dataTransfer.types].includes(CLINIC_APPOINTMENT_DND_MIME)) {
                      setDropTargetId(dropId)
                    }
                  }}
                  onDrop={(e) => void onDropOnDay(e, day)}
                >
                  {list.length === 0 ? (
                    <p
                      className={clsx(
                        'text-[11px] text-center py-4 rounded-lg border border-dashed transition-colors',
                        dropActive ? 'text-orange-700 border-orange-200 bg-orange-50/50' : 'text-gray-400 border-transparent'
                      )}
                      aria-label={t.ariaDropReschedule}
                    >
                      {dropActive ? t.ariaDropReschedule : '—'}
                    </p>
                  ) : (
                    list.map((a) => (
                      <AppointmentChip
                        key={a.id}
                        appointment={a}
                        dateLocale={dateLocale}
                        t={t}
                        onOpen={() => setSelectedAppointmentId(a.id)}
                        onRequestMove={() => setMoveAppt(a)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {dayKeys.map((k) => (
              <div key={k} className="px-1 py-2 text-center text-[11px] font-semibold text-gray-500">
                {t[k]}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((cell, idx) => {
              const inMonth = isSameLocalMonth(cell, monthAnchor)
              const today = isToday(cell)
              const list = appointmentsOnDay(visibleAppointments, cell)
              const dropId = `m-${idx}`
              const dropActive = dropTargetId === dropId
              return (
                <div
                  key={idx}
                  className={clsx(
                    'min-h-[100px] sm:min-h-[120px] border-b border-r border-gray-100 p-1 flex flex-col transition-colors',
                    !inMonth && 'bg-gray-50/80 text-gray-400',
                    today && 'bg-orange-50/50',
                    dropActive && 'bg-orange-50 ring-1 ring-inset ring-orange-300'
                  )}
                  onClick={() => {
                    setSelectedDay(cell)
                    setViewMode('day')
                  }}
                  onDragOver={onColDragOver}
                  onDragEnter={(e) => {
                    if ([...e.dataTransfer.types].includes(CLINIC_APPOINTMENT_DND_MIME)) {
                      setDropTargetId(dropId)
                    }
                  }}
                  onDrop={(e) => void onDropOnDay(e, cell)}
                >
                  <p
                    className={clsx(
                      'text-xs font-semibold px-1 mb-1',
                      today ? 'text-orange-800' : inMonth ? 'text-gray-800' : 'text-gray-400'
                    )}
                  >
                    {cell.getDate()}
                  </p>
                  <div className="flex flex-col gap-1 flex-1">
                    {list.slice(0, MAX_APPTS_VISIBLE).map((a) => (
                      <AppointmentChip
                        key={a.id}
                        appointment={a}
                        dateLocale={dateLocale}
                        t={t}
                        compact
                        onOpen={() => setSelectedAppointmentId(a.id)}
                        onRequestMove={() => setMoveAppt(a)}
                      />
                    ))}
                    {list.length > MAX_APPTS_VISIBLE && (
                      <p className="text-[10px] text-gray-500 px-1">
                        {t.moreAppointments.replace('{count}', String(list.length - MAX_APPTS_VISIBLE))}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {viewMode === 'week' && !loading && appointments.length === 0 && !error && (
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

      <ClinicRescheduleSheet
        appointment={moveAppt}
        t={t}
        dateLocale={dateLocale}
        onClose={() => setMoveAppt(null)}
        onApplied={() => void load()}
      />
      <ClinicAppointmentDrawer
        appointmentId={selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
        onChanged={() => void load()}
      />
    </div>
  )
}

function AppointmentChip({
  appointment: a,
  dateLocale,
  compact,
  t,
  onOpen,
  onRequestMove,
}: {
  appointment: Appointment
  dateLocale: string
  compact?: boolean
  t: ClinicStrings
  onOpen: () => void
  onRequestMove: () => void
}) {
  const payload: ClinicAppointmentDragPayload = { id: a.id, startsAt: a.startsAt }
  return (
    <div
      className={clsx(
        'flex gap-0.5 rounded-xl border border-gray-100 bg-gray-50/90 hover:bg-white hover:border-orange-100 hover:shadow-sm text-left transition-all',
        compact ? 'min-h-[40px]' : 'min-h-[48px]'
      )}
    >
      <div
        role="link"
        tabIndex={0}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(CLINIC_APPOINTMENT_DND_MIME, JSON.stringify(payload))
          e.dataTransfer.effectAllowed = 'move'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen()
          }
        }}
        className={clsx(
          'flex-1 min-w-0 px-2 py-2 rounded-l-[10px] cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-inset',
          compact ? 'py-1.5' : ''
        )}
      >
        <p
          className={clsx(
            'font-semibold text-gray-900 leading-tight',
            compact ? 'text-[10px]' : 'text-[11px]'
          )}
        >
          {new Date(a.startsAt).toLocaleTimeString(dateLocale, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p className={clsx('text-gray-800 truncate', compact ? 'text-[10px]' : 'text-xs')}>
          {a.patient.lastName}, {a.patient.firstName}
        </p>
        {!compact && (
          <>
            <p className="text-[10px] text-gray-500 truncate">
              {a.procedure?.name || a.titleOverride || '—'}
            </p>
            {a.bufferAfterMinutes > 0 && (
              <p className="text-[10px] text-orange-700 truncate">
                +{a.bufferAfterMinutes} {t.minutesAbbr} {t.appointmentBuffer.toLowerCase()}
              </p>
            )}
          </>
        )}
      </div>
      <button
        type="button"
        draggable={false}
        onClick={(e) => {
          e.stopPropagation()
          onRequestMove()
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={clsx(
          'shrink-0 self-stretch flex items-center justify-center px-1.5 rounded-r-[10px] text-gray-500 hover:text-orange-800 hover:bg-orange-50 transition-colors min-w-[40px]',
          compact && 'min-w-[36px] px-1'
        )}
        aria-label={t.rescheduleMove}
        title={t.rescheduleMove}
      >
        <CalendarDays className={clsx('shrink-0', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} aria-hidden />
      </button>
    </div>
  )
}

function AppointmentAgendaRow({
  appointment: a,
  dateLocale,
  t,
  onOpen,
  onRequestMove,
}: {
  appointment: Appointment
  dateLocale: string
  t: ClinicStrings
  onOpen: () => void
  onRequestMove: () => void
}) {
  const start = new Date(a.startsAt)
  const end = a.endsAt ? new Date(a.endsAt) : null
  const occupiedUntil = end ? new Date(end.getTime() + (a.bufferAfterMinutes || 0) * 60 * 1000) : null
  return (
    <div
      className={clsx(
        'rounded-2xl border p-3 transition-colors',
        appointmentStatusClass(a.status)
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button type="button" onClick={onOpen} className="min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900">
            {start.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
            {end && (
              <span className="text-gray-500">
                {' '}
                – {end.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
          <p className="mt-1 font-medium text-gray-900">
            {a.patient.lastName}, {a.patient.firstName}
          </p>
          <p className="text-sm text-gray-600">{a.procedure?.name || a.titleOverride || t.appointmentDefault}</p>
          {occupiedUntil && a.bufferAfterMinutes > 0 && (
            <p className="mt-1 text-xs text-orange-700">
              {t.technicalBreak}: +{a.bufferAfterMinutes} {t.minutesAbbr} · {t.occupiedUntil}{' '}
              {occupiedUntil.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </button>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-10 items-center rounded-xl bg-white px-3 text-sm font-semibold text-orange-700 shadow-sm"
          >
            {t.openAppointment}
          </button>
          <button
            type="button"
            onClick={onRequestMove}
            className="inline-flex min-h-10 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
          >
            {t.rescheduleMove}
          </button>
        </div>
      </div>
    </div>
  )
}

function appointmentStatusClass(status: string) {
  if (status === 'CONFIRMED') return 'border-blue-200 bg-blue-50/70'
  if (status === 'ARRIVED') return 'border-emerald-200 bg-emerald-50/70'
  if (status === 'COMPLETED') return 'border-gray-200 bg-gray-50'
  if (status === 'CANCELLED' || status === 'NO_SHOW') return 'border-red-200 bg-red-50/70'
  return 'border-orange-200 bg-orange-50/60'
}
