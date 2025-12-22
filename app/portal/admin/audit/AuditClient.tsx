'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

function toIsoInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function AuditClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])

  const [tenantId, setTenantId] = useState('all')
  const [start, setStart] = useState(() => toIsoInput(new Date(Date.now() - 7 * 24 * 3600 * 1000)))
  const [end, setEnd] = useState(() => toIsoInput(new Date()))
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [actor, setActor] = useState('')

  const [items, setItems] = useState<any[]>([])
  const [openRow, setOpenRow] = useState<string | null>(null)

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    q.set('tenantId', tenantId)
    q.set('start', new Date(start).toISOString())
    q.set('end', new Date(end).toISOString())
    if (action.trim()) q.set('action', action.trim())
    if (entityType.trim()) q.set('entityType', entityType.trim())
    if (entityId.trim()) q.set('entityId', entityId.trim())
    if (actor.trim()) q.set('actor', actor.trim())
    q.set('limit', '200')
    q.set('offset', '0')
    return q.toString()
  }, [tenantId, start, end, action, entityType, entityId, actor])

  const load = async () => {
    setLoading(true)
    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' })
      if (!meRes.ok) {
        router.push('/login')
        return
      }
      const meJson = await meRes.json()
      setMe(meJson.user)

      // Tenants list only for Master Admin (for filtering)
      if (meJson?.user?.role === 'MASTER_ADMIN') {
        const tRes = await fetch('/api/portal/admin/tenants', { credentials: 'include' })
        const tJson = await tRes.json().catch(() => ({}))
        if (tJson.success) setTenants(tJson.tenants || [])
      }

      const res = await fetch(`/api/portal/admin/audit?${qs}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) setItems(json.items || [])
      else setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/portal/admin')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-sm text-gray-600">Admin/operator actions (settings, users, zones, calibration, finance, alerts, reports, tenant switches).</p>
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
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                disabled={me?.role !== 'MASTER_ADMIN'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-60"
              >
                <option value="all">All tenants</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {me?.role !== 'MASTER_ADMIN' ? <div className="text-xs text-gray-500 mt-1">Tenant-scoped (Master Admin can filter all).</div> : null}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Action contains</label>
              <input value={action} onChange={(e) => setAction(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Entity type contains</label>
              <input value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Entity id contains</label>
              <input value={entityId} onChange={(e) => setEntityId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Actor email contains</label>
              <input value={actor} onChange={(e) => setActor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 w-10"></th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Actor</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Entity</th>
                <th className="text-left px-4 py-3">Tenant</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const open = openRow === a.id
                return (
                  <>
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <button onClick={() => setOpenRow(open ? null : a.id)} className="text-gray-600 hover:text-gray-900">
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-gray-800">{a.actorEmail || a.actorUserId || '—'}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{a.action}</td>
                      <td className="px-4 py-3 text-gray-900">
                        <span className="font-medium">{a.entityType}</span>
                        {a.entityId ? <span className="text-gray-600"> · {a.entityId}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{a.tenantName || a.tenantId || '—'}</td>
                    </tr>
                    {open ? (
                      <tr className="border-t border-gray-100 bg-gray-50/50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Before</div>
                              <pre className="text-xs bg-white border border-gray-200 rounded p-3 overflow-auto max-h-64">
                                {JSON.stringify(a.before, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">After</div>
                              <pre className="text-xs bg-white border border-gray-200 rounded p-3 overflow-auto max-h-64">
                                {JSON.stringify(a.after, null, 2)}
                              </pre>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            IP: {a.ip || '—'} · UA: {a.userAgent ? String(a.userAgent).slice(0, 120) : '—'}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </>
                )
              })}
              {(!loading && items.length === 0) ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No audit events found for the selected filters.
                  </td>
                </tr>
              ) : null}
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}


