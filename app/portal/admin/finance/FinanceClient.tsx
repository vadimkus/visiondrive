'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  RefreshCw, 
  Plus, 
  Download,
  CreditCard,
  Wallet,
  PieChart,
  Users,
  Percent,
  Calendar,
  Tag,
  Building,
  FileText,
  Loader2
} from 'lucide-react'

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
      <Section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600 text-lg">Loading financial data...</span>
        </div>
      </Section>
    )
  }

  const k = overview?.kpis || {}
  const currency = 'AED'

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
            <p className="text-gray-600">Revenue tracking, expense management, and profitability metrics</p>
          </div>
          <button 
            onClick={load}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                Tenant Filter
              </label>
              <select 
                value={tenantId} 
                onChange={(e) => setTenantId(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="all">All Tenants</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Start Date
              </label>
              <input 
                value={start} 
                onChange={(e) => setStart(e.target.value)} 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                End Date
              </label>
              <input 
                value={end} 
                onChange={(e) => setEnd(e.target.value)} 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              <strong>Stripe Integration:</strong> Webhook endpoint at{' '}
              <code className="font-mono bg-blue-100 px-2 py-0.5 rounded">/ api/webhooks/stripe</code>
              {' '}(requires{' '}
              <code className="font-mono bg-blue-100 px-2 py-0.5 rounded">STRIPE_WEBHOOK_SECRET</code>)
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Net Revenue</div>
            <div className="text-2xl font-bold text-green-700">{fmtMoney(k.netRevenueCents || 0, currency)}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <Users className="h-3 w-3" />
              <span>{k.activeSubs || 0} active subs</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Receipt className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Expenses</div>
            <div className="text-2xl font-bold text-red-700">{fmtMoney(k.expensesCents || 0, currency)}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <Percent className="h-3 w-3" />
              <span>Churn: {k.churnRatePct || 0}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Net Profit</div>
            <div className="text-2xl font-bold text-blue-700">{fmtMoney(k.profitCents || 0, currency)}</div>
            <div className="mt-2 text-xs text-gray-600">
              {((k.profitCents / (k.netRevenueCents || 1)) * 100).toFixed(1)}% margin
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">MRR / ARR</div>
            <div className="text-lg font-bold text-purple-700">{fmtMoney(k.mrrCents || 0, currency)}</div>
            <div className="mt-1 text-xs text-gray-600">
              ARR: {fmtMoney(k.arrCents || 0, currency)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Expenses */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Wallet className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Expense Tracking</h2>
                    <p className="text-sm text-gray-600">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
                  </div>
                </div>
                <a
                  href={`/api/portal/admin/finance/expenses?${qs}&limit=500`}
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </a>
              </div>
            </div>

            <div className="p-6">
              {/* Add Expense Form */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Expense
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Category
                    </label>
                    <select 
                      value={expCategory} 
                      onChange={(e) => setExpCategory(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                    >
                      {['CLOUD','HARDWARE','OPS','SUPPORT','MARKETING','SOFTWARE','OTHER'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Amount (AED)
                    </label>
                    <input 
                      value={expAmountAed} 
                      onChange={(e) => setExpAmountAed(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      Vendor
                    </label>
                    <input 
                      value={expVendor} 
                      onChange={(e) => setExpVendor(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                      placeholder="e.g., AWS, Azure"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </label>
                    <input 
                      value={expDate} 
                      onChange={(e) => setExpDate(e.target.value)} 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Description
                    </label>
                    <input 
                      value={expDesc} 
                      onChange={(e) => setExpDesc(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                      placeholder="Optional details"
                    />
                  </div>
                </div>

                <button
                  onClick={addExpense}
                  disabled={busy === 'addExpense'}
                  className="mt-3 inline-flex items-center px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg font-medium"
                >
                  {busy === 'addExpense' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Expense
                </button>
              </div>

              {/* Expenses Table */}
              <div className="overflow-auto border border-gray-200 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 30).map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">
                          {e.occurredAt ? new Date(e.occurredAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{e.vendor || '—'}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {fmtMoney(e.amountCents, e.currency || 'AED')}
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No expenses in selected range</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Billing Events */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Stripe Billing Events</h2>
                    <p className="text-sm text-gray-600">{billing.length} event{billing.length !== 1 ? 's' : ''} received</p>
                  </div>
                </div>
                <a
                  href={`/api/portal/admin/finance/billing-events?${qs}&limit=500`}
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </a>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  Configure Stripe webhooks to track invoice payments, subscriptions, refunds, and more.
                </p>
              </div>

              <div className="overflow-auto border border-gray-200 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Time</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing.slice(0, 40).map((b: any) => (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">
                          {b.occurredAt ? new Date(b.occurredAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-900">
                            {b.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {typeof b.amountCents === 'number' ? fmtMoney(b.amountCents, b.currency || 'AED') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            b.status === 'succeeded' || b.status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : b.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {b.status || 'unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {billing.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No billing events yet</p>
                          <p className="text-sm text-gray-400 mt-1">Connect Stripe webhook to see data</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}


