'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2, UserPlus } from 'lucide-react'

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
  if (sev === 'CRITICAL') return 'bg-red-50 border-red-200 text-red-700'
  if (sev === 'WARNING') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  return 'bg-blue-50 border-blue-200 text-blue-700'
}

function statusPill(st: string) {
  if (st === 'OPEN') return 'bg-orange-50 border-orange-200 text-orange-700'
  if (st === 'ACKNOWLEDGED') return 'bg-purple-50 border-purple-200 text-purple-700'
  return 'bg-green-50 border-green-200 text-green-700'
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

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push(`/portal?zoneId=${encodeURIComponent(zoneId)}`)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Alerts</h1>
            <p className="text-sm text-gray-600">Queue + SLA timers + audit trail. Use “Run Scan” to recompute alerts from sensor data.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runScan}
              disabled={actionBusy === 'scan'}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {actionBusy === 'scan' ? 'Scanning…' : 'Run Scan'}
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm mb-4">
          <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">Open: {openCount}</span>
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Critical: {criticalCount}</span>
          <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">Total: {items.length}</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
              <select value={zoneId} onChange={(e) => setParam('zoneId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {(zones.length ? zones : [{ id: 'all', name: 'All Zones' }]).map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={status} onChange={(e) => setParam('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="OPEN">OPEN</option>
                <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="">All</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
              <select value={severity} onChange={(e) => setParam('severity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="">All</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={type} onChange={(e) => setParam('type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
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
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="text-gray-600">
                Filtering by <span className="font-semibold">sensorId</span>: <span className="font-mono">{sensorId}</span>
              </div>
              <button onClick={() => setParam('sensorId', '')} className="text-primary-700 hover:underline">
                Clear sensor filter
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Alert</th>
                  <th className="text-left px-4 py-3">SLA</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                      No alerts
                    </td>
                  </tr>
                )}
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedAlertId === a.id ? 'bg-gray-50' : ''}`}
                    onClick={() => setSelectedAlertId(a.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {a.severity === 'CRITICAL' ? (
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                          ) : a.severity === 'WARNING' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-700" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-blue-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${severityPill(a.severity)}`}>{a.severity}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${statusPill(a.status)}`}>{a.status}</span>
                            <span className="text-xs text-gray-500">{a.type}</span>
                          </div>
                          <div className="font-medium text-gray-900 mt-1">{a.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {a.sensor ? (
                              <>
                                Sensor: <span className="font-mono">{a.sensor.devEui}</span>
                                {a.sensor.bayCode ? ` · Bay ${a.sensor.bayCode}` : ''} {a.sensor.zoneName ? ` · ${a.sensor.zoneName}` : ''}
                              </>
                            ) : (
                              <span>Tenant-wide</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last detected: {fmtAgo(a.lastDetectedAt)} · Opened: {fmtAgo(a.openedAt)}
                          </div>
                          {a.assignedToEmail && <div className="text-xs text-gray-500 mt-1">Assigned: {a.assignedToEmail}</div>}
                          {a.acknowledgedByEmail && <div className="text-xs text-gray-500 mt-1">Acknowledged: {a.acknowledgedByEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-gray-700">
                        {a.status === 'RESOLVED' ? (
                          <span className="text-green-700">Resolved</span>
                        ) : (
                          <>
                            Due: <span className={a.slaDueAt && new Date(a.slaDueAt).getTime() < Date.now() ? 'text-red-700 font-semibold' : 'font-semibold'}>{fmtDue(a.slaDueAt)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            act(a.id, 'ACKNOWLEDGE')
                          }}
                          disabled={actionBusy === `ACKNOWLEDGE:${a.id}` || a.status !== 'OPEN'}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Ack
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            act(a.id, 'ASSIGN_TO_ME')
                          }}
                          disabled={actionBusy === `ASSIGN_TO_ME:${a.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign me
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            act(a.id, 'RESOLVE')
                          }}
                          disabled={actionBusy === `RESOLVE:${a.id}` || a.status === 'RESOLVED'}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Audit Trail</h2>
            {!selectedAlertId && <p className="text-sm text-gray-500">Select an alert to view its history.</p>}
            {selectedAlertId && eventsLoading && <p className="text-sm text-gray-500">Loading…</p>}
            {selectedAlertId && !eventsLoading && (
              <div className="space-y-2 max-h-[520px] overflow-auto">
                {events.length === 0 && <p className="text-sm text-gray-500">No events</p>}
                {events.map((e) => (
                  <div key={e.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-900">{e.action}</div>
                      <div className="text-xs text-gray-500">{fmtAgo(e.createdAt)}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {e.actorEmail ? `By ${e.actorEmail}` : 'System'}
                    </div>
                    {e.note && <div className="text-xs text-gray-700 mt-2">{e.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}


