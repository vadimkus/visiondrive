'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, CreditCard, PauseCircle, PlayCircle, RefreshCw, Repeat2, ShieldCheck } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type MembershipPlan = {
  id: string
  name: string
  monthlyPriceCents: number
  currency: string
  includedSessions: number
  description: string | null
  active: boolean
}

type MembershipRow = {
  id: string
  patientId: string
  patientName: string
  patientPhone: string | null
  planId: string
  planName: string
  monthlyPriceCents: number
  currency: string
  includedSessions: number
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  nextBillingAt: string
  autopayEnabled: boolean
  paymentMethod: string
  note: string | null
}

type MembershipData = {
  plans: MembershipPlan[]
  subscriptions: MembershipRow[]
  dueSubscriptions: MembershipRow[]
  patients: Array<{ id: string; name: string }>
  summary: {
    activePlans: number
    activeSubscriptions: number
    dueSubscriptions: number
    autopayEnabled: number
    monthlyRecurringCents: number
  }
}

const copy = {
  en: {
    title: 'Memberships & autopay',
    badge: 'Recurring care',
    intro: 'Create monthly maintenance plans, track subscribed clients, and prepare due membership charges for manual review.',
    guardrail: 'Autopay is provider-ready only. Practice OS prepares auditable pending payments; no card is charged automatically.',
    refresh: 'Refresh',
    newPlan: 'New plan',
    planName: 'Plan name',
    monthlyPrice: 'Monthly price AED',
    includedSessions: 'Included sessions',
    description: 'Description',
    savePlan: 'Create plan',
    addSubscription: 'Add subscription',
    patient: 'Patient',
    plan: 'Plan',
    nextBilling: 'Next billing',
    autopay: 'Autopay consent',
    note: 'Note',
    subscribe: 'Subscribe client',
    activePlans: 'Active plans',
    activeSubs: 'Active subscriptions',
    dueNow: 'Due now',
    autopayEnabled: 'Autopay consent',
    mrr: 'Monthly recurring',
    dueCharges: 'Due charges',
    noDue: 'No subscriptions are due today.',
    allSubscriptions: 'Subscriptions',
    noSubscriptions: 'No subscriptions yet.',
    prepareCharge: 'Prepare charge',
    pause: 'Pause',
    resume: 'Resume',
    cancelled: 'Cancelled',
    saved: 'Saved.',
    failed: 'Could not load memberships.',
  },
  ru: {
    title: 'Абонементы и автосписание',
    badge: 'Регулярный уход',
    intro: 'Создавайте ежемесячные планы ухода, ведите подписки клиентов и готовьте платежи к проверке.',
    guardrail: 'Автосписание пока provider-ready. Practice OS готовит проверяемые pending-платежи; карта автоматически не списывается.',
    refresh: 'Обновить',
    newPlan: 'Новый план',
    planName: 'Название плана',
    monthlyPrice: 'Цена в месяц AED',
    includedSessions: 'Сеансов включено',
    description: 'Описание',
    savePlan: 'Создать план',
    addSubscription: 'Добавить подписку',
    patient: 'Пациент',
    plan: 'План',
    nextBilling: 'Следующее списание',
    autopay: 'Согласие на автосписание',
    note: 'Заметка',
    subscribe: 'Подписать клиента',
    activePlans: 'Активные планы',
    activeSubs: 'Активные подписки',
    dueNow: 'К оплате сейчас',
    autopayEnabled: 'С автосписанием',
    mrr: 'Ежемесячная выручка',
    dueCharges: 'Платежи к подготовке',
    noDue: 'Сегодня нет подписок к оплате.',
    allSubscriptions: 'Подписки',
    noSubscriptions: 'Подписок пока нет.',
    prepareCharge: 'Подготовить платёж',
    pause: 'Пауза',
    resume: 'Возобновить',
    cancelled: 'Отменена',
    saved: 'Сохранено.',
    failed: 'Не удалось загрузить абонементы.',
  },
} as const

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function parseAedToCents(value: string) {
  const amount = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : NaN
}

