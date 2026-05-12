'use client'

import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  MapPin,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { CLINIC_LOCALE_STORAGE, type ClinicLocale } from '@/lib/clinic/strings'

type PortalPackage = {
  id: string
  name: string
  totalSessions: number
  remainingSessions: number
  status: string
  expiresAt: string | null
  procedure: { name: string } | null
}

type PortalPayment = {
  id: string
  amountCents: number
  currency: string
  method: string
  status: string
  reference: string | null
  receiptKind: 'STANDARD' | 'DEPOSIT' | 'LATE_CANCEL_FEE' | 'NO_SHOW_FEE'
  paidAt: string
  label: string
  receiptHref: string
}

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
    paymentRequirementStatus: string
    policy: {
      type: 'NONE' | 'DEPOSIT' | 'FULL_PREPAY' | 'CARD_ON_FILE'
      acceptedAt: string | null
      paymentRequirementStatus: string
      text: string | null
      currency: string
      depositRequiredCents: number
      cancellationWindowHours: number
      lateCancelFeeCents: number
      noShowFeeCents: number
      payments: Array<{
        id: string
        amountCents: number
        currency: string
        status: string
        reference: string | null
        paymentRequestExpiresAt: string | null
        kind: 'STANDARD' | 'DEPOSIT' | 'LATE_CANCEL_FEE' | 'NO_SHOW_FEE'
      }>
    }
    preVisitTasks: Array<{
      id: string
      title: string
      description: string
      completed: boolean
    }>
  }>
  aftercare: Array<{
    id: string
    visitAt: string
    label: string
    procedureSummary: string | null
    nextSteps: string | null
    aftercareTitle: string | null
    aftercareText: string | null
    aftercareDocumentName: string | null
    aftercareDocumentUrl: string | null
    aftercareSentAt: string | null
    treatmentPlanTitle: string | null
  }>
  packages: PortalPackage[]
  payments: PortalPayment[]
  wallet: {
    balance: {
      currency: string
      dueCents: number
      creditCents: number
      pendingCents: number
      status: 'CLEAR' | 'DEBT' | 'CREDIT'
      lastPaymentAt: string | null
    }
    overview: {
      currency: string
      dueCents: number
      creditCents: number
      pendingCents: number
      pendingRequestCents: number
      activePackageSessions: number
      activeGiftCardBalanceCents: number
      activeSavedPaymentMethods: number
      status: 'CLEAR' | 'DEBT' | 'CREDIT'
    }
    pendingPayments: Array<{
      id: string
      amountCents: number
      currency: string
      method: string
      status: string
      reference: string | null
      paymentRequestExpiresAt: string | null
      kind: 'STANDARD' | 'DEPOSIT' | 'LATE_CANCEL_FEE' | 'NO_SHOW_FEE'
      label: string
    }>
    quotes: Array<{
      id: string
      quoteNumber: string
      title: string
      status: string
      currency: string
      totalCents: number
      validUntil: string | null
      createdAt: string
    }>
    packageBalances: PortalPackage[]
    giftCards: Array<{
      id: string
      code: string
      buyerName: string
      recipientName: string | null
      initialBalanceCents: number
      remainingBalanceCents: number
      currency: string
      status: string
      purchasedAt: string
      expiresAt: string | null
    }>
    giftCardRedemptions: Array<{
      id: string
      amountCents: number
      currency: string
      redeemedAt: string
      giftCard: { code: string; recipientName: string | null }
    }>
    savedPaymentMethods: Array<{
      id: string
      provider: string
      brand: string | null
      last4: string
      expiryMonth: number | null
      expiryYear: number | null
      status: string
      consentedAt: string
    }>
    receipts: PortalPayment[]
  }
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
    portalEyebrow: 'VisionDrive patient portal',
    greeting: 'Welcome',
    intro: 'A simple view of your next booking, what was done, care notes, receipts, and anything you need to do before the visit.',
    privateNotice: 'This private link is for patient use only. Do not forward it publicly.',
    nextBooking: 'Next booking',
    noNextBooking: 'No future booking',
    lastVisit: 'Last visit',
    noLastVisit: 'No visit summary yet',
    preparation: 'Before your visit',
    openTasks: 'tasks open',
    allPrepared: 'Nothing to prepare',
    contactPractice: 'Contact the practice',
    contactPracticeHint: 'Send a private note if you need help, have a question, or want the practitioner to know something before the visit.',
    sendMessage: 'Send message',
    quickActions: 'Quick actions',
    whatWasDone: 'What was done',
    whatWasDoneHint: 'Visit summaries, recommendations, and next steps shared by your practitioner.',
    visitSummary: 'Visit summary',
    recommendations: 'Recommendations',
    nextSteps: 'Next steps',
    carePlan: 'Care plan and packages',
    balanceAndReceipts: 'Payments and receipts',
    documents: 'Documents and consents',
    clientWallet: 'Client wallet',
    walletIntro: 'Balances, unpaid requests, quotes, packages, gift cards, saved payment methods, and receipts.',
    accountBalance: 'Account balance',
    amountDue: 'Amount due',
    accountCredit: 'Account credit',
    clearBalance: 'Nothing due',
    pendingRequests: 'Payment requests',
    noPendingPayments: 'No unpaid requests.',
    activePackageSessions: 'Package sessions',
    giftCardBalance: 'Gift card balance',
    savedMethods: 'Saved payment methods',
    noSavedMethods: 'No saved payment methods.',
    cardEnding: 'ending in',
    quotes: 'Quotes',
    noQuotes: 'No shared quotes.',
    total: 'Total',
    validUntil: 'Valid until',
    giftCards: 'Gift cards',
    noGiftCards: 'No gift cards linked to this client.',
    redeemed: 'Redeemed',
    walletPackages: 'Packages',
    recentReceipts: 'Recent receipts',
    loadFailed: 'Could not load portal link.',
    expired: 'This patient portal link is not available or has expired.',
    unavailableTitle: 'Portal link unavailable',
    unavailableHint: 'This private link may have expired or been revoked. Please ask the practice to send a new patient portal link.',
    upcoming: 'Upcoming appointments',
    noUpcoming: 'No upcoming appointments are currently scheduled.',
    requestChange: 'Request change',
    requestCancel: 'Request cancellation',
    requestReschedule: 'Request reschedule',
    preferredTime: 'Preferred time',
    preferredTimePlaceholder: 'Tomorrow after 15:00',
    message: 'Message',
    sendRequest: 'Send request',
    sending: 'Sending...',
    requestSent: 'Request sent. The practice will review it.',
    aftercare: 'Aftercare and next steps',
    noAftercare: 'No aftercare notes have been shared yet.',
    aftercareDocument: 'Open aftercare document',
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
    policy: 'Booking policy',
    policyAccepted: 'Accepted',
    depositDue: 'Deposit due',
    depositPaid: 'Deposit paid',
    depositPending: 'Deposit pending',
    fullPrepayDue: 'Full prepayment required',
    cardOnFile: 'Card-on-file / no-show protection',
    cancellationWindow: 'Free cancellation or reschedule up to',
    hoursBefore: 'hours before the appointment',
    lateCancelFee: 'Late-cancel fee',
    noShowFee: 'No-show fee',
    receiptText: 'This receipt confirms a payment recorded by the practice.',
    depositReceiptText: 'This receipt confirms a deposit recorded for your appointment.',
    lateCancelReceiptText: 'This receipt confirms a late-cancellation fee recorded by the practice.',
    noShowReceiptText: 'This receipt confirms a no-show fee recorded by the practice.',
    method: 'Method',
    reference: 'Reference',
    preVisitTasks: 'Pre-visit tasks',
    preVisitTasksHint: 'Please tick these before the practitioner arrives.',
    preVisitSaved: 'Pre-visit tasks saved.',
  },
  ru: {
    title: 'Кабинет пациента',
    secure: 'Приватная ссылка пациента',
    portalEyebrow: 'Кабинет пациента VisionDrive',
    greeting: 'Здравствуйте',
    intro: 'Простой обзор следующей записи, выполненных процедур, рекомендаций, чеков и задач перед визитом.',
    privateNotice: 'Эта приватная ссылка предназначена только для пациента. Не публикуйте её открыто.',
    nextBooking: 'Следующая запись',
    noNextBooking: 'Будущих записей нет',
    lastVisit: 'Последний визит',
    noLastVisit: 'Итогов визита пока нет',
    preparation: 'Перед визитом',
    openTasks: 'задач открыто',
    allPrepared: 'Готовиться не нужно',
    contactPractice: 'Связаться со специалистом',
    contactPracticeHint: 'Отправьте приватное сообщение, если нужен перенос, есть вопрос или хотите сообщить что-то до визита.',
    sendMessage: 'Отправить сообщение',
    quickActions: 'Быстрые действия',
    whatWasDone: 'Что было сделано',
    whatWasDoneHint: 'Итоги визитов, рекомендации и следующие шаги от специалиста.',
    visitSummary: 'Итог визита',
    recommendations: 'Рекомендации',
    nextSteps: 'Следующие шаги',
    carePlan: 'План ухода и пакеты',
    balanceAndReceipts: 'Оплаты и чеки',
    documents: 'Документы и согласия',
    clientWallet: 'Кошелёк клиента',
    walletIntro: 'Баланс, неоплаченные запросы, расчёты, пакеты, подарочные карты, сохранённые способы оплаты и чеки.',
    accountBalance: 'Баланс счёта',
    amountDue: 'К оплате',
    accountCredit: 'Кредит клиента',
    clearBalance: 'Нет задолженности',
    pendingRequests: 'Запросы на оплату',
    noPendingPayments: 'Неоплаченных запросов нет.',
    activePackageSessions: 'Сеансы в пакетах',
    giftCardBalance: 'Баланс подарочных карт',
    savedMethods: 'Сохранённые способы оплаты',
    noSavedMethods: 'Сохранённых способов оплаты нет.',
    cardEnding: 'оканчивается на',
    quotes: 'Расчёты',
    noQuotes: 'Отправленных расчётов пока нет.',
    total: 'Итого',
    validUntil: 'Действует до',
    giftCards: 'Подарочные карты',
    noGiftCards: 'Подарочных карт у клиента нет.',
    redeemed: 'Использовано',
    walletPackages: 'Пакеты',
    recentReceipts: 'Последние чеки',
    loadFailed: 'Не удалось загрузить кабинет.',
    expired: 'Эта ссылка недоступна или истекла.',
    unavailableTitle: 'Ссылка недоступна',
    unavailableHint: 'Эта приватная ссылка могла истечь или быть отозвана. Попросите специалиста отправить новую ссылку.',
    upcoming: 'Будущие записи',
    noUpcoming: 'Будущих записей пока нет.',
    requestChange: 'Запросить изменение',
    requestCancel: 'Запросить отмену',
    requestReschedule: 'Запросить перенос',
    preferredTime: 'Желаемое время',
    preferredTimePlaceholder: 'Завтра после 15:00',
    message: 'Сообщение',
    sendRequest: 'Отправить запрос',
    sending: 'Отправляем...',
    requestSent: 'Запрос отправлен. Клиника его проверит.',
    aftercare: 'Рекомендации и следующие шаги',
    noAftercare: 'Рекомендаций пока нет.',
    aftercareDocument: 'Открыть документ с рекомендациями',
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
    policy: 'Правила записи',
    policyAccepted: 'Принято',
    depositDue: 'Депозит к оплате',
    depositPaid: 'Депозит оплачен',
    depositPending: 'Депозит ожидает оплаты',
    fullPrepayDue: 'Требуется полная предоплата',
    cardOnFile: 'Карта / защита от неявки',
    cancellationWindow: 'Бесплатная отмена или перенос не позднее чем за',
    hoursBefore: 'часов до записи',
    lateCancelFee: 'Штраф за позднюю отмену',
    noShowFee: 'Штраф за неявку',
    receiptText: 'Этот чек подтверждает оплату, зафиксированную практикой.',
    depositReceiptText: 'Этот чек подтверждает депозит по вашей записи.',
    lateCancelReceiptText: 'Этот чек подтверждает штраф за позднюю отмену.',
    noShowReceiptText: 'Этот чек подтверждает штраф за неявку.',
    method: 'Метод',
    reference: 'Номер/ссылка',
    preVisitTasks: 'Задачи перед визитом',
    preVisitTasksHint: 'Отметьте это до приезда специалиста.',
    preVisitSaved: 'Задачи перед визитом сохранены.',
  },
} as const

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function paymentKindText(c: (typeof copy)['en'] | (typeof copy)['ru'], kind: PortalPayment['receiptKind']) {
  if (kind === 'DEPOSIT') return c.depositDue
  if (kind === 'LATE_CANCEL_FEE') return c.lateCancelFee
  if (kind === 'NO_SHOW_FEE') return c.noShowFee
  return c.pendingRequests
}

