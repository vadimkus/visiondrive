'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { CalendarClock, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { CLINIC_LOCALE_STORAGE, type ClinicLocale } from '@/lib/clinic/strings'

type Procedure = {
  id: string
  name: string
  defaultDurationMin: number
  bufferAfterMinutes: number
  basePriceCents: number
  currency: string
  bookingPolicyType: 'NONE' | 'DEPOSIT' | 'FULL_PREPAY' | 'CARD_ON_FILE'
  depositAmountCents: number
  depositPercent: number
  cancellationWindowHours: number
  lateCancelFeeCents: number
  noShowFeeCents: number
  bookingPolicyText: string | null
  intakeQuestions: IntakeQuestion[]
}

type IntakeQuestion = {
  id: string
  prompt: string
  helpText: string | null
  type: 'TEXT' | 'TEXTAREA' | 'YES_NO'
  required: boolean
}

type Slot = {
  startsAt: string
  endsAt: string
}

type PublicBookingData = {
  tenant: { name: string; slug: string }
  procedures: Procedure[]
  slots: Slot[]
}

function money(cents: number, currency: string) {
  if (!cents) return ''
  return `${(cents / 100).toFixed(0)} ${currency}`
}

function depositRequiredCents(procedure: Procedure) {
  if (procedure.bookingPolicyType === 'FULL_PREPAY') return procedure.basePriceCents
  if (procedure.bookingPolicyType !== 'DEPOSIT') return 0
  return Math.max(
    procedure.depositAmountCents,
    Math.round(procedure.basePriceCents * (Math.max(0, procedure.depositPercent) / 100))
  )
}

function readStoredLocale(): ClinicLocale {
  if (typeof window === 'undefined') return 'en'
  return window.localStorage.getItem(CLINIC_LOCALE_STORAGE) === 'ru' ? 'ru' : 'en'
}

function bookingFunnelSession(slug: string) {
  if (typeof window === 'undefined') return ''
  const key = `visiondrive:booking-funnel:${slug}`
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.sessionStorage.setItem(key, created)
  return created
}

function bookingFunnelAttribution(slug: string) {
  if (typeof window === 'undefined') return {}
  const key = `visiondrive:booking-attribution:${slug}`
  const existing = window.sessionStorage.getItem(key)
  if (existing) {
    try {
      return JSON.parse(existing) as Record<string, string>
    } catch {
      window.sessionStorage.removeItem(key)
    }
  }
  const params = new URLSearchParams(window.location.search)
  const attribution: Record<string, string> = {}
  const fields = {
    source: 'source',
    utm_source: 'utmSource',
    utm_medium: 'utmMedium',
    utm_campaign: 'utmCampaign',
    ref: 'ref',
  } as const
  for (const [queryKey, payloadKey] of Object.entries(fields)) {
    const value = params.get(queryKey)?.trim()
    if (value) attribution[payloadKey] = value.slice(0, 120)
  }
  if (Object.keys(attribution).length > 0) {
    window.sessionStorage.setItem(key, JSON.stringify(attribution))
  }
  return attribution
}

