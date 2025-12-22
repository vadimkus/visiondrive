'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, Download, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react'

type Row = any

function toIsoInput(d: Date) {
  return d.toISOString().slice(0, 16)
}

function pct(n: number | null) {
  if (typeof n !== 'number') return '—'
  return `${Math.round(n * 100)}%`
}

export default function SensorReportsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zoneId') || 'all'

  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState<any[]>([])
  const [rows, setRows] = useState<Row[]>([])

  const [end, setEnd] = useState(() => toIsoInput(new Date()))
  const [start, setStart] = useState(() => toIsoInput(new Date(Date.now() - 7 * 24 * 3600 * 1000)))
  const [limit, setLimit] = useState(50)

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    q.set('zoneId', zoneId)
    q.set('start', new Date(start).toISOString())
    q.set('end', new Date(end).toISOString())
    q.set('limit', String(limit))
    return q.toString()
  }, [zoneId, start, end, limit])

  const load = async () => {
    setLoading(true)
    try {
      const me = await fetch('/api/auth/me', { credentials: 'include' })
      if (!me.ok) {
        router.push('/login')
        return
      }
      const zRes = await fetch('/api/portal/zones', { credentials: 'include' })
      const zJson = await zRes.json()
      if (zJson.success) setZones(zJson.zones || [])

      const res = await fetch(`/api/portal/reports/sensors?${qs}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) setRows(json.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  const exportUrl = `/api/portal/reports/sensors?${qs}&format=csv`

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (v) next.set(k, v)
    else next.delete(k)
    router.push(`/portal/reports/sensors?${next.toString()}`)
  }

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push(`/portal?zoneId=${encodeURIComponent(zoneId)}`)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sensor Performance Report</h1>
            <p className="text-sm text-gray-600">Rankings + period comparisons. Export CSV for enterprise reporting.</p>
          </div>
          <div className="flex gap-2">
            <a href={exportUrl} className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </a>
            <button onClick={load} className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
              <select value={zoneId} onChange={(e) => setParam('zoneId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {(zones.length ? zones : [{ id: 'all', name: 'All Zones' }]).map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} {typeof z.bayCount === 'number' ? `(${z.bayCount})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
              <input value={start} onChange={(e) => setStart(e.target.value)} type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
              <input value={end} onChange={(e) => setEnd(e.target.value)} type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Limit</label>
              <input value={limit} onChange={(e) => setLimit(Number(e.target.value || 50))} type="number" min={20} max={200} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Sensor</th>
                <th className="text-left px-4 py-3">Events</th>
                <th className="text-left px-4 py-3">Occupancy</th>
                <th className="text-left px-4 py-3">Signal (avg)</th>
                <th className="text-left px-4 py-3">Battery Δ</th>
                <th className="text-left px-4 py-3">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No data</td>
                </tr>
              )}
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/portal/sensors/${r.id}`)}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-gray-900">{r.devEui}</div>
                    <div className="text-xs text-gray-500">{r.bayCode ? `Bay ${r.bayCode}` : '—'}</div>
                    <div className="text-xs text-gray-500">Last event: {r.current.lastEventTime ? new Date(r.current.lastEventTime).toLocaleString() : '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{r.current.events}</div>
                    <div className="text-xs text-gray-500">Prev: {r.previous.events}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary-600" />
                      <span className="font-semibold text-gray-900">{pct(r.current.occupancyRate)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Prev: {pct(r.previous.occupancyRate)}</div>
                    <div className="text-xs text-gray-500">Flaps: {r.current.flapChanges}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">
                      RSSI {typeof r.current.avgRssi === 'number' ? r.current.avgRssi.toFixed(1) : '—'} / SNR {typeof r.current.avgSnr === 'number' ? r.current.avgSnr.toFixed(1) : '—'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Prev RSSI {typeof r.previous.avgRssi === 'number' ? r.previous.avgRssi.toFixed(1) : '—'} / Prev SNR {typeof r.previous.avgSnr === 'number' ? r.previous.avgSnr.toFixed(1) : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{typeof r.current.batteryDropPct === 'number' ? `${r.current.batteryDropPct.toFixed(1)}%` : '—'}</div>
                    <div className="text-xs text-gray-500">Prev: {typeof r.previous.batteryDropPct === 'number' ? `${r.previous.batteryDropPct.toFixed(1)}%` : '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-gray-900">{r.alerts.open}</span>
                      <span className="text-xs text-gray-500">({r.alerts.critical} critical)</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}


