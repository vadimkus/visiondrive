'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../../components/common/Section'
import { 
  Download, 
  RefreshCw, 
  Radio, 
  ShieldAlert, 
  Activity, 
  Signal, 
  Wifi,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp
} from 'lucide-react'

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = items.length
    const totalEvents = items.reduce((sum, g) => sum + (g.events24h || 0), 0)
    const avgRssi = items.length > 0 
      ? items.reduce((sum, g) => sum + (g.avgRssi24h || 0), 0) / items.filter(g => g.avgRssi24h).length
      : 0
    const totalAlerts = items.reduce((sum, g) => sum + (g.alerts?.open || 0), 0)
    const criticalAlerts = items.reduce((sum, g) => sum + (g.alerts?.critical || 0), 0)
    
    return { total, totalEvents, avgRssi, totalAlerts, criticalAlerts }
  }, [items])

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gateway Reports</h1>
            <p className="text-gray-600">Monitor gateway performance, coverage, and connectivity</p>
          </div>
          <div className="flex gap-2">
            <a 
              href={exportUrl} 
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </a>
            <button 
              onClick={load}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Zone Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Zone</label>
          <select 
            value={zoneId} 
            onChange={(e) => setParam('zoneId', e.target.value)} 
            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          >
            {(zones.length ? zones : [{ id: 'all', name: 'All Zones' }]).map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Radio className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Events 24h</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{stats.totalEvents.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Signal className="h-4 w-4 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Avg RSSI</span>
            </div>
            <div className="text-2xl font-bold text-teal-700">{stats.avgRssi.toFixed(1)}</div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Alerts</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{stats.totalAlerts}</div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <ShieldAlert className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-700">{stats.criticalAlerts}</div>
          </div>
        </div>

        {/* Coverage Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Coverage by Site */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Coverage by Site</h2>
                  <p className="text-sm text-gray-600">Gateway distribution per location</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {(coverage?.bySite || []).map((r: any) => (
                  <div key={r.siteName} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{r.siteName}</div>
                      <div className="px-2 py-1 bg-purple-100 rounded-lg">
                        <span className="text-xs font-bold text-purple-700">{r.gateways} GW</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Online: </span>
                        <span className="font-semibold text-green-700">{r.online15m}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-gray-600">Offline: </span>
                        <span className="font-semibold text-red-700">{r.offline15m}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!(coverage?.bySite || []).length && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No gateways deployed yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Backhaul Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Wifi className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Backhaul Distribution</h2>
                  <p className="text-sm text-gray-600">Connection types across network</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {(coverage?.byBackhaul || []).map((r: any) => (
                  <div key={r.backhaul} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wifi className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{r.backhaul}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-blue-100 rounded-lg">
                      <span className="font-bold text-blue-700">{r.count}</span>
                    </div>
                  </div>
                ))}
                {!(coverage?.byBackhaul || []).length && (
                  <div className="text-center py-8">
                    <Wifi className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No backhaul data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gateways Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Radio className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gateway Details</h2>
                <p className="text-sm text-gray-600">{items.length} gateway{items.length !== 1 ? 's' : ''} in network</p>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Gateway</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Traffic (24h)</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Signal Quality</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                      <p className="text-gray-600">Loading gateway data...</p>
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Radio className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No gateways found</p>
                      <p className="text-sm text-gray-400 mt-1">Deploy gateways to see data here</p>
                    </td>
                  </tr>
                )}
                {items.map((g: any) => {
                  const rssiQuality = (g.avgRssi24h || 0) > -70 ? 'good' : (g.avgRssi24h || 0) > -90 ? 'fair' : 'poor'
                  
                  return (
                    <tr key={g.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Radio className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{g.name}</div>
                            <div className="text-sm text-gray-600">
                              {g.serial ? <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{g.serial}</span> : <span className="text-gray-400">No serial</span>}
                              <span className="mx-2">·</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{g.backhaul}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {g.siteName || 'Unassigned'}
                              <span className="mx-2">·</span>
                              Last heartbeat: {g.lastHeartbeat ? new Date(g.lastHeartbeat).toLocaleString() : 'Never'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <span className="text-2xl font-bold text-gray-900">{g.events24h?.toLocaleString() || 0}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <TrendingUp className="h-3 w-3 inline mr-1 text-gray-400" />
                          {g.uniqueSensors24h || 0} unique sensors
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Signal className={`h-4 w-4 ${
                              rssiQuality === 'good' ? 'text-green-600' :
                              rssiQuality === 'fair' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                            <span className="text-sm font-medium text-gray-700">
                              RSSI: <span className="font-mono">{typeof g.avgRssi24h === 'number' ? g.avgRssi24h.toFixed(1) : '—'}</span> dBm
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            SNR: <span className="font-mono font-medium">{typeof g.avgSnr24h === 'number' ? g.avgSnr24h.toFixed(1) : '—'}</span> dB
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-orange-600" />
                            <span className="text-2xl font-bold text-gray-900">{g.alerts?.open ?? 0}</span>
                          </div>
                          {(g.alerts?.critical ?? 0) > 0 && (
                            <div className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {g.alerts.critical} critical
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}


