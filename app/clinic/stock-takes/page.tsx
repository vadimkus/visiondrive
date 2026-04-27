'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type StockTakeSession = {
  id: string
  title: string
  status: 'DRAFT' | 'FINALIZED' | 'CANCELLED'
  countedAt: string
  finalizedAt: string | null
  summary: {
    lines: number
    counted: number
    varianceLines: number
    totalVariance: number
  }
}

function statusLabel(t: ReturnType<typeof useClinicLocale>['t'], status: StockTakeSession['status']) {
  if (status === 'FINALIZED') return t.stockTakeStatusFinalized
  if (status === 'CANCELLED') return t.stockTakeStatusCancelled
  return t.stockTakeStatusDraft
}

export default function ClinicStockTakesPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [sessions, setSessions] = useState<StockTakeSession[]>([])
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/clinic/stock-takes', { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.failedToLoad)
      setSessions([])
      return
    }
    setSessions(data.sessions || [])
    setError('')
  }, [router, t.failedToLoad])

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

  const startStockTake = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/stock-takes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, note }),
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      router.push(`/clinic/stock-takes/${data.stockTake.id}`)
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/clinic/inventory" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          {t.inventory}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.stockTakes}</h1>
        <p className="text-sm text-gray-600 mt-1">{t.stockTakesSubtitle}</p>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <form onSubmit={startStockTake} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">{t.startStockTake}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.countAllItemsHint}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-gray-600 mb-1">{t.stockTakeTitle}</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.stockTakeTitle}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-600 mb-1">{t.stockTakeNote}</span>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.stockTakeNote}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? t.loading : t.startStockTake}
        </button>
      </form>

      {sessions.length === 0 ? (
        <ClinicEmptyState title={t.noStockTakes} />
      ) : (
        <div className="grid gap-3">
          {sessions.map((row) => (
            <Link
              key={row.id}
              href={`/clinic/stock-takes/${row.id}`}
              className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:border-orange-200 hover:shadow-md transition"
            >
              <div className="flex flex-wrap gap-3 items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{row.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(row.countedAt).toLocaleDateString()} · {row.summary.counted}/{row.summary.lines} {t.stockTakeCounted.toLowerCase()}
                  </p>
                </div>
                <span
                  className={clsx(
                    'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                    row.status === 'FINALIZED' && 'bg-emerald-100 text-emerald-800',
                    row.status === 'CANCELLED' && 'bg-gray-100 text-gray-700',
                    row.status === 'DRAFT' && 'bg-amber-100 text-amber-800'
                  )}
                >
                  {statusLabel(t, row.status)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">{t.stockTakeVariance}</p>
                  <p className="font-semibold text-gray-900">{row.summary.varianceLines}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">{t.quantityDelta}</p>
                  <p className="font-semibold text-gray-900">{row.summary.totalVariance}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">{t.stockTakeAdjustments}</p>
                  <p className="font-semibold text-gray-900">{row.status === 'FINALIZED' ? row.summary.varianceLines : '—'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
