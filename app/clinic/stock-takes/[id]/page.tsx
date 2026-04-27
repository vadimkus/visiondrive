'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type VarianceReason = 'COUNT_CORRECTION' | 'EXPIRED' | 'DAMAGED' | 'LOST' | 'FOUND' | 'OTHER'

type StockTakeLine = {
  id: string
  expectedQuantity: number
  countedQuantity: number | null
  varianceQuantity: number
  reason: VarianceReason | null
  note: string | null
  movementId: string | null
  stockItem: {
    id: string
    name: string
    sku: string | null
    unit: string
    quantityOnHand: number
    active: boolean
  }
}

type StockTake = {
  id: string
  title: string
  status: 'DRAFT' | 'FINALIZED' | 'CANCELLED'
  note: string | null
  countedAt: string
  finalizedAt: string | null
  lines: StockTakeLine[]
}

type LineForm = {
  countedQuantity: string
  reason: string
  note: string
}

const varianceReasons: VarianceReason[] = ['COUNT_CORRECTION', 'EXPIRED', 'DAMAGED', 'LOST', 'FOUND', 'OTHER']

function reasonLabel(t: ReturnType<typeof useClinicLocale>['t'], reason: VarianceReason) {
  if (reason === 'EXPIRED') return t.stockTakeReasonExpired
  if (reason === 'DAMAGED') return t.stockTakeReasonDamaged
  if (reason === 'LOST') return t.stockTakeReasonLost
  if (reason === 'FOUND') return t.stockTakeReasonFound
  if (reason === 'OTHER') return t.stockTakeReasonOther
  return t.stockTakeReasonCountCorrection
}

function statusLabel(t: ReturnType<typeof useClinicLocale>['t'], status: StockTake['status']) {
  if (status === 'FINALIZED') return t.stockTakeStatusFinalized
  if (status === 'CANCELLED') return t.stockTakeStatusCancelled
  return t.stockTakeStatusDraft
}

