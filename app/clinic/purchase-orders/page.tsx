'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'

type Line = {
  id: string
  quantityOrdered: number
  quantityReceived: number
  stockItem: { name: string; unit: string }
}

type Order = {
  id: string
  supplierName: string
  supplier: { id: string; name: string } | null
  reference: string | null
  status: string
  orderedAt: string
  expectedAt: string | null
  lines: Line[]
}

function statusClass(status: string): string {
  switch (status) {
    case 'RECEIVED':
      return 'bg-emerald-100 text-emerald-900'
    case 'PARTIALLY_RECEIVED':
      return 'bg-sky-100 text-sky-900'
    case 'ORDERED':
      return 'bg-blue-100 text-blue-900'
    case 'CANCELLED':
      return 'bg-gray-200 text-gray-700'
    default:
      return 'bg-amber-100 text-amber-900'
  }
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/clinic/purchase-orders', { credentials: 'include' })
    if (res.status === 401) {
      router.replace('/login')
      return
    }
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.failedToLoad)
      setOrders([])
      return
    }
    setOrders(data.orders || [])
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

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/clinic" className="text-sm text-orange-600 hover:text-orange-700 min-h-11 inline-flex items-center">
          {t.backDashboard}
        </Link>
        <div className="flex flex-wrap items-start gap-3 mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.purchaseOrders}</h1>
            <p className="text-gray-600 text-sm mt-1">{t.purchaseOrdersSubtitle}</p>
          </div>
          <Link
            href="/clinic/purchase-orders/new"
            className="ms-auto inline-flex items-center min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
          >
            {t.newPurchaseOrder}
          </Link>
          <Link
            href="/clinic/suppliers"
            className="inline-flex items-center min-h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm font-semibold hover:bg-gray-50"
          >
            {t.suppliers}
          </Link>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      {orders.length === 0 ? (
        <ClinicEmptyState title={t.poNoOrders} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="p-4 hover:bg-gray-50/80">
                <Link href={`/clinic/purchase-orders/${o.id}`} className="block min-h-11">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{o.supplier?.name ?? o.supplierName}</span>
                    <span
                      className={clsx(
                        'inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold',
                        statusClass(o.status)
                      )}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {o.reference || t.emptyValue}
                    <span className="text-gray-400 mx-2">·</span>
                    {new Date(o.orderedAt).toLocaleDateString()}
                    {o.lines.length > 0 && (
                      <>
                        <span className="text-gray-400 mx-2">·</span>
                        {o.lines.length} {t.poLines.toLowerCase()}
                      </>
                    )}
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
