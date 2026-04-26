'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { ClinicStrings } from '@/lib/clinic/strings'
import { rescheduleStartsAtPreserveClock } from '@/lib/clinic/appointment-dnd'

export type RescheduleAppointmentRef = {
  id: string
  startsAt: string
  patient: { firstName: string; lastName: string }
}

export function ClinicRescheduleSheet({
  appointment,
  t,
  dateLocale,
  onClose,
  onApplied,
}: {
  appointment: RescheduleAppointmentRef | null
  t: ClinicStrings
  dateLocale: string
  onClose: () => void
  onApplied: () => void
}) {
  const [dateVal, setDateVal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!appointment) return
    const d = new Date(appointment.startsAt)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setDateVal(`${y}-${m}-${day}`)
  }, [appointment])

  useEffect(() => {
    if (!appointment) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [appointment, onClose])

  if (!appointment) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateVal) return
    const parts = dateVal.split('-').map((x) => Number.parseInt(x, 10))
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return
    const [y, m, d] = parts
    const target = new Date(y, m - 1, d)
    const startsAt = rescheduleStartsAtPreserveClock(appointment.startsAt, target)
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/appointments/${appointment.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startsAt }),
      })
      if (!res.ok) {
        alert(t.rescheduleFailed)
        return
      }
      onApplied()
      onClose()
    } catch {
      alert(t.rescheduleFailed)
    } finally {
      setSaving(false)
    }
  }

  const whenLabel = new Date(appointment.startsAt).toLocaleString(dateLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-label={t.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinic-reschedule-title"
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-gray-200/80 sm:border-gray-200 max-h-[88vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 id="clinic-reschedule-title" className="text-lg font-semibold text-gray-900">
              {t.rescheduleSheetTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {appointment.patient.lastName}, {appointment.patient.firstName}
            </p>
            <p className="text-xs text-gray-400 mt-1">{whenLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 min-h-11 min-w-11 rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
            aria-label={t.close}
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={(e) => void submit(e)} className="p-5 space-y-4">
          <p className="text-sm text-gray-500">{t.rescheduleHint}</p>
          <div>
            <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">
              {t.rescheduleNewDate}
            </label>
            <input
              id="reschedule-date"
              type="date"
              required
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl border border-gray-200 text-base text-gray-900"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-11 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? t.savingEllipsis : t.rescheduleApply}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
