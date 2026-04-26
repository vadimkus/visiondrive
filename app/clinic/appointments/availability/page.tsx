'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'

type AvailabilityRule = {
  id?: string
  dayOfWeek: number
  startMinutes: number
  endMinutes: number
  slotIntervalMinutes: number
  minLeadMinutes: number
  active: boolean
  label?: string | null
}

type BlockedTime = {
  id: string
  startsAt: string
  endsAt: string
  reason: string | null
}

type AvailabilitySlot = {
  startsAt: string
  endsAt: string
  occupiedUntil: string
}

const dayNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayNamesRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function minutesToHHMM(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function hhmmToMinutes(value: string, fallback: number) {
  const [hRaw, mRaw] = value.split(':')
  const h = Number(hRaw)
  const m = Number(mRaw)
  if (!Number.isInteger(h) || !Number.isInteger(m)) return fallback
  return Math.max(0, Math.min(24 * 60, h * 60 + m))
}

function dateTimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultRows(): AvailabilityRule[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i + 1,
    startMinutes: 10 * 60,
    endMinutes: 18 * 60,
    slotIntervalMinutes: 30,
    minLeadMinutes: 120,
    active: i < 5,
    label: null,
  }))
}

export default function ClinicAvailabilityPage() {
  const router = useRouter()
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const dayNames = isRu ? dayNamesRu : dayNamesEn
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const copy = {
    title: isRu ? 'Рабочее время и закрытые слоты' : 'Working hours and blocked time',
    subtitle: isRu
      ? 'Настройте доступность, личное время, перерывы и основу для онлайн-записи.'
      : 'Control availability, private time, breaks, and the foundation for online booking.',
    back: isRu ? '← Записи' : '← Appointments',
    save: isRu ? 'Сохранить расписание' : 'Save working hours',
    addBlock: isRu ? 'Добавить закрытый слот' : 'Add blocked time',
    preview: isRu ? 'Свободные слоты на 14 дней' : 'Available slots for next 14 days',
    noSlots: isRu ? 'Нет свободных слотов по текущим правилам.' : 'No slots available with current rules.',
    closed: isRu ? 'Закрыто' : 'Closed',
    open: isRu ? 'Открыто' : 'Open',
    from: isRu ? 'С' : 'From',
    to: isRu ? 'До' : 'To',
    interval: isRu ? 'Интервал' : 'Interval',
    lead: isRu ? 'Мин. до записи' : 'Min lead',
    reason: isRu ? 'Причина' : 'Reason',
    reasonPlaceholder: isRu ? 'Обед, личное, обучение...' : 'Lunch, personal, training...',
    activeBlocks: isRu ? 'Закрытые слоты' : 'Blocked time',
    noBlocks: isRu ? 'Нет закрытых слотов.' : 'No blocked time set.',
    saved: isRu ? 'Расписание сохранено.' : 'Working hours saved.',
  }

  const [rules, setRules] = useState<AvailabilityRule[]>(defaultRows)
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [blockStartsAt, setBlockStartsAt] = useState(() => dateTimeLocalValue(new Date()))
  const [blockEndsAt, setBlockEndsAt] = useState(() =>
    dateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000))
  )
  const [blockReason, setBlockReason] = useState('')

  const previewRange = useMemo(() => {
    const from = new Date()
    const to = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000)
    return { from, to }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [availabilityRes, blockedRes, slotsRes] = await Promise.all([
        fetch('/api/clinic/availability', { credentials: 'include' }),
        fetch('/api/clinic/blocked-times', { credentials: 'include' }),
        fetch(
          `/api/clinic/availability/slots?from=${encodeURIComponent(previewRange.from.toISOString())}&to=${encodeURIComponent(previewRange.to.toISOString())}&durationMinutes=60`,
          { credentials: 'include' }
        ),
      ])
      if ([availabilityRes, blockedRes, slotsRes].some((res) => res.status === 401)) {
        router.replace('/login')
        return
      }
      const availabilityData = await availabilityRes.json()
      const blockedData = await blockedRes.json()
      const slotsData = await slotsRes.json()
      if (!availabilityRes.ok || !blockedRes.ok || !slotsRes.ok) {
        setError(availabilityData.error || blockedData.error || slotsData.error || t.failedToLoad)
        return
      }
      const loadedRules = (availabilityData.rules || []) as AvailabilityRule[]
      const byDay = new Map(loadedRules.map((rule) => [rule.dayOfWeek, rule]))
      setRules(defaultRows().map((row) => ({ ...row, ...(byDay.get(row.dayOfWeek) || {}) })))
      setBlockedTimes(blockedData.blockedTimes || [])
      setSlots(slotsData.slots || [])
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [previewRange.from, previewRange.to, router, t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const updateRule = (index: number, patch: Partial<AvailabilityRule>) => {
    setRules((current) => current.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)))
  }

  const saveRules = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/clinic/availability', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setMessage(copy.saved)
      await load()
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  const addBlockedTime = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const startsAt = new Date(blockStartsAt)
      const endsAt = new Date(blockEndsAt)
      const res = await fetch('/api/clinic/blocked-times', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          reason: blockReason,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setBlockReason('')
      await load()
    } catch {
      setError(t.networkError)
    }
  }

  const deleteBlockedTime = async (id: string) => {
    setError('')
    try {
      const res = await fetch(`/api/clinic/blocked-times/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      await load()
    } catch {
      setError(t.networkError)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/clinic/appointments" className="text-sm text-orange-600 hover:text-orange-700">
            {copy.back}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{copy.title}</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => void saveRules()}
          disabled={saving}
          className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? t.savingEllipsis : copy.save}
        </button>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {message && <ClinicAlert variant="success">{message}</ClinicAlert>}

      <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{copy.title}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {rules.map((rule, index) => (
            <div key={rule.dayOfWeek} className="grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-3 p-4">
              <label className="flex items-center gap-3 font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={rule.active}
                  onChange={(e) => updateRule(index, { active: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-orange-600"
                />
                {dayNames[rule.dayOfWeek - 1]}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <label className="text-sm text-gray-600">
                  <span className="block mb-1">{copy.from}</span>
                  <input
                    type="time"
                    value={minutesToHHMM(rule.startMinutes)}
                    disabled={!rule.active}
                    onChange={(e) =>
                      updateRule(index, {
                        startMinutes: hhmmToMinutes(e.target.value, rule.startMinutes),
                      })
                    }
                    className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900 disabled:bg-gray-50"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="block mb-1">{copy.to}</span>
                  <input
                    type="time"
                    value={minutesToHHMM(rule.endMinutes)}
                    disabled={!rule.active}
                    onChange={(e) =>
                      updateRule(index, { endMinutes: hhmmToMinutes(e.target.value, rule.endMinutes) })
                    }
                    className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900 disabled:bg-gray-50"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="block mb-1">{copy.interval}</span>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={rule.slotIntervalMinutes}
                    disabled={!rule.active}
                    onChange={(e) => updateRule(index, { slotIntervalMinutes: Number(e.target.value) })}
                    className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900 disabled:bg-gray-50"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="block mb-1">{copy.lead}</span>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    value={rule.minLeadMinutes}
                    disabled={!rule.active}
                    onChange={(e) => updateRule(index, { minLeadMinutes: Number(e.target.value) })}
                    className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900 disabled:bg-gray-50"
                  />
                </label>
                <div className="flex items-end">
                  <span className="inline-flex min-h-11 items-center rounded-xl bg-gray-50 px-3 text-sm font-medium text-gray-600">
                    {rule.active ? copy.open : copy.closed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <section className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">{copy.addBlock}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {isRu ? 'Используйте для обеда, отпуска, закупок или личного времени.' : 'Use for lunch, leave, supply runs, training, or personal time.'}
            </p>
          </div>
          <form onSubmit={(e) => void addBlockedTime(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm text-gray-600">
              <span className="block mb-1">{copy.from}</span>
              <input
                type="datetime-local"
                value={blockStartsAt}
                onChange={(e) => setBlockStartsAt(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
              />
            </label>
            <label className="text-sm text-gray-600">
              <span className="block mb-1">{copy.to}</span>
              <input
                type="datetime-local"
                value={blockEndsAt}
                onChange={(e) => setBlockEndsAt(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
              />
            </label>
            <label className="sm:col-span-2 text-sm text-gray-600">
              <span className="block mb-1">{copy.reason}</span>
              <input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={copy.reasonPlaceholder}
                className="w-full min-h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 min-h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" aria-hidden />
              {copy.addBlock}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">{copy.activeBlocks}</h2>
          {blockedTimes.length === 0 ? (
            <p className="text-sm text-gray-500">{copy.noBlocks}</p>
          ) : (
            <div className="space-y-2">
              {blockedTimes.map((block) => (
                <div key={block.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(block.startsAt).toLocaleString(dateLocale, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(block.endsAt).toLocaleString(dateLocale, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    {block.reason && <p className="text-sm text-gray-700 mt-1">{block.reason}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteBlockedTime(block.id)}
                    className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                    aria-label={t.cancel}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-orange-600" aria-hidden />
          <h2 className="font-semibold text-gray-900">{copy.preview}</h2>
        </div>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-500">{copy.noSlots}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {slots.slice(0, 36).map((slot) => (
              <div key={slot.startsAt} className="rounded-xl border border-gray-100 bg-orange-50/50 p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(slot.startsAt).toLocaleDateString(dateLocale, {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  })}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(slot.startsAt).toLocaleTimeString(dateLocale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
