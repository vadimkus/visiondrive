'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import Section from '../../components/common/Section'
import { 
  Loader2, 
  Save, 
  Search, 
  Layers, 
  MapPin,
  Satellite,
  Box,
  Navigation,
  Info,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  MousePointer2,
  Move,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

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
  const multiBaseRef = useRef<Map<string, { lat: number; lng: number }>>(new Map())
  const multiMarkerBaseRef = useRef<{ lat: number; lng: number } | null>(null)
  const multiBaselineKeyRef = useRef<string>('')

  const [bootLoading, setBootLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [items, setItems] = useState<SensorRow[]>([])
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [draft, setDraft] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const [satellite, setSatellite] = useState(false)
  const [mode3d, setMode3d] = useState(false)
  const [installedOnly, setInstalledOnly] = useState(true)
  const [showAllOnMap, setShowAllOnMap] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Resize map when sidebar is toggled
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    
    // Small delay to let CSS transition complete
    const timer = setTimeout(() => {
      map.resize()
    }, 350) // Match the transition duration (300ms) + small buffer

    return () => clearTimeout(timer)
  }, [sidebarOpen])

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
            multiSelected: selectedIds.has(s.id) ? 1 : 0,
          },
        }
      })
      .filter(Boolean)
    return { type: 'FeatureCollection', features }
  }, [items, selectedId, selectedIds])

  const fitSensorsOnMap = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const fc: any = allSensorsGeojson as any
    const feats: any[] = Array.isArray(fc?.features) ? fc.features : []
    const coords: [number, number][] = feats
      .map((f) => f?.geometry?.coordinates)
      .filter(
        (c): c is [number, number] =>
          Array.isArray(c) && c.length === 2 && typeof c[0] === 'number' && typeof c[1] === 'number'
      )
    if (!coords.length) return

    let minLng = coords[0][0]
    let minLat = coords[0][1]
    let maxLng = coords[0][0]
    let maxLat = coords[0][1]
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng
      if (lat < minLat) minLat = lat
      if (lng > maxLng) maxLng = lng
      if (lat > maxLat) maxLat = lat
    }

    try {
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 70, duration: 700, maxZoom: 19 }
      )
    } catch {
      // ignore (map may be transitioning style)
    }
  }, [allSensorsGeojson])

  // When "Show all" is enabled, auto-fit once so all sensors are actually visible on the map.
  useEffect(() => {
    if (!showAllOnMap) return
    const map = mapRef.current
    if (!map) return
    const t = setTimeout(() => fitSensorsOnMap(), 75)
    return () => clearTimeout(t)
  }, [showAllOnMap, fitSensorsOnMap])

  const selectedIdsKey = useMemo(() => {
    if (!selectedIds || selectedIds.size === 0) return ''
    return Array.from(selectedIds).sort().join('|')
  }, [selectedIds])

  // Single stable key for effects that must not use variable-length dependency arrays
  const sensorsLayerKey = useMemo(() => {
    const ids = (items || []).map((s) => s.id).join('|')
    return [
      `ids=${ids}`,
      `sel=${selectedId ?? ''}`,
      `multi=${multiSelectMode ? 1 : 0}`,
      `multiIds=${selectedIdsKey}`,
      `showAll=${showAllOnMap ? 1 : 0}`,
    ].join('::')
  }, [items, selectedId, multiSelectMode, selectedIdsKey, showAllOnMap])

  const selected = useMemo(() => items.find((s) => s.id === selectedId) || null, [items, selectedId])
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items
    return items.filter((s) => `${s.devEui} ${s.bayCode || ''} ${s.zoneName || ''}`.toLowerCase().includes(t))
  }, [items, q])

  const sensorCoordDistinct = useMemo(() => {
    const key = (lat: any, lng: any) =>
      typeof lat === 'number' && typeof lng === 'number' ? `${lat.toFixed(7)},${lng.toFixed(7)}` : 'null'
    return new Set(items.map((s) => key(s.lat, s.lng))).size
  }, [items])

  const looksStacked = useMemo(() => {
    // Heuristic for demo: 40 sensors but only a few distinct coordinate pairs
    return items.length >= 30 && sensorCoordDistinct <= 5
  }, [items.length, sensorCoordDistinct])

  const resetDemoCoords = useCallback(async () => {
    try {
      setStatus('Fixing demo sensor positions…')
      const res = await fetch('/api/portal/admin/sensors', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reset_demo_coords' }),
      })
      const json = await res.json()
      if (!json?.success) {
        setStatus(`failed: ${json?.error || 'reset failed'}`)
        return
      }
      setStatus(`✓ Reset complete (distinct coords: ${json.after?.distinct_coords ?? 'n/a'})`)
      await load(false)
      // re-fit after reset
      setTimeout(() => fitSensorsOnMap(), 150)
    } catch (e: any) {
      setStatus(`failed: ${e?.message || 'reset failed'}`)
    }
  }, [fitSensorsOnMap])

  // Multi-select baseline: preserve relative spacing by applying a delta (translation) from the group's centroid.
  // If we don't do this, saving multi-select will "stack" sensors on the same coordinate.
  useEffect(() => {
    if (!multiSelectMode || selectedIds.size === 0) {
      multiBaselineKeyRef.current = ''
      multiBaseRef.current = new Map()
      multiMarkerBaseRef.current = null
      return
    }
    if (multiBaselineKeyRef.current === selectedIdsKey) return

    const selectedSensors = items.filter((s) => selectedIds.has(s.id))
    const baseMap = new Map<string, { lat: number; lng: number }>()
    const coords: Array<{ lat: number; lng: number }> = []
    for (const s of selectedSensors) {
      const lat = typeof s.lat === 'number' ? s.lat : typeof s.bayLat === 'number' ? s.bayLat : null
      const lng = typeof s.lng === 'number' ? s.lng : typeof s.bayLng === 'number' ? s.bayLng : null
      if (typeof lat === 'number' && typeof lng === 'number') {
        baseMap.set(s.id, { lat, lng })
        coords.push({ lat, lng })
      }
    }

    // Centroid (avg) as the group handle location
    const map = mapRef.current
    const fallbackCenter = map ? map.getCenter() : { lat: 25.1016, lng: 55.1622 }
    const avgLat = coords.length ? coords.reduce((sum, c) => sum + c.lat, 0) / coords.length : fallbackCenter.lat
    const avgLng = coords.length ? coords.reduce((sum, c) => sum + c.lng, 0) / coords.length : fallbackCenter.lng

    multiBaseRef.current = baseMap
    multiMarkerBaseRef.current = { lat: avgLat, lng: avgLng }
    multiBaselineKeyRef.current = selectedIdsKey
    setDraft({ lat: avgLat, lng: avgLng })
  }, [multiSelectMode, selectedIdsKey, selectedIds, items])

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
    if (!token) {
      console.error('Mapbox token not found')
      return
    }
    if (!containerRef.current) return
    if (mapRef.current) return

    ;(mapboxgl as any).accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/streets-v12',
      center: [center.lng, center.lat],
      zoom: satellite ? 19 : 18,
      pitch: mode3d ? 45 : 0,
      bearing: 0,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

    map.on('style.load', () => {
      // 3D buildings layer
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
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#e0e0e0',
                100, '#d0d0d0',
                200, '#c0c0c0'
              ],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6,
            },
          })
        }
      } catch {
        // ignore
      }
    })

    // map load event is handled by layer bootstrap; no debug logs in production
  }, [token, satellite, mode3d])

  // Update map center when center changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    map.flyTo({ center: [center.lng, center.lat], zoom: 18, duration: 1000 })
  }, [center.lat, center.lng])

  // Update style (satellite toggle)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const style = satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/streets-v12'
    map.setStyle(style)
  }, [satellite])

  // Update pitch (3D toggle)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({ pitch: mode3d ? 45 : 0, duration: 600 })
  }, [mode3d])

  // Add/update "all sensors" layer for visual reference
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!items.length) return // Don't try to add layers if no data yet

    const ensureLayers = () => {
      // Ensure map is ready
      if (!map.isStyleLoaded()) return

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
          filter: ['!=', ['get', 'multiSelected'], 1],
          paint: {
            'circle-radius': 6,
            'circle-color': '#3b82f6',
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      // multi-selected dots (orange)
      if (!map.getLayer('calib-sensors-multi')) {
        map.addLayer({
          id: 'calib-sensors-multi',
          type: 'circle',
          source: 'calib-sensors',
          filter: ['==', ['get', 'multiSelected'], 1],
          paint: {
            'circle-radius': 8,
            'circle-color': '#f97316',
            'circle-opacity': 0.9,
            'circle-stroke-width': 3,
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
            'circle-radius': 12,
            'circle-color': '#22c55e',
            'circle-opacity': 0.95,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
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

          if (multiSelectMode) {
            // Toggle in multi-select set
            setSelectedIds(prev => {
              const next = new Set(prev)
              if (next.has(id)) {
                next.delete(id)
              } else {
                next.add(id)
              }
              return next
            })
          } else {
            // Single select mode
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
          }
        })

        // Also handle clicks on multi-selected sensors
        map.on('click', 'calib-sensors-multi', (e) => {
          if (!multiSelectMode) return
          const f = e.features?.[0] as any
          const id = f?.properties?.id ? String(f.properties.id) : ''
          if (!id) return
          
          setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
            return next
          })
        })

        map.on('mouseenter', 'calib-sensors-dots', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'calib-sensors-dots', () => (map.getCanvas().style.cursor = ''))
        map.on('mouseenter', 'calib-sensors-multi', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'calib-sensors-multi', () => (map.getCanvas().style.cursor = ''))
        ;(map as any).__calibClickBound = true
      }

      // toggle visibility
      const vis = showAllOnMap ? 'visible' : 'none'
      if (map.getLayer('calib-sensors-dots')) map.setLayoutProperty('calib-sensors-dots', 'visibility', vis)
      if (map.getLayer('calib-sensors-multi')) map.setLayoutProperty('calib-sensors-multi', 'visibility', vis)
      if (map.getLayer('calib-sensors-selected')) map.setLayoutProperty('calib-sensors-selected', 'visibility', vis)
    }

    // Ensure on first render (map may still be loading) and re-ensure on every style reload
    const onStyleLoad = () => ensureLayers()
    map.on('style.load', onStyleLoad)

    // First load: sometimes this effect runs before the style is actually ready.
    // Use load/idle to guarantee we add sources/layers once Mapbox is ready.
    if (map.isStyleLoaded()) {
      ensureLayers()
    } else {
      map.once('load', ensureLayers)
      map.once('idle', ensureLayers)
    }

    return () => {
      map.off('style.load', onStyleLoad)
      map.off('load', ensureLayers)
      map.off('idle', ensureLayers)
    }
  }, [sensorsLayerKey])

  // Place / update draggable marker for selected sensor or multi-select center
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!selectedId && selectedIds.size === 0) {
      // No selection, remove marker
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    let start: { lat: number; lng: number }

    if (multiSelectMode && selectedIds.size > 0) {
      // Multi-select mode: place marker at center or draft position
      if (typeof draft.lat === 'number' && typeof draft.lng === 'number') {
        start = { lat: draft.lat, lng: draft.lng }
      } else {
        // Calculate center of selected sensors
        const selectedSensors = items.filter(s => selectedIds.has(s.id))
        const coords = selectedSensors
          .map(s => {
            const lat = typeof s.lat === 'number' ? s.lat : typeof s.bayLat === 'number' ? s.bayLat : null
            const lng = typeof s.lng === 'number' ? s.lng : typeof s.bayLng === 'number' ? s.bayLng : null
            return lat !== null && lng !== null ? { lat, lng } : null
          })
          .filter((c): c is { lat: number; lng: number } => c !== null)
        
        if (coords.length > 0) {
          const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length
          const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length
          start = { lat: avgLat, lng: avgLng }
          setDraft({ lat: avgLat, lng: avgLng })
        } else {
          const c = map.getCenter()
          start = { lat: c.lat, lng: c.lng }
          setDraft({ lat: c.lat, lng: c.lng })
        }
      }
    } else {
      // Single select mode
      const lat = draft.lat ?? selected?.lat
      const lng = draft.lng ?? selected?.lng
      start =
        typeof lat === 'number' && typeof lng === 'number'
          ? { lat, lng }
          : (() => {
              const c = map.getCenter()
              return { lat: c.lat, lng: c.lng }
            })()
    }

    // Create marker if needed
    if (!markerRef.current) {
      const m = new mapboxgl.Marker({ draggable: true, color: multiSelectMode ? '#f97316' : '#ef4444' })
        .setLngLat([start.lng, start.lat])
        .addTo(map)
      m.on('dragend', () => {
        const p = m.getLngLat()
        setDraft({ lat: p.lat, lng: p.lng })
        if (multiSelectMode) {
          const base = multiMarkerBaseRef.current
          const dLat = base ? p.lat - base.lat : 0
          const dLng = base ? p.lng - base.lng : 0
          setStatus(`Move group: Δ${dLat.toFixed(6)}, ${dLng.toFixed(6)} (affects ${selectedIds.size} sensors)`)
        } else {
          setStatus(`Moved to: ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`)
        }
      })
      markerRef.current = m
    } else {
      markerRef.current.setLngLat([start.lng, start.lat])
      // Update marker color based on mode
      markerRef.current.remove()
      const m = new mapboxgl.Marker({ draggable: true, color: multiSelectMode ? '#f97316' : '#ef4444' })
        .setLngLat([start.lng, start.lat])
        .addTo(map)
      m.on('dragend', () => {
        const p = m.getLngLat()
        setDraft({ lat: p.lat, lng: p.lng })
        if (multiSelectMode) {
          const base = multiMarkerBaseRef.current
          const dLat = base ? p.lat - base.lat : 0
          const dLng = base ? p.lng - base.lng : 0
          setStatus(`Move group: Δ${dLat.toFixed(6)}, ${dLng.toFixed(6)} (affects ${selectedIds.size} sensors)`)
        } else {
          setStatus(`Moved to: ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`)
        }
      })
      markerRef.current = m
    }

    // Ensure draft coords are set
    if (typeof draft.lat !== 'number' || typeof draft.lng !== 'number') {
      setDraft({ lat: start.lat, lng: start.lng })
    }

    map.easeTo({ center: [start.lng, start.lat], zoom: 19, duration: 450 })
  }, [selectedId, selected?.lat, selected?.lng, draft.lat, draft.lng, multiSelectMode, selectedIds, items])

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
    if (multiSelectMode && selectedIds.size > 0) {
      // Bulk save for multiple sensors
      if (typeof draft.lat !== 'number' || typeof draft.lng !== 'number') {
        setStatus('Move the marker first to set the position for all selected sensors.')
        return
      }
      
      setSaving(true)
      setStatus(null)
      try {
        const baseMarker = multiMarkerBaseRef.current
        if (!baseMarker) {
          setStatus('failed: multi-select baseline not initialized (try reselecting sensors)')
          return
        }

        const dLat = draft.lat - baseMarker.lat
        const dLng = draft.lng - baseMarker.lng

        const updates: Array<{ id: string; lat: number; lng: number }> = []
        for (const id of Array.from(selectedIds)) {
          const base = multiBaseRef.current.get(id)
          if (!base) continue
          updates.push({ id, lat: base.lat + dLat, lng: base.lng + dLng })
        }

        if (!updates.length) {
          setStatus('failed: no valid sensor positions to update')
          return
        }

        const res = await fetch('/api/portal/admin/sensors', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'bulk_update_locations', updates }),
        })
        const json = await res.json()
        if (!json?.success) {
          setStatus(`failed: ${json?.error || 'bulk save failed'}`)
          return
        }

        const nextById = new Map(updates.map((u) => [u.id, u]))
        setItems((prev) =>
          prev.map((s) => {
            const u = nextById.get(s.id)
            return u ? { ...s, lat: u.lat, lng: u.lng } : s
          })
        )

        setStatus(`✓ Saved ${json.updated ?? updates.length} sensor${(json.updated ?? updates.length) !== 1 ? 's' : ''}`)
        await load(false)
      } finally {
        setSaving(false)
      }
    } else if (selectedId) {
      // Single sensor save
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
        setStatus('Saved successfully! ✓')
        // Optimistic update
        setItems((prev) => prev.map((s) => (s.id === selectedId ? { ...s, lat: draft.lat!, lng: draft.lng! } : s)))
        await load()
      } finally {
        setSaving(false)
      }
    }
  }

  if (!token) {
    return (
      <Section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-md">
            <p className="text-sm text-yellow-900">
              Set <code className="font-mono font-semibold">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to use Calibration.
            </p>
          </div>
        </div>
      </Section>
    )
  }

  if (bootLoading) {
    return (
      <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading calibration tools...</p>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto">
        {/* Header Bar */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sensor Calibration</h1>
                <p className="text-sm text-gray-600">Drag sensors to their exact location on the map</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (multiSelectMode) {
                    // Exit multi-select mode
                    setSelectedIds(new Set())
                    setMultiSelectMode(false)
                  } else {
                    // Enter multi-select mode
                    setSelectedId(null)
                    setMultiSelectMode(true)
                  }
                }}
                className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
                  multiSelectMode
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MousePointer2 className="h-4 w-4 mr-2" />
                {multiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
              </button>
              
              {multiSelectMode && (
                <>
                  <button
                    onClick={() => {
                      const visibleIds = new Set(filtered.map(s => s.id))
                      setSelectedIds(visibleIds)
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm font-medium"
                  >
                    Select All Visible
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm font-medium"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear ({selectedIds.size})
                  </button>
                </>
              )}
              
              <button
                onClick={() => setSatellite((v) => !v)}
                className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
                  satellite 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Satellite className="h-4 w-4 mr-2" />
                Satellite
              </button>
              <button
                onClick={() => setMode3d((v) => !v)}
                className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
                  mode3d 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Box className="h-4 w-4 mr-2" />
                3D
              </button>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)] relative">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'col-span-12 lg:col-span-3' : 'col-span-0'} bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 relative ${!sidebarOpen && 'hidden'}`}>
            {/* Chevron Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 -right-3 z-10 bg-white border border-gray-300 rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </button>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  <h2 className="font-bold text-gray-900">Sensors</h2>
                </div>

                {looksStacked && (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <div className="font-semibold">Demo sensor positions look stacked</div>
                    <div className="mt-0.5">
                      Only {sensorCoordDistinct} distinct sensor coordinate pairs detected. Click “Reset demo coords” to
                      restore 40 distinct points from bay positions.
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={resetDemoCoords}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 transition-colors"
                      >
                        Reset demo coords
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search DevEUI / bay..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={installedOnly} 
                        onChange={(e) => setInstalledOnly(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-gray-700">Installed only</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showAllOnMap} 
                        onChange={(e) => setShowAllOnMap(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-gray-700">Show all on map</span>
                    </label>
                    <button
                      type="button"
                      onClick={fitSensorsOnMap}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm text-xs"
                      title="Fit all sensors on map"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-blue-600" />
                      Fit
                    </button>
                    <button
                      onClick={() => load(false)}
                      disabled={listLoading}
                      className="ml-auto p-1 hover:bg-blue-100 rounded transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`h-4 w-4 text-blue-600 ${listLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mt-2">
                  {filtered.length} sensor{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (multiSelectMode) {
                        setSelectedIds(prev => {
                          const next = new Set(prev)
                          if (next.has(s.id)) {
                            next.delete(s.id)
                          } else {
                            next.add(s.id)
                          }
                          return next
                        })
                      } else {
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
                      }
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      multiSelectMode && selectedIds.has(s.id)
                        ? 'bg-orange-50 border-l-4 border-l-orange-600'
                        : selectedId === s.id && !multiSelectMode
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {multiSelectMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => {}}
                          className="mt-1 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm font-semibold text-gray-900 truncate">{s.devEui}</div>
                        <div className="text-xs text-gray-600 truncate mt-1">
                          {s.siteName || '—'} · {s.zoneName || '—'} · Bay {s.bayCode || '—'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {typeof s.lat === 'number' && typeof s.lng === 'number' ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="h-3 w-3" />
                              Calibrated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              <AlertCircle className="h-3 w-3" />
                              Needs position
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {!filtered.length && (
                  <div className="p-8 text-center text-gray-500">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium">No sensors found</p>
                  </div>
                )}
              </div>
            </div>
          {/* Chevron Toggle Button - Visible when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-0 top-4 z-10 bg-white border border-gray-300 rounded-r-full pl-1.5 pr-2 py-2 shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
              title="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Map Container */}
          <div className={`${sidebarOpen ? 'col-span-12 lg:col-span-9' : 'col-span-12'} bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col`}>
            {/* Map Header */}
            {multiSelectMode && selectedIds.size > 0 ? (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <Move className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900">
                        Multi-Select Mode: {selectedIds.size} sensor{selectedIds.size !== 1 ? 's' : ''} selected
                      </div>
                      <div className="text-xs text-gray-600">
                        Drag the marker to set position for all selected sensors
                      </div>
                      {typeof draft.lat === 'number' && typeof draft.lng === 'number' && (
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          Target position: {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={save}
                    disabled={saving || typeof draft.lat !== 'number' || typeof draft.lng !== 'number'}
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Saving...' : `Save ${selectedIds.size} Position${selectedIds.size !== 1 ? 's' : ''}`}
                  </button>
                </div>
                {status && (
                  <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    status.includes('✓') || status.includes('success') || status.includes('Saved')
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : status.includes('failed') || status.includes('error')
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {status.includes('✓') || status.includes('success') || status.includes('Saved') ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : status.includes('failed') || status.includes('error') ? (
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                )}
              </div>
            ) : selected && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm font-bold text-gray-900 truncate">{selected.devEui}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {selected.siteName} · {selected.zoneName} · Bay {selected.bayCode}
                      </div>
                      {typeof draft.lat === 'number' && typeof draft.lng === 'number' && (
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          Position: {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={save}
                    disabled={saving || typeof draft.lat !== 'number' || typeof draft.lng !== 'number'}
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Position'}
                  </button>
                </div>
                {status && (
                  <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    status.includes('✓') || status.includes('success')
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : status.includes('failed') || status.includes('error')
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {status.includes('✓') || status.includes('success') ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : status.includes('failed') || status.includes('error') ? (
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                )}
              </div>
            )}

            {/* Map */}
            <div className="flex-1 relative">
              <div ref={containerRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

