'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Calendar,
  CreditCard,
  MessageSquare,
  Camera,
  Clock,
  Pencil,
  ChevronUp,
  ClipboardList,
} from 'lucide-react'
import clsx from 'clsx'

type ProcedureRef = { id: string; name: string } | null

type AppointmentRow = {
  id: string
  startsAt: string
  endsAt: string | null
  status: string
  titleOverride: string | null
  internalNotes: string | null
  procedure: ProcedureRef
}

type MediaMeta = {
  id: string
  kind: string
  mimeType: string
  caption: string | null
  visitId: string | null
  createdAt: string
}

type VisitRow = {
  id: string
  visitAt: string
  status: string
  chiefComplaint: string | null
  procedureSummary: string | null
  staffNotes: string | null
  nextSteps: string | null
  media: MediaMeta[]
}

type PaymentRow = {
  id: string
  amountCents: number
  currency: string
  method: string
  status: string
  reference: string | null
  note: string | null
  paidAt: string
  visitId: string | null
  createdAt: string
}

type CrmRow = {
  id: string
  type: string
  body: string
  occurredAt: string
  createdAt: string
}

export type PatientRecord = {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  phone: string | null
  email: string | null
  internalNotes: string | null
  appointments: AppointmentRow[]
  visits: VisitRow[]
  media: MediaMeta[]
  payments: PaymentRow[]
  crmActivities: CrmRow[]
}

type Tab = 'overview' | 'timeline' | 'photos' | 'payments' | 'crm'