const copy = {
  en: {
    bookingUnavailable: 'Booking link is not available.',
    loadFailed: 'Could not load booking link. Please try again.',
    chooseServiceTime: 'Choose a service and available time.',
    createFailed: 'Could not create booking. Please choose another time.',
    createFailedRetry: 'Could not create booking. Please try again.',
    errors: {},
    bookingRequested: 'Booking requested',
    confirmationPrefix: 'Thank you, {name}. Your {service} is reserved for {date}.',
    confirmationSuffix: 'The practice will confirm if anything needs adjusting.',
    privateLink: 'Private booking link',
    bookWith: 'Book with {practice}',
    fallbackPractice: 'the practice',
    subtitle:
      'Choose a service, pick an available time, and leave your details. Your information goes directly to the practice.',
    secure: 'Private, tenant-scoped booking',
    chooseService: '1. Choose service',
    loadingServices: 'Loading services...',
    min: 'min',
    buffer: 'buffer',
    bookingPolicy: 'Booking policy',
    policyRequired: 'Policy applies',
    depositDue: 'Deposit due',
    lateCancelFee: 'Late-cancel fee',
    noShowFee: 'No-show fee',
    policyFallback:
      'This service has booking protection terms. Please review and accept them before requesting the appointment.',
    acceptPolicy: 'I accept the booking, cancellation, and no-show policy for this service.',
    pickTime: '2. Pick time',
    noSlots: 'No available slots found. Try again later or contact the practice.',
    yourDetails: '3. Your details',
    firstName: 'First name',
    lastName: 'Last name',
    dateOfBirth: 'Date of birth',
    phone: 'Phone / WhatsApp',
    email: 'Email',
    notes: 'Notes for the practice',
    notesPlaceholder: 'Anything the practitioner should know before the appointment?',
    serviceQuestions: 'Service questions',
    serviceQuestionsHint: 'Answer these so the practitioner can prepare safely.',
    chooseAnswer: 'Choose answer',
    yes: 'Yes',
    no: 'No',
    consent: 'I consent to the practice storing my details for booking and patient-record purposes.',
    requesting: 'Requesting booking...',
    request: 'Request booking',
  },
  ru: {
    bookingUnavailable: 'Ссылка для записи недоступна.',
    loadFailed: 'Не удалось загрузить ссылку для записи. Попробуйте снова.',
    chooseServiceTime: 'Выберите услугу и доступное время.',
    createFailed: 'Не удалось создать запись. Выберите другое время.',
    createFailedRetry: 'Не удалось создать запись. Попробуйте снова.',
    errors: {
      'Booking link not found': 'Ссылка для записи не найдена.',
      'Invalid from or to datetime': 'Некорректный период дат.',
      'Invalid JSON': 'Некорректный запрос.',
      'firstName and lastName are required': 'Имя и фамилия обязательны.',
      'dateOfBirth is required': 'Дата рождения обязательна.',
      'phone or email is required': 'Укажите телефон или email.',
      'Consent is required': 'Необходимо согласие на обработку данных.',
      'Required intake questions are missing': 'Ответьте на обязательные вопросы по услуге.',
      'Booking policy acceptance is required': 'Необходимо принять правила записи.',
      'procedureId and valid startsAt are required': 'Выберите услугу и корректное время.',
      'Service not found': 'Услуга не найдена.',
      'This slot is no longer available': 'Этот слот больше недоступен.',
    },
    bookingRequested: 'Запрос на запись отправлен',
    confirmationPrefix: 'Спасибо, {name}. Ваша услуга «{service}» зарезервирована на {date}.',
    confirmationSuffix: 'Клиника подтвердит запись, если потребуется уточнение.',
    privateLink: 'Приватная ссылка для записи',
    bookWith: 'Запись в {practice}',
    fallbackPractice: 'клинику',
    subtitle:
      'Выберите услугу, доступное время и оставьте данные. Информация попадёт напрямую в клинику.',
    secure: 'Приватная запись в рамках клиники',
    chooseService: '1. Выберите услугу',
    loadingServices: 'Загрузка услуг...',
    min: 'мин',
    buffer: 'буфер',
    bookingPolicy: 'Правила записи',
    policyRequired: 'Действуют правила',
    depositDue: 'Депозит',
    lateCancelFee: 'Поздняя отмена',
    noShowFee: 'Неявка',
    policyFallback:
      'Для этой услуги действуют условия защиты записи. Ознакомьтесь и примите их перед отправкой запроса.',
    acceptPolicy: 'Я принимаю правила записи, отмены и неявки по этой услуге.',
    pickTime: '2. Выберите время',
    noSlots: 'Доступных слотов нет. Попробуйте позже или свяжитесь с клиникой.',
    yourDetails: '3. Ваши данные',
    firstName: 'Имя',
    lastName: 'Фамилия',
    dateOfBirth: 'Дата рождения',
    phone: 'Телефон / WhatsApp',
    email: 'Email',
    notes: 'Комментарий для клиники',
    notesPlaceholder: 'Что специалисту нужно знать перед записью?',
    serviceQuestions: 'Вопросы по услуге',
    serviceQuestionsHint: 'Ответьте, чтобы специалист мог безопасно подготовиться.',
    chooseAnswer: 'Выберите ответ',
    yes: 'Да',
    no: 'Нет',
    consent: 'Я согласен(на), чтобы клиника хранила мои данные для записи и карты пациента.',
    requesting: 'Отправляем запрос...',
    request: 'Запросить запись',
  },
} as const

