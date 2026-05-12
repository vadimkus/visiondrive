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

type StockRow = { id: string; name: string; unit: string; latestUnitCostCents: number | null; active: boolean }
type SupplierRow = { id: string; name: string }
type LineForm = { stockItemId: string; quantityOrdered: string; unitCost: string }

type Order = {
  id: string
  supplierName: string
  supplier: { id: string; name: string } | null
  reference: string | null
  notes: string | null
  status: string
  orderedAt: string
  expectedAt: string | null
  lines: Line[]
}

function formatMoney(cents: number, currency = 'AED') {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function centsToMajor(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toFixed(2)
}

function parseMajorToCents(value: string) {
  const parsed = Number.parseFloat(value.replace(',', '.') || '0')
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0
}

function datetimeLocalValue(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function linesFromOrder(order: Order): LineForm[] {
  return order.lines.map((line) => ({
    stockItemId: line.stockItem.id,
    quantityOrdered: String(line.quantityOrdered),
    unitCost: line.unitCostCents == null ? '' : centsToMajor(line.unitCostCents),
  }))
}

function canEditPurchaseOrderLines(order: Order) {
  return order.status !== 'CANCELLED' && order.lines.every((line) => line.quantityReceived === 0)
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id || '')
  const { t } = useClinicLocale()
  const [order, setOrder] = useState<Order | null>(null)
  const [stock, setStock] = useState<StockRow[]>([])
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [receiptNote, setReceiptNote] = useState('')
  const [receiveQty, setReceiveQty] = useState<Record<string, string>>({})
  const [editOpen, setEditOpen] = useState(false)
  const [editSupplierId, setEditSupplierId] = useState('')
  const [editSupplierName, setEditSupplierName] = useState('')
  const [editReference, setEditReference] = useState('')
  const [editExpectedAt, setEditExpectedAt] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editLines, setEditLines] = useState<LineForm[]>([])

  const load = useCallback(async () => {
    const [res, stockRes, suppliersRes] = await Promise.all([
      fetch(`/api/clinic/purchase-orders/${id}`, { credentials: 'include' }),
      fetch('/api/clinic/inventory', { credentials: 'include' }),
      fetch('/api/clinic/suppliers', { credentials: 'include' }),
    ])
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
    setEditSupplierId(o.supplier?.id ?? '')
    setEditSupplierName(o.supplier?.name ?? o.supplierName)
    setEditReference(o.reference ?? '')
    setEditExpectedAt(datetimeLocalValue(o.expectedAt))
    setEditNotes(o.notes ?? '')
    setEditLines(linesFromOrder(o))
    const init: Record<string, string> = {}
    for (const l of o.lines) {
      const remaining = l.quantityOrdered - l.quantityReceived
      init[l.id] = remaining > 0 ? String(Math.min(remaining, remaining)) : '0'
    }
    setReceiveQty(init)
    if (stockRes.ok) {
      const stockData = await stockRes.json()
      setStock((stockData.items || []).filter((item: StockRow) => item.active))
    }
    if (suppliersRes.ok) {
      const supplierData = await suppliersRes.json()
      setSuppliers(supplierData.suppliers || [])
    }
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

  const saveEdits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    const canEditLines = canEditPurchaseOrderLines(order)
    const bodyLines = editLines
      .filter((line) => line.stockItemId)
      .map((line) => {
        const quantityOrdered = parseInt(line.quantityOrdered, 10) || 0
        const unitCostCents = line.unitCost.trim() ? parseMajorToCents(line.unitCost) : null
        return {
          stockItemId: line.stockItemId,
          quantityOrdered,
          ...(unitCostCents != null && Number.isFinite(unitCostCents) ? { unitCostCents } : {}),
        }
      })

    if (canEditLines && bodyLines.length === 0) {
      setError(t.operationFailed)
      return
    }

    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/purchase-orders/${order.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: editSupplierId || null,
          supplierName: editSupplierName.trim(),
          reference: editReference.trim() || null,
          notes: editNotes.trim() || null,
          expectedAt: editExpectedAt ? new Date(editExpectedAt).toISOString() : null,
          ...(canEditLines ? { lines: bodyLines } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      const updated = data.order as Order
      setOrder(updated)
      setEditSupplierId(updated.supplier?.id ?? '')
      setEditSupplierName(updated.supplier?.name ?? updated.supplierName)
      setEditReference(updated.reference ?? '')
      setEditExpectedAt(datetimeLocalValue(updated.expectedAt))
      setEditNotes(updated.notes ?? '')
      setEditLines(linesFromOrder(updated))
      setEditOpen(false)
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
  const canEditLines = canEditPurchaseOrderLines(order)

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
        {order.supplier ? (
          <Link
            href={`/clinic/suppliers/${order.supplier.id}`}
            className="mt-2 inline-flex min-h-11 items-center text-gray-700 font-medium hover:text-orange-700"
          >
            {order.supplier.name}
          </Link>
        ) : (
          <p className="text-gray-700 mt-2 font-medium">{order.supplierName}</p>
        )}
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
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditOpen((open) => !open)}
          className="min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
        >
          {editOpen ? t.close : t.edit}
        </button>
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

      {editOpen && (
        <form
          onSubmit={saveEdits}
          className="bg-white rounded-2xl border border-orange-100 p-5 md:p-6 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.poEditOrder}</h2>
            {!canEditLines && (
              <p className="mt-1 text-sm text-amber-700">
                {t.poLinesLockedAfterReceipt}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.poSupplier}</label>
              <Link href="/clinic/suppliers" className="text-xs font-medium text-orange-600">
                {t.manageSuppliers}
              </Link>
            </div>
            <select
              className="mb-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 min-h-11"
              value={editSupplierId}
              onChange={(e) => {
                const nextId = e.target.value
                setEditSupplierId(nextId)
                const selected = suppliers.find((supplier) => supplier.id === nextId)
                if (selected) setEditSupplierName(selected.name)
              }}
            >
              <option value="">{t.chooseSupplierOptional}</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <input
              required={!editSupplierId}
              disabled={!!editSupplierId}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={editSupplierName}
              onChange={(e) => setEditSupplierName(e.target.value)}
              placeholder={editSupplierId ? t.useTypedSupplierName : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.poReference}</label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.poExpectedAt}</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
                value={editExpectedAt}
                onChange={(e) => setEditExpectedAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.poNotes}</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>

          {canEditLines && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-gray-900">{t.poLines}</h3>
                <button
                  type="button"
                  className="text-sm font-medium text-orange-600 min-h-11"
                  onClick={() =>
                    setEditLines([...editLines, { stockItemId: '', quantityOrdered: '1', unitCost: '' }])
                  }
                >
                  + {t.poAddLine}
                </button>
              </div>
              <div className="space-y-3">
                {editLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/80"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-xs text-gray-600 mb-1">{t.poStockItem}</label>
                      <select
                        required={idx === 0}
                        className="w-full rounded-xl border border-gray-200 px-2 py-2 min-h-11 bg-white text-sm"
                        value={line.stockItemId}
                        onChange={(e) => {
                          const stockItemId = e.target.value
                          const selected = stock.find((item) => item.id === stockItemId)
                          const next = [...editLines]
                          next[idx] = {
                            ...next[idx],
                            stockItemId,
                            unitCost:
                              selected?.latestUnitCostCents != null
                                ? centsToMajor(selected.latestUnitCostCents)
                                : next[idx].unitCost,
                          }
                          setEditLines(next)
                        }}
                      >
                        <option value="">{t.selectPlaceholder}</option>
                        {stock.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">{t.poQtyOrdered}</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-gray-200 px-2 py-2 min-h-11 text-sm"
                        value={line.quantityOrdered}
                        onChange={(e) => {
                          const next = [...editLines]
                          next[idx] = { ...next[idx], quantityOrdered: e.target.value }
                          setEditLines(next)
                        }}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">{t.poUnitCostAtOrder}</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-full rounded-xl border border-gray-200 px-2 py-2 min-h-11 text-sm"
                        value={line.unitCost}
                        onChange={(e) => {
                          const next = [...editLines]
                          next[idx] = { ...next[idx], unitCost: e.target.value }
                          setEditLines(next)
                        }}
                      />
                    </div>
                    <div className="sm:col-span-1 flex sm:items-end">
                      <button
                        type="button"
                        className="min-h-11 w-full rounded-xl text-sm text-gray-500 hover:text-red-600"
                        onClick={() => setEditLines(editLines.filter((_, lineIdx) => lineIdx !== idx))}
                        aria-label={t.removeMaterial}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="min-h-11 px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50"
            >
              {busy ? t.savingEllipsis : t.poSaveOrder}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditOpen(false)}
              className="min-h-11 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 disabled:opacity-50"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

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
                  {l.unitCostCents != null && (
                    <p className="mt-1 text-xs text-gray-500">
                      {t.poUnitCostAtOrder}: {formatMoney(l.unitCostCents)}
                      <span className="text-gray-300"> · </span>
                      {formatMoney(l.quantityOrdered * l.unitCostCents)}
                    </p>
                  )}
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
