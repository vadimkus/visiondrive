'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, Download, RefreshCw, Router as RouterIcon, ShieldAlert } from 'lucide-react'

export default function GatewayReportsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zoneId') || 'all'

  const [loading, setLoading] = useState(true)
  const [zones, setZones] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [coverage, setCoverage] = useState<any>(null)

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    q.set('zoneId', zoneId)
    q.set('limit', '200')
    return q.toString()
  }, [zoneId])

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

      const res = await fetch(`/api/portal/reports/gateways?${qs}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) {
        setItems(json.items || [])
        setCoverage(json.coverage || null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  const exportUrl = `/api/portal/reports/gateways?${qs}&format=csv`

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (v) next.set(k, v)
    else next.delete(k)
    router.push(`/portal/reports/gateways?${next.toString()}`)
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gateway Overview</h1>
            <p className="text-sm text-gray-600">Units list + coverage panels (site/backhaul) + CSV export.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone (for sensor counts)</label>
              <select value={zoneId} onChange={(e) => setParam('zoneId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {(zones.length ? zones : [{ id: 'all', name: 'All Zones' }]).map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Coverage by site</h2>
            <div className="space-y-2 text-sm">
              {(coverage?.bySite || []).map((r: any) => (
                <div key={r.siteName} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{r.siteName}</div>
                    <div className="text-xs text-gray-500">Gateways: {r.gateways}</div>
                  </div>
                  <div className="text-xs text-gray-700 text-right">
                    <div>Online (15m): <span className="font-semibold text-green-700">{r.online15m}</span></div>
                    <div>Offline (15m): <span className="font-semibold text-red-700">{r.offline15m}</span></div>
                  </div>
                </div>
              ))}
              {!(coverage?.bySite || []).length && <div className="text-sm text-gray-500">No gateways yet</div>}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Backhaul distribution</h2>
            <div className="space-y-2 text-sm">
              {(coverage?.byBackhaul || []).map((r: any) => (
                <div key={r.backhaul} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{r.backhaul}</div>
                  <div className="text-gray-700">{r.count}</div>
                </div>
              ))}
              {!(coverage?.byBackhaul || []).length && <div className="text-sm text-gray-500">No gateways yet</div>}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Gateway</th>
                <th className="text-left px-4 py-3">Traffic (24h)</th>
                <th className="text-left px-4 py-3">Signal (avg 24h)</th>
                <th className="text-left px-4 py-3">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">Loading…</td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No gateways</td>
                </tr>
              )}
              {items.map((g: any) => (
                <tr key={g.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{g.name}</div>
                    <div className="text-xs text-gray-500">{g.serial ? <span className="font-mono">{g.serial}</span> : '—'} · {g.backhaul}</div>
                    <div className="text-xs text-gray-500">{g.siteName || 'Unassigned'} · heartbeat {g.lastHeartbeat ? new Date(g.lastHeartbeat).toLocaleString() : '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <RouterIcon className="h-4 w-4 text-primary-600" />
                      <span className="font-semibold text-gray-900">{g.events24h}</span>
                    </div>
                    <div className="text-xs text-gray-500">Unique sensors: {g.uniqueSensors24h}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    RSSI {typeof g.avgRssi24h === 'number' ? g.avgRssi24h.toFixed(1) : '—'} / SNR {typeof g.avgSnr24h === 'number' ? g.avgSnr24h.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-gray-900">{g.alerts?.open ?? 0}</span>
                      <span className="text-xs text-gray-500">({g.alerts?.critical ?? 0} critical)</span>
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


