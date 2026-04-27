'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type Supplier = {
  id: string
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  active: boolean
  summary: {
    orderedCents: number
    receivedCents: number
    paidCents: number
    outstandingCents: number
  }
  purchaseOrders: { id: string }[]
}

function money(cents: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function SuppliersPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    whatsapp: '',
    email: '',
    defaultPaymentTermsDays: '0',
    preferredReorderNote: '',
    notes: '',
  })

  const load = useCallback(async () => {
    const res = await fetch('/api/clinic/suppliers', { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.failedToLoad)
      setSuppliers([])
      return
    }
    setSuppliers(data.suppliers || [])
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/suppliers', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          defaultPaymentTermsDays: parseInt(form.defaultPaymentTermsDays, 10) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setForm({
        name: '',
        contactName: '',
        phone: '',
        whatsapp: '',
        email: '',
        defaultPaymentTermsDays: '0',
        preferredReorderNote: '',
        notes: '',
      })
      await load()
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
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div>
        <Link href="/clinic" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          {t.backDashboard}
        </Link>
        <div className="flex flex-wrap items-start gap-3 mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.supplierProfiles}</h1>
            <p className="text-sm text-gray-600 mt-1">{t.suppliersSubtitle}</p>
          </div>
          <Link
            href="/clinic/purchase-orders"
            className="ms-auto inline-flex min-h-11 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {t.purchaseOrders}
          </Link>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.newSupplier}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            {t.supplierName}
            <input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t.supplierContactName}
            <input
              value={form.contactName}
              onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t.supplierPhone}
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t.supplierWhatsapp}
            <input
              value={form.whatsapp}
              onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t.supplierEmail}
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t.supplierPaymentTerms}
            <input
              type="number"
              min={0}
              max={365}
              value={form.defaultPaymentTermsDays}
              onChange={(e) => setForm((prev) => ({ ...prev, defaultPaymentTermsDays: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-xl border border-gray-200 px-3 py-2.5"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          {t.supplierPreferredReorder}
          <textarea
            rows={2}
            value={form.preferredReorderNote}
            onChange={(e) => setForm((prev) => ({ ...prev, preferredReorderNote: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          {t.supplierNotes}
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? t.savingEllipsis : t.createSupplier}
        </button>
      </form>

      {suppliers.length === 0 ? (
        <ClinicEmptyState title={t.noSuppliers} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {suppliers.map((supplier) => (
              <li key={supplier.id} className="p-4 hover:bg-gray-50/80">
                <Link href={`/clinic/suppliers/${supplier.id}`} className="block">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{supplier.name}</span>
                    {supplier.contactName && <span className="text-sm text-gray-500">{supplier.contactName}</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {supplier.phone || supplier.email || t.emptyValue}
                    <span className="mx-2 text-gray-400">·</span>
                    {supplier.purchaseOrders.length} {t.purchaseOrders.toLowerCase()}
                    <span className="mx-2 text-gray-400">·</span>
                    {t.supplierSummaryOutstanding}: {money(supplier.summary.outstandingCents)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
