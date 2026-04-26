'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  CreditCard,
  MessageSquare,
  Camera,
  Clock,
  Pencil,
  ChevronUp,
  ClipboardList,
  FileDown,
} from 'lucide-react'
import clsx from 'clsx'
import { anamnesisFromJson, anamnesisToStorage } from '@/lib/clinic/anamnesis'
import { buildTimelineItems, filterTimelineItems, type TimelineFilter } from '@/lib/clinic/timeline'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'

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
  anamnesisJson?: unknown | null
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
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all')
  const [editOpen, setEditOpen] = useState(false)
  const [savingPatient, setSavingPatient] = useState(false)

  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editInternal, setEditInternal] = useState('')
  const [editAllergies, setEditAllergies] = useState('')
  const [editMedications, setEditMedications] = useState('')
  const [editConditions, setEditConditions] = useState('')
  const [editSocial, setEditSocial] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/clinic/patients/${patientId}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.notFound)
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
    const am = anamnesisFromJson(p.anamnesisJson)
    setEditAllergies(am.allergies)
    setEditMedications(am.medications)
    setEditConditions(am.conditions)
    setEditSocial(am.social)
    setError('')
  }, [patientId, router, t.notFound])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await load()
      } catch {
        if (!cancelled) setError(t.networkError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load, t.networkError])

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
    return buildTimelineItems(
      patient.appointments,
      patient.visits,
      patient.payments,
      patient.crmActivities,
      dateLocale
    )
  }, [patient, dateLocale])

  const filteredTimeline = useMemo(
    () => filterTimelineItems(timelineItems, timelineFilter),
    [timelineItems, timelineFilter]
  )

  const savePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setSavingPatient(true)
    try {
      let anamnesisJson: ReturnType<typeof anamnesisToStorage>
      try {
        anamnesisJson = anamnesisToStorage({
          allergies: editAllergies,
          medications: editMedications,
          conditions: editConditions,
          social: editSocial,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : t.saveFailed)
        setSavingPatient(false)
        return
      }
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
          anamnesisJson,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setEditOpen(false)
      await load()
    } catch {
      setError(t.networkError)
    } finally {
      setSavingPatient(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} />
  }

  if (error || !patient) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
        {!error && !patient && <ClinicAlert variant="error">{t.notFound}</ClinicAlert>}
        <Link href="/clinic/patients" className="text-orange-600 text-sm min-h-11 inline-flex items-center">
          {t.backPatients}
        </Link>
      </div>
    )
  }

  const age = ageFromDob(patient.dateOfBirth)
  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'overview', label: t.overview, icon: ClipboardList },
    { id: 'timeline', label: t.timeline, icon: Clock },
    { id: 'photos', label: t.photos, icon: Camera },
    { id: 'payments', label: t.payments, icon: CreditCard },
    { id: 'crm', label: t.crm, icon: MessageSquare },
  ]

  const filterChips: { id: TimelineFilter; label: string }[] = [
    { id: 'all', label: t.timelineAll },
    { id: 'appointment', label: t.timelineAppointments },
    { id: 'visit', label: t.timelineVisits },
    { id: 'payment', label: t.timelinePayments },
    { id: 'crm', label: t.timelineCrm },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <Link
        href="/clinic/patients"
        className="text-sm text-orange-600 hover:text-orange-700 inline-block min-h-11 py-2"
      >
        {t.backPatients}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          {patient.lastName}, {patient.firstName}
          {patient.middleName ? ` ${patient.middleName}` : ''}
        </h1>
        <p className="text-gray-600 text-sm">
          {t.dobLabel}{' '}
          {new Date(patient.dateOfBirth).toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {age != null ? ` · ${age} ${t.ageYears}` : ''}
        </p>
        <a
          href={`/api/clinic/patients/${patient.id}/summary-pdf`}
          className="mt-3 inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 shadow-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileDown className="w-4 h-4 text-orange-600 shrink-0" aria-hidden />
          {t.downloadPatientSummaryPdf}
        </a>
        <p className="text-xs text-gray-500 mt-2 max-w-xl">{t.patientSummaryPdfHint}</p>
      </div>

      {/* Next actions — tuned for returning patient on iPad */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 mb-2">{t.whatNext}</p>
        <ul className="space-y-2 text-sm text-orange-950">
          {nextAppointment && (
            <li className="flex gap-2">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" aria-hidden />
              <span>
                <span className="font-medium">{t.scheduled} </span>
                {new Date(nextAppointment.startsAt).toLocaleString(dateLocale, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' — '}
                {nextAppointment.procedure?.name || nextAppointment.titleOverride || t.appointmentDefault}
              </span>
            </li>
          )}
          {lastVisitWithPlan?.nextSteps && (
            <li className="flex gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" aria-hidden />
              <span>
                <span className="font-medium">{t.fromLastVisit} </span>
                {lastVisitWithPlan.nextSteps}
              </span>
            </li>
          )}
          {patient.internalNotes && (
            <li className="flex gap-2">
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" aria-hidden />
              <span>
                <span className="font-medium">{t.staffNotesLabel} </span>
                {patient.internalNotes}
              </span>
            </li>
          )}
          {!nextAppointment && !lastVisitWithPlan?.nextSteps && !patient.internalNotes && (
            <li className="text-orange-800/90">{t.noUpcoming}</li>
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
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 min-h-11',
              tab === id
                ? 'bg-white text-orange-800 shadow-sm border border-orange-100'
                : 'text-gray-600 hover:bg-white/70'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
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
          editAllergies={editAllergies}
          setEditAllergies={setEditAllergies}
          editMedications={editMedications}
          setEditMedications={setEditMedications}
          editConditions={editConditions}
          setEditConditions={setEditConditions}
          editSocial={editSocial}
          setEditSocial={setEditSocial}
          savePatient={savePatient}
          savingPatient={savingPatient}
          onVisitLogged={load}
        />
      )}
      {tab === 'timeline' && (
        <div className="space-y-3">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label={t.timeline}
          >
            {filterChips.map(({ id: fid, label: fl }) => (
              <button
                key={fid}
                type="button"
                role="tab"
                aria-selected={timelineFilter === fid}
                onClick={() => setTimelineFilter(fid)}
                className={clsx(
                  'min-h-11 px-3 rounded-xl text-sm font-medium border transition-colors',
                  timelineFilter === fid
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                )}
              >
                {fl}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {timelineItems.length === 0 ? (
              <ClinicEmptyState title={t.noHistory} className="border-0 shadow-none" />
            ) : filteredTimeline.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">{t.noTimeline}</p>
            ) : (
              filteredTimeline.map((item, i) => (
                <div key={`${item.sort}-${item.kind}-${i}`} className="p-4 text-sm">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-gray-700 mt-0.5 whitespace-pre-wrap">{item.detail}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.meta}</p>
                </div>
              ))
            )}
          </div>
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
  editAllergies,
  setEditAllergies,
  editMedications,
  setEditMedications,
  editConditions,
  setEditConditions,
  editSocial,
  setEditSocial,
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
  editAllergies: string
  setEditAllergies: (v: string) => void
  editMedications: string
  setEditMedications: (v: string) => void
  editConditions: string
  setEditConditions: (v: string) => void
  editSocial: string
  setEditSocial: (v: string) => void
  savePatient: (e: React.FormEvent) => Promise<void>
  savingPatient: boolean
  onVisitLogged: () => Promise<void>
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const amDisplay = anamnesisFromJson(patient.anamnesisJson)
  const hasAnamnesis =
    !!(amDisplay.allergies || amDisplay.medications || amDisplay.conditions || amDisplay.social)
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
        alert(data.error || t.couldNotLogVisit)
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
          <p className="font-medium text-gray-900">{t.contact}</p>
          <button
            type="button"
            onClick={() => setEditOpen(!editOpen)}
            className="text-orange-600 text-sm font-medium flex items-center gap-1"
          >
            {editOpen ? (
              <>
                <ChevronUp className="w-4 h-4" /> {t.close}
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" /> {t.edit}
              </>
            )}
          </button>
        </div>
        <p>
          <span className="text-gray-500">{t.phoneLabel}:</span> {patient.phone || t.emptyValue}
        </p>
        <p>
          <span className="text-gray-500">{t.emailLabel}:</span> {patient.email || t.emptyValue}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 text-sm">
        <p className="font-medium text-gray-900">{t.anamnesisHeading}</p>
        <p className="text-xs text-gray-500">{t.anamnesisHint}</p>
        {hasAnamnesis ? (
          <dl className="space-y-2 text-gray-800">
            {amDisplay.allergies ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisAllergies}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.allergies}</dd>
              </div>
            ) : null}
            {amDisplay.medications ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisMedications}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.medications}</dd>
              </div>
            ) : null}
            {amDisplay.conditions ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisConditions}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.conditions}</dd>
              </div>
            ) : null}
            {amDisplay.social ? (
              <div>
                <dt className="text-gray-500 text-xs">{t.anamnesisSocial}</dt>
                <dd className="whitespace-pre-wrap mt-0.5">{amDisplay.social}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-gray-500">{t.anamnesisNoneOnFile}</p>
        )}
      </div>

      {editOpen && (
        <form
          onSubmit={savePatient}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">{t.firstName}</label>
              <input
                value={editFirst}
                onChange={(e) => setEditFirst(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.lastName}</label>
              <input
                value={editLast}
                onChange={(e) => setEditLast(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.phoneLabel}</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.emailLabel}</label>
            <input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              inputMode="email"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">{t.internalNotesStaff}</label>
            <textarea
              value={editInternal}
              onChange={(e) => setEditInternal(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="font-medium text-gray-800">{t.anamnesisHeading}</p>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisAllergies}</label>
              <textarea
                value={editAllergies}
                onChange={(e) => setEditAllergies(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisMedications}</label>
              <textarea
                value={editMedications}
                onChange={(e) => setEditMedications(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisConditions}</label>
              <textarea
                value={editConditions}
                onChange={(e) => setEditConditions(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">{t.anamnesisSocial}</label>
              <textarea
                value={editSocial}
                onChange={(e) => setEditSocial(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPatient}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
          >
            {savingPatient ? t.savingEllipsis : t.savePatient}
          </button>
        </form>
      )}

      <form
        onSubmit={logVisit}
        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">{t.logVisit}</h2>
        <p className="text-sm text-gray-500">{t.logVisitHint}</p>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.visitDateTime}</label>
          <input
            type="datetime-local"
            value={visitAt}
            onChange={(e) => setVisitAt(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.chiefComplaint}</label>
          <textarea
            value={chief}
            onChange={(e) => setChief(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.procedureSummary}</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.nextStepsHint}</label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.staffNotesVisit}</label>
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
          {logging ? t.savingEllipsis : t.saveVisit}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t.recentAppointments}</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {patient.appointments.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{t.noAppointmentsYet}</p>
          ) : (
            patient.appointments.slice(0, 8).map((a) => (
              <div key={a.id} className="p-4 text-sm">
                <p className="font-medium text-gray-900">
                  {new Date(a.startsAt).toLocaleString(dateLocale, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-gray-600">
                  {a.procedure?.name || a.titleOverride || t.appointmentDefault}
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
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
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
        alert(data.error || t.uploadFailed)
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
            ? new Date(v.visitAt).toLocaleDateString(dateLocale)
            : t.visitUnassigned,
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [patient, dateLocale, t.visitUnassigned])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-600" />
          {t.addPhotoTitle}
        </h2>
        <p className="text-sm text-gray-500">{t.addPhotoHint}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.linkToVisit}</label>
            <select
              value={visitId}
              onChange={(e) => setVisitId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="">{t.notLinked}</option>
              {patient.visits.map((v) => (
                <option key={v.id} value={v.id}>
                  {new Date(v.visitAt).toLocaleString(dateLocale, {
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
            <label className="block text-sm text-gray-600 mb-1">{t.photoType}</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="BEFORE">{t.photoKindBefore}</option>
              <option value="AFTER">{t.photoKindAfter}</option>
              <option value="OTHER">{t.photoKindOther}</option>
            </select>
          </div>
        </div>
        <label className="flex flex-col items-center justify-center gap-2 w-full py-10 border-2 border-dashed border-orange-200 rounded-2xl bg-orange-50/50 cursor-pointer hover:bg-orange-50 transition-colors">
          <Camera className="w-8 h-8 text-orange-500" />
          <span className="text-sm font-medium text-orange-800">
            {uploading ? t.uploadingEllipsis : t.tapToChoosePhoto}
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
        <p className="text-center text-sm text-gray-500 py-8">{t.noPhotosYet}</p>
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
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
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
      alert(t.enterValidAmount)
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
        alert(data.error || t.operationFailed)
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
        <h2 className="text-lg font-semibold text-gray-900">{t.recordPayment}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.amountAed}</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder={t.amountPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.paymentMethod}</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
            >
              <option value="CARD">{t.payMethodCard}</option>
              <option value="CASH">{t.payMethodCash}</option>
              <option value="TRANSFER">{t.payMethodTransfer}</option>
              <option value="POS">{t.payMethodPos}</option>
              <option value="OTHER">{t.payMethodOther}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.paymentStatusLabel}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="PAID">{t.payStatusPaid}</option>
            <option value="PENDING">{t.payStatusPending}</option>
            <option value="REFUNDED">{t.payStatusRefunded}</option>
            <option value="VOID">{t.payStatusVoid}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.linkToVisitOptional}</label>
          <select
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="">{t.emptyValue}</option>
            {patient.visits.map((v) => (
              <option key={v.id} value={v.id}>
                {new Date(v.visitAt).toLocaleString(dateLocale, {
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
          <label className="block text-sm text-gray-600 mb-1">{t.note}</label>
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
          {saving ? t.savingEllipsis : t.addPayment}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {patient.payments.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t.noPaymentsRecorded}</p>
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
                {new Date(pmt.paidAt).toLocaleDateString(dateLocale)}
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
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
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
        alert(data.error || t.operationFailed)
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
        <h2 className="text-lg font-semibold text-gray-900">{t.logInteraction}</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.crmTypeLabel}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
          >
            <option value="NOTE">{t.crmTypeNote}</option>
            <option value="CALL">{t.crmTypeCall}</option>
            <option value="WHATSAPP">{t.crmTypeWhatsapp}</option>
            <option value="EMAIL">{t.crmTypeEmail}</option>
            <option value="FOLLOW_UP">{t.crmTypeFollowUp}</option>
            <option value="OTHER">{t.crmTypeOther}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.crmDetails}</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base"
            placeholder={t.crmDetailsPlaceholder}
          />
        </div>
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-50"
        >
          {saving ? t.savingEllipsis : t.saveToCrm}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {patient.crmActivities.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t.noCrmHistory}</p>
        ) : (
          patient.crmActivities.map((c) => (
            <div key={c.id} className="p-4 text-sm">
              <p className="font-medium text-gray-900">
                {c.type}{' '}
                <span className="text-gray-400 font-normal text-xs">
                  {new Date(c.occurredAt).toLocaleString(dateLocale, {
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
