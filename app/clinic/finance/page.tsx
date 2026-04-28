'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { ArrowDownRight, ArrowUpRight, BadgePercent, CircleDollarSign, Plus, ReceiptText } from 'lucide-react'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { ClinicStrings } from '@/lib/clinic/strings'

type ExpenseCategory = 'CLOUD' | 'HARDWARE' | 'OPS' | 'SUPPORT' | 'MARKETING' | 'SOFTWARE' | 'OTHER'
type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'POS' | 'STRIPE' | 'OTHER'

type Expense = {
  id: string
  category: ExpenseCategory
  vendor: string | null
  description: string | null
  amountCents: number
  currency: string
  occurredAt: string
  createdAt: string
}

type Overview = {
  range: { start: string; end: string }
  kpis: {
    paidRevenueCents: number
    refundsCents: number
    netRevenueCents: number
    paymentDiscountCents: number
    packageDiscountCents: number
    productSaleDiscountCents: number
    totalDiscountCents: number
    productSalesRevenueCents: number
    procedureMaterialCostCents: number
    productSalesCostCents: number
    processorFeeCents: number
    directCostCents: number
    grossProfitCents: number
    pendingCents: number
    expensesCents: number
    profitCents: number
    marginPct: number
    paidPayments: number
    refundedPayments: number
    pendingPayments: number
    discountedPayments: number
    discountedPackages: number
    expenseCount: number
    completedVisits: number
    productSales: number
  }
  breakdown: {
    expensesByCategory: { category: ExpenseCategory; amountCents: number }[]
    allExpenseCategories: ExpenseCategory[]
    procedureProfitability: {
      procedureId: string | null
      procedureName: string
      visits: number
      totalMinutes: number
      expectedRevenueCents: number
      discountCents: number
      paidRevenueCents: number
      refundsCents: number
      netRevenueCents: number
      materialCostCents: number
      processorFeeCents: number
      grossProfitCents: number
      marginPct: number
      profitPerHourCents: number
    }[]
  }
  recentDiscounts: {
    id: string
    patientName: string
    amountCents: number
    discountCents: number
    discountName: string | null
    discountReason: string | null
    currency: string
    status: string
    paidAt: string
  }[]
  recentExpenses: Expense[]
}

type DiscountRule = {
  id: string
  name: string
  type: 'PERCENT' | 'FIXED'
  percentBps: number
  fixedCents: number
  active: boolean
  note: string | null
}

type FeeRule = {
  id: string | null
  method: PaymentMethod
  percentBps: number
  fixedFeeCents: number
  active: boolean
}

type MethodTotals = Record<PaymentMethod, number>

type DailyCloseData = {
  businessDate: string
  methods: PaymentMethod[]
  summary: {
    expectedByMethod: MethodTotals
    countedByMethod: MethodTotals
    discrepancyByMethod: MethodTotals
    expectedTotalCents: number
    countedTotalCents: number
    discrepancyTotalCents: number
    paidTotalCents: number
    refundedTotalCents: number
    pendingTotalCents: number
    processorFeeCents: number
    paymentCount: number
    appointmentCount: number
  }
  close: null | {
    id: string
    businessDate: string
    status: 'DRAFT' | 'FINALIZED'
    note: string | null
    finalizedAt: string | null
  }
  recentCloses?: {
    id: string
    businessDate: string
    status: 'DRAFT' | 'FINALIZED'
    paidTotalCents: number
    refundedTotalCents: number
    pendingTotalCents: number
    discrepancyByMethod: MethodTotals
  }[]
}

const CATEGORIES: ExpenseCategory[] = [
  'OPS',
  'HARDWARE',
  'SOFTWARE',
  'MARKETING',
  'SUPPORT',
  'CLOUD',
  'OTHER',
]

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER', 'POS', 'STRIPE', 'OTHER']

const EMPTY_METHOD_INPUTS: Record<PaymentMethod, string> = {
  CASH: '0',
  CARD: '0',
  TRANSFER: '0',
  POS: '0',
  STRIPE: '0',
  OTHER: '0',
}

