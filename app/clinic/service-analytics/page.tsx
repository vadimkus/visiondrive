'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart3, CircleDollarSign, Clock3, Package, RefreshCw, TrendingUp } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type ServiceAnalyticsOverview = {
  kpis: {
    completedVisits: number
    procedureMaterialCostCents: number
  }
  breakdown: {
    procedureProfitability: Array<{
      procedureId: string | null
      procedureName: string
      visits: number
      totalMinutes: number
      expectedRevenueCents: number
      discountCents: number
      netRevenueCents: number
      materialCostCents: number
      processorFeeCents: number
      grossProfitCents: number
      marginPct: number
      profitPerHourCents: number
    }>
  }
}

type SortKey = 'grossProfit' | 'profitPerHour' | 'visits'

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function hours(minutes: number, locale: string) {
  return `${(Math.max(0, minutes) / 60).toLocaleString(locale, {
    maximumFractionDigits: 1,
  })}h`
}

export default function ClinicServiceAnalyticsPage() {
  const { locale, t } = useClinicLocale()
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const [range, setRange] = useState<'month' | '30d'>('month')
  const [sortKey, setSortKey] = useState<SortKey>('grossProfit')
  const [overview, setOverview] = useState<ServiceAnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/finance/overview?range=${range}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
        return
      }
      setOverview(data)
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [range, t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const rows = useMemo(() => {
    const base = overview?.breakdown.procedureProfitability ?? []
    return [...base].sort((a, b) => {
      if (sortKey === 'profitPerHour') return b.profitPerHourCents - a.profitPerHourCents
      if (sortKey === 'visits') return b.visits - a.visits
      return b.grossProfitCents - a.grossProfitCents
    })
  }, [overview?.breakdown.procedureProfitability, sortKey])

  const totals = useMemo(() => {
    const visits = rows.reduce((sum, row) => sum + row.visits, 0)
    const totalMinutes = rows.reduce((sum, row) => sum + row.totalMinutes, 0)
    const netRevenueCents = rows.reduce((sum, row) => sum + row.netRevenueCents, 0)
    const grossProfitCents = rows.reduce((sum, row) => sum + row.grossProfitCents, 0)
    const materialCostCents = rows.reduce((sum, row) => sum + row.materialCostCents, 0)
    return {
      visits,
      totalMinutes,
      netRevenueCents,
      grossProfitCents,
      materialCostCents,
      averagePriceCents: visits > 0 ? Math.round(netRevenueCents / visits) : 0,
      profitPerHourCents: totalMinutes > 0 ? Math.round((grossProfitCents / totalMinutes) * 60) : 0,
    }
  }, [rows])

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.serviceAnalytics}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.serviceAnalyticsIntro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['month', t.financeThisMonth],
              ['30d', t.financeLast30Days],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as 'month' | '30d')}
                className={`min-h-10 rounded-xl px-3 text-sm font-semibold ${
                  range === value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'border border-orange-100 bg-white text-orange-800 hover:bg-orange-50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 text-sm font-semibold text-orange-800 hover:bg-orange-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <CircleDollarSign className="h-5 w-5 text-orange-600" aria-hidden />
          <p className="mt-3 text-sm text-gray-500">{t.financeNetRevenue}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">
            {money(totals.netRevenueCents, numberLocale)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t.financeCompletedVisits}: {totals.visits}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden />
          <p className="mt-3 text-sm text-gray-500">{t.serviceAnalyticsAveragePrice}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">
            {money(totals.averagePriceCents, numberLocale)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t.serviceAnalyticsPerCompletedVisit}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <Package className="h-5 w-5 text-purple-600" aria-hidden />
          <p className="mt-3 text-sm text-gray-500">{t.financeMaterialCost}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">
            {money(totals.materialCostCents, numberLocale)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t.serviceAnalyticsAcrossServices}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <Clock3 className="h-5 w-5 text-blue-600" aria-hidden />
          <p className="mt-3 text-sm text-gray-500">{t.financeProfitPerHour}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">
            {money(totals.profitPerHourCents, numberLocale)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{hours(totals.totalMinutes, numberLocale)} {t.serviceAnalyticsBookedTime}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden />
              {t.serviceAnalytics}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-950">{t.serviceAnalyticsByProcedure}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.serviceAnalyticsByProcedureHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['grossProfit', t.financeGrossProfit],
              ['profitPerHour', t.financeProfitPerHour],
              ['visits', t.financeCompletedVisits],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSortKey(value as SortKey)}
                className={`min-h-10 rounded-xl px-3 text-sm font-semibold ${
                  sortKey === value
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {rows.length === 0 ? (
            <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
              {t.financeNoProcedureProfitability}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">{t.procedureColName}</th>
                  <th className="py-2 px-3 font-medium">{t.financeCompletedVisits}</th>
                  <th className="py-2 px-3 font-medium">{t.serviceAnalyticsAveragePrice}</th>
                  <th className="py-2 px-3 font-medium">{t.financeNetRevenue}</th>
                  <th className="py-2 px-3 font-medium">{t.financeMaterialCost}</th>
                  <th className="py-2 px-3 font-medium">{t.financeGrossProfit}</th>
                  <th className="py-2 px-3 font-medium">{t.financeProfitPerHour}</th>
                  <th className="py-2 pl-3 font-medium">{t.serviceAnalyticsTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const averagePriceCents = row.visits > 0 ? Math.round(row.netRevenueCents / row.visits) : 0
                  return (
                    <tr key={row.procedureId ?? row.procedureName}>
                      <td className="py-3 pr-3 font-medium text-gray-900">{row.procedureName}</td>
                      <td className="py-3 px-3 tabular-nums text-gray-700">{row.visits}</td>
                      <td className="py-3 px-3 tabular-nums text-gray-700">
                        {money(averagePriceCents, numberLocale)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-gray-700">
                        {money(row.netRevenueCents, numberLocale)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-gray-700">
                        {money(row.materialCostCents, numberLocale)}
                      </td>
                      <td className="py-3 px-3 tabular-nums font-semibold text-gray-900">
                        {money(row.grossProfitCents, numberLocale)}
                        <span className="ml-1 text-xs font-normal text-gray-500">({row.marginPct}%)</span>
                      </td>
                      <td className="py-3 px-3 tabular-nums text-gray-700">
                        {money(row.profitPerHourCents, numberLocale)}
                      </td>
                      <td className="py-3 pl-3 tabular-nums text-gray-700">
                        {hours(row.totalMinutes, numberLocale)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
        {t.serviceAnalyticsFinanceHint}{' '}
        <Link href="/clinic/finance" className="font-semibold underline">
          {t.finance}
        </Link>
      </div>
    </div>
  )
}