export default function ClinicStockTakeDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { t } = useClinicLocale()
  const [stockTake, setStockTake] = useState<StockTake | null>(null)
  const [forms, setForms] = useState<Record<string, LineForm>>({})
  const [loading, setLoading] = useState(true)
  const [savingLineId, setSavingLineId] = useState<string | null>(null)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const buildForms = useCallback((lines: StockTakeLine[]) => {
    return Object.fromEntries(
      lines.map((line) => [
        line.id,
        {
          countedQuantity: line.countedQuantity == null ? '' : String(line.countedQuantity),
          reason: line.reason || '',
          note: line.note || '',
        },
      ])
    )
  }, [])

  const load = useCallback(async () => {
    const res = await fetch(`/api/clinic/stock-takes/${params.id}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.failedToLoad)
      return
    }
    setStockTake(data.stockTake)
    setForms(buildForms(data.stockTake.lines || []))
    setError('')
  }, [buildForms, params.id, router, t.failedToLoad])

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

  const summary = useMemo(() => {
    const lines = stockTake?.lines || []
    return {
      counted: lines.filter((line) => line.countedQuantity != null).length,
      total: lines.length,
      varianceLines: lines.filter((line) => line.varianceQuantity !== 0).length,
      totalVariance: lines.reduce((sum, line) => sum + line.varianceQuantity, 0),
    }
  }, [stockTake])

  const updateForm = (lineId: string, patch: Partial<LineForm>) => {
    const defaultForm = {
      countedQuantity: '',
      reason: '',
      note: '',
    }
    setForms((current) => ({
      ...current,
      [lineId]: {
        ...defaultForm,
        ...current[lineId],
        ...patch,
      },
    }))
  }

  const saveLine = async (line: StockTakeLine) => {
    const form = forms[line.id]
    setSavingLineId(line.id)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/clinic/stock-takes/${params.id}/lines/${line.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countedQuantity: form?.countedQuantity,
          reason: form?.reason || null,
          note: form?.note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setStockTake((current) =>
        current
          ? {
              ...current,
              lines: current.lines.map((item) => (item.id === line.id ? data.line : item)),
            }
          : current
      )
      updateForm(line.id, {
        countedQuantity: String(data.line.countedQuantity),
        reason: data.line.reason || '',
        note: data.line.note || '',
      })
    } catch {
      setError(t.networkError)
    } finally {
      setSavingLineId(null)
    }
  }

  const finalize = async () => {
    setFinalizing(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/clinic/stock-takes/${params.id}/finalize`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setMessage(t.stockTakeFinalized)
      await load()
    } catch {
      setError(t.networkError)
    } finally {
      setFinalizing(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  if (!stockTake) {
    return (
      <div className="max-w-4xl mx-auto">
        <ClinicAlert variant="error">{error || t.notFound}</ClinicAlert>
      </div>
    )
  }

  const isDraft = stockTake.status === 'DRAFT'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/clinic/stock-takes" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          {t.stockTakes}
        </Link>
        <div className="flex flex-wrap gap-3 items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{stockTake.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{t.finalizeStockTakeHint}</p>
          </div>
          <span
            className={clsx(
              'inline-flex px-3 py-1 rounded-full text-xs font-semibold',
              stockTake.status === 'FINALIZED' && 'bg-emerald-100 text-emerald-800',
              stockTake.status === 'CANCELLED' && 'bg-gray-100 text-gray-700',
              stockTake.status === 'DRAFT' && 'bg-amber-100 text-amber-800'
            )}
          >
            {statusLabel(t, stockTake.status)}
          </span>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {message && <ClinicAlert variant="success">{message}</ClinicAlert>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t.stockTakeCounted}</p>
          <p className="text-xl font-semibold text-gray-900">{summary.counted}/{summary.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t.stockTakeVariance}</p>
          <p className="text-xl font-semibold text-gray-900">{summary.varianceLines}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t.quantityDelta}</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalVariance}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t.stockTakeAdjustments}</p>
          <p className="text-xl font-semibold text-gray-900">
            {stockTake.lines.filter((line) => line.movementId).length}
          </p>
        </div>
      </div>

      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
          <p className="text-sm text-amber-900">{t.finalizeStockTakeHint}</p>
          <button
            type="button"
            onClick={finalize}
            disabled={finalizing || summary.counted !== summary.total}
            className="min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {finalizing ? t.loading : t.finalizeStockTake}
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {stockTake.lines.map((line) => {
          const form = forms[line.id] || { countedQuantity: '', reason: '', note: '' }
          const liveVariance =
            form.countedQuantity === '' ? line.varianceQuantity : Number(form.countedQuantity) - line.expectedQuantity
          const needsReason = Number.isFinite(liveVariance) && liveVariance !== 0
          return (
            <div key={line.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
              <div className="flex flex-wrap gap-2 items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{line.stockItem.name}</p>
                  <p className="text-xs text-gray-500">
                    {line.stockItem.sku || t.emptyValue} · {line.stockItem.unit}
                  </p>
                </div>
                <span
                  className={clsx(
                    'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                    line.varianceQuantity === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  )}
                >
                  {t.stockTakeVariance}: {line.varianceQuantity}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <p className="text-xs text-gray-500">{t.stockTakeExpected}</p>
                  <p className="min-h-11 flex items-center rounded-xl bg-gray-50 px-3 text-sm font-semibold text-gray-900">
                    {line.expectedQuantity}
                  </p>
                </div>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">{t.stockTakeActual}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!isDraft}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11 disabled:bg-gray-50"
                    value={form.countedQuantity}
                    onChange={(e) => updateForm(line.id, { countedQuantity: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">{t.stockTakeReason}</span>
                  <select
                    disabled={!isDraft || !needsReason}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11 disabled:bg-gray-50"
                    value={form.reason}
                    onChange={(e) => updateForm(line.id, { reason: e.target.value })}
                  >
                    <option value="">{needsReason ? t.selectPlaceholder : '—'}</option>
                    {varianceReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reasonLabel(t, reason)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block lg:col-span-2">
                  <span className="block text-xs text-gray-600 mb-1">{t.movementNote}</span>
                  <input
                    disabled={!isDraft}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11 disabled:bg-gray-50"
                    value={form.note}
                    onChange={(e) => updateForm(line.id, { note: e.target.value })}
                  />
                </label>
              </div>

              {needsReason && !form.reason && isDraft && (
                <p className="text-xs text-amber-700">{t.stockTakeReasonRequired}</p>
              )}

              {isDraft && (
                <button
                  type="button"
                  onClick={() => saveLine(line)}
                  disabled={savingLineId === line.id || form.countedQuantity === '' || (needsReason && !form.reason)}
                  className="min-h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                >
                  {savingLineId === line.id ? t.loading : t.saveCountLine}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