const EMPTY_METHOD_TOTALS: MethodTotals = {
  CASH: 0,
  CARD: 0,
  TRANSFER: 0,
  POS: 0,
  STRIPE: 0,
  OTHER: 0,
}

function money(cents: number, currency = 'AED', locale = 'en-GB') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function expenseCategoryLabel(t: ClinicStrings, category: ExpenseCategory) {
  switch (category) {
    case 'CLOUD':
      return t.financeCategoryCLOUD
    case 'HARDWARE':
      return t.financeCategoryHARDWARE
    case 'OPS':
      return t.financeCategoryOPS
    case 'SUPPORT':
      return t.financeCategorySUPPORT
    case 'MARKETING':
      return t.financeCategoryMARKETING
    case 'SOFTWARE':
      return t.financeCategorySOFTWARE
    case 'OTHER':
      return t.financeCategoryOTHER
  }
}

function parseAedToCents(value: string) {
  const normalized = value.replace(/,/g, '.').trim()
  if (!normalized) return NaN
  const amount = Number(normalized)
  return Number.isFinite(amount) ? Math.round(amount * 100) : NaN
}

function methodLabel(t: ClinicStrings, method: PaymentMethod) {
  switch (method) {
    case 'CASH':
      return t.payMethodCash
    case 'CARD':
      return t.payMethodCard
    case 'TRANSFER':
      return t.payMethodTransfer
    case 'POS':
      return t.payMethodPos
    case 'STRIPE':
      return t.payMethodStripe
    case 'OTHER':
      return t.payMethodOther
  }
}

