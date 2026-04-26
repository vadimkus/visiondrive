'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'

type StockRow = { id: string; name: string; unit: string }

type LineForm = { stockItemId: string; quantityOrdered: string; unitCostCents: string }

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [stock, setStock] = useState<StockRow[]>([])
  const [supplierName, setSupplierName] = useState('')
  const [reference, setReference] = useState('')
  const [expectedAt, setExpectedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineForm[]>([
    { stockItemId: '', quantityOrdered: '1', unitCostCents: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/clinic/inventory', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setStock((data.items || []).filter((i: { active: boolean }) => i.active))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const bodyLines = lines
        .filter((l) => l.stockItemId)
        .map((l) => {
          const q = parseInt(l.quantityOrdered, 10) || 0
          const c = l.unitCostCents.trim() ? parseInt(l.unitCostCents, 10) : null
          return {
            stockItemId: l.stockItemId,
            quantityOrdered: q,
            ...(c != null && Number.isFinite(c) ? { unitCostCents: c } : {}),
          }
        })
      if (bodyLines.length === 0) {
        setError(t.operationFailed)
        setLoading(false)
        return
      }
      const res = await fetch('/api/clinic/purchase-orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: supplierName.trim(),
          reference: reference.trim() || null,
          notes: notes.trim() || null,
          expectedAt: expectedAt ? new Date(expectedAt).toISOString() : null,
          status: 'DRAFT',
          lines: bodyLines,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      const id = data.order?.id as string
      if (id) router.push(`/clinic/purchase-orders/${id}`)
      else router.push('/clinic/purchase-orders')
      router.refresh()
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div>
        <Link
          href="/clinic/purchase-orders"
          className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center"
        >
          {t.backToPurchaseOrders}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.newPurchaseOrder}</h1>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.poSupplier}</label>
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.poReference}</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.poExpectedAt}</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.poNotes}</label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{t.poLines}</h2>
            <button
              type="button"
              className="text-sm font-medium text-orange-600 min-h-11"
              onClick={() =>
                setLines([...lines, { stockItemId: '', quantityOrdered: '1', unitCostCents: '' }])
              }
            >
              + {t.poAddLine}
            </button>
          </div>
          <div className="space-y-3">
            {lines.map((line, idx) => (
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
                      const next = [...lines]
                      next[idx] = { ...next[idx], stockItemId: e.target.value }
                      setLines(next)
                    }}
                  >
                    <option value="">{t.selectPlaceholder}</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.unit})
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
                      const next = [...lines]
                      next[idx] = { ...next[idx], quantityOrdered: e.target.value }
                      setLines(next)
                    }}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs text-gray-600 mb-1">{t.poUnitCostOptional}</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-xl border border-gray-200 px-2 py-2 min-h-11 text-sm"
                    value={line.unitCostCents}
                    onChange={(e) => {
                      const next = [...lines]
                      next[idx] = { ...next[idx], unitCostCents: e.target.value }
                      setLines(next)
                    }}
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="w-full min-h-11 text-sm text-red-600"
                      onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto min-h-11 px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50"
        >
          {loading ? t.savingEllipsis : t.save}
        </button>
      </form>
    </div>
  )
}
