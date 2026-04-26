'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'

type Line = {
  id: string
  quantityOrdered: number
  quantityReceived: number
  unitCostCents: number | null
  stockItem: { id: string; name: string; unit: string; sku: string | null }
}

type Order = {
  id: string
  supplierName: string
  reference: string | null
  notes: string | null
  status: string
  orderedAt: string
  expectedAt: string | null
  lines: Line[]
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id || '')
  const { t } = useClinicLocale()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [receiptNote, setReceiptNote] = useState('')
  const [receiveQty, setReceiveQty] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const res = await fetch(`/api/clinic/purchase-orders/${id}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.notFound)
      setOrder(null)
      return
    }
    const o = data.order as Order
    setOrder(o)
    const init: Record<string, string> = {}
    for (const l of o.lines) {
      const remaining = l.quantityOrdered - l.quantityReceived
      init[l.id] = remaining > 0 ? String(Math.min(remaining, remaining)) : '0'
    }
    setReceiveQty(init)
    setError('')
  }, [id, router, t.notFound])

  useEffect(() => {
    if (!id) return
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
  }, [load, id, t.networkError])

  const statusLabel = (s: string) => {
    switch (s) {
      case 'DRAFT':
        return t.poStatusDraft
      case 'ORDERED':
        return t.poStatusOrdered
      case 'PARTIALLY_RECEIVED':
        return t.poStatusPartial
      case 'RECEIVED':
        return t.poStatusReceived
      case 'CANCELLED':
        return t.poStatusCancelled
      default:
        return s
    }
  }

  const patchStatus = async (status: string) => {
    if (!order) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/purchase-orders/${order.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setOrder(data.order)
    } catch {
      setError(t.networkError)
    } finally {
      setBusy(false)
    }
  }

  const submitReceive = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    const items: { lineId: string; quantity: number }[] = []
    for (const l of order.lines) {
      const q = parseInt(receiveQty[l.id] ?? '0', 10)
      if (Number.isFinite(q) && q > 0) {
        items.push({ lineId: l.id, quantity: q })
      }
    }
    if (items.length === 0) {
      setError(t.operationFailed)
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/purchase-orders/${order.id}/receive`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptNote: receiptNote.trim() || null, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setOrder(data.order)
      setReceiptNote('')
      const init: Record<string, string> = {}
      for (const l of data.order.lines as Line[]) {
        const remaining = l.quantityOrdered - l.quantityReceived
        init[l.id] = remaining > 0 ? String(remaining) : '0'
      }
      setReceiveQty(init)
    } catch {
      setError(t.networkError)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} />
  }

  if (error && !order) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <ClinicAlert variant="error">{error}</ClinicAlert>
        <Link href="/clinic/purchase-orders" className="text-orange-600 text-sm min-h-11 inline-flex items-center">
          {t.backToPurchaseOrders}
        </Link>
      </div>
    )
  }

  if (!order) return null

  const canMarkOrdered = order.status === 'DRAFT'
  const canCancel =
    order.status === 'DRAFT' || (order.status === 'ORDERED' && order.lines.every((l) => l.quantityReceived === 0))
  const canReceive =
    order.status !== 'CANCELLED' &&
    order.status !== 'RECEIVED' &&
    order.lines.some((l) => l.quantityReceived < l.quantityOrdered)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div>
        <Link
          href="/clinic/purchase-orders"
          className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center"
        >
          {t.backToPurchaseOrders}
        </Link>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <h1 className="text-2xl font-semibold text-gray-900">{t.poDetailTitle}</h1>
          <span
            className={clsx(
              'inline-flex px-2 py-1 rounded-lg text-xs font-semibold',
              order.status === 'RECEIVED' && 'bg-emerald-100 text-emerald-900',
              order.status === 'PARTIALLY_RECEIVED' && 'bg-sky-100 text-sky-900',
              order.status === 'ORDERED' && 'bg-blue-100 text-blue-900',
              order.status === 'CANCELLED' && 'bg-gray-200 text-gray-700',
              order.status === 'DRAFT' && 'bg-amber-100 text-amber-900'
            )}
          >
            {statusLabel(order.status)}
          </span>
        </div>
        <p className="text-gray-700 mt-2 font-medium">{order.supplierName}</p>
        <p className="text-sm text-gray-600">
          {order.reference || t.emptyValue}
          <span className="text-gray-400 mx-2">·</span>
          {new Date(order.orderedAt).toLocaleString()}
        </p>
        {order.expectedAt && (
          <p className="text-sm text-gray-600">
            {t.poExpectedAt}: {new Date(order.expectedAt).toLocaleString()}
          </p>
        )}
        {order.notes && (
          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap border-t border-gray-100 pt-2">
            {order.notes}
          </p>
        )}
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <div className="flex flex-wrap gap-2">
        {canMarkOrdered && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patchStatus('ORDERED')}
            className="min-h-11 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {t.poMarkOrdered}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (typeof window !== 'undefined' && !window.confirm(t.cancel + '?')) return
              void patchStatus('CANCELLED')
            }}
            className="min-h-11 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 disabled:opacity-50"
          >
            {t.cancel}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-5 py-4 border-b border-gray-100">{t.poLines}</h2>
        <ul className="divide-y divide-gray-100">
          {order.lines.map((l) => (
            <li key={l.id} className="px-5 py-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <Link
                    href={`/clinic/inventory/${l.stockItem.id}`}
                    className="font-medium text-orange-700 hover:text-orange-800"
                  >
                    {l.stockItem.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {l.stockItem.unit}
                    {l.stockItem.sku ? ` · ${l.stockItem.sku}` : ''}
                  </p>
                </div>
                <div className="text-right tabular-nums">
                  <p className="text-gray-800">
                    {t.poReceivedProgress}: {l.quantityReceived} / {l.quantityOrdered}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {canReceive && (
        <form
          onSubmit={submitReceive}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900">{t.poReceiveStock}</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.poReceiptNote}</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
            />
          </div>
          {order.lines.map((l) => {
            const remaining = l.quantityOrdered - l.quantityReceived
            if (remaining <= 0) return null
            return (
              <div key={l.id}>
                <label className="block text-sm text-gray-600 mb-1">
                  {l.stockItem.name} — {t.poReceiveQty} (≤ {remaining})
                </label>
                <input
                  type="number"
                  min={0}
                  max={remaining}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11 tabular-nums"
                  value={receiveQty[l.id] ?? '0'}
                  onChange={(e) => setReceiveQty((prev) => ({ ...prev, [l.id]: e.target.value }))}
                />
              </div>
            )
          })}
          <button
            type="submit"
            disabled={busy}
            className="w-full sm:w-auto min-h-11 px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50"
          >
            {busy ? t.savingEllipsis : t.poReceiveStock}
          </button>
        </form>
      )}
    </div>
  )
}
