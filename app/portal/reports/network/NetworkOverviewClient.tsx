'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, RefreshCw, Network } from 'lucide-react'
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
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push(`/portal?zoneId=${encodeURIComponent(zoneId)}`)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Network Overview</h1>
            <p className="text-sm text-gray-600">Nodes + edges (gateway→sensor) from last 24h traffic.</p>
          </div>
          <button onClick={load} className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Sites', value: counts.site || 0 },
            { label: 'Gateways', value: counts.gateway || 0 },
            { label: 'Sensors', value: counts.sensor || 0 },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="text-xs text-gray-600">{c.label}</div>
              <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <Network className="h-4 w-4 text-primary-600" />
              Edges (last 24h)
            </h2>
            <div className="text-xs text-gray-500">Links: {links.length}</div>
          </div>

          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">Gateway</th>
                    <th className="text-left px-3 py-2">Sensor</th>
                    <th className="text-left px-3 py-2">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {links.slice(0, 200).map((l: any, idx: number) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-mono text-gray-900">{l.from}</td>
                      <td className="px-3 py-2 font-mono text-gray-900">{l.to}</td>
                      <td className="px-3 py-2 text-gray-600">{l.lastSeen ? new Date(l.lastSeen).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                  {links.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                        No edges (no gatewayId present in recent events yet)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Map</h2>
            <div className="text-xs text-gray-500">
              Sites (green) · Gateways (violet) · Sensors (blue)
            </div>
          </div>
          <NetworkOverviewMap nodes={nodes} links={links} />
        </div>
      </div>
    </Section>
  )
}


