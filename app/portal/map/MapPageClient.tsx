'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, Loader2, Navigation } from 'lucide-react'
import MapboxMap from './MapboxMap'
import { appleMapsDirectionsUrl, googleMapsDirectionsUrl } from '@/lib/navigation-links'

type MapItem = {
  bayId: string
  bayCode: string | null
  sensorId: string | null
  devEui: string | null
  lastSeen: string | null
  batteryPct: number | null
  confidence: number
  ageMinutes?: number | null
  state: 'FREE' | 'OCCUPIED' | 'OFFLINE' | 'UNKNOWN'
  color: 'GREEN' | 'RED' | 'GRAY'
  lat?: number | null
  lng?: number | null
  sensorLat?: number | null
  sensorLng?: number | null
  geojson?: any | null
}

type MapMeta = {
  siteName: string | null
  zoneName: string | null
  address: string | null
  siteId?: string | null
  centerLat?: number | null
  centerLng?: number | null
  zoneGeojson?: any | null
  bayCount: number
}

export default function PortalMapPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<MapItem[]>([])
  const [meta, setMeta] = useState<MapMeta | null>(null)
  const [overlays, setOverlays] = useState<any>(null)
  const zoneId = searchParams.get('zoneId') || 'all'
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ OCCUPIED: false, OFFLINE: false, UNKNOWN: false })

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

  const filteredItems = useMemo(() => {
    const active = Object.entries(filters).filter(([, v]) => v).map(([k]) => k)
    if (!active.length) return items
    const set = new Set(active)
    return items.filter((b) => set.has(b.state))
  }, [items, filters])

  const selected = useMemo(() => {
    if (!selectedBayId) return null
    return items.find((i) => i.bayId === selectedBayId) || null
  }, [selectedBayId, items])

  const navigateTarget = useMemo(() => {
    // Prefer sensor coordinates (calibration result), then bay coords, then zone/site center.
    const lat =
      (selected?.sensorLat ?? null) ??
      (selected?.lat ?? null) ??
      (meta?.centerLat ?? null)
    const lng =
      (selected?.sensorLng ?? null) ??
      (selected?.lng ?? null) ??
      (meta?.centerLng ?? null)
    if (typeof lat !== 'number' || typeof lng !== 'number') return null
    const label =
      selected?.bayCode
        ? `Bay ${selected.bayCode}`
        : meta?.zoneName
          ? meta.zoneName
          : meta?.siteName || 'Destination'
    return { lat, lng, label }
  }, [selected, meta])

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
          setOverlays(json.overlays || null)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [router, zoneId])

  // Auto-scroll details list to selected bay
  useEffect(() => {
    if (!selectedBayId) return
    const el = document.querySelector(`[data-bayid="${selectedBayId}"]`) as HTMLElement | null
    if (!el) return
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedBayId])

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push(`/portal?zoneId=${encodeURIComponent(zoneId)}`)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
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
          <div className="flex flex-wrap items-center gap-2">
            {navigateTarget ? (
              <>
                <a
                  href={appleMapsDirectionsUrl({ lat: navigateTarget.lat, lng: navigateTarget.lng }, navigateTarget.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Apple Maps
                </a>
                <a
                  href={googleMapsDirectionsUrl({ lat: navigateTarget.lat, lng: navigateTarget.lng }, navigateTarget.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Google Maps
                </a>
              </>
            ) : (
              <span className="text-xs text-gray-500">Navigation available when coordinates exist</span>
            )}
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
              <h2 className="font-semibold text-gray-900">Live Map (Mapbox)</h2>
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
                    setOverlays(json.overlays || null)
                  }
                  setLoading(false)
                }}
                className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-600 mr-1">Filters:</span>
              {(['OCCUPIED', 'OFFLINE', 'UNKNOWN'] as const).map((k) => (
                <label key={k} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white">
                  <input
                    type="checkbox"
                    checked={(filters as any)[k]}
                    onChange={(e) => setFilters((s) => ({ ...s, [k]: e.target.checked }))}
                  />
                  {k === 'OCCUPIED' ? 'Occupied' : k === 'OFFLINE' ? 'Offline' : 'Unknown'}
                </label>
              ))}
              <button
                onClick={() => setFilters({ OCCUPIED: false, OFFLINE: false, UNKNOWN: false })}
                className="px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Clear
              </button>
              <span className="ml-auto text-gray-500">
                Showing {filteredItems.length} / {items.length}
              </span>
            </div>

            <MapboxMap
              meta={meta as any}
              items={filteredItems as any}
              selectedBayId={selectedBayId}
              onSelectBay={(bayId) => setSelectedBayId(bayId)}
              overlays={overlays}
              initialLayers={{ bays: true, sensors: true, zones: true }}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Details</h2>
            <div id="bay-details-scroll" className="space-y-2 max-h-[520px] overflow-auto">
              {filteredItems.map((b) => (
                <div
                  key={b.bayId}
                  data-bayid={b.bayId}
                  onClick={() => setSelectedBayId(b.bayId)}
                  className={`flex items-start justify-between border-b border-gray-100 pb-2 cursor-pointer ${
                    selectedBayId === b.bayId ? 'bg-gray-50 rounded-md px-2 py-2 border border-gray-200' : ''
                  }`}
                >
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
              {filteredItems.length === 0 && <p className="text-sm text-gray-500">No bays match the current filters.</p>}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}



