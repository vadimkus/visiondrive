'use client'

import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import {
  BadgePercent,
  CalendarClock,
  CreditCard,
  FileText,
  Gift,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  Wallet,
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
    intro: 'Your upcoming appointments, aftercare, packages, receipts, and requests in one secure page.',
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
    intro: 'Будущие записи, рекомендации, пакеты, чеки и запросы на одной защищённой странице.',
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

function receiptText(c: (typeof copy)['en'] | (typeof copy)['ru'], kind: PortalData['payments'][number]['receiptKind']) {
  if (kind === 'DEPOSIT') return c.depositReceiptText
  if (kind === 'LATE_CANCEL_FEE') return c.lateCancelReceiptText
  if (kind === 'NO_SHOW_FEE') return c.noShowReceiptText
  return c.receiptText
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

function savedMethodLabel(c: (typeof copy)['en'] | (typeof copy)['ru'], method: PortalData['wallet']['savedPaymentMethods'][number]) {
  const brand = method.brand || method.provider
  const expiry =
    method.expiryMonth && method.expiryYear
      ? ` · ${String(method.expiryMonth).padStart(2, '0')}/${String(method.expiryYear).slice(-2)}`
      : ''
  return `${brand} ${c.cardEnding} ${method.last4}${expiry}`
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
        setError(locale === 'ru' ? c.loadFailed : json.error || c.loadFailed)
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

        {taskSaved && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            {c.preVisitSaved}
          </div>
        )}

        <PortalSection icon={Wallet} title={c.clientWallet}>
          <p className="mb-4 text-sm leading-relaxed text-gray-600">{c.walletIntro}</p>
          <div className="grid gap-3 md:grid-cols-4">
            <WalletMetric
              label={walletBalanceLabel(c, data.wallet.overview)}
              value={walletBalanceAmount(data.wallet.overview)}
              tone={data.wallet.overview.dueCents > 0 ? 'red' : data.wallet.overview.creditCents > 0 ? 'emerald' : 'gray'}
            />
            <WalletMetric
              label={c.pendingRequests}
              value={money(data.wallet.overview.pendingCents, data.wallet.overview.currency)}
              tone={data.wallet.overview.pendingCents > 0 ? 'amber' : 'gray'}
            />
            <WalletMetric
              label={c.activePackageSessions}
              value={String(data.wallet.overview.activePackageSessions)}
              tone={data.wallet.overview.activePackageSessions > 0 ? 'indigo' : 'gray'}
            />
            <WalletMetric
              label={c.giftCardBalance}
              value={money(data.wallet.overview.activeGiftCardBalanceCents, data.wallet.overview.currency)}
              tone={data.wallet.overview.activeGiftCardBalanceCents > 0 ? 'emerald' : 'gray'}
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <WalletPanel icon={CreditCard} title={c.pendingRequests}>
              {data.wallet.pendingPayments.length === 0 ? (
                <p className="text-sm text-gray-500">{c.noPendingPayments}</p>
              ) : (
                <div className="space-y-3">
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
                </div>
              )}
            </WalletPanel>

            <WalletPanel icon={BadgePercent} title={c.quotes}>
              {data.wallet.quotes.length === 0 ? (
                <p className="text-sm text-gray-500">{c.noQuotes}</p>
              ) : (
                <div className="space-y-3">
                  {data.wallet.quotes.map((quote) => (
                    <div key={quote.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">{quote.title}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {quote.quoteNumber} · {quote.status}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-gray-950">
                          {money(quote.totalCents, quote.currency)}
                        </p>
                      </div>
                      {quote.validUntil && (
                        <p className="mt-2 text-xs text-gray-500">
                          {c.validUntil} {new Date(quote.validUntil).toLocaleDateString(dateLocale)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </WalletPanel>

            <WalletPanel icon={PackageCheck} title={c.walletPackages}>
              {data.wallet.packageBalances.length === 0 ? (
                <p className="text-sm text-gray-500">{c.noPackages}</p>
              ) : (
                <div className="space-y-3">
                  {data.wallet.packageBalances.map((pkg) => (
                    <div key={pkg.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
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
            </WalletPanel>

            <WalletPanel icon={Gift} title={c.giftCards}>
              {data.wallet.giftCards.length === 0 && data.wallet.giftCardRedemptions.length === 0 ? (
                <p className="text-sm text-gray-500">{c.noGiftCards}</p>
              ) : (
                <div className="space-y-3">
                  {data.wallet.giftCards.map((card) => (
                    <div key={card.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="font-semibold text-gray-950">{card.code}</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {money(card.remainingBalanceCents, card.currency)} / {money(card.initialBalanceCents, card.currency)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {card.recipientName || card.buyerName} · {card.status}
                      </p>
                    </div>
                  ))}
                  {data.wallet.giftCardRedemptions.map((redemption) => (
                    <div key={redemption.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-semibold text-gray-950">{c.redeemed}: {redemption.giftCard.code}</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {money(redemption.amountCents, redemption.currency)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(redemption.redeemedAt).toLocaleDateString(dateLocale)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </WalletPanel>

            <WalletPanel icon={ShieldCheck} title={c.savedMethods}>
              {data.wallet.savedPaymentMethods.length === 0 ? (
                <p className="text-sm text-gray-500">{c.noSavedMethods}</p>
              ) : (
                <div className="space-y-3">
                  {data.wallet.savedPaymentMethods.map((method) => (
                    <div key={method.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-semibold text-gray-950">{savedMethodLabel(c, method)}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {method.status} · {new Date(method.consentedAt).toLocaleDateString(dateLocale)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </WalletPanel>

            <WalletPanel icon={ReceiptText} title={c.recentReceipts}>
              {data.wallet.receipts.length === 0 ? (
                <p className="text-sm text-gray-500">{c.noPayments}</p>
              ) : (
                <div className="space-y-3">
                  {data.wallet.receipts.map((payment) => (
                    <div key={payment.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="font-semibold text-gray-950">{payment.label}</p>
                      <p className="mt-1 text-sm text-gray-700">{money(payment.amountCents, payment.currency)}</p>
                      <p className="mt-1 text-sm text-gray-600">{receiptText(c, payment.receiptKind)}</p>
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
          </div>
        </PortalSection>

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
                  {appointment.preVisitTasks.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/80 p-3 text-sm">
                      <p className="font-semibold text-emerald-950">{c.preVisitTasks}</p>
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
                    <div className="mt-3 rounded-2xl border border-orange-100 bg-white/80 p-3 text-sm">
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
                  {item.aftercareTitle && <p className="mt-2 text-sm font-semibold text-orange-900">{item.aftercareTitle}</p>}
                  {item.procedureSummary && <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.procedureSummary}</p>}
                  {(item.aftercareText || item.nextSteps) && (
                    <p className="mt-2 text-sm font-medium text-orange-800 whitespace-pre-wrap">
                      {item.aftercareText || item.nextSteps}
                    </p>
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
                </div>
              ))}
            </div>
          )}
        </PortalSection>

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
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
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
    <div className="rounded-[1.5rem] border border-gray-100 bg-white/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-950">
        <span className="rounded-xl bg-gray-50 p-2 text-orange-700">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}
