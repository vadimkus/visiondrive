'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicBarcodeField } from '@/components/clinic/ClinicBarcodeField'

type Procedure = { id: string; name: string }

export default function NewStockItemPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    unit: 'unit',
    reorderPoint: '0',
    initialQuantity: '0',
    consumePerVisit: '0',
    procedureId: '',
    batchNumber: '',
    batchExpiresAt: '',
    notes: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/clinic/procedures', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (!cancelled) {
        setProcedures((data.procedures || []).filter((p: { active: boolean }) => p.active))
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
      const res = await fetch('/api/clinic/inventory', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku.trim() || null,
          barcode: form.barcode.trim() || null,
          unit: form.unit.trim() || 'unit',
          reorderPoint: parseInt(form.reorderPoint, 10) || 0,
          initialQuantity: parseInt(form.initialQuantity, 10) || 0,
          consumePerVisit: parseInt(form.consumePerVisit, 10) || 0,
          procedureId: form.procedureId || null,
          batchNumber: form.batchNumber.trim() || null,
          batchExpiresAt: form.batchExpiresAt || null,
          notes: form.notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      const id = data.item?.id as string
      if (id) router.push(`/clinic/inventory/${id}`)
      else router.push('/clinic/inventory')
      router.refresh()
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/clinic/inventory" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          ← {t.inventory}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.newStockItemTitle}</h1>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockItemName}</label>
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockSku}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.barcodeLabel}</label>
          <ClinicBarcodeField
            value={form.barcode}
            onChange={(v) => setForm({ ...form, barcode: v })}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">{t.barcodeHint}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockUnit}</label>
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockReorderPoint}</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
            value={form.reorderPoint}
            onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">{t.stockReorderHint}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockInitialQty}</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
            value={form.initialQuantity}
            onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">{t.stockInitialHint}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockLinkProcedure}</label>
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11 bg-white"
            value={form.procedureId}
            onChange={(e) => setForm({ ...form, procedureId: e.target.value })}
          >
            <option value="">{t.emptyValue}</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.consumePerVisitLabel}</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
            value={form.consumePerVisit}
            onChange={(e) => setForm({ ...form, consumePerVisit: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">{t.consumePerVisitHint}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <h2 className="text-sm font-semibold text-sky-950">{t.injectableBatchTracking}</h2>
          <p className="mt-1 text-xs text-sky-800">{t.injectableBatchHint}</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.batchNumber}
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.batchExpiresAt}
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 min-h-11"
                value={form.batchExpiresAt}
                onChange={(e) => setForm({ ...form, batchExpiresAt: e.target.value })}
              />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.stockNotes}</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 min-h-11"
        >
          {loading ? t.savingEllipsis : t.addStockItem}
        </button>
      </form>
    </div>
  )
}
