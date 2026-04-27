'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'

type Appointment = {
  id: string
  startsAt: string
  endsAt: string | null
  status: string
  titleOverride: string | null
  internalNotes: string | null
  bufferAfterMinutes: number
  travelBufferBeforeMinutes: number
  travelBufferAfterMinutes: number
  locationAddress: string | null
  locationArea: string | null
  locationNotes: string | null
  overrideReason: string | null
  patientId: string
  procedureId: string | null
  patient: { id: string; firstName: string; lastName: string }
  procedure: { id: string; name: string; defaultDurationMin: number } | null
}

type Procedure = { id: string; name: string; bufferAfterMinutes: number }
type SchedulingConflict = {
  type?: string
  patientName?: string
  startsAt?: string
  reason?: string | null
  minLeadMinutes?: number
}

function conflictMessage(t: ReturnType<typeof useClinicLocale>['t'], conflict: SchedulingConflict) {
  if (conflict.type === 'BLOCKED_TIME') {
    return t.appointmentConflictBlocked.replace('{reason}', conflict.reason || t.emptyValue)
  }
  if (conflict.type === 'WORKING_HOURS') return t.appointmentConflictWorkingHours
  if (conflict.type === 'LEAD_TIME') {
    return t.appointmentConflictLeadTime.replace('{minutes}', String(conflict.minLeadMinutes ?? 0))
  }
  return t.appointmentConflictWith
    .replace('{name}', conflict.patientName || '')
    .replace(
      '{time}',
      conflict.startsAt
        ? new Date(conflict.startsAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''
    )
}

export default function EditAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id || '')
  const { t } = useClinicLocale()

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [startsAt, setStartsAt] = useState('')
  const [status, setStatus] = useState('SCHEDULED')
  const [procedureId, setProcedureId] = useState('')
  const [bufferAfterMinutes, setBufferAfterMinutes] = useState('0')
  const [travelBufferBeforeMinutes, setTravelBufferBeforeMinutes] = useState('0')
  const [travelBufferAfterMinutes, setTravelBufferAfterMinutes] = useState('0')
  const [locationAddress, setLocationAddress] = useState('')
  const [locationArea, setLocationArea] = useState('')
  const [locationNotes, setLocationNotes] = useState('')
  const [allowConflictOverride, setAllowConflictOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [titleOverride, setTitleOverride] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [aRes, pRes] = await Promise.all([
          fetch(`/api/clinic/appointments/${id}`, { credentials: 'include' }),
          fetch('/api/clinic/procedures', { credentials: 'include' }),
        ])
        if (aRes.status === 401) {
          router.replace('/login')
          return
        }
        if (!aRes.ok) {
          const j = await aRes.json()
          setError(j.error || t.notFound)
          return
        }
        const aj = await aRes.json()
        const a = aj.appointment as Appointment
        if (cancelled) return
        setAppointment(a)
        const d = new Date(a.startsAt)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        setStartsAt(d.toISOString().slice(0, 16))
        setStatus(a.status)
        setProcedureId(a.procedureId ?? '')
        setBufferAfterMinutes(String(a.bufferAfterMinutes ?? 0))
        setTravelBufferBeforeMinutes(String(a.travelBufferBeforeMinutes ?? 0))
        setTravelBufferAfterMinutes(String(a.travelBufferAfterMinutes ?? 0))
        setLocationAddress(a.locationAddress ?? '')
        setLocationArea(a.locationArea ?? '')
        setLocationNotes(a.locationNotes ?? '')
        setOverrideReason(a.overrideReason ?? '')
        setTitleOverride(a.titleOverride ?? '')
        setInternalNotes(a.internalNotes ?? '')

        if (pRes.ok) {
          const pj = await pRes.json()
          if (!cancelled) {
            setProcedures((pj.procedures || []).filter((x: { active: boolean }) => x.active))
          }
        }
      } catch {
        if (!cancelled) setError(t.networkError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router, t.networkError, t.notFound])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment) return
    setSaving(true)
    setError('')
    try {
      const start = new Date(startsAt)
      if (Number.isNaN(start.getTime())) {
        setError(t.invalidDateTime)
        setSaving(false)
        return
      }
      const res = await fetch(`/api/clinic/appointments/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startsAt: start.toISOString(),
          status,
          procedureId: procedureId || null,
          bufferAfterMinutes: parseInt(bufferAfterMinutes || '0', 10),
          travelBufferBeforeMinutes: parseInt(travelBufferBeforeMinutes || '0', 10),
          travelBufferAfterMinutes: parseInt(travelBufferAfterMinutes || '0', 10),
          locationAddress: locationAddress.trim() || null,
          locationArea: locationArea.trim() || null,
          locationNotes: locationNotes.trim() || null,
          allowConflictOverride,
          overrideReason: overrideReason.trim() || null,
          titleOverride: titleOverride.trim() || null,
          internalNotes: internalNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && data.conflict) {
          setError(`${conflictMessage(t, data.conflict)} ${t.appointmentOverrideRequired}`)
        } else {
          setError(data.error || t.saveFailed)
        }
        return
      }
      router.push('/clinic/appointments')
      router.refresh()
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} />
  }

  if (error && !appointment) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <ClinicAlert variant="error">{error}</ClinicAlert>
        <Link href="/clinic/appointments" className="text-orange-600 text-sm min-h-11 inline-flex items-center">
          ← {t.appointments}
        </Link>
      </div>
    )
  }

  if (!appointment) return null

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/clinic/appointments" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          ← {t.appointments}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {t.editAppointment}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {appointment.patient.lastName}, {appointment.patient.firstName}
        </p>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.appointmentStatus}</label>
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11 bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="SCHEDULED">{t.appointmentStatusScheduled}</option>
            <option value="CONFIRMED">{t.appointmentStatusConfirmed}</option>
            <option value="ARRIVED">{t.appointmentStatusArrived}</option>
            <option value="COMPLETED">{t.appointmentStatusCompleted}</option>
            <option value="CANCELLED">{t.appointmentStatusCancelled}</option>
            <option value="NO_SHOW">{t.appointmentStatusNoShow}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.startsAt}</label>
          <input
            required
            type="datetime-local"
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.procedureOptional}</label>
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11 bg-white"
            value={procedureId}
            onChange={(e) => {
              const procedure = procedures.find((p) => p.id === e.target.value)
              setProcedureId(e.target.value)
              setBufferAfterMinutes(String(procedure?.bufferAfterMinutes ?? 0))
            }}
          >
            <option value="">{t.emptyValue}</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.appointmentBuffer}</label>
          <input
            type="number"
            min={0}
            max={60}
            step={5}
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
            value={bufferAfterMinutes}
            onChange={(e) => setBufferAfterMinutes(e.target.value)}
          />
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-emerald-950">{t.homeVisitRoute}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.visitLocation}</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.area}</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
              value={locationArea}
              onChange={(e) => setLocationArea(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.travelBefore}</label>
              <input
                type="number"
                min={0}
                max={180}
                step={5}
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
                value={travelBufferBeforeMinutes}
                onChange={(e) => setTravelBufferBeforeMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.travelAfter}</label>
              <input
                type="number"
                min={0}
                max={180}
                step={5}
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
                value={travelBufferAfterMinutes}
                onChange={(e) => setTravelBufferAfterMinutes(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.accessNotes}</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900"
              value={locationNotes}
              onChange={(e) => setLocationNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <label className="flex items-start gap-3 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-amber-300 text-orange-600"
              checked={allowConflictOverride}
              onChange={(e) => setAllowConflictOverride(e.target.checked)}
            />
            <span>{t.appointmentAllowOverride}</span>
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-gray-900"
            placeholder={t.appointmentOverrideReasonHint}
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />
          <p className="text-xs text-amber-900">{t.appointmentOverrideReason}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.titleIfNoProcedure}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
            value={titleOverride}
            onChange={(e) => setTitleOverride(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.internalNotesStaff}</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 min-h-11 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? t.savingEllipsis : t.save}
          </button>
          <Link
            href="/clinic/appointments"
            className="flex-1 min-h-11 py-3 rounded-xl border border-gray-200 text-center font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-center"
          >
            {t.cancel}
          </Link>
        </div>
        <Link
          href={`/clinic/patients/${appointment.patient.id}`}
          className="block text-center text-sm text-orange-600 min-h-11 py-2"
        >
          {t.viewPatientChart} — {appointment.patient.lastName}, {appointment.patient.firstName}
        </Link>
      </form>
    </div>
  )
}
