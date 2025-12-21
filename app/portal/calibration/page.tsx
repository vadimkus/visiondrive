'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import Section from '../../components/common/Section'
import { ArrowLeft, Loader2, Save, Search, Layers } from 'lucide-react'

type SensorRow = {
  id: string
  devEui: string
  type: string
  status: string
  lat: number | null
  lng: number | null
  bayLat?: number | null
  bayLng?: number | null
  bayCode: string | null
  zoneName: string | null
  siteName: string | null
}

export default function CalibrationPage() {
  const router = useRouter()
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [bootLoading, setBootLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [items, setItems] = useState<SensorRow[]>([])
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const [satellite, setSatellite] = useState(false)
  const [mode3d, setMode3d] = useState(false)
  const [installedOnly, setInstalledOnly] = useState(true)
  const [showAllOnMap, setShowAllOnMap] = useState(true)

  const allSensorsGeojson = useMemo(() => {
    const features = (items || [])
      .map((s) => {
        const lat = typeof s.lat === 'number' ? s.lat : typeof s.bayLat === 'number' ? s.bayLat : null
        const lng = typeof s.lng === 'number' ? s.lng : typeof s.bayLng === 'number' ? s.bayLng : null
        if (typeof lat !== 'number' || typeof lng !== 'number') return null
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {
            id: s.id,
            devEui: s.devEui,
            selected: selectedId === s.id ? 1 : 0,
          },
        }
      })
      .filter(Boolean)
    return { type: 'FeatureCollection', features }
  }, [items, selectedId])

  const selected = useMemo(() => items.find((s) => s.id === selectedId) || null, [items, selectedId])
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items
    return items.filter((s) => `${s.devEui} ${s.bayCode || ''} ${s.zoneName || ''}`.toLowerCase().includes(t))
  }, [items, q])

  const center = useMemo(() => {
    // Prefer selected sensor location; fallback to Dubai Media City (demo)
    const lat = draft.lat ?? selected?.lat
    const lng = draft.lng ?? selected?.lng
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng }
    return { lat: 25.1016, lng: 55.1622 }
  }, [draft.lat, draft.lng, selected?.lat, selected?.lng])

  const load = async (boot = false) => {
    if (boot) setBootLoading(true)
    else setListLoading(true)
    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' })
      if (!meRes.ok) {
        router.push('/login')
        return
      }
      const meJson = await meRes.json()
      if (!['MASTER_ADMIN', 'CUSTOMER_ADMIN'].includes(meJson.user?.role)) {
        router.push('/portal')
        return
      }

      const res = await fetch(
        `/api/portal/admin/sensors?q=${encodeURIComponent(q.trim())}&installedOnly=${installedOnly ? '1' : '0'}`,
        { credentials: 'include' }
      )
      const json = await res.json()
      if (json.success) setItems(json.items || [])
    } finally {
      if (boot) setBootLoading(false)
      else setListLoading(false)
    }
  }

  useEffect(() => {
    load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // reload when installedOnly changes
    if (!bootLoading) load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installedOnly])

  // Initialize map once
  useEffect(() => {
    if (!token) return
    if (!containerRef.current) return
    if (mapRef.current) return

    ;(mapboxgl as any).accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/light-v11',
      center: [center.lng, center.lat],
      zoom: satellite ? 19 : 18,
      pitch: mode3d ? 60 : 0,
      bearing: 0,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

    map.on('style.load', () => {
      // 3D buildings layer (works with Mapbox Streets style sources)
      try {
        if (mode3d && !map.getLayer('3d-buildings') && map.getSource('composite')) {
          map.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.45,
            },
          })
        }
      } catch {
        // ignore
      }
    })
  }, [token, center.lat, center.lng, mode3d, satellite])

  // Update style (satellite toggle)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const style = satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/light-v11'
    if ((map as any)._style?.stylesheet?.id) {
      // still safe to call setStyle; mapbox handles reload
    }
    map.setStyle(style)
  }, [satellite])

  // Update pitch (3D toggle)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({ pitch: mode3d ? 60 : 0, duration: 400 })
  }, [mode3d])

  // Add/update "all sensors" layer for visual reference
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const ensureLayers = () => {
      if (!map.getSource('calib-sensors')) {
        map.addSource('calib-sensors', { type: 'geojson', data: allSensorsGeojson as any })
      } else {
        ;(map.getSource('calib-sensors') as any).setData(allSensorsGeojson as any)
      }

      // base dots
      if (!map.getLayer('calib-sensors-dots')) {
        map.addLayer({
          id: 'calib-sensors-dots',
          type: 'circle',
          source: 'calib-sensors',
          paint: {
            'circle-radius': 4,
            'circle-color': '#2563eb',
            'circle-opacity': 0.55,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      // selected ring
      if (!map.getLayer('calib-sensors-selected')) {
        map.addLayer({
          id: 'calib-sensors-selected',
          type: 'circle',
          source: 'calib-sensors',
          filter: ['==', ['get', 'selected'], 1],
          paint: {
            'circle-radius': 10,
            'circle-color': '#ffffff',
            'circle-opacity': 0.95,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#111827',
          },
        })
      } else {
        map.setFilter('calib-sensors-selected', ['==', ['get', 'selected'], 1])
      }

      // click to select
      if (!(map as any).__calibClickBound) {
        map.on('click', 'calib-sensors-dots', (e) => {
          const f = e.features?.[0] as any
          const id = f?.properties?.id ? String(f.properties.id) : ''
          if (!id) return
          const s = items.find((x) => x.id === id)
          if (!s) return
          setSelectedId(s.id)
          const fallback =
            typeof s.lat === 'number' && typeof s.lng === 'number'
              ? { lat: s.lat, lng: s.lng }
              : typeof s.bayLat === 'number' && typeof s.bayLng === 'number'
                ? { lat: s.bayLat, lng: s.bayLng }
                : (() => {
                    const c = map.getCenter()
                    return { lat: c.lat, lng: c.lng }
                  })()
          setDraft({ lat: fallback.lat, lng: fallback.lng })
          setStatus(null)
        })
        map.on('mouseenter', 'calib-sensors-dots', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'calib-sensors-dots', () => (map.getCanvas().style.cursor = ''))
        ;(map as any).__calibClickBound = true
      }

      // toggle visibility
      const vis = showAllOnMap ? 'visible' : 'none'
      if (map.getLayer('calib-sensors-dots')) map.setLayoutProperty('calib-sensors-dots', 'visibility', vis)
      if (map.getLayer('calib-sensors-selected')) map.setLayoutProperty('calib-sensors-selected', 'visibility', vis)
    }

    if (map.isStyleLoaded()) ensureLayers()
    map.once('style.load', ensureLayers)

    // Update data on changes
    try {
      ensureLayers()
    } catch {
      // style may be transitioning
    }
  }, [allSensorsGeojson, items, showAllOnMap])

  // Place / update draggable marker for selected sensor
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!selectedId) return

    const lat = draft.lat ?? selected?.lat
    const lng = draft.lng ?? selected?.lng
    const start =
      typeof lat === 'number' && typeof lng === 'number'
        ? { lat, lng }
        : (() => {
            const c = map.getCenter()
            return { lat: c.lat, lng: c.lng }
          })()

    // Create marker if needed
    if (!markerRef.current) {
      const m = new mapboxgl.Marker({ draggable: true, color: '#111827' })
        .setLngLat([start.lng, start.lat])
        .addTo(map)
      m.on('dragend', () => {
        const p = m.getLngLat()
        setDraft({ lat: p.lat, lng: p.lng })
        setStatus(`Draft position: ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`)
      })
      markerRef.current = m
    } else {
      markerRef.current.setLngLat([start.lng, start.lat])
    }

    // Ensure draft coords are set even if sensor had no saved lat/lng yet.
    if (typeof draft.lat !== 'number' || typeof draft.lng !== 'number') {
      setDraft({ lat: start.lat, lng: start.lng })
    }

    map.easeTo({ center: [start.lng, start.lat], zoom: 19, duration: 450 })
  }, [selectedId, selected?.lat, selected?.lng, draft.lat, draft.lng])

  // Cleanup map
  useEffect(() => {
    return () => {
      markerRef.current?.remove()
      markerRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const save = async () => {
    if (!selectedId) return
    if (typeof draft.lat !== 'number' || typeof draft.lng !== 'number') {
      setStatus('Move the marker first (no draft lat/lng).')
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch(`/api/portal/admin/sensors/${selectedId}/location`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lat: draft.lat, lng: draft.lng }),
      })
      const json = await res.json()
      if (!json.success) {
        setStatus(`Save failed: ${json.error || 'UNKNOWN'}`)
        return
      }
      setStatus('Saved.')
      // Optimistic update: update list immediately so UI reflects saved coords without waiting.
      setItems((prev) => prev.map((s) => (s.id === selectedId ? { ...s, lat: draft.lat!, lng: draft.lng! } : s)))
      // refresh list so saved coords are in DB state
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (!token) {
    return (
      <Section className="pt-32 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
            Set <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to use Calibration.
          </div>
        </div>
      </Section>
    )
  }

  if (bootLoading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/portal')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Map Calibration (Sensors)</h1>
            <p className="text-sm text-gray-600">
              Select a sensor → drag marker to correct location → Save. This affects sensor placement, not bay polygons.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSatellite((v) => !v)}
              className={`inline-flex items-center px-3 py-2 text-sm rounded-lg border ${
                satellite ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title="Satellite view"
            >
              <Layers className="h-4 w-4 mr-2" />
              Satellite
            </button>
            <button
              onClick={() => setMode3d((v) => !v)}
              className={`inline-flex items-center px-3 py-2 text-sm rounded-lg border ${
                mode3d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title="3D mode"
            >
              3D
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <label className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white">
                <input type="checkbox" checked={installedOnly} onChange={(e) => setInstalledOnly(e.target.checked)} />
                Installed only (expect 40)
              </label>
              <label className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white">
                <input type="checkbox" checked={showAllOnMap} onChange={(e) => setShowAllOnMap(e.target.checked)} />
                Show all on map
              </label>
            </div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search DevEUI / bay / zone…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={() => load(false)}
                disabled={listLoading}
                className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                {listLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            <div className="text-xs text-gray-600 mb-2">Sensors: {filtered.length}</div>
            <div className="max-h-[720px] lg:max-h-[780px] overflow-auto border border-gray-100 rounded-lg">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedId(s.id)
                    const fallback =
                      typeof s.lat === 'number' && typeof s.lng === 'number'
                        ? { lat: s.lat, lng: s.lng }
                        : typeof s.bayLat === 'number' && typeof s.bayLng === 'number'
                          ? { lat: s.bayLat, lng: s.bayLng }
                          : (() => {
                              const c = mapRef.current?.getCenter()
                              return c ? { lat: c.lat, lng: c.lng } : { lat: 25.1016, lng: 55.1622 }
                            })()
                    setDraft({ lat: fallback.lat, lng: fallback.lng })
                    setStatus(null)
                  }}
                  className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 ${
                    selectedId === s.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 truncate">{s.devEui}</div>
                  <div className="text-xs text-gray-600 truncate">
                    {s.siteName || '—'} / {s.zoneName || '—'} / Bay {s.bayCode || '—'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {typeof s.lat === 'number' && typeof s.lng === 'number'
                      ? `Saved: ${s.lat.toFixed(6)}, ${s.lng.toFixed(6)}`
                      : 'No saved lat/lng yet'}
                  </div>
                </button>
              ))}
              {!filtered.length && <div className="p-4 text-sm text-gray-600">No sensors found.</div>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {!selected ? (
              <div className="text-sm text-gray-600">Select a sensor on the left to start calibrating.</div>
            ) : (
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{selected.devEui}</div>
                  <div className="text-xs text-gray-600 truncate">
                    {selected.siteName || '—'} / {selected.zoneName || '—'} / Bay {selected.bayCode || '—'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Draft: {typeof draft.lat === 'number' && typeof draft.lng === 'number' ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}` : '—'}
                  </div>
                </div>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            )}

            <div ref={containerRef} className="w-full h-[720px] lg:h-[780px] rounded-lg overflow-hidden border border-gray-200" />

            {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
          </div>
        </div>
      </div>
    </Section>
  )
}