export default function ClinicFinancePage() {
  const router = useRouter()
  const { locale, t } = useClinicLocale()
  const [range, setRange] = useState<'month' | '30d'>('month')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [feeRules, setFeeRules] = useState<FeeRule[]>([])
  const [dailyClose, setDailyClose] = useState<DailyCloseData | null>(null)
  const [dailyCloseDate, setDailyCloseDate] = useState(new Date().toISOString().slice(0, 10))
  const [dailyCloseCounts, setDailyCloseCounts] = useState<Record<PaymentMethod, string>>(EMPTY_METHOD_INPUTS)
  const [dailyCloseNote, setDailyCloseNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDiscountRule, setSavingDiscountRule] = useState<string | null>(null)
  const [savingFeeRule, setSavingFeeRule] = useState<PaymentMethod | null>(null)
  const [savingDailyClose, setSavingDailyClose] = useState<'draft' | 'finalized' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    category: 'OPS' as ExpenseCategory,
    vendor: '',
    description: '',
    amount: '',
    occurredAt: new Date().toISOString().slice(0, 10),
  })
  const [discountForm, setDiscountForm] = useState({
    name: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    percent: '10',
    fixed: '',
    note: '',
  })

  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [res, discountRes, feeRes, dailyCloseRes] = await Promise.all([
        fetch(`/api/clinic/finance/overview?range=${range}`, {
          credentials: 'include',
        }),
        fetch('/api/clinic/discount-rules', { credentials: 'include' }),
        fetch('/api/clinic/payment-fee-rules', { credentials: 'include' }),
        fetch(`/api/clinic/daily-close?date=${dailyCloseDate}`, { credentials: 'include' }),
      ])
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.failedToLoad)
      }
      setOverview(data)
      if (discountRes.ok) {
        const discountData = await discountRes.json()
        setDiscountRules(discountData.rules || [])
      }
      if (feeRes.ok) {
        const feeData = await feeRes.json()
        setFeeRules(feeData.rules || [])
      }
      if (dailyCloseRes.ok) {
        const dailyCloseData = await dailyCloseRes.json()
        setDailyClose(dailyCloseData)
        const countedByMethod = dailyCloseData.summary?.countedByMethod ?? {}
        setDailyCloseCounts(
          PAYMENT_METHODS.reduce((acc, method) => {
            acc[method] = ((countedByMethod[method] ?? 0) / 100).toString()
            return acc
          }, {} as Record<PaymentMethod, string>)
        )
        setDailyCloseNote(dailyCloseData.close?.note ?? '')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.failedToLoad)
    } finally {
      setLoading(false)
    }
  }, [dailyCloseDate, range, router, t.failedToLoad])

  useEffect(() => {
    load()
  }, [load])

  const categoryTotal = useMemo(() => {
    const total = overview?.kpis.expensesCents ?? 0
    return total > 0 ? total : 1
  }, [overview])

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amountCents = parseAedToCents(form.amount)
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      setError(t.enterValidAmount)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/clinic/finance/expenses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          vendor: form.vendor,
          description: form.description,
          amountCents,
          currency: 'AED',
          occurredAt: `${form.occurredAt}T12:00:00.000Z`,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.saveFailed)
      }
      setForm((current) => ({ ...current, vendor: '', description: '', amount: '' }))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  async function createDiscountRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const percentBps = Math.round(Number(discountForm.percent.replace(',', '.')) * 100)
    const fixedCents = parseAedToCents(discountForm.fixed || '0')
    setSavingDiscountRule('new')
    setError(null)
    try {
      const res = await fetch('/api/clinic/discount-rules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: discountForm.name,
          type: discountForm.type,
          percentBps: Number.isFinite(percentBps) ? percentBps : 0,
          fixedCents: Number.isFinite(fixedCents) ? fixedCents : 0,
          active: true,
          note: discountForm.note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.saveFailed)
      }
      setDiscountRules(data.rules || [])
      setDiscountForm({ name: '', type: 'PERCENT', percent: '10', fixed: '', note: '' })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setSavingDiscountRule(null)
    }
  }

  async function saveDiscountRule(rule: DiscountRule) {
    setSavingDiscountRule(rule.id)
    setError(null)
    try {
      const res = await fetch('/api/clinic/discount-rules', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.saveFailed)
      }
      setDiscountRules(data.rules || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setSavingDiscountRule(null)
    }
  }

  async function saveFeeRule(rule: FeeRule) {
    setSavingFeeRule(rule.method)
    setError(null)
    try {
      const res = await fetch('/api/clinic/payment-fee-rules', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.saveFailed)
      }
      setFeeRules(data.rules || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setSavingFeeRule(null)
    }
  }

  async function saveDailyClose(status: 'DRAFT' | 'FINALIZED') {
    setSavingDailyClose(status === 'FINALIZED' ? 'finalized' : 'draft')
    setError(null)
    try {
      const countedByMethod = PAYMENT_METHODS.reduce((acc, method) => {
        const amountCents = parseAedToCents(dailyCloseCounts[method] || '0')
        if (!Number.isFinite(amountCents) || amountCents < 0) {
          throw new Error(t.enterValidAmount)
        }
        acc[method] = amountCents
        return acc
      }, {} as MethodTotals)

      const res = await fetch('/api/clinic/daily-close', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dailyCloseDate,
          countedByMethod,
          note: dailyCloseNote,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.saveFailed)
      }
      setDailyClose(data)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setSavingDailyClose(null)
    }
  }

  if (loading && !overview) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  const kpis = overview?.kpis
  const expectedByMethod = dailyClose?.summary.expectedByMethod ?? EMPTY_METHOD_TOTALS
  const countedByMethod = PAYMENT_METHODS.reduce((acc, method) => {
    const amountCents = parseAedToCents(dailyCloseCounts[method] || '0')
    acc[method] = Number.isFinite(amountCents) && amountCents > 0 ? amountCents : 0
    return acc
  }, {} as MethodTotals)
  const discrepancyByMethod = PAYMENT_METHODS.reduce((acc, method) => {
    acc[method] = countedByMethod[method] - (expectedByMethod[method] ?? 0)
    return acc
  }, {} as MethodTotals)
  const expectedTotalCents = PAYMENT_METHODS.reduce((sum, method) => sum + (expectedByMethod[method] ?? 0), 0)
  const countedTotalCents = PAYMENT_METHODS.reduce((sum, method) => sum + countedByMethod[method], 0)
  const discrepancyTotalCents = countedTotalCents - expectedTotalCents

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t.finance}</h1>
          <p className="text-gray-600 mt-1 text-[15px] leading-relaxed">{t.financeSubtitle}</p>
        </div>
        <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
          {[
            ['month', t.financeThisMonth],
            ['30d', t.financeLast30Days],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value as 'month' | '30d')}
              className={clsx(
                'px-3 py-2 rounded-xl text-sm font-semibold min-h-10 transition-colors',
                range === value ? 'bg-orange-100 text-orange-900' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{t.dailyClose}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.dailyCloseHint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              <span className="sr-only">{t.dailyCloseDate}</span>
              <input
                type="date"
                value={dailyCloseDate}
                onChange={(e) => setDailyCloseDate(e.target.value)}
                className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
              />
            </label>
            {dailyClose?.close && (
              <span
                className={clsx(
                  'inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold',
                  dailyClose.close.status === 'FINALIZED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                )}
              >
                {dailyClose.close.status === 'FINALIZED' ? t.dailyCloseFinalized : t.dailyCloseDraft}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.dailyCloseExpected}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(expectedTotalCents, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {dailyClose?.summary.paymentCount ?? 0} {t.dailyClosePayments.toLowerCase()}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.dailyCloseCounted}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(countedTotalCents, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {dailyClose?.summary.appointmentCount ?? 0} {t.appointments.toLowerCase()}
            </p>
          </div>
          <div
            className={clsx(
              'rounded-2xl border p-4',
              discrepancyTotalCents === 0
                ? 'bg-emerald-50 border-emerald-100'
                : 'bg-amber-50 border-amber-100'
            )}
          >
            <p className="text-sm text-gray-600">{t.dailyCloseDiscrepancy}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(discrepancyTotalCents, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t.dailyCloseDiscrepancyHint}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.financePending}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(dailyClose?.summary.pendingTotalCents ?? 0, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.financeRefunds}: {money(dailyClose?.summary.refundedTotalCents ?? 0, 'AED', numberLocale)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="py-2 pr-3 font-medium">{t.paymentMethod}</th>
                <th className="py-2 px-3 font-medium">{t.dailyCloseExpected}</th>
                <th className="py-2 px-3 font-medium">{t.dailyCloseCounted}</th>
                <th className="py-2 pl-3 font-medium">{t.dailyCloseDiscrepancy}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PAYMENT_METHODS.map((method) => (
                <tr key={method}>
                  <td className="py-3 pr-3 font-medium text-gray-900">{methodLabel(t, method)}</td>
                  <td className="py-3 px-3 tabular-nums text-gray-700">
                    {money(expectedByMethod[method] ?? 0, 'AED', numberLocale)}
                  </td>
                  <td className="py-3 px-3">
                    <input
                      inputMode="decimal"
                      value={dailyCloseCounts[method]}
                      disabled={dailyClose?.close?.status === 'FINALIZED'}
                      onChange={(e) =>
                        setDailyCloseCounts((current) => ({ ...current, [method]: e.target.value }))
                      }
                      className="min-h-11 w-28 rounded-xl border border-gray-200 px-3 text-sm tabular-nums disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </td>
                  <td className="py-3 pl-3 tabular-nums font-semibold text-gray-900">
                    {money(discrepancyByMethod[method] ?? 0, 'AED', numberLocale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.dailyCloseNote}</span>
            <textarea
              value={dailyCloseNote}
              disabled={dailyClose?.close?.status === 'FINALIZED'}
              onChange={(e) => setDailyCloseNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </label>
          <div className="flex flex-col justify-end gap-2">
            <button
              type="button"
              disabled={savingDailyClose !== null || dailyClose?.close?.status === 'FINALIZED'}
              onClick={() => saveDailyClose('DRAFT')}
              className="min-h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              {savingDailyClose === 'draft' ? t.savingEllipsis : t.dailyCloseSaveDraft}
            </button>
            <button
              type="button"
              disabled={savingDailyClose !== null || dailyClose?.close?.status === 'FINALIZED'}
              onClick={() => saveDailyClose('FINALIZED')}
              className="min-h-11 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {savingDailyClose === 'finalized' ? t.savingEllipsis : t.dailyCloseFinalize}
            </button>
          </div>
        </div>

        {(dailyClose?.recentCloses?.length ?? 0) > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">{t.dailyCloseRecent}</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {dailyClose?.recentCloses?.map((close) => {
                const discrepancyTotal = PAYMENT_METHODS.reduce(
                  (sum, method) => sum + (close.discrepancyByMethod[method] ?? 0),
                  0
                )
                return (
                  <button
                    key={close.id}
                    type="button"
                    onClick={() => setDailyCloseDate(close.businessDate)}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left text-sm hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-gray-900">{close.businessDate}</span>
                      <span className="text-xs text-gray-500">
                        {close.status === 'FINALIZED' ? t.dailyCloseFinalized : t.dailyCloseDraft}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {t.dailyCloseDiscrepancy}: {money(discrepancyTotal, 'AED', numberLocale)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.financeNetRevenue}</p>
            <ArrowUpRight className="w-5 h-5 text-emerald-600" aria-hidden />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2 tabular-nums">
            {money(kpis?.netRevenueCents ?? 0, 'AED', numberLocale)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t.financePaidRevenue}: {money(kpis?.paidRevenueCents ?? 0, 'AED', numberLocale)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t.discountTotal}: {money(kpis?.totalDiscountCents ?? 0, 'AED', numberLocale)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.expenses}</p>
            <ArrowDownRight className="w-5 h-5 text-red-500" aria-hidden />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2 tabular-nums">
            {money(kpis?.expensesCents ?? 0, 'AED', numberLocale)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {kpis?.expenseCount ?? 0} {t.expenses.toLowerCase()}
          </p>
        </div>
        <div
          className={clsx(
            'rounded-2xl border p-4 shadow-sm',
            (kpis?.profitCents ?? 0) >= 0
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-red-50 border-red-100'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{t.profit}</p>
            <CircleDollarSign className="w-5 h-5 text-orange-600" aria-hidden />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2 tabular-nums">
            {money(kpis?.profitCents ?? 0, 'AED', numberLocale)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t.financeMargin}: {kpis?.marginPct ?? 0}%
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.financePending}</p>
            <ReceiptText className="w-5 h-5 text-amber-600" aria-hidden />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2 tabular-nums">
            {money(kpis?.pendingCents ?? 0, 'AED', numberLocale)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t.financeRefunds}: {money(kpis?.refundsCents ?? 0, 'AED', numberLocale)}
          </p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{t.financePnlV2}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.financePnlV2Hint}</p>
          </div>
          <p className="text-xs text-gray-500">
            {kpis?.completedVisits ?? 0} {t.financeCompletedVisits.toLowerCase()} · {kpis?.productSales ?? 0}{' '}
            {t.productSales.toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.financeGrossProfit}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(kpis?.grossProfitCents ?? 0, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t.financeNetAfterDirectCosts}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.financeDirectCosts}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(kpis?.directCostCents ?? 0, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.financeMaterialCost}: {money(kpis?.procedureMaterialCostCents ?? 0, 'AED', numberLocale)} ·{' '}
              {t.financeProcessorFees}: {money(kpis?.processorFeeCents ?? 0, 'AED', numberLocale)}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.financeProductSalesRevenue}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(kpis?.productSalesRevenueCents ?? 0, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.financeProductSalesCost}: {money(kpis?.productSalesCostCents ?? 0, 'AED', numberLocale)}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{t.financeOperatingProfit}</p>
            <p className="text-xl font-semibold text-gray-900 mt-2 tabular-nums">
              {money(kpis?.profitCents ?? 0, 'AED', numberLocale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.financeMargin}: {kpis?.marginPct ?? 0}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {(overview?.breakdown.procedureProfitability.length ?? 0) > 0 ? (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">{t.procedureColName}</th>
                  <th className="py-2 px-3 font-medium">{t.financeCompletedVisits}</th>
                  <th className="py-2 px-3 font-medium">{t.financeExpectedRevenue}</th>
                  <th className="py-2 px-3 font-medium">{t.discountTotal}</th>
                  <th className="py-2 px-3 font-medium">{t.financeNetRevenue}</th>
                  <th className="py-2 px-3 font-medium">{t.financeMaterialCost}</th>
                  <th className="py-2 px-3 font-medium">{t.financeProcessorFees}</th>
                  <th className="py-2 px-3 font-medium">{t.financeGrossProfit}</th>
                  <th className="py-2 pl-3 font-medium">{t.financeProfitPerHour}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview?.breakdown.procedureProfitability.map((row) => (
                  <tr key={row.procedureId ?? row.procedureName}>
                    <td className="py-3 pr-3 font-medium text-gray-900">{row.procedureName}</td>
                    <td className="py-3 px-3 tabular-nums text-gray-700">{row.visits}</td>
                    <td className="py-3 px-3 tabular-nums text-gray-700">
                      {money(row.expectedRevenueCents, 'AED', numberLocale)}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-gray-700">
                      {money(row.discountCents, 'AED', numberLocale)}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-gray-700">
                      {money(row.netRevenueCents, 'AED', numberLocale)}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-gray-700">
                      {money(row.materialCostCents, 'AED', numberLocale)}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-gray-700">
                      {money(row.processorFeeCents, 'AED', numberLocale)}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-semibold text-gray-900">
                      {money(row.grossProfitCents, 'AED', numberLocale)}
                      <span className="ml-1 text-xs font-normal text-gray-500">({row.marginPct}%)</span>
                    </td>
                    <td className="py-3 pl-3 tabular-nums text-gray-700">
                      {money(row.profitPerHourCents, 'AED', numberLocale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
              {t.financeNoProcedureProfitability}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{t.discountRules}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.discountRulesHint}</p>
          </div>
          <p className="text-xs text-gray-500">
            {kpis?.discountedPayments ?? 0} {t.discountedPayments.toLowerCase()} ·{' '}
            {money(kpis?.paymentDiscountCents ?? 0, 'AED', numberLocale)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {discountRules.length === 0 ? (
              <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">{t.noDiscountRules}</p>
            ) : (
              discountRules.map((rule) => (
                <div key={rule.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_130px_120px_auto] md:items-end">
                    <label className="block text-xs font-medium text-gray-600">
                      {t.discountRuleName}
                      <input
                        value={rule.name}
                        onChange={(e) =>
                          setDiscountRules((current) =>
                            current.map((item) => (item.id === rule.id ? { ...item, name: e.target.value } : item))
                          )
                        }
                        className="mt-1 w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
                      />
                    </label>
                    <label className="block text-xs font-medium text-gray-600">
                      {t.discountType}
                      <select
                        value={rule.type}
                        onChange={(e) =>
                          setDiscountRules((current) =>
                            current.map((item) =>
                              item.id === rule.id ? { ...item, type: e.target.value as DiscountRule['type'] } : item
                            )
                          )
                        }
                        className="mt-1 w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
                      >
                        <option value="PERCENT">{t.discountPercent}</option>
                        <option value="FIXED">{t.discountFixed}</option>
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-gray-600">
                      {rule.type === 'PERCENT' ? t.discountPercent : t.discountFixed}
                      <input
                        inputMode="decimal"
                        value={rule.type === 'PERCENT' ? (rule.percentBps / 100).toString() : (rule.fixedCents / 100).toString()}
                        onChange={(e) => {
                          const value = Number(e.target.value.replace(',', '.'))
                          setDiscountRules((current) =>
                            current.map((item) =>
                              item.id === rule.id
                                ? rule.type === 'PERCENT'
                                  ? { ...item, percentBps: Number.isFinite(value) ? Math.round(value * 100) : 0 }
                                  : { ...item, fixedCents: Number.isFinite(value) ? Math.round(value * 100) : 0 }
                                : item
                            )
                          )
                        }}
                        className="mt-1 w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                        <input
                          type="checkbox"
                          checked={rule.active}
                          onChange={(e) =>
                            setDiscountRules((current) =>
                              current.map((item) =>
                                item.id === rule.id ? { ...item, active: e.target.checked } : item
                              )
                            )
                          }
                        />
                        {t.enabled}
                      </label>
                      <button
                        type="button"
                        disabled={savingDiscountRule === rule.id}
                        onClick={() => saveDiscountRule(rule)}
                        className="min-h-10 rounded-xl bg-gray-950 px-3 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {savingDiscountRule === rule.id ? t.savingEllipsis : t.save}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={createDiscountRule} className="rounded-2xl border border-orange-100 bg-orange-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-orange-900">
              <BadgePercent className="h-5 w-5" aria-hidden />
              <h3 className="text-sm font-semibold">{t.addDiscountRule}</h3>
            </div>
            <label className="block text-xs font-medium text-orange-900">
              {t.discountRuleName}
              <input
                value={discountForm.name}
                onChange={(e) => setDiscountForm((current) => ({ ...current, name: e.target.value }))}
                placeholder={t.discountRuleNamePlaceholder}
                className="mt-1 w-full min-h-11 rounded-xl border border-orange-100 bg-white px-3 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-medium text-orange-900">
                {t.discountType}
                <select
                  value={discountForm.type}
                  onChange={(e) =>
                    setDiscountForm((current) => ({ ...current, type: e.target.value as DiscountRule['type'] }))
                  }
                  className="mt-1 w-full min-h-11 rounded-xl border border-orange-100 bg-white px-3 text-sm"
                >
                  <option value="PERCENT">{t.discountPercent}</option>
                  <option value="FIXED">{t.discountFixed}</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-orange-900">
                {discountForm.type === 'PERCENT' ? t.discountPercent : t.discountFixed}
                <input
                  inputMode="decimal"
                  value={discountForm.type === 'PERCENT' ? discountForm.percent : discountForm.fixed}
                  onChange={(e) =>
                    setDiscountForm((current) =>
                      current.type === 'PERCENT'
                        ? { ...current, percent: e.target.value }
                        : { ...current, fixed: e.target.value }
                    )
                  }
                  placeholder={discountForm.type === 'PERCENT' ? '10' : '100'}
                  className="mt-1 w-full min-h-11 rounded-xl border border-orange-100 bg-white px-3 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs font-medium text-orange-900">
              {t.note}
              <input
                value={discountForm.note}
                onChange={(e) => setDiscountForm((current) => ({ ...current, note: e.target.value }))}
                className="mt-1 w-full min-h-11 rounded-xl border border-orange-100 bg-white px-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={savingDiscountRule === 'new'}
              className="min-h-11 w-full rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {savingDiscountRule === 'new' ? t.savingEllipsis : t.addDiscountRule}
            </button>
          </form>
        </div>

        {overview?.recentDiscounts.length ? (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">{t.recentDiscounts}</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {overview.recentDiscounts.map((discount) => (
                <div key={discount.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{discount.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {discount.discountName ?? t.manualDiscount} · {new Date(discount.paidAt).toLocaleDateString(numberLocale)}
                      </p>
                    </div>
                    <p className="font-semibold text-orange-700">
                      {money(discount.discountCents, discount.currency, numberLocale)}
                    </p>
                  </div>
                  {discount.discountReason && (
                    <p className="mt-2 rounded-xl bg-white p-2 text-xs text-gray-600">{discount.discountReason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{t.paymentFeeRules}</h2>
          <p className="text-sm text-gray-500 mt-1">{t.paymentFeeRulesHint}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {PAYMENT_METHODS.map((method) => {
            const rule =
              feeRules.find((item) => item.method === method) ?? {
                id: null,
                method,
                percentBps: 0,
                fixedFeeCents: 0,
                active: method !== 'CASH',
              }
            return (
              <div key={method} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">{methodLabel(t, method)}</p>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={(e) =>
                        setFeeRules((current) =>
                          current.map((item) =>
                            item.method === method ? { ...item, active: e.target.checked } : item
                          )
                        )
                      }
                    />
                    {t.enabled}
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block text-xs font-medium text-gray-600">
                    {t.paymentFeePercent}
                    <input
                      inputMode="decimal"
                      value={(rule.percentBps / 100).toString()}
                      onChange={(e) => {
                        const percent = Number(e.target.value.replace(',', '.'))
                        setFeeRules((current) =>
                          current.map((item) =>
                            item.method === method
                              ? { ...item, percentBps: Number.isFinite(percent) ? Math.round(percent * 100) : 0 }
                              : item
                          )
                        )
                      }}
                      className="mt-1 w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-medium text-gray-600">
                    {t.paymentFeeFixed}
                    <input
                      inputMode="decimal"
                      value={(rule.fixedFeeCents / 100).toString()}
                      onChange={(e) => {
                        const amount = Number(e.target.value.replace(',', '.'))
                        setFeeRules((current) =>
                          current.map((item) =>
                            item.method === method
                              ? { ...item, fixedFeeCents: Number.isFinite(amount) ? Math.round(amount * 100) : 0 }
                              : item
                          )
                        )
                      }}
                      className="mt-1 w-full min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={savingFeeRule === method}
                  onClick={() => saveFeeRule(rule)}
                  className="mt-3 min-h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {savingFeeRule === method ? t.savingEllipsis : t.save}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">{t.profitability}</h2>
            {loading && <span className="text-xs text-gray-500">{t.loading}</span>}
          </div>

          <div className="space-y-3">
            {(overview?.breakdown.expensesByCategory.length ?? 0) > 0 ? (
              overview?.breakdown.expensesByCategory.map((row) => (
                <div key={row.category}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-800">{expenseCategoryLabel(t, row.category)}</span>
                    <span className="tabular-nums text-gray-600">
                      {money(row.amountCents, 'AED', numberLocale)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${Math.max(4, (row.amountCents / categoryTotal) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">{t.financeNoExpenses}</p>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.financeRecentExpenses}</h3>
            <div className="divide-y divide-gray-100">
              {(overview?.recentExpenses.length ?? 0) > 0 ? (
                overview?.recentExpenses.map((expense) => (
                  <div key={expense.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {expense.vendor || expense.description || expenseCategoryLabel(t, expense.category)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {expenseCategoryLabel(t, expense.category)} ·{' '}
                        {new Date(expense.occurredAt).toLocaleDateString(numberLocale)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                      {money(expense.amountCents, expense.currency, numberLocale)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-3">{t.financeNoExpenses}</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">{t.financeAddExpense}</h2>
          <form onSubmit={submitExpense} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.financeExpenseCategory}</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((current) => ({ ...current, category: e.target.value as ExpenseCategory }))
                }
                className="mt-1 w-full min-h-11 rounded-xl border border-gray-300 px-3 text-sm bg-white"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {expenseCategoryLabel(t, category)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.financeExpenseVendor}</span>
              <input
                value={form.vendor}
                onChange={(e) => setForm((current) => ({ ...current, vendor: e.target.value }))}
                className="mt-1 w-full min-h-11 rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.financeExpenseDescription}</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.financeExpenseAmount}</span>
              <input
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
                placeholder="450"
                className="mt-1 w-full min-h-11 rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.financeExpenseDate}</span>
              <input
                type="date"
                value={form.occurredAt}
                onChange={(e) => setForm((current) => ({ ...current, occurredAt: e.target.value }))}
                className="mt-1 w-full min-h-11 rounded-xl border border-gray-300 px-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" aria-hidden />
              {saving ? t.savingEllipsis : t.financeAddExpense}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