function depositStatusText(c: (typeof copy)['en'] | (typeof copy)['ru'], appointment: PortalData['appointments'][number]) {
  const depositPayment = appointment.policy.payments.find((payment) => payment.kind === 'DEPOSIT')
  if (appointment.policy.paymentRequirementStatus === 'PAID' || depositPayment?.status === 'PAID') return c.depositPaid
  return c.depositPending
}

function walletBalanceLabel(c: (typeof copy)['en'] | (typeof copy)['ru'], overview: PortalData['wallet']['overview']) {
  if (overview.dueCents > 0) return c.amountDue
  if (overview.creditCents > 0) return c.accountCredit
  return c.clearBalance
}

function walletBalanceAmount(overview: PortalData['wallet']['overview']) {
  if (overview.dueCents > 0) return money(overview.dueCents, overview.currency)
  if (overview.creditCents > 0) return money(overview.creditCents, overview.currency)
  return money(0, overview.currency)
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
  const [requestType, setRequestType] = useState<'RESCHEDULE' | 'CANCEL' | 'MESSAGE'>('RESCHEDULE')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [taskSavingKey, setTaskSavingKey] = useState('')
  const [taskSaved, setTaskSaved] = useState(false)

  const selectedAppointment = useMemo(
    () => data?.appointments.find((appointment) => appointment.id === requestAppointmentId) ?? null,
    [data?.appointments, requestAppointmentId]
  )

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/patient-portal/${token}?locale=${locale}`)
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
  }, [token, locale, c.expired, c.loadFailed])

  useEffect(() => {
    void load()
  }, [load])

  const openRequest = (appointmentId: string, type: 'RESCHEDULE' | 'CANCEL' | 'MESSAGE') => {
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
        setError(locale === 'ru' ? c.loadFailed : json.error || c.loadFailed)
        return
      }
      setRequestSent(true)
      setRequestAppointmentId('')
      setRequestType('RESCHEDULE')
    } catch {
      setError(c.loadFailed)
    } finally {
      setRequesting(false)
    }
  }

  const savePreVisitTask = async (appointmentId: string, taskId: string, checked: boolean) => {
    if (!data) return
    const appointment = data.appointments.find((item) => item.id === appointmentId)
    if (!appointment) return
    const completedTaskIds = appointment.preVisitTasks
      .filter((task) => (task.id === taskId ? checked : task.completed))
      .map((task) => task.id)

    setTaskSavingKey(`${appointmentId}:${taskId}`)
    setTaskSaved(false)
    try {
      const res = await fetch(`/api/patient-portal/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_previsit_tasks',
          appointmentId,
          completedTaskIds,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(locale === 'ru' ? c.loadFailed : json.error || c.loadFailed)
        return
      }
      setData((current) =>
        current
          ? {
              ...current,
              appointments: current.appointments.map((item) =>
                item.id === appointmentId
                  ? {
                      ...item,
                      preVisitTasks: item.preVisitTasks.map((task) => ({
                        ...task,
                        completed: completedTaskIds.includes(task.id),
                      })),
                    }
                  : item
              ),
            }
          : current
      )
      setTaskSaved(true)
    } catch {
      setError(c.loadFailed)
    } finally {
      setTaskSavingKey('')
    }
  }

  if (loading && !data) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-xl shadow-orange-100/50">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">{c.portalEyebrow}</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{c.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{c.title}...</p>
        </section>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-xl rounded-[2rem] border border-red-100 bg-white p-6 shadow-xl shadow-red-100/40">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">{c.portalEyebrow}</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{c.unavailableTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{error || c.expired}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.unavailableHint}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {c.refresh}
          </button>
        </section>
      </main>
    )
  }

  const nextAppointment = data.appointments[0]
  const latestVisit = data.aftercare[0]
  const openTaskCount = data.appointments.reduce(
    (count, appointment) => count + appointment.preVisitTasks.filter((task) => !task.completed).length,
    0
  )
  const hasCarePlan = data.treatmentPlans.length > 0 || data.wallet.packageBalances.length > 0
  const hasPayments =
    data.wallet.pendingPayments.length > 0 ||
    data.wallet.receipts.length > 0 ||
    data.wallet.overview.dueCents > 0 ||
    data.wallet.overview.creditCents > 0

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_28rem),radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_24rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/80 bg-white/80 px-4 py-3 shadow-sm shadow-orange-100/40 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo/visiondrive-mark.svg"
              alt="VisionDrive"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-2xl shadow-lg shadow-orange-200"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">{c.portalEyebrow}</p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            {c.secure}
          </div>
        </div>

        <header className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-xl shadow-orange-100/50 backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-w-0 p-5 md:p-8">
              <p className="text-sm font-semibold text-orange-700">{c.greeting}, {data.patient.firstName}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">{c.intro}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <WalletMetric
                  label={c.nextBooking}
                  value={
                    nextAppointment
                      ? new Date(nextAppointment.startsAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })
                      : c.noNextBooking
                  }
                  tone={nextAppointment ? 'amber' : 'gray'}
                />
                <WalletMetric
                  label={c.preparation}
                  value={openTaskCount > 0 ? `${openTaskCount} ${c.openTasks}` : c.allPrepared}
                  tone={openTaskCount > 0 ? 'red' : 'emerald'}
                />
                <WalletMetric
                  label={walletBalanceLabel(c, data.wallet.overview)}
                  value={walletBalanceAmount(data.wallet.overview)}
                  tone={data.wallet.overview.dueCents > 0 ? 'red' : data.wallet.overview.creditCents > 0 ? 'emerald' : 'gray'}
                />
                <WalletMetric
                  label={c.lastVisit}
                  value={
                    latestVisit
                      ? new Date(latestVisit.visitAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })
                      : c.noLastVisit
                  }
                  tone={latestVisit ? 'indigo' : 'gray'}
                />
              </div>
            </div>
            <aside className="border-t border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 lg:border-l lg:border-t-0 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">{c.nextBooking}</p>
              {nextAppointment ? (
                <div className="mt-3">
                  <p className="text-lg font-semibold text-slate-950">{nextAppointment.label}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {new Date(nextAppointment.startsAt).toLocaleString(dateLocale, {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {(nextAppointment.locationArea || nextAppointment.locationAddress) && (
                    <p className="mt-3 flex gap-2 text-sm leading-relaxed text-slate-700">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden />
                      <span>{[nextAppointment.locationArea, nextAppointment.locationAddress].filter(Boolean).join(', ')}</span>
                    </p>
                  )}
                  <div className="mt-5 grid gap-2">
                    <button
                      type="button"
                      onClick={() => openRequest(nextAppointment.id, 'RESCHEDULE')}
                      className="min-h-10 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white"
                    >
                      {c.requestReschedule}
                    </button>
                    <button
                      type="button"
                      onClick={() => openRequest(nextAppointment.id, 'CANCEL')}
                      className="min-h-10 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                    >
                      {c.requestCancel}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">{c.noUpcoming}</p>
              )}
            </aside>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <p className="min-w-0 text-sm text-slate-500">
              {data.patient.firstName} {data.patient.lastName}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:border-orange-200 md:w-auto"
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

        {taskSaved && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            {c.preVisitSaved}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <PortalSection icon={CalendarClock} title={c.upcoming}>
              {data.appointments.length === 0 ? (
                <EmptyState text={c.noUpcoming} />
              ) : (
                <div className="space-y-4">
                  {data.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-[1.5rem] border border-orange-100 bg-orange-50/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
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
                        </div>
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
                          {appointment.status}
                        </span>
                      </div>
                      {(appointment.locationAddress || appointment.locationArea) && (
                        <p className="mt-3 flex gap-2 text-sm text-gray-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden />
                          <span>{[appointment.locationArea, appointment.locationAddress].filter(Boolean).join(', ')}</span>
                        </p>
                      )}
                      {appointment.locationNotes && <p className="mt-1 text-sm text-gray-500">{appointment.locationNotes}</p>}
                      {appointment.preVisitTasks.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/85 p-3 text-sm">
                          <p className="flex items-center gap-2 font-semibold text-emerald-950">
                            <ClipboardCheck className="h-4 w-4" aria-hidden />
                            {c.preVisitTasks}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{c.preVisitTasksHint}</p>
                          <div className="mt-3 space-y-2">
                            {appointment.preVisitTasks.map((task) => (
                              <label
                                key={task.id}
                                className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  disabled={taskSavingKey === `${appointment.id}:${task.id}`}
                                  onChange={(event) =>
                                    void savePreVisitTask(appointment.id, task.id, event.currentTarget.checked)
                                  }
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600"
                                />
                                <span>
                                  <span className="block font-semibold text-gray-900">{task.title}</span>
                                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                                    {task.description}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      {appointment.policy.type !== 'NONE' && (
                        <div className="mt-4 rounded-2xl border border-orange-100 bg-white/85 p-3 text-sm">
                          <p className="font-semibold text-orange-950">{c.policy}</p>
                          {appointment.policy.text && (
                            <p className="mt-1 whitespace-pre-wrap text-gray-700">{appointment.policy.text}</p>
                          )}
                          <div className="mt-2 space-y-1 text-gray-700">
                            {appointment.policy.acceptedAt && (
                              <p>
                                {c.policyAccepted}:{' '}
                                {new Date(appointment.policy.acceptedAt).toLocaleDateString(dateLocale)}
                              </p>
                            )}
                            {appointment.policy.depositRequiredCents > 0 && (
                              <p>
                                {appointment.policy.type === 'FULL_PREPAY' ? c.fullPrepayDue : c.depositDue}:{' '}
                                {money(appointment.policy.depositRequiredCents, appointment.policy.currency)} ·{' '}
                                {depositStatusText(c, appointment)}
                              </p>
                            )}
                            {appointment.policy.type === 'CARD_ON_FILE' && <p>{c.cardOnFile}</p>}
                            <p>
                              {c.cancellationWindow} {appointment.policy.cancellationWindowHours} {c.hoursBefore}.
                            </p>
                            {appointment.policy.lateCancelFeeCents > 0 && (
                              <p>
                                {c.lateCancelFee}: {money(appointment.policy.lateCancelFeeCents, appointment.policy.currency)}
                              </p>
                            )}
                            {appointment.policy.noShowFeeCents > 0 && (
                              <p>
                                {c.noShowFee}: {money(appointment.policy.noShowFeeCents, appointment.policy.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => openRequest(appointment.id, 'RESCHEDULE')}
                          className="min-h-10 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white"
                        >
                          {c.requestReschedule}
                        </button>
                        <button
                          type="button"
                          onClick={() => openRequest(appointment.id, 'CANCEL')}
                          className="min-h-10 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                        >
                          {c.requestCancel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PortalSection>

            {(selectedAppointment || requestType === 'MESSAGE') && (
              <form onSubmit={submitRequest} className="rounded-[1.5rem] border border-gray-100 bg-white/95 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-950">
                  {requestType === 'MESSAGE' ? c.contactPractice : c.requestChange}
                </h3>
                {selectedAppointment && <p className="mt-1 text-sm text-gray-600">{selectedAppointment.label}</p>}
                {requestType === 'RESCHEDULE' && (
                  <label className="mt-3 block text-sm font-medium text-gray-700">
                    {c.preferredTime}
                    <input
                      value={preferredTime}
                      onChange={(event) => setPreferredTime(event.target.value)}
                      className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3"
                      placeholder={c.preferredTimePlaceholder}
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
                  className="mt-3 min-h-11 w-full rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                >
                  {requesting ? c.sending : c.sendRequest}
                </button>
              </form>
            )}

            <PortalSection icon={CheckCircle2} title={c.whatWasDone}>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">{c.whatWasDoneHint}</p>
              {data.aftercare.length === 0 ? (
                <EmptyState text={c.noAftercare} />
              ) : (
                <div className="space-y-4">
                  {data.aftercare.map((item) => (
                    <article key={item.id} className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-950">{item.label}</p>
                          {item.treatmentPlanTitle && (
                            <p className="mt-1 text-sm text-gray-500">{item.treatmentPlanTitle}</p>
                          )}
                        </div>
                        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                          {new Date(item.visitAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {item.procedureSummary && (
                        <div className="mt-4 rounded-2xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{c.visitSummary}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.procedureSummary}</p>
                        </div>
                      )}
                      {item.aftercareTitle && (
                        <p className="mt-4 text-sm font-semibold text-orange-900">{item.aftercareTitle}</p>
                      )}
                      {item.aftercareText && (
                        <div className="mt-2 rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">{c.recommendations}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-orange-950">{item.aftercareText}</p>
                        </div>
                      )}
                      {item.nextSteps && (
                        <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{c.nextSteps}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950">{item.nextSteps}</p>
                        </div>
                      )}
                      {item.aftercareDocumentUrl && (
                        <a
                          href={item.aftercareDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-orange-100 bg-white px-3 text-sm font-semibold text-orange-700"
                        >
                          {item.aftercareDocumentName || c.aftercareDocument}
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </PortalSection>

            {hasCarePlan && (
              <PortalSection icon={PackageCheck} title={c.carePlan}>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.treatmentPlans.map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                      <p className="font-semibold text-gray-950">{plan.title}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {plan.completedSessions}/{plan.expectedSessions} · {plan.status}
                      </p>
                      {plan.procedure && <p className="mt-1 text-sm text-gray-500">{plan.procedure.name}</p>}
                      {plan.goals && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{plan.goals}</p>}
                      {plan.nextSteps && <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-indigo-900">{plan.nextSteps}</p>}
                    </div>
                  ))}
                  {data.wallet.packageBalances.map((pkg) => (
                    <div key={pkg.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
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
              </PortalSection>
            )}
          </div>

          <aside className="space-y-4">
            <WalletPanel icon={MessageCircle} title={c.contactPractice}>
              <p className="text-sm leading-relaxed text-gray-600">{c.contactPracticeHint}</p>
              <button
                type="button"
                onClick={() => openRequest('', 'MESSAGE')}
                className="mt-4 min-h-10 w-full rounded-xl bg-gray-950 px-3 py-2 text-sm font-semibold text-white"
              >
                {c.sendMessage}
              </button>
            </WalletPanel>

            <WalletPanel icon={CreditCard} title={c.balanceAndReceipts}>
              {!hasPayments ? (
                <EmptyState text={c.noPendingPayments} compact />
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      {walletBalanceLabel(c, data.wallet.overview)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-950">{walletBalanceAmount(data.wallet.overview)}</p>
                  </div>
                  {data.wallet.pendingPayments.map((payment) => (
                    <div key={payment.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                      <p className="font-semibold text-gray-950">{payment.label}</p>
                      <p className="mt-1 text-sm font-semibold text-amber-900">
                        {money(payment.amountCents, payment.currency)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {paymentKindText(c, payment.kind)}
                        {payment.paymentRequestExpiresAt
                          ? ` · ${c.expires} ${new Date(payment.paymentRequestExpiresAt).toLocaleDateString(dateLocale)}`
                          : ''}
                      </p>
                    </div>
                  ))}
                  {data.wallet.receipts.slice(0, 4).map((payment) => (
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
            </WalletPanel>

            <WalletPanel icon={FileText} title={c.documents}>
              {data.consents.length === 0 ? (
                <EmptyState text={c.noConsents} compact />
              ) : (
                <div className="space-y-3">
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
            </WalletPanel>

            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4 text-sm leading-relaxed text-blue-950">
              {c.privateNotice}
            </div>
          </aside>
        </div>

        <footer className="mt-auto flex flex-col gap-1 rounded-[1.5rem] border border-white/70 bg-white/70 px-5 py-4 text-xs text-slate-500 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <span>VisionDrive Practice OS</span>
          <span>{c.secure}</span>
        </footer>
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
    <section className="min-w-0 rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="mb-4 flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-2xl bg-orange-50 p-3 text-orange-700">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="min-w-0 text-lg font-semibold text-gray-950">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function EmptyState({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 text-sm text-gray-500 ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      {text}
    </div>
  )
}

function WalletMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'gray' | 'red' | 'amber' | 'emerald' | 'indigo'
}) {
  const tones = {
    gray: 'border-gray-100 bg-gray-50 text-gray-950',
    red: 'border-red-100 bg-red-50 text-red-950',
    amber: 'border-amber-100 bg-amber-50 text-amber-950',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-950',
    indigo: 'border-indigo-100 bg-indigo-50 text-indigo-950',
  } as const

  return (
    <div className={`min-w-0 rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="break-words text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function WalletPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-gray-100 bg-white/80 p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 text-gray-950">
        <span className="shrink-0 rounded-xl bg-gray-50 p-2 text-orange-700">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="min-w-0 font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}
