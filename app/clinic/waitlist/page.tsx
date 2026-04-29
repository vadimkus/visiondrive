'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarPlus, ClipboardList, MessageCircle, RefreshCw } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type PatientOption = {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  area: string | null
}

type ProcedureOption = {
  id: string
  name: string
  defaultDurationMin: number
}

type WaitlistEntry = {
  id: string
  status: 'OPEN' | 'CONTACTED' | 'BOOKED' | 'CLOSED'
  priority: number
  earliestAt: string | null
  latestAt: string | null
  preferredDays: string[]
  preferredTimeOfDay: string | null
  note: string | null
  createdAt: string
  lastContactedAt: string | null
  matchScore: number
  whatsappMessage: string | null
  whatsappUrl: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    area: string | null
    tags: string[]
  }
  procedure: ProcedureOption | null
}

type WaitlistResponse = {
  entries: WaitlistEntry[]
  totals: {
    open: number
    contacted: number
    active: number
  }
}

function toDateTimeInput(date: Date) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return copy.toISOString().slice(0, 16)
}

function patientName(patient: Pick<PatientOption, 'firstName' | 'lastName'>) {
  return `${patient.firstName} ${patient.lastName}`.trim()
}

export default function ClinicWaitlistPage() {
  const { t } = useClinicLocale()
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [procedures, setProcedures] = useState<ProcedureOption[]>([])
  const [overview, setOverview] = useState<WaitlistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    patientId: '',
    procedureId: '',
    priority: '2',
    earliestAt: '',
    latestAt: '',
    preferredDays: '',
    preferredTimeOfDay: '',
    note: '',
  })
  const [slot, setSlot] = useState({
    slotStart: toDateTimeInput(new Date(Date.now() + 60 * 60_000)),
    procedureId: '',
    durationMinutes: '60',
  })

  const loadReference = useCallback(async () => {
    const [patientsRes, proceduresRes] = await Promise.all([
      fetch('/api/clinic/patients', { credentials: 'include' }),
      fetch('/api/clinic/procedures', { credentials: 'include' }),
    ])
    const [patientsData, proceduresData] = await Promise.all([patientsRes.json(), proceduresRes.json()])
    if (!patientsRes.ok) throw new Error(patientsData.error || t.failedToLoad)
    if (!proceduresRes.ok) throw new Error(proceduresData.error || t.failedToLoad)
    setPatients(patientsData.patients ?? [])
    setProcedures((proceduresData.procedures ?? []).filter((procedure: ProcedureOption & { active?: boolean }) => procedure.active !== false))
  }, [t.failedToLoad])

  const loadWaitlist = useCallback(async () => {
    const params = new URLSearchParams()
    if (slot.slotStart) params.set('slotStart', new Date(slot.slotStart).toISOString())
    if (slot.procedureId) params.set('procedureId', slot.procedureId)
    const res = await fetch(`/api/clinic/waitlist?${params.toString()}`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || t.failedToLoad)
    setOverview(data)
  }, [slot.procedureId, slot.slotStart, t.failedToLoad])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadReference(), loadWaitlist()])
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError)
    } finally {
      setLoading(false)
    }
  }, [loadReference, loadWaitlist, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const selectedProcedure = useMemo(
    () => procedures.find((procedure) => procedure.id === slot.procedureId),
    [procedures, slot.procedureId]
  )

  async function createEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const res = await fetch('/api/clinic/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: form.patientId,
          procedureId: form.procedureId || null,
          priority: Number(form.priority),
          earliestAt: form.earliestAt ? new Date(form.earliestAt).toISOString() : null,
          latestAt: form.latestAt ? new Date(form.latestAt).toISOString() : null,
          preferredDays: form.preferredDays,
          preferredTimeOfDay: form.preferredTimeOfDay,
          note: form.note,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      setNotice(t.waitlistCreated)
      setForm((current) => ({ ...current, note: '', preferredDays: '', preferredTimeOfDay: '' }))
      await loadWaitlist()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError)
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(entry: WaitlistEntry, status: WaitlistEntry['status']) {
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/waitlist/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      await loadWaitlist()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError)
    }
  }

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  const entries = overview?.entries ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">{t.cancellationFill}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">{t.smartWaitlist}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{t.smartWaitlistIntro}</p>
          </div>
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
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {notice && <ClinicAlert variant="success">{notice}</ClinicAlert>}

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label={t.waitlistOpen} value={overview?.totals.open ?? 0} />
        <Metric label={t.waitlistContacted} value={overview?.totals.contacted ?? 0} />
        <Metric label={t.activeWaitlist} value={overview?.totals.active ?? 0} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={createEntry} className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">{t.addWaitlistEntry}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.cancellationFillHint}</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            {t.patientLabel}
            <select
              required
              value={form.patientId}
              onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
            >
              <option value="">{t.selectPlaceholder}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patientName(patient)}{patient.area ? ` · ${patient.area}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {t.procedureOptional}
            <select
              value={form.procedureId}
              onChange={(event) => setForm((current) => ({ ...current, procedureId: event.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
            >
              <option value="">{t.selectPlaceholder}</option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.waitlistPriority}
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              >
                <option value="1">{t.waitlistPriorityHigh}</option>
                <option value="2">{t.waitlistPriorityNormal}</option>
                <option value="3">{t.waitlistPriorityLow}</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.waitlistPreferredTime}
              <input
                value={form.preferredTimeOfDay}
                onChange={(event) => setForm((current) => ({ ...current, preferredTimeOfDay: event.target.value }))}
                placeholder="Morning / afternoon / after 18:00"
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.waitlistEarliest}
              <input
                type="datetime-local"
                value={form.earliestAt}
                onChange={(event) => setForm((current) => ({ ...current, earliestAt: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.waitlistLatest}
              <input
                type="datetime-local"
                value={form.latestAt}
                onChange={(event) => setForm((current) => ({ ...current, latestAt: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            {t.waitlistPreferredDays}
            <input
              value={form.preferredDays}
              onChange={(event) => setForm((current) => ({ ...current, preferredDays: event.target.value }))}
              placeholder="Mon, Wed, Friday"
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {t.waitlistNote}
            <textarea
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !form.patientId}
            className="min-h-11 w-full rounded-2xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? t.creatingEllipsis : t.waitlistCreate}
          </button>
        </form>

        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">{t.fillSuggestions}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.cancellationFillHint}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              {t.waitlistSlotStart}
              <input
                type="datetime-local"
                value={slot.slotStart}
                onChange={(event) => setSlot((current) => ({ ...current, slotStart: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.waitlistSlotDuration}
              <input
                type="number"
                min="5"
                max="480"
                value={selectedProcedure?.defaultDurationMin ?? slot.durationMinutes}
                onChange={(event) => setSlot((current) => ({ ...current, durationMinutes: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 sm:col-span-3">
              {t.procedureOptional}
              <select
                value={slot.procedureId}
                onChange={(event) => setSlot((current) => ({ ...current, procedureId: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm"
              >
                <option value="">{t.selectPlaceholder}</option>
                {procedures.map((procedure) => (
                  <option key={procedure.id} value={procedure.id}>
                    {procedure.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => void loadWaitlist()}
            className="min-h-11 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            {t.refresh}
          </button>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                {t.noFillSuggestions}
              </p>
            ) : (
              entries.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-950">{patientName(entry.patient)}</h3>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-600">
                          {statusLabel(entry.status, t)}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                          {t.waitlistMatchScore}: {entry.matchScore}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {entry.procedure?.name || t.procedureOptional}
                        {entry.patient.area ? ` · ${entry.patient.area}` : ''}
                      </p>
                      {(entry.preferredDays.length > 0 || entry.preferredTimeOfDay) && (
                        <p className="mt-1 text-xs text-gray-500">
                          {[entry.preferredDays.join(', '), entry.preferredTimeOfDay].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.whatsappUrl ? (
                        <a
                          href={entry.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => void updateStatus(entry, 'CONTACTED')}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {t.openWhatsApp}
                        </a>
                      ) : (
                        <span className="inline-flex min-h-10 items-center rounded-xl bg-white px-3 text-sm font-semibold text-gray-500">
                          {t.waitlistPatientMissingPhone}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void updateStatus(entry, 'BOOKED')}
                        className="min-h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        {t.markBooked}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateStatus(entry, 'CLOSED')}
                        className="min-h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        {t.markClosed}
                      </button>
                    </div>
                  </div>
                  {entry.whatsappMessage && (
                    <div className="mt-3 rounded-xl border border-white bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t.waitlistMessagePreview}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">{entry.whatsappMessage}</p>
                    </div>
                  )}
                  {entry.note && <p className="mt-3 text-sm text-gray-600">{entry.note}</p>}
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

function statusLabel(status: WaitlistEntry['status'], t: ReturnType<typeof useClinicLocale>['t']) {
  if (status === 'CONTACTED') return t.waitlistContacted
  if (status === 'BOOKED') return t.waitlistBooked
  if (status === 'CLOSED') return t.waitlistClosed
  return t.waitlistOpen
}
