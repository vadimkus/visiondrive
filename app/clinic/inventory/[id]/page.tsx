'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicBarcodeField } from '@/components/clinic/ClinicBarcodeField'

type Procedure = { id: string; name: string }

type Movement = {
  id: string
  type: string
  quantityDelta: number
  note: string | null
  reference: string | null
  createdAt: string
}

type Item = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  unit: string
  quantityOnHand: number
  reorderPoint: number
  consumePerVisit: number
  active: boolean
  notes: string | null
  procedureId: string | null
  procedure: { id: string; name: string } | null
  lowStock: boolean
  movements: Movement[]
}

export default function StockItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id || '')
  const { t } = useClinicLocale()
  const [item, setItem] = useState<Item | null>(null)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [moveLoading, setMoveLoading] = useState(false)

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [unit, setUnit] = useState('')
  const [reorderPoint, setReorderPoint] = useState('')
  const [procedureId, setProcedureId] = useState('')
  const [active, setActive] = useState(true)
  const [notes, setNotes] = useState('')
  const [barcode, setBarcode] = useState('')
  const [consumePerVisit, setConsumePerVisit] = useState('0')

  const [movType, setMovType] = useState('RECEIPT')
  const [movDelta, setMovDelta] = useState('1')
  const [movNote, setMovNote] = useState('')
  const [movRef, setMovRef] = useState('')

  const load = useCallback(async () => {
    const [iRes, pRes] = await Promise.all([
      fetch(`/api/clinic/inventory/${id}`, { credentials: 'include' }),
      fetch('/api/clinic/procedures', { credentials: 'include' }),
    ])
    if (iRes.status === 401) {
      router.replace('/login')
      return
    }
    const data = await iRes.json()
    if (!iRes.ok) {
      setError(data.error || t.notFound)
      setItem(null)
      return
    }
    const it = data.item as Item
    setItem(it)
    setName(it.name)
    setSku(it.sku ?? '')
    setUnit(it.unit)
    setReorderPoint(String(it.reorderPoint))
    setProcedureId(it.procedureId ?? '')
    setActive(it.active)
    setNotes(it.notes ?? '')
    setBarcode(it.barcode ?? '')
    setConsumePerVisit(String(it.consumePerVisit ?? 0))
    setError('')

    if (pRes.ok) {
      const pj = await pRes.json()
      setProcedures((pj.procedures || []).filter((p: { active: boolean }) => p.active))
    }
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

  const saveMeta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/inventory/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku: sku.trim() || null,
          unit: unit.trim() || 'unit',
          reorderPoint: parseInt(reorderPoint, 10) || 0,
          procedureId: procedureId || null,
          active,
          notes: notes.trim() || null,
          barcode: barcode.trim() || null,
          consumePerVisit: parseInt(consumePerVisit, 10) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setItem((prev) =>
        prev
          ? {
              ...prev,
              ...data.item,
              movements: prev.movements,
            }
          : null
      )
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  const recordMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    setMoveLoading(true)
    setError('')
    try {
      const delta = parseInt(movDelta, 10)
      if (!Number.isFinite(delta) || delta === 0) {
        setError(t.operationFailed)
        setMoveLoading(false)
        return
      }
      const res = await fetch(`/api/clinic/inventory/${item.id}/movements`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: movType,
          quantityDelta: delta,
          note: movNote.trim() || null,
          reference: movRef.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setItem((prev) =>
        prev
          ? {
              ...prev,
              ...data.item,
              movements: [{ ...data.movement }, ...prev.movements].slice(0, 100),
            }
          : null
      )
      setMovNote('')
      setMovRef('')
    } catch {
      setError(t.networkError)
    } finally {
      setMoveLoading(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} />
  }

  if (error && !item) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <ClinicAlert variant="error">{error}</ClinicAlert>
        <Link href="/clinic/inventory" className="text-orange-600 text-sm min-h-11 inline-flex items-center">
          ← {t.inventory}
        </Link>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <div>
        <Link href="/clinic/inventory" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          ← {t.inventory}
        </Link>
        <div className="flex flex-wrap items-start gap-3 mt-2">
          <h1 className="text-2xl font-semibold text-gray-900">{item.name}</h1>
          {item.lowStock && (
            <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900">
              {t.lowStock}
            </span>
          )}
        </div>
        <p className="text-gray-700 mt-2">
          <span className="font-medium">{t.stockOnHand}:</span>{' '}
          <span className="tabular-nums">
            {item.quantityOnHand} {item.unit}
          </span>
        </p>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <form
        onSubmit={recordMovement}
        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">{t.recordMovement}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.movementType}</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 bg-white min-h-11"
              value={movType}
              onChange={(e) => setMovType(e.target.value)}
            >
              <option value="RECEIPT">{t.movementReceipt}</option>
              <option value="ADJUSTMENT">{t.movementAdjustment}</option>
              <option value="CONSUMPTION">{t.movementConsumption}</option>
              <option value="RETURN">{t.movementReturn}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.quantityDelta}</label>
            <input
              type="number"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={movDelta}
              onChange={(e) => setMovDelta(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">{t.quantityDeltaHint}</p>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.movementNote}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={movNote}
            onChange={(e) => setMovNote(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.movementReference}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={movRef}
            onChange={(e) => setMovRef(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={moveLoading}
          className="w-full sm:w-auto min-h-11 px-5 py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50"
        >
          {moveLoading ? t.savingEllipsis : t.recordMovement}
        </button>
      </form>

      <form
        onSubmit={saveMeta}
        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">{t.stockItemDetail}</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.stockItemName}</label>
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.stockSku}</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t.stockUnit}</label>
            <input
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.barcodeLabel}</label>
          <ClinicBarcodeField value={barcode} onChange={setBarcode} disabled={saving} />
          <p className="text-xs text-gray-500 mt-1">{t.barcodeHint}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.consumePerVisitLabel}</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={consumePerVisit}
            onChange={(e) => setConsumePerVisit(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">{t.consumePerVisitHint}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.stockReorderPoint}</label>
          <input
            type="number"
            min={0}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11"
            value={reorderPoint}
            onChange={(e) => setReorderPoint(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.stockLinkProcedure}</label>
          <select
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 min-h-11 bg-white"
            value={procedureId}
            onChange={(e) => setProcedureId(e.target.value)}
          >
            <option value="">{t.emptyValue}</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 min-h-11 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-gray-300 text-orange-600"
          />
          {t.statusActive}
        </label>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t.stockNotes}</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto min-h-11 px-5 py-3 rounded-xl border border-gray-200 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? t.savingEllipsis : t.saveStockItem}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-5 py-4 border-b border-gray-100">
          {t.stockLastMovements}
        </h2>
        {item.movements.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">{t.noMovementsYet}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {item.movements.map((m) => (
              <li key={m.id} className="px-5 py-3 text-sm">
                <p className="font-medium text-gray-900">
                  {m.type} · {m.quantityDelta > 0 ? '+' : ''}
                  {m.quantityDelta}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
                {(m.note || m.reference) && (
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                    {[m.reference, m.note].filter(Boolean).join(' · ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
