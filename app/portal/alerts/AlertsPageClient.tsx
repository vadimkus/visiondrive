'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  UserPlus,
  Clock,
  Filter,
  MapPin,
  Radio,
  Loader2,
  Play,
  Eye
} from 'lucide-react'

type AlertItem = {
  id: string
  type: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
  title: string
  message: string | null
  openedAt: string | null
  lastDetectedAt: string | null
  acknowledgedAt: string | null
  acknowledgedByEmail: string | null
  assignedToEmail: string | null
  resolvedAt: string | null
  slaDueAt: string | null
  sensor: null | { id: string; devEui: string; bayCode: string | null; zoneName: string | null; siteName: string | null }
}

type AlertEvent = { id: string; action: string; note: string | null; actorEmail: string | null; createdAt: string | null }

function fmtAgo(iso: string | null) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function fmtDue(iso: string | null) {
  if (!iso) return '—'
  const ms = new Date(iso).getTime() - Date.now()
  const m = Math.ceil(ms / 60000)
  if (m <= 0) return `overdue`
  if (m < 60) return `${m}m`
  const h = Math.ceil(m / 60)
  if (h < 48) return `${h}h`
  const d = Math.ceil(h / 24)
  return `${d}d`
}

function severityPill(sev: string) {
  if (sev === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200'
  if (sev === 'WARNING') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-blue-100 text-blue-700 border-blue-200'
}

function statusPill(st: string) {
  if (st === 'OPEN') return 'bg-orange-100 text-orange-700 border-orange-200'
  if (st === 'ACKNOWLEDGED') return 'bg-purple-100 text-purple-700 border-purple-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

export default function AlertsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const zoneId = searchParams.get('zoneId') || 'all'
  const status = searchParams.get('status') || 'OPEN'
  const severity = searchParams.get('severity') || ''
  const type = searchParams.get('type') || ''
  const sensorId = searchParams.get('sensorId') || ''

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<AlertItem[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [events, setEvents] = useState<AlertEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    if (zoneId) q.set('zoneId', zoneId)
    if (status) q.set('status', status)
    if (severity) q.set('severity', severity)
    if (type) q.set('type', type)
    if (sensorId) q.set('sensorId', sensorId)
    q.set('limit', '200')
    return q.toString()
  }, [zoneId, status, severity, type, sensorId])

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/portal/alerts?${qs}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) setItems(json.items || [])
    } finally {
      setLoading(false)
    }
  }

  const loadZones = async () => {
    try {
      const res = await fetch('/api/portal/zones', { credentials: 'include' })
      const json = await res.json()
      if (json.success) setZones(json.zones || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const run = async () => {
      const me = await fetch('/api/auth/me', { credentials: 'include' })
      if (!me.ok) {
        router.push('/login')
        return
      }
      await loadZones()
      await refresh()
    }
    run().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  useEffect(() => {
    const run = async () => {
      if (!selectedAlertId) {
        setEvents([])
        return
      }
      setEventsLoading(true)
      try {
        const res = await fetch(`/api/portal/alerts/${selectedAlertId}/events`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setEvents(json.items || [])
      } finally {
        setEventsLoading(false)
      }
    }
    run()
  }, [selectedAlertId])

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (v) next.set(k, v)
    else next.delete(k)
    router.push(`/portal/alerts?${next.toString()}`)
  }

  const runScan = async () => {
    setActionBusy('scan')
    try {
      await fetch('/api/portal/alerts/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ zoneId }),
      })
      await refresh()
    } finally {
      setActionBusy(null)
    }
  }

  const act = async (id: string, action: 'ACKNOWLEDGE' | 'ASSIGN_TO_ME' | 'RESOLVE') => {
    setActionBusy(`${action}:${id}`)
    try {
      await fetch(`/api/portal/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })
      await refresh()
      if (selectedAlertId === id) {
        const res = await fetch(`/api/portal/alerts/${id}/events`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setEvents(json.items || [])
      }
    } finally {
      setActionBusy(null)
    }
  }

  const openCount = items.filter((i) => i.status === 'OPEN').length
  const criticalCount = items.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length
  const acknowledgedCount = items.filter((i) => i.status === 'ACKNOWLEDGED').length

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Alert Management</h1>
            <p className="text-gray-600">Monitor and resolve system alerts with SLA tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runScan}
              disabled={actionBusy === 'scan'}
              className="inline-flex items-center px-4 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg font-medium"
            >
              {actionBusy === 'scan' ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {actionBusy === 'scan' ? 'Scanning...' : 'Run Scan'}
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <RefreshCw className={`h-5 w-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Open</div>
            <div className="text-3xl font-bold text-orange-700">{openCount}</div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Critical</div>
            <div className="text-3xl font-bold text-red-700">{criticalCount}</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Acknowledged</div>
            <div className="text-3xl font-bold text-purple-700">{acknowledgedCount}</div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-100 rounded-xl">
                <ShieldAlert className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{items.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Filter className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <p className="text-sm text-gray-600">Refine alert list by criteria</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zone</label>
                <select 
                  value={zoneId} 
                  onChange={(e) => setParam('zoneId', e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Zones</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setParam('status', e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="">All</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
                <select 
                  value={severity} 
                  onChange={(e) => setParam('severity', e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">All</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setParam('type', e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">All</option>
                  <option value="SENSOR_OFFLINE">SENSOR_OFFLINE</option>
                  <option value="LOW_BATTERY">LOW_BATTERY</option>
                  <option value="POOR_SIGNAL">POOR_SIGNAL</option>
                  <option value="FLAPPING">FLAPPING</option>
                  <option value="DECODE_ERRORS">DECODE_ERRORS</option>
                </select>
              </div>
            </div>
            {sensorId ? (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="text-sm text-blue-900">
                  Filtering by sensor: <span className="font-mono font-semibold">{sensorId}</span>
                </div>
                <button 
                  onClick={() => setParam('sensorId', '')} 
                  className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  Clear filter
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Alerts Table + Audit Trail */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <ShieldAlert className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
                  <p className="text-sm text-gray-600">{items.length} alert{items.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>
            </div>
            <div className="overflow-auto max-h-[800px]">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Alert Details</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">SLA</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-3" />
                        <p className="text-gray-600">Loading alerts...</p>
                      </td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No alerts found</p>
                        <p className="text-sm text-gray-400 mt-1">All systems operating normally!</p>
                      </td>
                    </tr>
                  )}
                  {items.map((a) => (
                    <tr
                      key={a.id}
                      className={`border-b border-gray-100 hover:bg-orange-50 cursor-pointer transition-colors ${
                        selectedAlertId === a.id ? 'bg-orange-50' : ''
                      }`}
                      onClick={() => setSelectedAlertId(a.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {a.severity === 'CRITICAL' ? (
                              <ShieldAlert className="h-6 w-6 text-red-600" />
                            ) : a.severity === 'WARNING' ? (
                              <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            ) : (
                              <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${severityPill(a.severity)}`}>
                                {a.severity}
                              </span>
                              <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${statusPill(a.status)}`}>
                                {a.status}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {a.type}
                              </span>
                            </div>
                            <div className="font-semibold text-gray-900 text-base mb-2">{a.title}</div>
                            {a.sensor && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Radio className="h-4 w-4" />
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{a.sensor.devEui}</span>
                                {a.sensor.bayCode && <span>• Bay {a.sensor.bayCode}</span>}
                                {a.sensor.zoneName && (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    <span>{a.sensor.zoneName}</span>
                                  </>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>Last detected: {fmtAgo(a.lastDetectedAt)}</span>
                              <span>•</span>
                              <span>Opened: {fmtAgo(a.openedAt)}</span>
                            </div>
                            {a.assignedToEmail && (
                              <div className="text-xs text-gray-600 mt-1">
                                <UserPlus className="h-3 w-3 inline mr-1" />
                                Assigned: {a.assignedToEmail}
                              </div>
                            )}
                            {a.acknowledgedByEmail && (
                              <div className="text-xs text-gray-600 mt-1">
                                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                Acknowledged by: {a.acknowledgedByEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {a.status === 'RESOLVED' ? (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                            Resolved
                          </span>
                        ) : (
                          <div className="text-sm">
                            <div className="text-gray-600 mb-1">Due in:</div>
                            <div className={`font-bold text-lg ${
                              a.slaDueAt && new Date(a.slaDueAt).getTime() < Date.now() 
                                ? 'text-red-700' 
                                : 'text-gray-900'
                            }`}>
                              {fmtDue(a.slaDueAt)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              act(a.id, 'ACKNOWLEDGE')
                            }}
                            disabled={actionBusy === `ACKNOWLEDGE:${a.id}` || a.status !== 'OPEN'}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Acknowledge
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              act(a.id, 'ASSIGN_TO_ME')
                            }}
                            disabled={actionBusy === `ASSIGN_TO_ME:${a.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all font-medium"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Me
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              act(a.id, 'RESOLVE')
                            }}
                            disabled={actionBusy === `RESOLVE:${a.id}` || a.status === 'RESOLVED'}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Audit Trail</h2>
                  <p className="text-sm text-gray-600">Event history</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {!selectedAlertId && (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No alert selected</p>
                  <p className="text-sm text-gray-400 mt-1">Click an alert to view its history</p>
                </div>
              )}
              {selectedAlertId && eventsLoading && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                  <p className="text-gray-600">Loading events...</p>
                </div>
              )}
              {selectedAlertId && !eventsLoading && (
                <div className="space-y-3 max-h-[700px] overflow-auto">
                  {events.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No events recorded</p>
                  )}
                  {events.map((e) => (
                    <div key={e.id} className="bg-purple-50 border border-purple-200 rounded-xl p-4 hover:bg-purple-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-gray-900">{e.action}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {fmtAgo(e.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {e.actorEmail ? (
                          <>
                            <UserPlus className="h-3 w-3 inline mr-1" />
                            By {e.actorEmail}
                          </>
                        ) : (
                          'System action'
                        )}
                      </div>
                      {e.note && (
                        <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border border-purple-200">
                          {e.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
