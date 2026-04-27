'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'

type Item = {
  id: string
  name: string
  sku: string | null
  unit: string
  quantityOnHand: number
  reorderPoint: number
  active: boolean
  lowStock: boolean
  procedure: { id: string; name: string } | null
}

function ClinicInventoryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useClinicLocale()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const lowOnly = searchParams.get('lowStock') === '1'
  const [showInactive, setShowInactive] = useState(false)
  const [lookupQ, setLookupQ] = useState('')
  const [lookupBusy, setLookupBusy] = useState(false)

  const load = useCallback(async () => {
    const q = new URLSearchParams()
    if (lowOnly) q.set('lowStock', '1')
    if (showInactive) q.set('includeInactive', '1')
    const res = await fetch(`/api/clinic/inventory?${q}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.failedToLoad)
      setItems([])
      return
    }
    setItems(data.items || [])
    setError('')
  }, [lowOnly, showInactive, router, t.failedToLoad])

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

  const toggleLowFilter = () => {
    const next = lowOnly ? '/clinic/inventory' : '/clinic/inventory?lowStock=1'
    router.push(next)
  }

  const runLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = lookupQ.trim()
    if (!q) return
    setLookupBusy(true)
    try {
      const res = await fetch(`/api/clinic/inventory/lookup?q=${encodeURIComponent(q)}`, {
        credentials: 'include',
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json()
      if (data.item?.id) {
        router.push(`/clinic/inventory/${data.item.id}`)
        return
      }
      setError(t.notFound)
    } catch {
      setError(t.networkError)
    } finally {
      setLookupBusy(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/clinic" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          {t.backDashboard}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.inventory}</h1>
        <p className="text-gray-600 text-sm mt-1">{t.inventorySubtitle}</p>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <form onSubmit={runLookup} className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[12rem]">
          <label className="block text-xs text-gray-600 mb-1">{t.scanLookupPlaceholder}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={lookupQ}
            onChange={(e) => setLookupQ(e.target.value)}
            placeholder={t.scanLookupPlaceholder}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={lookupBusy || !lookupQ.trim()}
          className="min-h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {lookupBusy ? t.loading : t.stockLookupSubmit}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={toggleLowFilter}
          className={clsx(
            'min-h-11 px-4 rounded-xl text-sm font-medium border transition-colors',
            lowOnly
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          )}
        >
          {t.lowStockOnly}
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 min-h-11 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-orange-600"
          />
          {t.showInactiveStock}
        </label>
        <Link
          href="/clinic/inventory/new"
          className="ms-auto inline-flex items-center min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
        >
          {t.addStockItem}
        </Link>
        <Link
          href="/clinic/stock-takes"
          className="inline-flex items-center min-h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          {t.stockTakes}
        </Link>
      </div>

      {items.length === 0 ? (
        <ClinicEmptyState title={t.noStockItems} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">{t.stockItemName}</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">{t.stockOnHand}</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">{t.stockReorderPoint}</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">{t.inventoryProcedureCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((row) => (
                <tr key={row.id} className={clsx(!row.active && 'opacity-60')}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/clinic/inventory/${row.id}`}
                      className="font-medium text-orange-700 hover:text-orange-800"
                    >
                      {row.name}
                    </Link>
                    {row.lowStock && (
                      <span className="ms-2 inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900">
                        {t.lowStock}
                      </span>
                    )}
                    {!row.active && (
                      <span className="ms-2 text-xs text-gray-500">{t.stockInactive}</span>
                    )}
                    <p className="text-xs text-gray-500 sm:hidden mt-0.5">
                      {row.quantityOnHand} {row.unit}
                    </p>
                  </td>
                  <td className="px-4 py-3 tabular-nums hidden sm:table-cell">
                    {row.quantityOnHand} {row.unit}
                  </td>
                  <td className="px-4 py-3 tabular-nums hidden md:table-cell">{row.reorderPoint}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                    {row.procedure?.name || t.emptyValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ClinicInventoryPage() {
  const { t } = useClinicLocale()
  return (
    <Suspense fallback={<ClinicSpinner label={t.loading} className="min-h-[40vh]" />}>
      <ClinicInventoryPageContent />
    </Suspense>
  )
}
