'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, Loader2 } from 'lucide-react'

type MapItem = {
  bayId: string
  bayCode: string | null
  sensorId: string | null
  devEui: string | null
  lastSeen: string | null
  batteryPct: number | null
  confidence: number
  state: 'FREE' | 'OCCUPIED' | 'OFFLINE' | 'UNKNOWN'
  color: 'GREEN' | 'RED' | 'GRAY'
}

type MapMeta = {
  siteName: string | null
  zoneName: string | null
  address: string | null
  bayCount: number
}

export default function PortalMapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<MapItem[]>([])
  const [meta, setMeta] = useState<MapMeta | null>(null)
  const zoneId = searchParams.get('zoneId') || 'all'

  const summary = useMemo(() => {
    let free = 0
    let occupied = 0
    let offline = 0
    let unknown = 0
    for (const i of items) {
      if (i.state === 'FREE') free++
      else if (i.state === 'OCCUPIED') occupied++
      else if (i.state === 'OFFLINE') offline++
      else unknown++
    }
    return { free, occupied, offline, unknown, total: items.length }
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
        const res = await fetch(`/api/portal/map?${qs.toString()}`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) {
          setItems(json.items || [])
          setMeta(json.meta || null)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [router, zoneId])

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  return (
    <Section className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/portal')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {meta?.zoneName ? meta.zoneName : 'Zone'} {meta?.siteName ? `— ${meta.siteName}` : ''}
            </h1>
            <p className="text-sm text-gray-600">
              {meta?.address ? meta.address : 'Demo location'} · Bays: {meta?.bayCount ?? summary.total} · Bay colors: Green=Free, Red=Occupied, Gray=Unknown/low confidence
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Free: {summary.free}</span>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Occupied: {summary.occupied}</span>
            <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">Offline: {summary.offline}</span>
            <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">Unknown: {summary.unknown}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Bay Grid (placeholder for Mapbox)</h2>
              <button
                onClick={async () => {
                  setLoading(true)
                  const qs = new URLSearchParams()
                  if (zoneId) qs.set('zoneId', zoneId)
                  const res = await fetch(`/api/portal/map?${qs.toString()}`, { credentials: 'include' })
                  const json = await res.json()
                  if (json.success) {
                    setItems(json.items || [])
                    setMeta(json.meta || null)
                  }
                  setLoading(false)
                }}
                className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {items.slice(0, 200).map((b) => (
                <div
                  key={b.bayId}
                  title={`${b.bayCode || 'Bay'} | ${b.state} | conf ${b.confidence}`}
                  className={`rounded-md border p-2 text-xs text-center ${
                    b.color === 'GREEN'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : b.color === 'RED'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-semibold">{b.bayCode || '—'}</div>
                  <div className="opacity-80">{Math.round(b.confidence * 100)}%</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Next upgrade: Mapbox/Google map rendering using bay geojson/lat/lng and clustering.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Details (first 50)</h2>
            <div className="space-y-2 max-h-[520px] overflow-auto">
              {items.slice(0, 50).map((b) => (
                <div key={b.bayId} className="flex items-start justify-between border-b border-gray-100 pb-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{b.bayCode || b.bayId}</div>
                    <div className="text-xs text-gray-600 truncate">{b.devEui || 'No sensor bound'}</div>
                    <div className="text-xs text-gray-500">
                      Last seen: {b.lastSeen ? new Date(b.lastSeen).toLocaleString() : '—'} | Battery:{' '}
                      {typeof b.batteryPct === 'number' ? `${Math.round(b.batteryPct)}%` : '—'}
                    </div>
                  </div>
                  <div className="text-xs font-semibold ml-2">
                    <span
                      className={`px-2 py-1 rounded-full border ${
                        b.color === 'GREEN'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : b.color === 'RED'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {b.state}
                    </span>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500">No bays yet. Seed a site/zones/bays to see live state.</p>}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}


