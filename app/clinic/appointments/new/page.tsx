'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type Patient = { id: string; firstName: string; lastName: string }
type Procedure = { id: string; name: string; bufferAfterMinutes: number }

export default function NewAppointmentPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [patients, setPatients] = useState<Patient[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(false)
  const [loadMeta, setLoadMeta] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    patientId: '',
    procedureId: '',
    startsAt: '',
    bufferAfterMinutes: '0',
    titleOverride: '',
    internalNotes: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [pr, proc] = await Promise.all([
          fetch('/api/clinic/patients', { credentials: 'include' }),
          fetch('/api/clinic/procedures', { credentials: 'include' }),
        ])
        if (pr.ok && proc.ok) {
          const pj = await pr.json()
          const procj = await proc.json()
          if (!cancelled) {
            setPatients(pj.patients || [])
            setProcedures((procj.procedures || []).filter((p: { active: boolean }) => p.active))
          }
        }
      } finally {
        if (!cancelled) setLoadMeta(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const startsAt = new Date(form.startsAt)
      if (Number.isNaN(startsAt.getTime())) {
        setError(t.invalidDateTime)
        setLoading(false)
        return
      }
      const res = await fetch('/api/clinic/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: form.patientId,
          procedureId: form.procedureId || undefined,
          startsAt: startsAt.toISOString(),
          bufferAfterMinutes: parseInt(form.bufferAfterMinutes || '0', 10),
          titleOverride: form.titleOverride || undefined,
          internalNotes: form.internalNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && data.conflict) {
          setError(
            t.appointmentConflictWith
              .replace('{name}', data.conflict.patientName || '')
              .replace(
                '{time}',
                new Date(data.conflict.startsAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              )
          )
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
      setLoading(false)
    }
  }

  if (loadMeta) {
    return <ClinicSpinner label={t.loading} className="min-h-[30vh]" />
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/clinic/appointments" className="text-sm text-orange-600 hover:text-orange-700">
          ← {t.appointments}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.newAppointment}</h1>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      {patients.length === 0 ? (
        <div className="p-4 rounded-xl bg-amber-50 text-amber-900 text-sm">
          {t.addPatientFirst}{' '}
          <Link href="/clinic/patients/new" className="font-semibold underline">
            {t.newPatientTitle}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.patientLabel}</label>
            <select
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            >
              <option value="">{t.selectPlaceholder}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.procedureOptional}</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.procedureId}
              onChange={(e) => {
                const procedure = procedures.find((p) => p.id === e.target.value)
                setForm({
                  ...form,
                  procedureId: e.target.value,
                  bufferAfterMinutes: String(procedure?.bufferAfterMinutes ?? 0),
                })
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
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.bufferAfterMinutes}
              onChange={(e) => setForm({ ...form, bufferAfterMinutes: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">{t.procedureBufferAfterHint}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.startsAt}</label>
            <input
              required
              type="datetime-local"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.titleIfNoProcedure}</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.titleOverride}
              onChange={(e) => setForm({ ...form, titleOverride: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.internalNotesStaffOnly}</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.internalNotes}
              onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? t.savingEllipsis : t.createAppointment}
          </button>
        </form>
      )}
    </div>
  )
}
