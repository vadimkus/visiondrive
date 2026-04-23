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
  patientId: string
  procedureId: string | null
  patient: { id: string; firstName: string; lastName: string }
  procedure: { id: string; name: string; defaultDurationMin: number } | null
}

type Procedure = { id: string; name: string }

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
          setError(j.error || 'Not found')
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
  }, [id, router, t.networkError])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment) return
    setSaving(true)
    setError('')
    try {
      const start = new Date(startsAt)
      if (Number.isNaN(start.getTime())) {
        setError('Invalid date/time')
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
          titleOverride: titleOverride.trim() || null,
          internalNotes: internalNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
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
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO_SHOW</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starts at</label>
          <input
            required
            type="datetime-local"
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Procedure (optional)</label>
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11 bg-white"
            value={procedureId}
            onChange={(e) => setProcedureId(e.target.value)}
          >
            <option value="">—</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (if no procedure)</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-gray-900 min-h-11"
            value={titleOverride}
            onChange={(e) => setTitleOverride(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Internal notes <span className="text-gray-400 font-normal">(staff)</span>
          </label>
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
            {saving ? '…' : t.save}
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
          {t.patients} → {appointment.patient.lastName}, {appointment.patient.firstName}
        </Link>
      </form>
    </div>
  )
}
