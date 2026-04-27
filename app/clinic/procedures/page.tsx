'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type Procedure = {
  id: string
  name: string
  defaultDurationMin: number
  bufferAfterMinutes: number
  basePriceCents: number
  currency: string
  active: boolean
  materials: ProcedureMaterial[]
}

type ProcedureMaterial = {
  id: string
  quantityPerVisit: number
  unitCostCents: number
  active: boolean
  note: string | null
  stockItem: {
    id: string
    name: string
    unit: string
    quantityOnHand: number
    active: boolean
  }
}

type StockItem = {
  id: string
  name: string
  unit: string
  quantityOnHand: number
  active: boolean
}

type MaterialForm = {
  stockItemId: string
  quantityPerVisit: string
  unitCost: string
  note: string
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function parseMajorToCents(value: string) {
  const parsed = Number.parseFloat(value || '0')
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0
}

function materialCost(materials: ProcedureMaterial[]) {
  return materials
    .filter((material) => material.active)
    .reduce((sum, material) => sum + material.quantityPerVisit * material.unitCostCents, 0)
}

export default function ClinicProceduresPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [forms, setForms] = useState<Record<string, MaterialForm>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [procedureRes, inventoryRes] = await Promise.all([
        fetch('/api/clinic/procedures', { credentials: 'include' }),
        fetch('/api/clinic/inventory', { credentials: 'include' }),
      ])
      if (procedureRes.status === 401 || inventoryRes.status === 401) {
        router.replace('/login')
        return
      }
      const procedureData = await procedureRes.json()
      const inventoryData = await inventoryRes.json()
      if (!procedureRes.ok || !inventoryRes.ok) {
        setError(procedureData.error || inventoryData.error || t.failedToLoad)
        return
      }
      setProcedures(procedureData.procedures || [])
      setStockItems((inventoryData.items || []).filter((item: StockItem) => item.active))
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [router, t.failedToLoad, t.networkError])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await load()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  function updateForm(procedureId: string, patch: Partial<MaterialForm>) {
    const defaultForm = { stockItemId: '', quantityPerVisit: '1', unitCost: '0', note: '' }
    setForms((current) => ({
      ...current,
      [procedureId]: {
        ...defaultForm,
        ...current[procedureId],
        ...patch,
      },
    }))
  }

  async function saveMaterial(procedureId: string) {
    const form = forms[procedureId]
    if (!form?.stockItemId) {
      alert(t.materialItemRequired)
      return
    }
    setBusy(procedureId)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedureId}/materials`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockItemId: form.stockItemId,
          quantityPerVisit: Number.parseInt(form.quantityPerVisit || '1', 10),
          unitCostCents: parseMajorToCents(form.unitCost),
          note: form.note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      setForms((current) => ({
        ...current,
        [procedureId]: { stockItemId: '', quantityPerVisit: '1', unitCost: '0', note: '' },
      }))
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function removeMaterial(procedureId: string, materialId: string) {
    setBusy(materialId)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedureId}/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.procedures}</h1>
          <p className="text-gray-600 text-sm mt-1">{t.proceduresCatalogSubtitle}</p>
        </div>
        <Link
          href="/clinic/procedures/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          {t.addProcedure}
        </Link>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        {[...procedures]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => {
            const form = forms[p.id] ?? { stockItemId: '', quantityPerVisit: '1', unitCost: '0', note: '' }
            const cost = materialCost(p.materials || [])
            return (
              <article key={p.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
                      {p.active ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {t.statusActive}
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          {t.statusInactive}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {p.defaultDurationMin} {t.minutesAbbr} · {t.appointmentBuffer}: {p.bufferAfterMinutes || 0}{' '}
                      {t.minutesAbbr} · {formatMoney(p.basePriceCents, p.currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-purple-50 px-4 py-3 text-purple-950">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{t.materialCost}</p>
                    <p className="mt-1 text-xl font-semibold">{formatMoney(cost, p.currency)}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.billOfMaterials}</h3>
                      <p className="text-xs text-gray-500">{t.materialCostHint}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {p.materials?.length ? (
                      p.materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{material.stockItem.name}</p>
                            <p className="text-xs text-gray-500">
                              {material.quantityPerVisit} {material.stockItem.unit} ·{' '}
                              {formatMoney(material.unitCostCents, p.currency)} / {material.stockItem.unit} ·{' '}
                              {t.stockOnHand}: {material.stockItem.quantityOnHand}
                            </p>
                            {material.note && <p className="mt-1 text-xs text-gray-500">{material.note}</p>}
                          </div>
                          <button
                            type="button"
                            disabled={busy === material.id}
                            onClick={() => void removeMaterial(p.id, material.id)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            {t.removeMaterial}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                        {t.noMaterialsYet}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_0.6fr_0.7fr_1fr_auto]">
                    <select
                      value={form.stockItemId}
                      onChange={(e) => updateForm(p.id, { stockItemId: e.target.value })}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900"
                    >
                      <option value="">{t.materialItem}</option>
                      {stockItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantityOnHand} {item.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.quantityPerVisit}
                      onChange={(e) => updateForm(p.id, { quantityPerVisit: e.target.value })}
                      inputMode="numeric"
                      placeholder={t.quantityPerVisit}
                      className="min-h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-900"
                    />
                    <input
                      value={form.unitCost}
                      onChange={(e) => updateForm(p.id, { unitCost: e.target.value })}
                      inputMode="decimal"
                      placeholder={t.unitCost}
                      className="min-h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-900"
                    />
                    <input
                      value={form.note}
                      onChange={(e) => updateForm(p.id, { note: e.target.value })}
                      placeholder={t.note}
                      className="min-h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      disabled={busy === p.id || stockItems.length === 0}
                      onClick={() => void saveMaterial(p.id)}
                      className="min-h-11 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {busy === p.id ? t.savingEllipsis : t.saveMaterial}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        {procedures.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
            {t.noProceduresEmpty}
          </div>
        )}
      </div>
    </div>
  )
}
