'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, DollarSign, TrendingUp, Receipt, RefreshCw, Plus, Download } from 'lucide-react'

function fmtMoney(cents: number, currency = 'AED') {
  const v = (cents || 0) / 100
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(v)
  } catch {
    return `${currency} ${v.toFixed(2)}`
  }
}

function toIsoInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function FinanceClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState<any[]>([])
  const [tenantId, setTenantId] = useState('all')
  const [start, setStart] = useState(() => toIsoInput(new Date(Date.now() - 30 * 24 * 3600 * 1000)))
  const [end, setEnd] = useState(() => toIsoInput(new Date()))

  const [overview, setOverview] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [billing, setBilling] = useState<any[]>([])

  // add expense form
  const [expCategory, setExpCategory] = useState('CLOUD')
  const [expVendor, setExpVendor] = useState('')
  const [expDesc, setExpDesc] = useState('')
  const [expAmountAed, setExpAmountAed] = useState('100')
  const [expDate, setExpDate] = useState(() => toIsoInput(new Date()))
  const [busy, setBusy] = useState<string | null>(null)

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    q.set('tenantId', tenantId)
    q.set('start', new Date(start).toISOString())
    q.set('end', new Date(end).toISOString())
    return q.toString()
  }, [tenantId, start, end])

  const load = async () => {
    setLoading(true)
    try {
      const me = await fetch('/api/auth/me', { credentials: 'include' })
      const meJson = await me.json().catch(() => ({}))
      if (!me.ok) {
        router.push('/login')
        return
      }
      if (meJson?.user?.role !== 'MASTER_ADMIN') {
        router.push('/portal')
        return
      }

      const [tRes, oRes, eRes, bRes] = await Promise.all([
        fetch('/api/portal/admin/tenants', { credentials: 'include' }),
        fetch(`/api/portal/admin/finance/overview?${qs}`, { credentials: 'include' }),
        fetch(`/api/portal/admin/finance/expenses?${qs}&limit=200`, { credentials: 'include' }),
        fetch(`/api/portal/admin/finance/billing-events?${qs}&limit=100`, { credentials: 'include' }),
      ])
      const tJson = await tRes.json()
      const oJson = await oRes.json()
      const eJson = await eRes.json()
      const bJson = await bRes.json()

      if (tJson.success) setTenants(tJson.tenants || [])
      if (oJson.success) setOverview(oJson)
      if (eJson.success) setExpenses(eJson.items || [])
      if (bJson.success) setBilling(bJson.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  const addExpense = async () => {
    setBusy('addExpense')
    try {
      const amountCents = Math.round(Number(expAmountAed) * 100)
      const occurredAt = new Date(expDate + 'T12:00:00Z').toISOString()
      const res = await fetch('/api/portal/admin/finance/expenses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId === 'all' ? null : tenantId,
          category: expCategory,
          vendor: expVendor || null,
          description: expDesc || null,
          currency: 'AED',
          amountCents,
          occurredAt,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to add expense')
        return
      }
      setExpVendor('')
      setExpDesc('')
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (loading && !overview) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  const k = overview?.kpis || {}
  const currency = 'AED'

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/portal/admin/tenants')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Master Admin
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finance (Master Admin)</h1>
            <p className="text-sm text-gray-600">Stripe billing metrics + expenses tracking → net margin + unit economics.</p>
          </div>
          <button onClick={load} className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tenant</label>
              <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="all">All tenants</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
              <input value={start} onChange={(e) => setStart(e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
              <input value={end} onChange={(e) => setEnd(e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Stripe ingestion endpoint: <span className="font-mono">/api/webhooks/stripe</span> (requires <span className="font-mono">STRIPE_WEBHOOK_SECRET</span>).
          </p>
        </div>

        {/* KPI cards (Flowly-style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: DollarSign, label: 'Net Revenue', value: fmtMoney(k.netRevenueCents || 0, currency), color: 'text-green-700' },
            { icon: Receipt, label: 'Expenses', value: fmtMoney(k.expensesCents || 0, currency), color: 'text-red-700' },
            { icon: TrendingUp, label: 'Profit', value: fmtMoney(k.profitCents || 0, currency), color: 'text-gray-900' },
            { icon: TrendingUp, label: 'MRR / ARR', value: `${fmtMoney(k.mrrCents || 0, currency)} / ${fmtMoney(k.arrCents || 0, currency)}`, color: 'text-indigo-700' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-600">{c.label}</div>
                    <div className="text-xl font-bold text-gray-900">{c.value}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Active subs: {k.activeSubs || 0} · Churn: {k.churnRatePct || 0}%
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${c.color}`} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Expenses */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Expenses</h2>
              <a
                href={`/api/portal/admin/finance/expenses?${qs}&limit=500`}
                className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  {['CLOUD','HARDWARE','OPS','SUPPORT','MARKETING','SOFTWARE','OTHER'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount (AED)</label>
                <input value={expAmountAed} onChange={(e) => setExpAmountAed(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vendor</label>
                <input value={expVendor} onChange={(e) => setExpVendor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input value={expDate} onChange={(e) => setExpDate(e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <button
              onClick={addExpense}
              disabled={busy === 'addExpense'}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add expense
            </button>

            <div className="mt-4 overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">When</th>
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-left px-3 py-2">Vendor</th>
                    <th className="text-left px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 30).map((e: any) => (
                    <tr key={e.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-600">{e.occurredAt ? new Date(e.occurredAt).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2 text-gray-900 font-medium">{e.category}</td>
                      <td className="px-3 py-2 text-gray-700">{e.vendor || '—'}</td>
                      <td className="px-3 py-2 text-gray-900 font-semibold">{fmtMoney(e.amountCents, e.currency || 'AED')}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-gray-500">No expenses in range</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing events */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Stripe billing events</h2>
              <a
                href={`/api/portal/admin/finance/billing-events?${qs}&limit=500`}
                className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                JSON
              </a>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Once Stripe webhooks are configured, you’ll see invoice payments, subscriptions, refunds, etc.
            </div>
            <div className="overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Amount</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.slice(0, 40).map((b: any) => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-600">{b.occurredAt ? new Date(b.occurredAt).toLocaleString() : '—'}</td>
                      <td className="px-3 py-2 font-mono text-gray-900">{b.type}</td>
                      <td className="px-3 py-2 text-gray-900">
                        {typeof b.amountCents === 'number' ? fmtMoney(b.amountCents, b.currency || 'AED') : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{b.status || '—'}</td>
                    </tr>
                  ))}
                  {billing.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-gray-500">No billing events yet (webhook not connected)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}


