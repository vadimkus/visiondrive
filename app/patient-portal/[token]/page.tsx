'use client'

import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import {
  CalendarClock,
  CreditCard,
  FileText,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { CLINIC_LOCALE_STORAGE, type ClinicLocale } from '@/lib/clinic/strings'

type PortalData = {
  practice: { name: string }
  patient: { firstName: string; lastName: string; phone: string | null; email: string | null }
  appointments: Array<{
    id: string
    startsAt: string
    endsAt: string | null
    status: string
    label: string
    locationAddress: string | null
    locationArea: string | null
    locationNotes: string | null
  }>
  aftercare: Array<{
    id: string
    visitAt: string
    label: string
    procedureSummary: string | null
    nextSteps: string | null
    treatmentPlanTitle: string | null
  }>
  packages: Array<{
    id: string
    name: string
    totalSessions: number
    remainingSessions: number
    status: string
    expiresAt: string | null
    procedure: { name: string } | null
  }>
  payments: Array<{
    id: string
    amountCents: number
    currency: string
    method: string
    status: string
    reference: string | null
    paidAt: string
    label: string
    receiptHref: string
  }>
  treatmentPlans: Array<{
    id: string
    title: string
    status: string
    expectedSessions: number
    cadenceDays: number
    targetEndAt: string | null
    goals: string | null
    nextSteps: string | null
    procedure: { name: string } | null
    completedSessions: number
  }>
  consents: Array<{
    id: string
    templateTitleSnapshot: string
    aftercareAcknowledged: boolean
    acceptedAt: string | null
    procedure: { name: string } | null
  }>
}

function readStoredLocale(): ClinicLocale {
  if (typeof window === 'undefined') return 'en'
  return window.localStorage.getItem(CLINIC_LOCALE_STORAGE) === 'ru' ? 'ru' : 'en'
}

const copy = {
  en: {
    title: 'Patient portal',
    secure: 'Private patient link',
    intro: 'Your upcoming appointments, aftercare, packages, receipts, and requests in one secure page.',
    loadFailed: 'Could not load portal link.',
    expired: 'This patient portal link is not available or has expired.',
    upcoming: 'Upcoming appointments',
    noUpcoming: 'No upcoming appointments are currently scheduled.',
    requestChange: 'Request change',
    requestCancel: 'Request cancellation',
    requestReschedule: 'Request reschedule',
    preferredTime: 'Preferred time',
    message: 'Message',
    sendRequest: 'Send request',
    sending: 'Sending...',
    requestSent: 'Request sent. The practice will review it.',
    aftercare: 'Aftercare and next steps',
    noAftercare: 'No aftercare notes have been shared yet.',
    packages: 'Package balance',
    noPackages: 'No active or recent packages.',
    sessionsLeft: 'sessions left',
    treatmentPlans: 'Treatment plans',
    noPlans: 'No active treatment plans.',
    payments: 'Receipts',
    noPayments: 'No receipts yet.',
    receipt: 'Download receipt',
    consents: 'Consents',
    noConsents: 'No accepted consents yet.',
    refresh: 'Refresh',
    location: 'Location',
    expires: 'expires',
  },
  ru: {
    title: 'Кабинет пациента',
    secure: 'Приватная ссылка пациента',
    intro: 'Будущие записи, рекомендации, пакеты, чеки и запросы на одной защищённой странице.',
    loadFailed: 'Не удалось загрузить кабинет.',
    expired: 'Эта ссылка недоступна или истекла.',
    upcoming: 'Будущие записи',
    noUpcoming: 'Будущих записей пока нет.',
    requestChange: 'Запросить изменение',
    requestCancel: 'Запросить отмену',
    requestReschedule: 'Запросить перенос',
    preferredTime: 'Желаемое время',
    message: 'Сообщение',
    sendRequest: 'Отправить запрос',
    sending: 'Отправляем...',
    requestSent: 'Запрос отправлен. Клиника его проверит.',
    aftercare: 'Рекомендации и следующие шаги',
    noAftercare: 'Рекомендаций пока нет.',
    packages: 'Баланс пакетов',
    noPackages: 'Активных или недавних пакетов нет.',
    sessionsLeft: 'сеансов осталось',
    treatmentPlans: 'Планы лечения',
    noPlans: 'Активных планов лечения нет.',
    payments: 'Чеки',
    noPayments: 'Чеков пока нет.',
    receipt: 'Скачать чек',
    consents: 'Согласия',
    noConsents: 'Принятых согласий пока нет.',
    refresh: 'Обновить',
    location: 'Адрес',
    expires: 'истекает',
  },
} as const

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

export default function PatientPortalPage() {
  const params = useParams()
  const token = String(params.token || '')
  const [locale] = useState<ClinicLocale>(() => readStoredLocale())
  const c = copy[locale]
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestAppointmentId, setRequestAppointmentId] = useState('')
  const [requestType, setRequestType] = useState<'RESCHEDULE' | 'CANCEL'>('RESCHEDULE')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const selectedAppointment = useMemo(
    () => data?.appointments.find((appointment) => appointment.id === requestAppointmentId) ?? null,
    [data?.appointments, requestAppointmentId]
  )

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/patient-portal/${token}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ? c.expired : c.loadFailed)
        setData(null)
        return
      }
      setData(json)
    } catch {
      setError(c.loadFailed)
    } finally {
      setLoading(false)
    }
  }, [token, c.expired, c.loadFailed])

  useEffect(() => {
    void load()
  }, [load])

  const openRequest = (appointmentId: string, type: 'RESCHEDULE' | 'CANCEL') => {
    setRequestAppointmentId(appointmentId)
    setRequestType(type)
    setRequestSent(false)
    setMessage('')
    setPreferredTime('')
  }

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault()
    setRequesting(true)
    setRequestSent(false)
    try {
      const res = await fetch(`/api/patient-portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: requestAppointmentId,
          type: requestType,
          preferredTime,
          message,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.loadFailed)
        return
      }
      setRequestSent(true)
      setRequestAppointmentId('')
    } catch {
      setError(c.loadFailed)
    } finally {
      setRequesting(false)
    }
  }

  if (loading && !data) {
    return <main className="min-h-screen bg-orange-50 p-6 text-gray-700">{c.title}...</main>
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <section className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-6 text-red-700 shadow-sm">
          {error || c.expired}
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_32rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-orange-100/50 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {c.secure}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                {data.patient.firstName}, {c.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">{c.intro}</p>
              <p className="mt-2 text-sm font-medium text-orange-800">{data.practice.name}</p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-orange-200"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              {c.refresh}
            </button>
          </div>
        </header>

        {requestSent && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            {c.requestSent}
          </div>
        )}

        <PortalSection icon={CalendarClock} title={c.upcoming}>
          {data.appointments.length === 0 ? (
            <p className="text-sm text-gray-500">{c.noUpcoming}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                  <p className="font-semibold text-gray-950">{appointment.label}</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {new Date(appointment.startsAt).toLocaleString(dateLocale, {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {(appointment.locationAddress || appointment.locationArea) && (
                    <p className="mt-2 text-sm text-gray-600">
                      {c.location}: {[appointment.locationArea, appointment.locationAddress].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {appointment.locationNotes && <p className="mt-1 text-sm text-gray-500">{appointment.locationNotes}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openRequest(appointment.id, 'RESCHEDULE')}
                      className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white"
                    >
                      {c.requestReschedule}
                    </button>
                    <button
                      type="button"
                      onClick={() => openRequest(appointment.id, 'CANCEL')}
                      className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                    >
                      {c.requestCancel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedAppointment && (
            <form onSubmit={submitRequest} className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-950">{c.requestChange}</h3>
              <p className="mt-1 text-sm text-gray-600">{selectedAppointment.label}</p>
              {requestType === 'RESCHEDULE' && (
                <label className="mt-3 block text-sm font-medium text-gray-700">
                  {c.preferredTime}
                  <input
                    value={preferredTime}
                    onChange={(event) => setPreferredTime(event.target.value)}
                    className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3"
                    placeholder="Tomorrow after 15:00"
                  />
                </label>
              )}
              <label className="mt-3 block text-sm font-medium text-gray-700">
                {c.message}
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={requesting}
                className="mt-3 min-h-11 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {requesting ? c.sending : c.sendRequest}
              </button>
            </form>
          )}
        </PortalSection>

        <PortalSection icon={MessageCircle} title={c.aftercare}>
          {data.aftercare.length === 0 ? (
            <p className="text-sm text-gray-500">{c.noAftercare}</p>
          ) : (
            <div className="space-y-3">
              {data.aftercare.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-950">{item.label}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.visitAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {item.procedureSummary && <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.procedureSummary}</p>}
                  {item.nextSteps && <p className="mt-2 text-sm font-medium text-orange-800 whitespace-pre-wrap">{item.nextSteps}</p>}
                </div>
              ))}
            </div>
          )}
        </PortalSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <PortalSection icon={PackageCheck} title={c.packages}>
            {data.packages.length === 0 ? (
              <p className="text-sm text-gray-500">{c.noPackages}</p>
            ) : (
              <div className="space-y-3">
                {data.packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-950">{pkg.name}</p>
                    <p className="mt-1 text-sm text-gray-700">
                      {pkg.remainingSessions}/{pkg.totalSessions} {c.sessionsLeft}
                    </p>
                    {pkg.procedure && <p className="text-sm text-gray-500">{pkg.procedure.name}</p>}
                    {pkg.expiresAt && (
                      <p className="text-xs text-gray-400">
                        {c.expires} {new Date(pkg.expiresAt).toLocaleDateString(dateLocale)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PortalSection>

          <PortalSection icon={CreditCard} title={c.payments}>
            {data.payments.length === 0 ? (
              <p className="text-sm text-gray-500">{c.noPayments}</p>
            ) : (
              <div className="space-y-3">
                {data.payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-950">{payment.label}</p>
                    <p className="mt-1 text-sm text-gray-700">{money(payment.amountCents, payment.currency)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.paidAt).toLocaleDateString(dateLocale)} · {payment.status}
                    </p>
                    <a
                      href={payment.receiptHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800"
                    >
                      {c.receipt}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </PortalSection>
        </div>

        <PortalSection icon={FileText} title={c.treatmentPlans}>
          {data.treatmentPlans.length === 0 ? (
            <p className="text-sm text-gray-500">{c.noPlans}</p>
          ) : (
            <div className="space-y-3">
              {data.treatmentPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-950">{plan.title}</p>
                  <p className="text-sm text-gray-600">
                    {plan.completedSessions}/{plan.expectedSessions} · {plan.status}
                  </p>
                  {plan.goals && <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{plan.goals}</p>}
                  {plan.nextSteps && <p className="mt-2 text-sm font-medium text-orange-800 whitespace-pre-wrap">{plan.nextSteps}</p>}
                </div>
              ))}
            </div>
          )}
        </PortalSection>

        <PortalSection icon={ShieldCheck} title={c.consents}>
          {data.consents.length === 0 ? (
            <p className="text-sm text-gray-500">{c.noConsents}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.consents.map((consent) => (
                <div key={consent.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-950">{consent.templateTitleSnapshot}</p>
                  {consent.procedure && <p className="text-sm text-gray-600">{consent.procedure.name}</p>}
                  {consent.acceptedAt && (
                    <p className="text-xs text-gray-400">{new Date(consent.acceptedAt).toLocaleDateString(dateLocale)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </PortalSection>
      </div>
    </main>
  )
}

function PortalSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-2xl bg-orange-50 p-3 text-orange-700">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      </div>
      {children}
    </section>
  )
}