function localizedError(message: unknown, locale: ClinicLocale) {
  if (typeof message !== 'string') return ''
  if (locale === 'en') return message
  return copy.ru.errors[message as keyof typeof copy.ru.errors] ?? message
}

export default function PublicBookingPage() {
  const params = useParams()
  const slug = String(params.slug || '')
  const [locale] = useState<ClinicLocale>(() => readStoredLocale())
  const c = copy[locale]
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [data, setData] = useState<PublicBookingData | null>(null)
  const [procedureId, setProcedureId] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<{
    startsAt: string
    service: string
    patientName: string
  } | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    notes: '',
    consentAccepted: false,
    bookingPolicyAccepted: false,
  })
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string>>({})
  const viewedRef = useRef(false)
  const formStartedRef = useRef(false)

  const selectedProcedure = useMemo(
    () => data?.procedures.find((procedure) => procedure.id === procedureId) ?? null,
    [data?.procedures, procedureId]
  )
  const requiresPolicyAcceptance =
    selectedProcedure != null && selectedProcedure.bookingPolicyType !== 'NONE'

  const track = useCallback(
    (eventType: string, extra: Record<string, unknown> = {}) => {
      if (!slug || typeof window === 'undefined') return
      const sessionId = bookingFunnelSession(slug)
      if (!sessionId) return
      void fetch(`/api/clinic/public-booking/${slug}/funnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType,
          ...bookingFunnelAttribution(slug),
          ...extra,
        }),
        keepalive: true,
      }).catch(() => undefined)
    },
    [slug]
  )

  const updateForm = useCallback(
    (patch: Partial<typeof form>) => {
      setForm((current) => ({ ...current, ...patch }))
      if (!formStartedRef.current) {
        formStartedRef.current = true
        track('FORM_STARTED', { procedureId, startsAt: selectedSlot || undefined })
      }
    },
    [procedureId, selectedSlot, track]
  )

  const updateIntakeAnswer = useCallback(
    (questionId: string, answer: string) => {
      setIntakeAnswers((current) => ({ ...current, [questionId]: answer }))
      if (!formStartedRef.current) {
        formStartedRef.current = true
        track('FORM_STARTED', { procedureId, startsAt: selectedSlot || undefined })
      }
    },
    [procedureId, selectedSlot, track]
  )

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (procedureId) qs.set('procedureId', procedureId)
      const res = await fetch(`/api/clinic/public-booking/${slug}?${qs.toString()}`)
      const json = await res.json()
      if (!res.ok) {
        setError(localizedError(json.error, locale) || c.bookingUnavailable)
        return
      }
      setData(json)
      if (!viewedRef.current) {
        viewedRef.current = true
        track('LINK_VIEW')
      }
      if (!procedureId && json.procedures?.[0]?.id) {
        setProcedureId(json.procedures[0].id)
      }
    } catch {
      setError(c.loadFailed)
    } finally {
      setLoading(false)
    }
  }, [slug, procedureId, locale, c.bookingUnavailable, c.loadFailed, track])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setSelectedSlot('')
    setIntakeAnswers({})
    setForm((current) => ({ ...current, bookingPolicyAccepted: false }))
  }, [procedureId])

  const chooseProcedure = (id: string) => {
    setProcedureId(id)
    track('SERVICE_SELECTED', { procedureId: id })
  }

  const chooseSlot = (startsAt: string) => {
    setSelectedSlot(startsAt)
    track('SLOT_SELECTED', { procedureId, startsAt })
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!procedureId || !selectedSlot) {
      setError(c.chooseServiceTime)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      track('FORM_SUBMITTED', {
        procedureId,
        startsAt: selectedSlot,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        consentAccepted: form.consentAccepted,
      })
      const res = await fetch(`/api/clinic/public-booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          procedureId,
          startsAt: selectedSlot,
          intakeAnswers: Object.entries(intakeAnswers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(localizedError(json.error, locale) || c.createFailed)
        await load()
        return
      }
      setConfirmed(json.appointment)
      track('BOOKING_COMPLETED', {
        procedureId,
        startsAt: selectedSlot,
        appointmentId: json.appointment?.id,
      })
    } catch {
      setError(c.createFailedRetry)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_32rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)] p-4 sm:p-8">
        <section className="mx-auto flex min-h-[80vh] max-w-xl items-center">
          <div className="w-full rounded-[2rem] border border-white/80 bg-white/90 p-6 text-center shadow-2xl shadow-orange-100/60 backdrop-blur md:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-700" aria-hidden />
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-gray-950">{c.bookingRequested}</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {c.confirmationPrefix
                .replace('{name}', confirmed.patientName)
                .replace('{service}', confirmed.service)
                .replace(
                  '{date}',
                  new Date(confirmed.startsAt).toLocaleString(dateLocale, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })
                )}{' '}
              {c.confirmationSuffix}
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_32rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_45%,#eef2ff_100%)] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-orange-100/50 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {c.privateLink}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                {c.bookWith.replace('{practice}', data?.tenant.name || c.fallbackPractice)}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">{c.subtitle}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <ShieldCheck className="mr-2 inline h-4 w-4" aria-hidden />
              {c.secure}
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
            <h2 className="text-lg font-semibold text-gray-950">{c.chooseService}</h2>
            {loading && !data ? (
              <p className="mt-4 text-sm text-gray-500">{c.loadingServices}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {data?.procedures.map((procedure) => (
                  <button
                    key={procedure.id}
                    type="button"
                    onClick={() => chooseProcedure(procedure.id)}
                    className={clsx(
                      'w-full rounded-2xl border p-4 text-left transition-all',
                      procedureId === procedure.id
                        ? 'border-orange-300 bg-orange-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-orange-200'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-950">{procedure.name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {procedure.defaultDurationMin} {c.min}
                          {procedure.bufferAfterMinutes > 0
                            ? ` + ${procedure.bufferAfterMinutes} ${c.min} ${c.buffer}`
                            : ''}
                        </p>
                        {procedure.bookingPolicyType !== 'NONE' && (
                          <p className="mt-2 inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
                            {c.policyRequired}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-orange-800">
                        {money(procedure.basePriceCents, procedure.currency)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <h2 className="mt-8 text-lg font-semibold text-gray-950">{c.pickTime}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {data?.slots.length === 0 && selectedProcedure && (
                <p className="col-span-full text-sm text-gray-500">
                  {c.noSlots}
                </p>
              )}
              {data?.slots.slice(0, 24).map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => chooseSlot(slot.startsAt)}
                  className={clsx(
                    'rounded-2xl border p-3 text-left transition-all',
                    selectedSlot === slot.startsAt
                      ? 'border-orange-400 bg-orange-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  )}
                >
                  <CalendarClock className="mb-2 h-4 w-4 text-orange-600" aria-hidden />
                  <p className="text-sm font-semibold text-gray-950">
                    {new Date(slot.startsAt).toLocaleDateString(dateLocale, {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(slot.startsAt).toLocaleTimeString(dateLocale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
            <h2 className="text-lg font-semibold text-gray-950">{c.yourDetails}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={c.firstName} value={form.firstName} onChange={(v) => updateForm({ firstName: v })} required />
              <Field label={c.lastName} value={form.lastName} onChange={(v) => updateForm({ lastName: v })} required />
              <Field
                label={c.dateOfBirth}
                type="date"
                value={form.dateOfBirth}
                onChange={(v) => updateForm({ dateOfBirth: v })}
                required
              />
              <Field label={c.phone} value={form.phone} onChange={(v) => updateForm({ phone: v })} />
              <Field label={c.email} type="email" value={form.email} onChange={(v) => updateForm({ email: v })} />
              <label className="sm:col-span-2 text-sm font-medium text-gray-700">
                {c.notes}
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => updateForm({ notes: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  placeholder={c.notesPlaceholder}
                />
              </label>
            </div>

            {selectedProcedure?.intakeQuestions?.length ? (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <h3 className="text-sm font-semibold text-blue-950">{c.serviceQuestions}</h3>
                <p className="mt-1 text-xs text-blue-900/70">{c.serviceQuestionsHint}</p>
                <div className="mt-4 space-y-4">
                  {selectedProcedure.intakeQuestions.map((question) => (
                    <label key={question.id} className="block text-sm font-medium text-gray-700">
                      {question.prompt}
                      {question.required ? ' *' : ''}
                      {question.helpText && <span className="mt-1 block text-xs font-normal text-gray-500">{question.helpText}</span>}
                      {question.type === 'YES_NO' ? (
                        <select
                          value={intakeAnswers[question.id] ?? ''}
                          onChange={(e) => updateIntakeAnswer(question.id, e.target.value)}
                          required={question.required}
                          className="mt-1 min-h-11 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="">{c.chooseAnswer}</option>
                          <option value="yes">{c.yes}</option>
                          <option value="no">{c.no}</option>
                        </select>
                      ) : question.type === 'TEXTAREA' ? (
                        <textarea
                          rows={3}
                          value={intakeAnswers[question.id] ?? ''}
                          onChange={(e) => updateIntakeAnswer(question.id, e.target.value)}
                          required={question.required}
                          className="mt-1 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                        />
                      ) : (
                        <input
                          value={intakeAnswers[question.id] ?? ''}
                          onChange={(e) => updateIntakeAnswer(question.id, e.target.value)}
                          required={question.required}
                          className="mt-1 min-h-11 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {requiresPolicyAcceptance && selectedProcedure && (
              <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                <h3 className="text-sm font-semibold text-orange-950">{c.bookingPolicy}</h3>
                <p className="mt-1 text-xs leading-relaxed text-orange-900/80">
                  {selectedProcedure.bookingPolicyText || c.policyFallback}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-orange-950 sm:grid-cols-3">
                  {depositRequiredCents(selectedProcedure) > 0 && (
                    <span className="rounded-xl bg-white px-3 py-2">
                      {c.depositDue}: {money(depositRequiredCents(selectedProcedure), selectedProcedure.currency)}
                    </span>
                  )}
                  {selectedProcedure.lateCancelFeeCents > 0 && (
                    <span className="rounded-xl bg-white px-3 py-2">
                      {c.lateCancelFee}: {money(selectedProcedure.lateCancelFeeCents, selectedProcedure.currency)}
                    </span>
                  )}
                  {selectedProcedure.noShowFeeCents > 0 && (
                    <span className="rounded-xl bg-white px-3 py-2">
                      {c.noShowFee}: {money(selectedProcedure.noShowFeeCents, selectedProcedure.currency)}
                    </span>
                  )}
                </div>
                <label className="mt-4 flex gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-sm font-medium text-orange-950">
                  <input
                    required
                    type="checkbox"
                    checked={form.bookingPolicyAccepted}
                    onChange={(e) => updateForm({ bookingPolicyAccepted: e.target.checked })}
                    className="mt-1 h-5 w-5 rounded border-orange-300 text-orange-600"
                  />
                  <span>{c.acceptPolicy}</span>
                </label>
              </div>
            )}

            <label className="mt-5 flex gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-950">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(e) => updateForm({ consentAccepted: e.target.checked })}
                className="mt-1 h-5 w-5 rounded border-orange-300 text-orange-600"
              />
              <span>
                {c.consent}
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? c.requesting : c.request}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </section>
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  )
}