function ageFromDob(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

export default function PatientRecordClient({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [savingPatient, setSavingPatient] = useState(false)

  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editInternal, setEditInternal] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/clinic/patients/${patientId}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Not found')
      setPatient(null)
      return
    }
    const p = data.patient as PatientRecord
    setPatient(p)
    setEditFirst(p.firstName)
    setEditLast(p.lastName)
    setEditPhone(p.phone ?? '')
    setEditEmail(p.email ?? '')
    setEditInternal(p.internalNotes ?? '')
    setError('')
  }, [patientId, router])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await load()
      } catch {
        if (!cancelled) setError('Network error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  const nextAppointment = useMemo(() => {
    if (!patient) return null
    const now = Date.now()
    const upcoming = patient.appointments
      .filter((a) => a.status === 'SCHEDULED' && new Date(a.startsAt).getTime() >= now - 60 * 60 * 1000)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    return upcoming[0] ?? null
  }, [patient])

  const lastVisitWithPlan = useMemo(() => {
    if (!patient) return null
    for (const v of patient.visits) {
      if (v.nextSteps?.trim()) return v
    }
    return null
  }, [patient])

  const timelineItems = useMemo(() => {
    if (!patient) return []
    type Item = { sort: number; label: string; detail: string; meta: string }
    const items: Item[] = []
    for (const a of patient.appointments) {
      items.push({
        sort: new Date(a.startsAt).getTime(),
        label: `Appointment · ${a.status}`,
        detail: a.procedure?.name || a.titleOverride || 'Scheduled visit',
        meta: new Date(a.startsAt).toLocaleString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    }
    for (const v of patient.visits) {
      items.push({
        sort: new Date(v.visitAt).getTime(),
        label: `Visit · ${v.status}`,
        detail: v.procedureSummary || v.chiefComplaint || 'Encounter',
        meta: new Date(v.visitAt).toLocaleString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    }
    for (const pmt of patient.payments) {
      items.push({
        sort: new Date(pmt.paidAt).getTime(),
        label: `Payment · ${pmt.status}`,
        detail: `${formatMoney(pmt.amountCents, pmt.currency)} · ${pmt.method}`,
        meta: new Date(pmt.paidAt).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      })
    }
    for (const c of patient.crmActivities) {
      items.push({
        sort: new Date(c.occurredAt).getTime(),
        label: `CRM · ${c.type}`,
        detail: c.body,
        meta: new Date(c.occurredAt).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    }
    return items.sort((a, b) => b.sort - a.sort)
  }, [patient])

  const savePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setSavingPatient(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: editFirst,
          lastName: editLast,
          phone: editPhone || null,
          email: editEmail || null,
          internalNotes: editInternal || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        return
      }
      setEditOpen(false)
      await load()
    } catch {
      setError('Network error')
    } finally {
      setSavingPatient(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <p className="text-red-600">{error || 'Not found'}</p>
        <Link href="/clinic/patients" className="text-orange-600 text-sm">
          ← Patients
        </Link>
      </div>
    )
  }

  const age = ageFromDob(patient.dateOfBirth)
  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'crm', label: 'CRM', icon: MessageSquare },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <Link href="/clinic/patients" className="text-sm text-orange-600 hover:text-orange-700 inline-block">
        ← Patients
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          {patient.lastName}, {patient.firstName}
          {patient.middleName ? ` ${patient.middleName}` : ''}
        </h1>
        <p className="text-gray-600 text-sm">
          DOB{' '}
          {new Date(patient.dateOfBirth).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {age != null ? ` · ${age} years` : ''}
        </p>
      </div>

      {/* Next actions — tuned for returning patient on iPad */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 mb-2">What to do next</p>
        <ul className="space-y-2 text-sm text-orange-950">
          {nextAppointment && (
            <li className="flex gap-2">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
              <span>
                <span className="font-medium">Scheduled: </span>
                {new Date(nextAppointment.startsAt).toLocaleString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' — '}
                {nextAppointment.procedure?.name || nextAppointment.titleOverride || 'Appointment'}
              </span>
            </li>
          )}
          {lastVisitWithPlan?.nextSteps && (
            <li className="flex gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
              <span>
                <span className="font-medium">From last visit: </span>
                {lastVisitWithPlan.nextSteps}
              </span>
            </li>
          )}
          {patient.internalNotes && (
            <li className="flex gap-2">
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
              <span>
                <span className="font-medium">Staff notes: </span>
                {patient.internalNotes}
              </span>
            </li>
          )}
          {!nextAppointment && !lastVisitWithPlan?.nextSteps && !patient.internalNotes && (
            <li className="text-orange-800/90">No upcoming appointment or follow-up notes on file.</li>
          )}
        </ul>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              tab === id
                ? 'bg-white text-orange-800 shadow-sm border border-orange-100'
                : 'text-gray-600 hover:bg-white/70'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <OverviewTab
          patient={patient}
          editOpen={editOpen}
          setEditOpen={setEditOpen}
          editFirst={editFirst}
          setEditFirst={setEditFirst}
          editLast={editLast}
          setEditLast={setEditLast}
          editPhone={editPhone}
          setEditPhone={setEditPhone}
          editEmail={editEmail}
          setEditEmail={setEditEmail}
          editInternal={editInternal}
          setEditInternal={setEditInternal}
          savePatient={savePatient}
          savingPatient={savingPatient}
          onVisitLogged={load}
        />
      )}
      {tab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {timelineItems.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No history yet.</p>
          ) : (
            timelineItems.map((item, i) => (
              <div key={`${item.sort}-${i}`} className="p-4 text-sm">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-gray-700 mt-0.5">{item.detail}</p>
                <p className="text-gray-400 text-xs mt-1">{item.meta}</p>
              </div>
            ))
          )}
        </div>
      )}
      {tab === 'photos' && <PhotosTab patient={patient} onRefresh={load} />}
      {tab === 'payments' && <PaymentsTab patient={patient} onRefresh={load} />}
      {tab === 'crm' && <CrmTab patient={patient} onRefresh={load} />}
    </div>
  )
}

