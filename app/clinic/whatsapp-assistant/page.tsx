'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bot, CalendarClock, CalendarPlus, Copy, ExternalLink, FileText, MessageSquare, Send, ShieldCheck, XCircle } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import {
  buildWhatsAppReceptionistMessage,
  type WhatsAppReceptionistMode,
} from '@/lib/clinic/whatsapp-receptionist'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type AssistantMode = WhatsAppReceptionistMode

type PatientOption = {
  id: string
  firstName: string
  lastName: string
  phone: string | null
}

type ProcedureOption = {
  id: string
  name: string
  basePriceCents: number
  currency: string
  active: boolean
}

type PatientDetail = PatientOption & {
  appointments: Array<{
    id: string
    startsAt: string
    status: string
    titleOverride: string | null
    procedure: { id: string; name: string } | null
  }>
  priceQuotes?: Array<{
    id: string
    quoteNumber: string
    title: string
    status: string
    currency: string
    totalCents: number
    validUntil: string | null
    lines: Array<{
      description: string
      quantity: number
      totalCents: number
    }>
  }>
}

type Stats = {
  bookingUrl: string | null
  publicBookingEnabled: boolean
}

const modes: Array<{ id: AssistantMode; icon: typeof Send }> = [
  { id: 'booking', icon: Send },
  { id: 'prices', icon: MessageSquare },
  { id: 'quote', icon: FileText },
  { id: 'reschedule', icon: CalendarClock },
  { id: 'cancel', icon: XCircle },
  { id: 'waitlist', icon: CalendarPlus },
  { id: 'approval', icon: ShieldCheck },
  { id: 'intake', icon: Bot },
  { id: 'status', icon: ExternalLink },
  { id: 'reminder', icon: Copy },
]

const receptionistCopy = {
  en: {
    mode_booking: 'Booking link',
    mode_prices: 'Price reply',
    mode_quote: 'Send quote',
    mode_reschedule: 'Reschedule request',
    mode_cancel: 'Cancel request',
    mode_waitlist: 'Waitlist slot',
    mode_approval: 'Approval brief',
    mode_intake: 'Intake prompt',
    mode_status: 'Appointment status',
    mode_reminder: 'Reminder reply',
    appointmentToUse: 'Appointment to reference',
    quoteToSend: 'Quote to send',
    noQuotes: 'No quotes yet. Select services to generate an estimate-style reply.',
    waitlistSlot: 'Waitlist slot to offer',
    contextLabel: 'Receptionist context / client question',
    contextPlaceholder: 'Example: client asks for Friday after 15:00, wants Russian copy, or needs practitioner approval before confirming.',
  },
  ru: {
    mode_booking: 'Ссылка для записи',
    mode_prices: 'Ответ по ценам',
    mode_quote: 'Отправить расчёт',
    mode_reschedule: 'Запрос переноса',
    mode_cancel: 'Запрос отмены',
    mode_waitlist: 'Окно из листа ожидания',
    mode_approval: 'На одобрение специалиста',
    mode_intake: 'Intake-вопросы',
    mode_status: 'Статус записи',
    mode_reminder: 'Follow-up / напоминание',
    appointmentToUse: 'Запись для сообщения',
    quoteToSend: 'Расчёт для отправки',
    noQuotes: 'Расчётов пока нет. Выберите услуги, чтобы собрать предварительный ответ.',
    waitlistSlot: 'Окно из листа ожидания',
    contextLabel: 'Контекст receptionist / вопрос клиента',
    contextPlaceholder: 'Например: клиент просит пятницу после 15:00, нужен текст на русском или требуется одобрение специалиста.',
  },
} as const

function money(cents: number, currency: string) {
  return `${(Math.max(0, cents) / 100).toFixed(2)} ${currency}`
}

function patientName(patient: PatientOption | null) {
  return patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : ''
}

function whatsappUrl(phone: string | null | undefined, body: string) {
  const digits = (phone || '').replace(/\D/g, '')
  const encoded = encodeURIComponent(body)
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}