export default function ClinicMembershipsPage() {
  const { locale } = useClinicLocale()
  const c = copy[locale]
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const [data, setData] = useState<MembershipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [planName, setPlanName] = useState('')
  const [price, setPrice] = useState('')
  const [includedSessions, setIncludedSessions] = useState('1')
  const [description, setDescription] = useState('')
  const [patientId, setPatientId] = useState('')
  const [planId, setPlanId] = useState('')
  const [nextBillingAt, setNextBillingAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [autopayEnabled, setAutopayEnabled] = useState(true)
  const [note, setNote] = useState('')

  const activePlans = useMemo(() => data?.plans.filter((plan) => plan.active) ?? [], [data?.plans])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/memberships', { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.failed)
        return
      }
      setData(json)
      if (!planId && json.plans?.[0]?.id) setPlanId(json.plans[0].id)
      if (!patientId && json.patients?.[0]?.id) setPatientId(json.patients[0].id)
    } catch {
      setError(c.failed)
    } finally {
      setLoading(false)
    }
  }, [c.failed, patientId, planId])

  useEffect(() => {
    void load()
  }, [load])

  const postAction = async (body: Record<string, unknown>) => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/clinic/memberships', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.failed)
        return
      }
      setData(json)
      setSaved(true)
    } catch {
      setError(c.failed)
    } finally {
      setSaving(false)
    }
  }

  const createPlan = async (event: FormEvent) => {
    event.preventDefault()
    const monthlyPriceCents = parseAedToCents(price)
    if (Number.isNaN(monthlyPriceCents)) {
      setError(c.failed)
      return
    }
    await postAction({
      action: 'create_plan',
      name: planName,
      monthlyPriceCents,
      includedSessions: Number(includedSessions) || 0,
      description,
    })
    setPlanName('')
    setPrice('')
    setDescription('')
  }

  const createSubscription = async (event: FormEvent) => {
    event.preventDefault()
    await postAction({
      action: 'create_subscription',
      patientId,
      planId,
      nextBillingAt,
      autopayEnabled,
      note,
    })
    setNote('')
  }

  if (loading && !data) return <ClinicSpinner label={c.title} />

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-orange-100/50 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
              <Repeat2 className="h-3.5 w-3.5" />
              {c.badge}
            </div>
            <h1 className="text-2xl font-semibold text-gray-950 md:text-3xl">{c.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">{c.intro}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            {c.refresh}
          </button>
        </div>
      </header>

      <ClinicAlert variant="warning">{c.guardrail}</ClinicAlert>
      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {saved && <ClinicAlert variant="success">{c.saved}</ClinicAlert>}

      <section className="grid gap-4 md:grid-cols-5">
        <Metric label={c.activePlans} value={String(data?.summary.activePlans ?? 0)} />
        <Metric label={c.activeSubs} value={String(data?.summary.activeSubscriptions ?? 0)} />
        <Metric label={c.dueNow} value={String(data?.summary.dueSubscriptions ?? 0)} />
        <Metric label={c.autopayEnabled} value={String(data?.summary.autopayEnabled ?? 0)} />
        <Metric label={c.mrr} value={money(data?.summary.monthlyRecurringCents ?? 0, numberLocale)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={createPlan} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{c.newPlan}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={c.planName} value={planName} onChange={setPlanName} required />
            <Field label={c.monthlyPrice} value={price} onChange={setPrice} inputMode="decimal" required />
            <Field label={c.includedSessions} value={includedSessions} onChange={setIncludedSessions} inputMode="numeric" />
            <Field label={c.description} value={description} onChange={setDescription} />
          </div>
          <button className="mt-4 min-h-11 w-full rounded-2xl bg-violet-600 px-4 text-sm font-semibold text-white disabled:opacity-60" disabled={saving}>
            {c.savePlan}
          </button>
        </form>

        <form onSubmit={createSubscription} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-950">{c.addSubscription}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">{c.patient}</span>
              <select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5">
                {(data?.patients ?? []).map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">{c.plan}</span>
              <select value={planId} onChange={(event) => setPlanId(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5">
                {activePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
            </label>
            <Field label={c.nextBilling} value={nextBillingAt} onChange={setNextBillingAt} type="date" />
            <Field label={c.note} value={note} onChange={setNote} />
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 p-3 text-sm text-violet-900">
            <input type="checkbox" checked={autopayEnabled} onChange={(event) => setAutopayEnabled(event.target.checked)} />
            <ShieldCheck className="h-4 w-4" />
            {c.autopay}
          </label>
          <button className="mt-4 min-h-11 w-full rounded-2xl bg-gray-950 px-4 text-sm font-semibold text-white disabled:opacity-60" disabled={saving || !activePlans.length}>
            {c.subscribe}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-violet-700" />
          <h2 className="text-lg font-semibold text-gray-950">{c.dueCharges}</h2>
        </div>
        {data?.dueSubscriptions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">{c.noDue}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data?.dueSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                locale={numberLocale}
                c={c}
                saving={saving}
                onAction={postAction}
                due
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-950">{c.allSubscriptions}</h2>
        {data?.subscriptions.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">{c.noSubscriptions}</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data?.subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                locale={numberLocale}
                c={c}
                saving={saving}
                onAction={postAction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  inputMode?: 'decimal' | 'numeric'
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
      />
    </label>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

function SubscriptionCard({
  subscription,
  locale,
  c,
  saving,
  onAction,
  due = false,
}: {
  subscription: MembershipRow
  locale: string
  c: (typeof copy)['en'] | (typeof copy)['ru']
  saving: boolean
  onAction: (body: Record<string, unknown>) => Promise<void>
  due?: boolean
}) {
  const isPaused = subscription.status === 'PAUSED'
  return (
    <article className={`rounded-3xl border p-4 ${due ? 'border-violet-100 bg-violet-50/60' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-950">{subscription.patientName}</p>
          <p className="mt-1 text-sm text-gray-600">{subscription.planName}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">{subscription.status}</span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
        <p>{money(subscription.monthlyPriceCents, locale)}</p>
        <p>{subscription.includedSessions} sessions</p>
        <p className="flex items-center gap-1">
          <CalendarClock className="h-4 w-4" />
          {new Date(subscription.nextBillingAt).toLocaleDateString(locale)}
        </p>
        <p>{subscription.autopayEnabled ? c.autopayEnabled : c.autopay}</p>
      </div>
      {subscription.note && <p className="mt-3 text-sm text-gray-500">{subscription.note}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving || subscription.status !== 'ACTIVE'}
          onClick={() => onAction({ action: 'prepare_charge', subscriptionId: subscription.id })}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-violet-600 px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          {c.prepareCharge}
        </button>
        <button
          type="button"
          disabled={saving || subscription.status === 'CANCELLED'}
          onClick={() =>
            onAction({
              action: 'update_subscription_status',
              subscriptionId: subscription.id,
              status: isPaused ? 'ACTIVE' : 'PAUSED',
            })
          }
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
        >
          {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
          {isPaused ? c.resume : c.pause}
        </button>
        <Link href={`/clinic/patients/${subscription.patientId}`} className="inline-flex min-h-10 items-center rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-orange-700">
          {c.patient}
        </Link>
      </div>
    </article>
  )
}