function OverviewTab({
  patient,
  editOpen,
  setEditOpen,
  editFirst,
  setEditFirst,
  editLast,
  setEditLast,
  editPhone,
  setEditPhone,
  editEmail,
  setEditEmail,
  editInternal,
  setEditInternal,
  savePatient,
  savingPatient,
  onVisitLogged,
}: {
  patient: PatientRecord
  editOpen: boolean
  setEditOpen: (v: boolean) => void
  editFirst: string
  setEditFirst: (v: string) => void
  editLast: string
  setEditLast: (v: string) => void
  editPhone: string
  setEditPhone: (v: string) => void
  editEmail: string
  setEditEmail: (v: string) => void
  editInternal: string
  setEditInternal: (v: string) => void
  savePatient: (e: React.FormEvent) => Promise<void>
  savingPatient: boolean
  onVisitLogged: () => Promise<void>
}) {
  const [visitAt, setVisitAt] = useState(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })
  const [chief, setChief] = useState('')
  const [summary, setSummary] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [logging, setLogging] = useState(false)

  const logVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLogging(true)
    try {
      const iso = new Date(visitAt).toISOString()
      const res = await fetch('/api/clinic/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: patient.id,
          visitAt: iso,
          chiefComplaint: chief || null,
          procedureSummary: summary || null,
          nextSteps: nextSteps || null,
          staffNotes: staffNotes || null,
          status: 'COMPLETED',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Could not log visit')
        return
      }
      setChief('')
      setSummary('')
      setNextSteps('')
      setStaffNotes('')
      await onVisitLogged()
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2 text-sm">
        <div className="flex justify-between items-start gap-3">
          <p className="font-medium text-gray-900">Contact</p>
          <button
            type="button"
            onClick={() => setEditOpen(!editOpen)}
            className="text-orange-600 text-sm font-medium flex items-center gap-1"
          >
            {editOpen ? (
              <>
                <ChevronUp className="w-4 h-4" /> Close
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" /> Edit
              </>
            )}
          </button>
        </div>
        <p>
          <span className="text-gray-500">Phone:</span> {patient.phone || '—'}
        </p>
        <p>
          <span className="text-gray-500">Email:</span> {patient.email || '—'}
        </p>
      </div>

      {editOpen && (
        <form
          onSubmit={savePatient}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">First name</label>
              <input
                value={editFirst}
                onChange={(e) => setEditFirst(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Last name</label>
              <input
                value={editLast}
                onChange={(e) => setEditLast(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Phone</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              inputMode="email"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Internal notes (staff)</label>
            <textarea
              value={editInternal}
              onChange={(e) => setEditInternal(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={savingPatient}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
          >
            {savingPatient ? 'Saving…' : 'Save patient'}
          </button>
        </form>
      )}

      <form
        onSubmit={logVisit}
        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Log a visit</h2>
        <p className="text-sm text-gray-500">
          Record what was done today and what follows. Attach before/after photos in the Photos tab.
        </p>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Visit date & time</label>
          <input
            type="datetime-local"
            value={visitAt}
            onChange={(e) => setVisitAt(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Chief complaint</label>
          <textarea
            value={chief}
            onChange={(e) => setChief(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Procedure / summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Next steps (shows in “What to do next”)</label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Staff notes (visit)</label>
          <textarea
            value={staffNotes}
            onChange={(e) => setStaffNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={logging}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-60"
        >
          {logging ? 'Saving…' : 'Save visit'}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent appointments</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {patient.appointments.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No appointments yet.</p>
          ) : (
            patient.appointments.slice(0, 8).map((a) => (
              <div key={a.id} className="p-4 text-sm">
                <p className="font-medium text-gray-900">
                  {new Date(a.startsAt).toLocaleString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-gray-600">
                  {a.procedure?.name || a.titleOverride || 'Appointment'}
                  <span className="text-gray-400"> · {a.status}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PhotosTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const [visitId, setVisitId] = useState<string>('')
  const [kind, setKind] = useState<string>('BEFORE')
  const [uploading, setUploading] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', kind)
      if (visitId) fd.append('visitId', visitId)
      const res = await fetch(`/api/clinic/patients/${patient.id}/media`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Upload failed')
        return
      }
      await onRefresh()
    } finally {
      setUploading(false)
    }
  }

  const allMedia = useMemo(() => {
    return patient.media
      .map((m) => {
        const v = m.visitId ? patient.visits.find((x) => x.id === m.visitId) : null
        return {
          ...m,
          visitLabel: v
            ? new Date(v.visitAt).toLocaleDateString('en-GB')
            : 'Unassigned',
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [patient])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-600" />
          Add photo (before / after)
        </h2>
        <p className="text-sm text-gray-500">
          On iPad, use the camera. Link to a visit if you logged one today.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Link to visit</label>
            <select
              value={visitId}
              onChange={(e) => setVisitId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">Not linked</option>
              {patient.visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {new Date(v.visitAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="BEFORE">Before</option>
              <option value="AFTER">After</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <label className="flex flex-col items-center justify-center gap-2 w-full py-10 border-2 border-dashed border-orange-200 rounded-2xl bg-orange-50/50 cursor-pointer hover:bg-orange-50 transition-colors">
          <Camera className="w-8 h-8 text-orange-500" />
          <span className="text-sm font-medium text-orange-800">
            {uploading ? 'Uploading…' : 'Tap to take or choose photo'}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={onFile}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allMedia.map((m) => (
          <div key={m.id} className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/clinic/media/${m.id}`}
              alt={m.caption || m.kind}
              className="w-full aspect-square object-cover"
            />
            <div className="p-2 text-[11px] text-gray-600">
              <span className="font-semibold text-gray-800">{m.kind}</span>
              <span className="text-gray-400"> · </span>
              {m.visitLabel}
            </div>
          </div>
        ))}
      </div>
      {allMedia.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">No photos yet for this patient.</p>
      )}
    </div>
  )
}

function PaymentsTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('CARD')
  const [status, setStatus] = useState('PAID')
  const [note, setNote] = useState('')
  const [visitId, setVisitId] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const major = Number.parseFloat(amount)
    if (Number.isNaN(major) || major <= 0) {
      alert('Enter a valid amount')
      return
    }
    const amountCents = Math.round(major * 100)
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amountCents,
          currency: 'AED',
          method,
          status,
          note: note || null,
          visitId: visitId || null,
          paidAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed')
        return
      }
      setAmount('')
      setNote('')
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Record payment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Amount (AED)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 450"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="POS">POS</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="VOID">Void</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Link to visit (optional)</label>
          <select
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="">—</option>
            {patient.visits.map((v) => (
              <option key={v.id} value={v.id}>
                {new Date(v.visitAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Add payment'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {patient.payments.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No payments recorded.</p>
        ) : (
          patient.payments.map((pmt) => (
            <div key={pmt.id} className="p-4 text-sm flex justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {formatMoney(pmt.amountCents, pmt.currency)}
                </p>
                <p className="text-gray-600">
                  {pmt.method} · {pmt.status}
                </p>
                {pmt.note && <p className="text-gray-500 text-xs mt-1">{pmt.note}</p>}
              </div>
              <p className="text-gray-400 text-xs shrink-0">
                {new Date(pmt.paidAt).toLocaleDateString('en-GB')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CrmTab({
  patient,
  onRefresh,
}: {
  patient: PatientRecord
  onRefresh: () => Promise<void>
}) {
  const [type, setType] = useState('NOTE')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clinic/patients/${patient.id}/crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          body: body.trim(),
          occurredAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed')
        return
      }
      setBody('')
      await onRefresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Log interaction</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="NOTE">Note</option>
            <option value="CALL">Call</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Details</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            placeholder="What was discussed, next touchpoint, preferences…"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save to CRM'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {patient.crmActivities.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No CRM history yet.</p>
        ) : (
          patient.crmActivities.map((c) => (
            <div key={c.id} className="p-4 text-sm">
              <p className="font-medium text-gray-900">
                {c.type}{' '}
                <span className="text-gray-400 font-normal text-xs">
                  {new Date(c.occurredAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
