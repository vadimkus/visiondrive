'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CircleDollarSign, RefreshCw, Target, TrendingUp, Users } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type RevenuePlan = {
  range: {
    start: string
    end: string
    daysInMonth: number
    elapsedDays: number
    remainingDays: number
  }
  plan: {
    monthlyTargetCents: number
    averageVisitCents: number
    configuredAverageVisitCents: number
  }
  actuals: {
    achievedRevenueCents: number
    completedVisits: number
    actualAverageVisitCents: number
    gapCents: number
    progressPct: number
    dailyPaceCents: number
    requiredDailyPaceCents: number
    projectedRevenueCents: number
    requiredVisits: number
  }
}

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function parseAedToCents(value: string) {
  const compact = value.replace(/\s/g, '').trim()
  if (!compact) return 0
  const normalized =
    /^[0-9]+,[0-9]{1,2}$/.test(compact) && !compact.includes('.')
      ? compact.replace(',', '.')
      : compact.replace(/,/g, '')
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : NaN
}

export default function ClinicRevenuePlanPage() {
  const { locale, t } = useClinicLocale()
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const [plan, setPlan] = useState<RevenuePlan | null>(null)
  const [target, setTarget] = useState('')
  const [averageVisit, setAverageVisit] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const hydrateForm = (next: RevenuePlan) => {
    setTarget(next.plan.monthlyTargetCents > 0 ? String(next.plan.monthlyTargetCents / 100) : '')
    setAverageVisit(
      next.plan.configuredAverageVisitCents > 0 ? String(next.plan.configuredAverageVisitCents / 100) : ''
    )
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/revenue-plan', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
        return
      }
      setPlan(data)
      hydrateForm(data)
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const monthlyTargetCents = parseAedToCents(target)
    const averageVisitCents = parseAedToCents(averageVisit)
    if (Number.isNaN(monthlyTargetCents) || Number.isNaN(averageVisitCents)) {
      setError(t.enterValidAmount)
      return
    }
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/clinic/revenue-plan', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyTargetCents, averageVisitCents }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setPlan(data)
      hydrateForm(data)
      setSaved(true)
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  if (loading && !plan) return <ClinicSpinner label={t.loading} />

  const progress = Math.max(0, Math.min(100, plan?.actuals.progressPct ?? 0))
  const monthLabel = plan
    ? new Date(plan.range.start).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
      month: 'long',
      year: 'numeric',
    })
    : ''

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.revenuePlan}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.revenuePlanIntro}
            </p>
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
      {saved && <ClinicAlert variant="success">{t.revenuePlanSaved}</ClinicAlert>}

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={save} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
              <Target className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">{t.revenuePlanMonthlyTarget}</h2>
              <p className="mt-1 text-sm text-gray-500">{t.revenuePlanTargetHint}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">{t.revenuePlanTargetAed}</span>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                inputMode="decimal"
                placeholder="50000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">{t.revenuePlanAverageVisitAed}</span>
              <input
                value={averageVisit}
                onChange={(e) => setAverageVisit(e.target.value)}
                inputMode="decimal"
                placeholder={plan?.actuals.actualAverageVisitCents ? String(plan.actuals.actualAverageVisitCents / 100) : '500'}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-gray-500">{t.revenuePlanAverageVisitHint}</p>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? t.savingEllipsis : t.save}
          </button>
        </form>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-500">{monthLabel}</p>
              <h2 className="mt-1 text-lg font-semibold text-gray-950">{t.revenuePlanProgress}</h2>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-800">
              {Math.max(0, plan?.actuals.progressPct ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%
            </span>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricCard icon={CircleDollarSign} label={t.revenuePlanTarget} value={money(plan?.plan.monthlyTargetCents ?? 0, numberLocale)} />
            <MetricCard icon={TrendingUp} label={t.revenuePlanAchieved} value={money(plan?.actuals.achievedRevenueCents ?? 0, numberLocale)} />
            <MetricCard icon={CalendarDays} label={t.revenuePlanGap} value={money(plan?.actuals.gapCents ?? 0, numberLocale)} />
            <MetricCard icon={Users} label={t.revenuePlanRequiredVisits} value={String(plan?.actuals.requiredVisits ?? 0)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label={t.revenuePlanDailyPace}
          value={money(plan?.actuals.dailyPaceCents ?? 0, numberLocale)}
          hint={t.revenuePlanPerElapsedDay.replace('{days}', String(plan?.range.elapsedDays ?? 0))}
        />
        <MetricCard
          icon={CalendarDays}
          label={t.revenuePlanRequiredDailyPace}
          value={money(plan?.actuals.requiredDailyPaceCents ?? 0, numberLocale)}
          hint={t.revenuePlanForRemainingDays.replace('{days}', String(plan?.range.remainingDays ?? 0))}
        />
        <MetricCard
          icon={CircleDollarSign}
          label={t.revenuePlanProjected}
          value={money(plan?.actuals.projectedRevenueCents ?? 0, numberLocale)}
          hint={t.revenuePlanAtCurrentPace}
        />
        <MetricCard
          icon={Users}
          label={t.financeCompletedVisits}
          value={String(plan?.actuals.completedVisits ?? 0)}
          hint={`${t.serviceAnalyticsAveragePrice}: ${money(plan?.actuals.actualAverageVisitCents ?? 0, numberLocale)}`}
        />
      </section>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CircleDollarSign
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-orange-600" aria-hidden />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
