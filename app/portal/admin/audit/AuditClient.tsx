'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  Filter,
  Clock,
  User,
  Activity,
  Shield,
  Loader2,
  FileText
} from 'lucide-react'

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
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Audit Log</h1>
            <p className="text-gray-600">Track all administrative actions and changes</p>
            <p className="text-sm text-gray-500 mt-1">
              Settings · Users · Zones · Calibration · Finance · Alerts · Reports · Tenant Switches
            </p>
          </div>
          <button 
            onClick={load} 
            disabled={loading}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-white p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <p className="text-sm text-gray-600">Refine your audit search</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Primary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Tenant
                </label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  disabled={me?.role !== 'MASTER_ADMIN'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white disabled:opacity-60 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="all">All tenants</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {me?.role !== 'MASTER_ADMIN' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tenant-scoped (Master Admin can filter all)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Start Date
                </label>
                <input 
                  value={start} 
                  onChange={(e) => setStart(e.target.value)} 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  End Date
                </label>
                <input 
                  value={end} 
                  onChange={(e) => setEnd(e.target.value)} 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                />
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Action contains</label>
                <input 
                  value={action} 
                  onChange={(e) => setAction(e.target.value)} 
                  placeholder="e.g., CREATE, UPDATE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Entity type contains</label>
                <input 
                  value={entityType} 
                  onChange={(e) => setEntityType(e.target.value)} 
                  placeholder="e.g., User, Zone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Entity ID contains</label>
                <input 
                  value={entityId} 
                  onChange={(e) => setEntityId(e.target.value)} 
                  placeholder="Entity identifier"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Actor email contains</label>
                <input 
                  value={actor} 
                  onChange={(e) => setActor(e.target.value)} 
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Audit Events</h2>
                  <p className="text-sm text-gray-600">{items.length} events found</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 w-10"></th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actor</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Entity</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tenant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((a) => {
                  const open = openRow === a.id
                  return (
                    <>
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setOpenRow(open ? null : a.id)} 
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {a.createdAt ? new Date(a.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{a.actorEmail || a.actorUserId || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold font-mono bg-purple-100 text-purple-700">
                            {a.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700">
                              {a.entityType}
                            </span>
                            {a.entityId && <div className="text-xs text-gray-600 mt-1 font-mono">{a.entityId}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{a.tenantName || a.tenantId || '—'}</span>
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-gradient-to-r from-gray-50 to-white">
                          <td colSpan={6} className="px-6 py-6">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  Before
                                </div>
                                <pre className="text-xs bg-white border-2 border-gray-200 rounded-xl p-4 overflow-auto max-h-64 font-mono">
                                  {JSON.stringify(a.before, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  After
                                </div>
                                <pre className="text-xs bg-white border-2 border-gray-200 rounded-xl p-4 overflow-auto max-h-64 font-mono">
                                  {JSON.stringify(a.after, null, 2)}
                                </pre>
                              </div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-semibold text-gray-700">IP Address:</span>{' '}
                                  <span className="text-gray-600 font-mono">{a.ip || '—'}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-700">User Agent:</span>{' '}
                                  <span className="text-gray-600">{a.userAgent ? String(a.userAgent).slice(0, 120) : '—'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
                {(!loading && items.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-16 w-16 text-gray-300" />
                        <p className="text-gray-500 font-medium text-lg">No audit events found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        <p className="text-gray-600 font-medium">Loading audit events...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}

