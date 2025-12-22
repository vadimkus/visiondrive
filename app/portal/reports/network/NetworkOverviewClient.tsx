'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../../components/common/Section'
import { RefreshCw, Network, MapPin, Radio, Cpu, Loader2 } from 'lucide-react'
import NetworkOverviewMap from './NetworkOverviewMap'

export default function NetworkOverviewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zoneId') || 'all'

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    q.set('zoneId', zoneId)
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
      const res = await fetch(`/api/portal/reports/network?${qs}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  const nodes = data?.nodes || []
  const links = data?.links || []
  const counts = useMemo(() => {
    const c: any = { site: 0, gateway: 0, sensor: 0 }
    for (const n of nodes) c[n.kind] = (c[n.kind] || 0) + 1
    return c
  }, [nodes])

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Network Overview</h1>
            <p className="text-gray-600">Real-time network topology and connectivity status</p>
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

        {/* KPI Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { 
              label: 'Sites', 
              value: counts.site || 0, 
              icon: MapPin, 
              color: 'from-emerald-50 to-green-50',
              iconBg: 'bg-emerald-100',
              iconColor: 'text-emerald-600',
              textColor: 'text-emerald-700'
            },
            { 
              label: 'Gateways', 
              value: counts.gateway || 0, 
              icon: Radio, 
              color: 'from-purple-50 to-violet-50',
              iconBg: 'bg-purple-100',
              iconColor: 'text-purple-600',
              textColor: 'text-purple-700'
            },
            { 
              label: 'Sensors', 
              value: counts.sensor || 0, 
              icon: Cpu, 
              color: 'from-blue-50 to-indigo-50',
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-600',
              textColor: 'text-blue-700'
            },
          ].map((c) => (
            <div key={c.label} className={`bg-gradient-to-r ${c.color} rounded-2xl shadow-xl border border-gray-200 p-6 transition-transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">{c.label}</div>
                  <div className="text-3xl font-bold text-gray-900">{c.value}</div>
                </div>
                <div className={`p-3 ${c.iconBg} rounded-xl`}>
                  <c.icon className={`h-8 w-8 ${c.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Network Topology Map</h2>
                  <p className="text-sm text-gray-600">Geographic distribution of network nodes</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-700">Sites</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-700">Gateways</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Sensors</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-0">
            <NetworkOverviewMap nodes={nodes} links={links} />
          </div>
        </div>

        {/* Edges Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Network className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Network Connections</h2>
                  <p className="text-sm text-gray-600">Gateway-to-sensor links from last 24 hours</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-purple-100 rounded-lg">
                <span className="text-sm font-semibold text-purple-700">{links.length} links</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
                Loading network data...
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Gateway</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Sensor</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.slice(0, 200).map((l: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-900 bg-purple-50 px-2 py-1 rounded">{l.from}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">{l.to}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {l.lastSeen ? new Date(l.lastSeen).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {links.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center">
                          <Network className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No network connections found</p>
                          <p className="text-sm text-gray-400 mt-1">Waiting for gateway traffic data</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}


