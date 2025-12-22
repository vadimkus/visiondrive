'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { Search, Cpu, Battery, Radio, Clock, Activity, AlertCircle, CheckCircle2, Loader2, TrendingUp } from 'lucide-react'

type SensorItem = {
  id: string
  devEui: string
  type: string
  status: string
  bayCode: string | null
  lastSeen: string | null
  batteryPct: number | null
  healthScore: number
}

export default function SensorsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zoneId') || 'all'
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<SensorItem[]>([])
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items
    return items.filter((s) => s.devEui.toLowerCase().includes(t))
  }, [items, q])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = items.length
    const healthy = items.filter(s => s.healthScore >= 80).length
    const warning = items.filter(s => s.healthScore >= 50 && s.healthScore < 80).length
    const critical = items.filter(s => s.healthScore < 50).length
    const avgBattery = items.length > 0 
      ? Math.round(items.reduce((sum, s) => sum + (s.batteryPct || 0), 0) / items.length)
      : 0
    const online = items.filter(s => {
      if (!s.lastSeen) return false
      const diff = Date.now() - new Date(s.lastSeen).getTime()
      return diff < 3600000 // Less than 1 hour
    }).length

    return { total, healthy, warning, critical, avgBattery, online }
  }, [items])

  useEffect(() => {
    const run = async () => {
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (!me.ok) {
          router.push('/login')
          return
        }
        const qs = new URLSearchParams()
        if (zoneId) qs.set('zoneId', zoneId)
        const res = await fetch(`/api/portal/sensors?${qs.toString()}`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setItems(json.items || [])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [router, zoneId])

  if (loading) {
    return (
      <Section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600 text-lg">Loading sensors...</span>
        </div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sensor Fleet</h1>
            <p className="text-gray-600">Monitor health, battery levels, and connectivity status</p>
          </div>
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by DevEUI..."
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full sm:w-80"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cpu className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Healthy</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.healthy}</div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Warning</span>
            </div>
            <div className="text-2xl font-bold text-yellow-700">{stats.warning}</div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Battery className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Avg Battery</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">{stats.avgBattery}%</div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Radio className="h-4 w-4 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-gray-600">Online</span>
            </div>
            <div className="text-2xl font-bold text-teal-700">{stats.online}</div>
          </div>
        </div>

        {/* Sensors Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Cpu className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Sensors</h2>
                  <p className="text-sm text-gray-600">{filtered.length} sensor{filtered.length !== 1 ? 's' : ''} {q && `matching "${q}"`}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Device</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Bay</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Last Seen</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Battery</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Health</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No sensors found</p>
                      {q && <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>}
                    </td>
                  </tr>
                )}
                {filtered.map((s) => {
                  const isOnline = s.lastSeen && (Date.now() - new Date(s.lastSeen).getTime()) < 3600000
                  const batteryLevel = s.batteryPct || 0
                  
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/portal/sensors/${s.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Cpu className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-semibold text-gray-900">{s.devEui}</div>
                            <div className="text-xs text-gray-500">{s.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {s.bayCode ? (
                          <span className="font-mono text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">
                            {s.bayCode}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.lastSeen ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {new Date(s.lastSeen).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {typeof s.batteryPct === 'number' ? (
                          <div className="flex items-center gap-2">
                            <Battery className={`h-4 w-4 ${
                              batteryLevel >= 70 ? 'text-green-600' :
                              batteryLevel >= 40 ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                            <span className={`text-sm font-semibold ${
                              batteryLevel >= 70 ? 'text-green-700' :
                              batteryLevel >= 40 ? 'text-yellow-700' :
                              'text-red-700'
                            }`}>
                              {Math.round(s.batteryPct)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${
                            s.healthScore >= 80 ? 'text-green-600' :
                            s.healthScore >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`} />
                          <span
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                              s.healthScore >= 80
                                ? 'bg-green-100 text-green-700'
                                : s.healthScore >= 50
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {s.healthScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            Offline
                          </span>
                        )}
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


