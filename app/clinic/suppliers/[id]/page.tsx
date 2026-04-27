'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type PurchaseOrderLine = {
  id: string
  quantityOrdered: number
  quantityReceived: number
  unitCostCents: number | null
  stockItem: { id: string; name: string; unit: string; sku: string | null }
}

type PurchaseOrder = {
  id: string
  status: string
  reference: string | null
  orderedAt: string
  expectedAt: string | null
  lines: PurchaseOrderLine[]
}

type Settlement = {
  id: string
  amountCents: number
  currency: string
  method: string | null
  reference: string | null
  note: string | null
  paidAt: string
}

type Supplier = {
  id: string
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  preferredReorderNote: string | null
  notes: string | null
  defaultPaymentTermsDays: number
  purchaseOrders: PurchaseOrder[]
  settlements: Settlement[]
  summary: {
    orderedCents: number
    receivedCents: number
    paidCents: number
    outstandingCents: number
  }
}

function money(cents: number, currency = 'AED') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function orderCost(order: PurchaseOrder) {
  return order.lines.reduce((sum, line) => sum + line.quantityReceived * (line.unitCostCents ?? 0), 0)
}

export default function SupplierDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id || '')
  const { t } = useClinicLocale()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [settlement, setSettlement] = useState({
    amountCents: '',
    paidAt: new Date().toISOString().slice(0, 16),
    method: '',
    reference: '',
    note: '',
  })

  const load = useCallback(async () => {
    const res = await fetch(`/api/clinic/suppliers/${id}`, { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.notFound)
      setSupplier(null)
      return
    }
    setSupplier(data.supplier)
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
  }, [id, load, t.networkError])

  const recordSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/clinic/suppliers/${id}/settlements`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: parseInt(settlement.amountCents, 10) || 0,
          paidAt: settlement.paidAt ? new Date(settlement.paidAt).toISOString() : null,
          method: settlement.method.trim() || null,
          reference: settlement.reference.trim() || null,
          note: settlement.note.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setSupplier(data.supplier)
      setSettlement({
        amountCents: '',
        paidAt: new Date().toISOString().slice(0, 16),
        method: '',
        reference: '',
        note: '',
      })
      setMessage(t.supplierSettlementRecorded)
    } catch {
      setError(t.networkError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  if (error && !supplier) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <ClinicAlert variant="error">{error}</ClinicAlert>
        <Link href="/clinic/suppliers" className="text-sm text-orange-600 min-h-11 inline-flex items-center">
          {t.suppliers}
        </Link>
      </div>
    )
  }

  if (!supplier) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div>
        <Link href="/clinic/suppliers" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          ← {t.suppliers}
        </Link>
        <div className="mt-2 flex flex-wrap items-start gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{supplier.name}</h1>
            <p className="mt-1 text-sm text-gray-600">{t.supplierDetail}</p>
          </div>
          <Link
            href="/clinic/purchase-orders/new"
            className="ms-auto inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
          >
            {t.newPurchaseOrder}
          </Link>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {message && <ClinicAlert variant="success">{message}</ClinicAlert>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          [t.supplierSummaryOrdered, supplier.summary.orderedCents],
          [t.supplierSummaryReceived, supplier.summary.receivedCents],
          [t.supplierSummaryPaid, supplier.summary.paidCents],
          [t.supplierSummaryOutstanding, supplier.summary.outstandingCents],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{money(Number(value))}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">{t.supplierContactName}</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">{t.supplierContactName}</dt>
              <dd className="font-medium text-gray-900">{supplier.contactName || t.emptyValue}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t.supplierPhone}</dt>
              <dd className="font-medium text-gray-900">{supplier.phone || t.emptyValue}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t.supplierWhatsapp}</dt>
              <dd className="font-medium text-gray-900">{supplier.whatsapp || t.emptyValue}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t.supplierEmail}</dt>
              <dd className="font-medium text-gray-900">{supplier.email || t.emptyValue}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t.supplierPaymentTerms}</dt>
              <dd className="font-medium text-gray-900">{supplier.defaultPaymentTermsDays}</dd>
            </div>
          </dl>
          {supplier.preferredReorderNote && (
            <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-950 whitespace-pre-wrap">
              {supplier.preferredReorderNote}
            </p>
          )}
          {supplier.notes && <p className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t.supplierRecordSettlement}</h2>
          <form onSubmit={recordSettlement} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.supplierSettlementAmount}
              <input
                required
                type="number"
                min={1}
                value={settlement.amountCents}
                onChange={(e) => setSettlement((prev) => ({ ...prev, amountCents: e.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.supplierSettlementDate}
              <input
                type="datetime-local"
                value={settlement.paidAt}
                onChange={(e) => setSettlement((prev) => ({ ...prev, paidAt: e.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.supplierSettlementMethod}
              <input
                value={settlement.method}
                onChange={(e) => setSettlement((prev) => ({ ...prev, method: e.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t.supplierSettlementReference}
              <input
                value={settlement.reference}
                onChange={(e) => setSettlement((prev) => ({ ...prev, reference: e.target.value }))}
                className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              {t.supplierSettlementNote}
              <textarea
                rows={2}
                value={settlement.note}
                onChange={(e) => setSettlement((prev) => ({ ...prev, note: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? t.savingEllipsis : t.supplierRecordSettlement}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <h2 className="px-5 py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">
          {t.supplierPurchaseHistory}
        </h2>
        {supplier.purchaseOrders.length === 0 ? (
          <div className="p-5">
            <ClinicEmptyState title={t.supplierNoPurchaseHistory} />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {supplier.purchaseOrders.map((order) => (
              <li key={order.id} className="p-5 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/clinic/purchase-orders/${order.id}`} className="font-semibold text-orange-700">
                      {order.reference || order.id}
                    </Link>
                    <p className="mt-1 text-gray-600">
                      {new Date(order.orderedAt).toLocaleDateString()} · {order.status}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{money(orderCost(order))}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {order.lines.map((line) => line.stockItem.name).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <h2 className="px-5 py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">
          {t.supplierSettlementHistory}
        </h2>
        {supplier.settlements.length === 0 ? (
          <div className="p-5">
            <ClinicEmptyState title={t.supplierNoSettlements} />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {supplier.settlements.map((row) => (
              <li key={row.id} className="p-5 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{row.reference || row.method || t.emptyValue}</p>
                    <p className="mt-1 text-gray-600">{new Date(row.paidAt).toLocaleString()}</p>
                    {row.note && <p className="mt-1 text-gray-600 whitespace-pre-wrap">{row.note}</p>}
                  </div>
                  <p className="font-semibold text-gray-900">{money(row.amountCents, row.currency)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
