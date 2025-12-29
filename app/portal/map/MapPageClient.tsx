'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, Loader2, Navigation, MapPin } from 'lucide-react'
import MapboxMap from './MapboxMap'
import { appleMapsDirectionsUrl, googleMapsDirectionsUrl } from '@/lib/navigation-links'

// GeoJSON Types
type GeoJSONFeature = {
  type: 'Feature'
  geometry: { type: string; coordinates: number[] | number[][] | number[][][] }
  properties: Record<string, unknown>
}

type GatewayItem = {
  id: string
  name: string
  status?: string | null
  backhaul?: string | null
  lastHeartbeat?: string | null
  ageMinutes?: number | null
  state?: 'ONLINE' | 'OFFLINE'
  lat: number | null
  lng: number | null
}

type ZoneItem = {
  id: string
  name: string
  kind?: string
  bayCount?: number
  address?: string
  tariff?: Record<string, unknown>
  geojson: GeoJSONFeature
}

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
  geojson?: GeoJSONFeature | null
}

type MapMeta = {
  siteName: string | null
  zoneName: string | null
  address: string | null
  siteId?: string | null
  centerLat?: number | null
  centerLng?: number | null
  zoneGeojson?: GeoJSONFeature | null
  bayCount: number
}

export default function PortalMapPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<MapItem[]>([])
  const [meta, setMeta] = useState<MapMeta | null>(null)
  const [gateways, setGateways] = useState<GatewayItem[]>([])
  const zoneId = searchParams.get('zoneId') || 'all'
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ OCCUPIED: false, OFFLINE: false, UNKNOWN: false })
  const [zones, setZones] = useState<ZoneItem[]>([])
  const [showZones, setShowZones] = useState(false)

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
          setGateways(json.gateways || [])
        }

        // Fetch all zones
        const zonesRes = await fetch('/api/portal/zones', { credentials: 'include' })
        const zonesJson = await zonesRes.json()
        if (zonesJson.success) {
          setZones(zonesJson.zones || [])
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        <button
          onClick={() => router.push(`/portal?zoneId=${encodeURIComponent(zoneId)}`)}
          className="inline-flex items-center text-base font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              {meta?.zoneName ? meta.zoneName : 'Zone'} {meta?.siteName ? `— ${meta.siteName}` : ''}
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              {meta?.address ? meta.address : 'Demo location'} · Bays: {meta?.bayCount ?? summary.total} · Bay colors: Green=Free, Red=Occupied, Gray=Unknown/low confidence
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {navigateTarget ? (
              <>
                <a
                  href={appleMapsDirectionsUrl({ lat: navigateTarget.lat, lng: navigateTarget.lng }, navigateTarget.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Apple Maps
                </a>
                <a
                  href={googleMapsDirectionsUrl({ lat: navigateTarget.lat, lng: navigateTarget.lng }, navigateTarget.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Google Maps
                </a>
              </>
            ) : (
              <span className="text-sm text-gray-500">Navigation available when coordinates exist</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 text-base font-medium rounded-full bg-green-50 text-green-700 border-2 border-green-200">Free: {summary.free}</span>
            <span className="px-4 py-2 text-base font-medium rounded-full bg-red-50 text-red-700 border-2 border-red-200">Occupied: {summary.occupied}</span>
            <span className="px-4 py-2 text-base font-medium rounded-full bg-yellow-50 text-yellow-800 border-2 border-yellow-200">Offline: {summary.offline}</span>
            <span className="px-4 py-2 text-base font-medium rounded-full bg-gray-50 text-gray-700 border-2 border-gray-200">Unknown: {summary.unknown}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Live Map (Mapbox)</h2>
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
                    setGateways(json.gateways || [])
                  }
                  setLoading(false)
                }}
                className="inline-flex items-center px-5 py-3 text-base font-medium rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
              >
                <Loader2 className="h-5 w-5 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowZones(!showZones)}
                className={`inline-flex items-center px-5 py-3 text-base font-medium rounded-lg transition-colors ${
                  showZones 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title={`${showZones ? 'Hide' : 'Show'} parking zones on map`}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Parking Areas ({zones.length})
              </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-700 font-medium mr-1">Filters:</span>
              {(['OCCUPIED', 'OFFLINE', 'UNKNOWN'] as const).map((k) => (
                <label key={k} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters as any)[k]}
                    onChange={(e) => setFilters((s) => ({ ...s, [k]: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{k === 'OCCUPIED' ? 'Occupied' : k === 'OFFLINE' ? 'Offline' : 'Unknown'}</span>
                </label>
              ))}
              <button
                onClick={() => setFilters({ OCCUPIED: false, OFFLINE: false, UNKNOWN: false })}
                className="px-4 py-2 text-sm font-medium rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Clear
              </button>
              <span className="ml-auto text-gray-600 font-medium">
                Showing {filteredItems.length} / {items.length}
              </span>
            </div>

            <div className="h-[600px] sm:h-[700px] lg:h-[900px] xl:h-[1000px] rounded-lg overflow-hidden">
              <MapboxMap
                meta={meta as any}
                items={filteredItems as any}
                gateways={gateways as any}
                zones={zones}
                showZones={showZones}
                initialLayers={{ sensors: true, gateways: true, traffic: false }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
            <div id="bay-details-scroll" className="space-y-3 max-h-[calc(100vh-300px)] overflow-auto">
              {filteredItems.map((b) => (
                <div
                  key={b.bayId}
                  data-bayid={b.bayId}
                  onClick={() => setSelectedBayId(b.bayId)}
                  className={`flex items-start justify-between border-b-2 border-gray-100 pb-3 cursor-pointer transition-all ${
                    selectedBayId === b.bayId ? 'bg-gray-50 rounded-lg px-3 py-3 border-2 border-gray-300' : 'hover:bg-gray-50 rounded-lg px-2 py-2'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold text-gray-900 truncate mb-1">{b.bayCode || b.bayId}</div>
                    <div className="text-sm text-gray-600 truncate mb-1">{b.devEui || 'No sensor bound'}</div>
                    <div className="text-xs text-gray-500">
                      Last seen: {b.lastSeen ? new Date(b.lastSeen).toLocaleString() : '—'} | Battery:{' '}
                      {typeof b.batteryPct === 'number' ? `${Math.round(b.batteryPct)}%` : '—'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <span
                      className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 ${
                        b.color === 'GREEN'
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : b.color === 'RED'
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    >
                      {b.state}
                    </span>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && <p className="text-base text-gray-500">No bays match the current filters.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