export default function WhatsAppAssistantPage() {
  const { locale, t } = useClinicLocale()
  const c = receptionistCopy[locale]
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [mode, setMode] = useState<AssistantMode>('booking')
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [procedures, setProcedures] = useState<ProcedureOption[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
  const [selectedQuoteId, setSelectedQuoteId] = useState('')
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([])
  const [customQuestion, setCustomQuestion] = useState('')
  const [waitlistSlotStart, setWaitlistSlotStart] = useState('')
  const [copied, setCopied] = useState(false)
  const [savingHistory, setSavingHistory] = useState(false)
  const [historySaved, setHistorySaved] = useState(false)
  const [historyNotice, setHistoryNotice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [patientsRes, proceduresRes, statsRes] = await Promise.all([
          fetch('/api/clinic/patients', { credentials: 'include' }),
          fetch('/api/clinic/procedures', { credentials: 'include' }),
          fetch('/api/clinic/stats', { credentials: 'include' }),
        ])
        const [patientsData, proceduresData, statsData] = await Promise.all([
          patientsRes.ok ? patientsRes.json() : { patients: [] },
          proceduresRes.ok ? proceduresRes.json() : { procedures: [] },
          statsRes.ok ? statsRes.json() : null,
        ])
        if (cancelled) return
        setPatients(patientsData.patients || [])
        setProcedures(((proceduresData.procedures || []) as ProcedureOption[]).filter((item) => item.active))
        setStats(statsData ? { bookingUrl: statsData.bookingUrl ?? null, publicBookingEnabled: statsData.publicBookingEnabled === true } : null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/clinic/patients/${selectedPatientId}`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) setSelectedPatient(data.patient)
    })()
    return () => {
      cancelled = true
    }
  }, [selectedPatientId])

  const selectedPatientOption = useMemo(
    () => selectedPatient ?? patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatient, selectedPatientId]
  )

  const selectedProcedures = useMemo(
    () => procedures.filter((procedure) => selectedProcedureIds.includes(procedure.id)),
    [procedures, selectedProcedureIds]
  )

  const upcomingAppointment = useMemo(() => {
    const now = Date.now()
    return selectedPatient?.appointments
      ?.filter((appointment) => new Date(appointment.startsAt).getTime() >= now - 60 * 60 * 1000)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]
  }, [selectedPatient])

  const appointmentOptions = useMemo(
    () =>
      [...(selectedPatient?.appointments ?? [])].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    [selectedPatient?.appointments]
  )

  const selectedAppointment = useMemo(
    () =>
      appointmentOptions.find((appointment) => appointment.id === selectedAppointmentId) ??
      upcomingAppointment ??
      null,
    [appointmentOptions, selectedAppointmentId, upcomingAppointment]
  )

  const selectedQuote = useMemo(
    () => selectedPatient?.priceQuotes?.find((quote) => quote.id === selectedQuoteId) ?? selectedPatient?.priceQuotes?.[0] ?? null,
    [selectedPatient?.priceQuotes, selectedQuoteId]
  )

  const message = useMemo(() => {
    return buildWhatsAppReceptionistMessage({
      mode,
      locale,
      patientFirstName: selectedPatientOption?.firstName,
      bookingUrl: stats?.bookingUrl,
      procedures: selectedProcedures,
      appointment: selectedAppointment
        ? {
            startsAt: selectedAppointment.startsAt,
            status: selectedAppointment.status,
            label: selectedAppointment.procedure?.name || selectedAppointment.titleOverride || t.appointmentDefault,
          }
        : null,
      quote: selectedQuote,
      customText: customQuestion,
      waitlistSlotStart: waitlistSlotStart || null,
    })
  }, [
    customQuestion,
    locale,
    mode,
    selectedAppointment,
    selectedPatientOption,
    selectedProcedures,
    selectedQuote,
    stats?.bookingUrl,
    t,
    waitlistSlotStart,
  ])

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  useEffect(() => {
    setHistorySaved(false)
    setHistoryNotice('')
  }, [message, selectedPatientId])

  const saveMessageHistory = async () => {
    if (!selectedPatientId) {
      setHistoryNotice(t.whatsappAssistantHistoryNeedsPatient)
      return false
    }
    setSavingHistory(true)
    setHistoryNotice('')
    try {
      const res = await fetch(`/api/clinic/patients/${selectedPatientId}/crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'WHATSAPP',
          body: `${t.whatsappAssistantSavedPrefix}: ${c[`mode_${mode}`]}\n\n${message}`,
          occurredAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setHistoryNotice(data.error || t.operationFailed)
        return false
      }
      setHistorySaved(true)
      setHistoryNotice(t.whatsappAssistantSavedToHistory)
      return true
    } finally {
      setSavingHistory(false)
    }
  }

  const openWhatsAppAndSave = async () => {
    if (selectedPatientId) {
      const saved = await saveMessageHistory()
      if (!saved) return
    }
    window.open(whatsappUrl(selectedPatientOption?.phone, message), '_blank', 'noopener,noreferrer')
  }

  const toggleProcedure = (procedureId: string) => {
    setSelectedProcedureIds((current) =>
      current.includes(procedureId)
        ? current.filter((item) => item !== procedureId)
        : [...current, procedureId]
    )
  }

  if (loading) return <ClinicSpinner label={t.loading} />

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-orange-100/50 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Bot className="h-3.5 w-3.5" />
              {t.whatsappAssistantBadge}
            </div>
            <h1 className="text-2xl font-semibold text-gray-950 md:text-3xl">{t.whatsappAssistant}</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">{t.whatsappAssistantHint}</p>
          </div>
          <Link
            href="/clinic/knowledge-base"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {t.knowledgeBase}
          </Link>
        </div>
      </div>

      {stats && !stats.publicBookingEnabled && (
        <ClinicAlert variant="warning">{t.whatsappAssistantBookingDisabled}</ClinicAlert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t.whatsappAssistantBuildReply}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {modes.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-semibold ${
                  mode === id
                    ? 'border-orange-300 bg-orange-50 text-orange-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {c[`mode_${id}`]}
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="mb-1 block text-sm text-gray-600">{t.patientLabel}</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
            >
              <option value="">{t.whatsappAssistantNoPatient}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.lastName}, {patient.firstName}
                  {patient.phone ? ` · ${patient.phone}` : ''}
                </option>
              ))}
            </select>
          </label>

          {['status', 'reschedule', 'cancel', 'approval'].includes(mode) && (
            <label className="mt-5 block">
              <span className="mb-1 block text-sm text-gray-600">{c.appointmentToUse}</span>
              <select
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
              >
                <option value="">{upcomingAppointment ? t.appointmentDefault : t.whatsappAssistantNoUpcomingAppointment}</option>
                {appointmentOptions.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {new Date(appointment.startsAt).toLocaleString(dateLocale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {appointment.procedure?.name || appointment.titleOverride || t.appointmentDefault} · {appointment.status}
                  </option>
                ))}
              </select>
            </label>
          )}

          {mode === 'quote' && (
            <label className="mt-5 block">
              <span className="mb-1 block text-sm text-gray-600">{c.quoteToSend}</span>
              <select
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
              >
                <option value="">{c.noQuotes}</option>
                {(selectedPatient?.priceQuotes || []).map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quoteNumber} · {quote.title} · {money(quote.totalCents, quote.currency)} · {quote.status}
                  </option>
                ))}
              </select>
            </label>
          )}

          {['prices', 'quote', 'waitlist', 'approval'].includes(mode) && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700">{t.whatsappAssistantChooseServices}</p>
              <div className="max-h-64 space-y-2 overflow-auto rounded-2xl border border-gray-100 bg-gray-50 p-3">
                {procedures.length === 0 ? (
                  <p className="text-sm text-gray-500">{t.noProceduresEmpty}</p>
                ) : (
                  procedures.map((procedure) => (
                    <label key={procedure.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm">
                      <span>
                        <input
                          type="checkbox"
                          checked={selectedProcedureIds.includes(procedure.id)}
                          onChange={() => toggleProcedure(procedure.id)}
                          className="me-2 h-4 w-4 rounded border-gray-300 text-orange-500"
                        />
                        {procedure.name}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {money(procedure.basePriceCents, procedure.currency)}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {mode === 'waitlist' && (
            <label className="mt-5 block">
              <span className="mb-1 block text-sm text-gray-600">{c.waitlistSlot}</span>
              <input
                type="datetime-local"
                value={waitlistSlotStart}
                onChange={(e) => setWaitlistSlotStart(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </label>
          )}

          {['intake', 'reschedule', 'cancel', 'waitlist', 'approval', 'quote'].includes(mode) && (
            <label className="mt-5 block">
              <span className="mb-1 block text-sm text-gray-600">{c.contextLabel}</span>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
                placeholder={c.contextPlaceholder}
              />
            </label>
          )}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t.whatsappAssistantPreview}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.whatsappAssistantPreviewHint}</p>
            </div>
            {copied && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t.copied}
              </span>
            )}
            {historySaved && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {t.whatsappAssistantSavedToHistory}
              </span>
            )}
          </div>
          <pre className="mt-4 min-h-80 whitespace-pre-wrap rounded-2xl bg-gray-950 p-4 text-sm leading-relaxed text-white">
            {message}
          </pre>
          {historyNotice && (
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {historyNotice}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void copyMessage()}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              {t.copy}
            </button>
            <button
              type="button"
              onClick={() => void saveMessageHistory()}
              disabled={savingHistory || !selectedPatientId}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              {savingHistory ? t.savingEllipsis : t.saveToMessageHistory}
            </button>
            <button
              type="button"
              onClick={() => void openWhatsAppAndSave()}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
              {t.openWhatsappAndSave}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
