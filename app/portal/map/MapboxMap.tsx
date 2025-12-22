'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

type MapItem = {
  bayId: string
  bayCode: string | null
  lat: number | null
  lng: number | null
  geojson: any | null
  sensorId: string | null
  devEui: string | null
  sensorLat?: number | null
  sensorLng?: number | null
  lastSeen: string | null
  batteryPct: number | null
  confidence: number
  ageMinutes: number | null
  state: 'FREE' | 'OCCUPIED' | 'OFFLINE' | 'UNKNOWN'
  color: 'GREEN' | 'RED' | 'GRAY'
}

type MapMeta = {
  siteName: string | null
  zoneName: string | null
  address: string | null
  centerLat: number | null
  centerLng: number | null
  zoneGeojson: any | null
  bayCount: number
}

type Props = {
  meta: MapMeta | null
  items: MapItem[]
  selectedBayId?: string | null
  onSelectBay?: (bayId: string) => void
  overlays?: any
  initialLayers?: { bays?: boolean; sensors?: boolean; zones?: boolean }
}

function asFeatureCollection(features: any[]) {
  return { type: 'FeatureCollection', features }
}

function colorForState(state: MapItem['state']) {
  if (state === 'FREE') return '#16a34a' // green-600
  if (state === 'OCCUPIED') return '#dc2626' // red-600
  if (state === 'OFFLINE') return '#d97706' // amber-600
  return '#6b7280' // gray-500
}

export default function MapboxMap({ meta, items, initialLayers, selectedBayId, onSelectBay, overlays }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const onSelectBayRef = useRef<Props['onSelectBay']>(undefined)

  // Keep latest callback without re-registering map handlers.
  onSelectBayRef.current = onSelectBay

  const [layers, setLayers] = useState({
    bays: initialLayers?.bays ?? true,
    sensors: initialLayers?.sensors ?? true,
    zones: initialLayers?.zones ?? true,
  })

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

  const center = useMemo(() => {
    if (typeof meta?.centerLat === 'number' && typeof meta?.centerLng === 'number') {
      return { lat: meta.centerLat, lng: meta.centerLng }
    }
    const pts = items.filter((i) => typeof i.lat === 'number' && typeof i.lng === 'number')
    if (!pts.length) return { lat: 25.2048, lng: 55.2708 } // Dubai fallback
    const lat = pts.reduce((s, p) => s + (p.lat as number), 0) / pts.length
    const lng = pts.reduce((s, p) => s + (p.lng as number), 0) / pts.length
    return { lat, lng }
  }, [items, meta?.centerLat, meta?.centerLng])

  const bayPolygons = useMemo(() => {
    return asFeatureCollection(
      items
        .map((b) => {
          const gj = b.geojson?.geometry ? b.geojson : null
          if (!gj) return null
          return {
            type: 'Feature',
            geometry: gj.geometry,
            properties: {
              bayId: b.bayId,
              bayCode: b.bayCode || '',
              state: b.state,
              confidence: b.confidence,
              lastSeen: b.lastSeen || '',
              devEui: b.devEui || '',
              batteryPct: typeof b.batteryPct === 'number' ? b.batteryPct : null,
              color: colorForState(b.state),
            },
          }
        })
        .filter(Boolean)
    )
  }, [items])

  const bayPoints = useMemo(() => {
    return asFeatureCollection(
      items
        .map((b) => {
          if (typeof b.lat !== 'number' || typeof b.lng !== 'number') return null
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
            properties: {
              bayId: b.bayId,
              bayCode: b.bayCode || '',
              state: b.state,
              confidence: b.confidence,
              lastSeen: b.lastSeen || '',
              devEui: b.devEui || '',
              batteryPct: typeof b.batteryPct === 'number' ? b.batteryPct : null,
              color: colorForState(b.state),
            },
          }
        })
        .filter(Boolean)
    )
  }, [items])

  const sensorPoints = useMemo(() => {
    return asFeatureCollection(
      items
        .map((b) => {
          if (!b.sensorId) return null
          const lat = typeof b.sensorLat === 'number' ? b.sensorLat : b.lat
          const lng = typeof b.sensorLng === 'number' ? b.sensorLng : b.lng
          if (typeof lat !== 'number' || typeof lng !== 'number') return null
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {
              sensorId: b.sensorId,
              devEui: b.devEui || '',
              state: b.state,
              color: colorForState(b.state),
            },
          }
        })
        .filter(Boolean)
    )
  }, [items])

  const currentZoneFeature = useMemo(() => {
    const z = meta?.zoneGeojson
    if (!z?.geometry) return asFeatureCollection([])
    return asFeatureCollection([
      {
        type: 'Feature',
        geometry: z.geometry,
        properties: { name: meta?.zoneName || '' },
      },
    ])
  }, [meta?.zoneGeojson, meta?.zoneName])

  const overlayZones = useMemo(() => {
    const z = overlays?.zones
    if (!z?.features) return asFeatureCollection([])
    return z
  }, [overlays])

  // Build / update map
  useEffect(() => {
    if (!containerRef.current) return
    if (!token) return

    // Configure mapbox token
    ;(mapboxgl as any).accessToken = token

    // Create map once
    if (!mapRef.current) {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [center.lng, center.lat],
        zoom: 15,
      })
      mapRef.current = map

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

      map.on('load', () => {
        // Current zone boundary (selected zone context)
        map.addSource('zone-current', { type: 'geojson', data: currentZoneFeature as any })
        map.addLayer({
          id: 'zone-current-fill',
          type: 'fill',
          source: 'zone-current',
          paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.08 },
        })
        map.addLayer({
          id: 'zone-current-outline',
          type: 'line',
          source: 'zone-current',
          paint: { 'line-color': '#2563eb', 'line-width': 2, 'line-opacity': 0.45 },
        })

        // Overlay zones (e.g., paid parking zones + tariffs)
        map.addSource('zones-overlay', { type: 'geojson', data: overlayZones as any })
        const zoneColor = [
          'match',
          ['get', 'kind'],
          'PAID',
          '#9333ea',
          'FREE',
          '#16a34a',
          'RESIDENT',
          '#2563eb',
          '#6b7280',
        ] as any
        map.addLayer({
          id: 'zones-overlay-fill',
          type: 'fill',
          source: 'zones-overlay',
          paint: { 'fill-color': zoneColor, 'fill-opacity': 0.06 },
        })
        map.addLayer({
          id: 'zones-overlay-outline',
          type: 'line',
          source: 'zones-overlay',
          paint: { 'line-color': zoneColor, 'line-width': 1.5, 'line-opacity': 0.6 },
        })

        // Bays polygon source + layers
        map.addSource('bays-poly', { type: 'geojson', data: bayPolygons as any })
        map.addLayer({
          id: 'bays-poly-fill',
          type: 'fill',
          source: 'bays-poly',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.4,
          },
        })
        map.addLayer({
          id: 'bays-poly-outline',
          type: 'line',
          source: 'bays-poly',
          paint: { 'line-color': '#111827', 'line-width': 2, 'line-opacity': 0.5 },
        })

        // Selected bay highlight (polygon)
        map.addLayer({
          id: 'bays-selected-outline',
          type: 'line',
          source: 'bays-poly',
          filter: ['==', ['get', 'bayId'], '__none__'],
          paint: { 'line-color': '#111827', 'line-width': 5, 'line-opacity': 0.9 },
        })

        // Bays point source (fallback if no polygons exist or for click targets)
        map.addSource('bays-pt', { type: 'geojson', data: bayPoints as any })
        map.addLayer({
          id: 'bays-pt',
          type: 'circle',
          source: 'bays-pt',
          paint: {
            'circle-radius': 8,
            'circle-color': ['get', 'color'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        })

        // Selected bay highlight (point fallback)
        map.addLayer({
          id: 'bays-selected-pt',
          type: 'circle',
          source: 'bays-pt',
          filter: ['==', ['get', 'bayId'], '__none__'],
          paint: {
            'circle-radius': 14,
            'circle-color': '#ffffff',
            'circle-stroke-width': 4,
            'circle-stroke-color': '#111827',
            'circle-opacity': 0.95,
          },
        })

        // Sensor points (clustered)
        map.addSource('sensors', {
          type: 'geojson',
          data: sensorPoints as any,
          cluster: true,
          clusterRadius: 40,
          clusterMaxZoom: 17,
        } as any)

        map.addLayer({
          id: 'sensor-clusters',
          type: 'circle',
          source: 'sensors',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#111827',
            'circle-radius': ['step', ['get', 'point_count'], 20, 25, 28, 60, 36],
            'circle-opacity': 0.75,
          },
        })
        map.addLayer({
          id: 'sensor-cluster-count',
          type: 'symbol',
          source: 'sensors',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
          },
          paint: { 'text-color': '#ffffff' },
        })
        map.addLayer({
          id: 'sensor-unclustered',
          type: 'circle',
          source: 'sensors',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#0f172a',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        })

        const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })

        const attachBayPopup = (layerId: string) => {
          map.on('click', layerId, (e) => {
            const f = e.features?.[0] as any
            if (!f) return
            const coords =
              f.geometry?.type === 'Point'
                ? (f.geometry.coordinates as [number, number])
                : (e.lngLat ? [e.lngLat.lng, e.lngLat.lat] : [center.lng, center.lat])

            const p = f.properties || {}
            const bayId = String(p.bayId || '')
            if (bayId) onSelectBayRef.current?.(bayId)
            const bayCode = p.bayCode || 'Bay'
            const state = p.state || 'UNKNOWN'
            const conf = typeof p.confidence === 'number' ? `${Math.round(p.confidence * 100)}%` : String(p.confidence || '')
            const last = p.lastSeen ? new Date(p.lastSeen).toLocaleString() : '—'
            const devEui = p.devEui || '—'
            const battery = p.batteryPct === null || typeof p.batteryPct === 'undefined' ? '—' : `${Math.round(Number(p.batteryPct))}%`

            popup
              .setLngLat(coords as any)
              .setHTML(
                `<div style=\"font-family: system-ui; font-size: 14px; line-height: 1.6;\">\n` +
                  `<div style=\"font-weight: 700; font-size: 16px; margin-bottom: 6px;\">${bayCode}</div>\n` +
                  `<div style=\"margin-bottom: 4px;\"><b>State:</b> ${state}</div>\n` +
                  `<div style=\"margin-bottom: 4px;\"><b>Confidence:</b> ${conf}</div>\n` +
                  `<div style=\"margin-bottom: 4px;\"><b>Last seen:</b> ${last}</div>\n` +
                  `<div style=\"margin-bottom: 4px;\"><b>Sensor:</b> ${devEui}</div>\n` +
                  `<div><b>Battery:</b> ${battery}</div>\n` +
                  `</div>`
              )
              .addTo(map)
          })
        }

        attachBayPopup('bays-poly-fill')
        attachBayPopup('bays-pt')

        map.on('mouseenter', 'bays-poly-fill', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'bays-poly-fill', () => (map.getCanvas().style.cursor = ''))
        map.on('mouseenter', 'bays-pt', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'bays-pt', () => (map.getCanvas().style.cursor = ''))

        map.on('click', 'sensor-clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['sensor-clusters'] })
          const clusterId = features[0]?.properties?.cluster_id
          const src = map.getSource('sensors') as any
          src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return
            const c = (features[0].geometry as any).coordinates
            map.easeTo({ center: c, zoom })
          })
        })

        // Initial visibility
        const setVis = (id: string, on: boolean) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
        setVis('zone-current-fill', layers.zones)
        setVis('zone-current-outline', layers.zones)
        setVis('zones-overlay-fill', layers.zones)
        setVis('zones-overlay-outline', layers.zones)
        setVis('bays-poly-fill', layers.bays)
        setVis('bays-poly-outline', layers.bays)
        setVis('bays-selected-outline', layers.bays)
        setVis('bays-pt', layers.bays)
        setVis('bays-selected-pt', layers.bays)
        setVis('sensor-clusters', layers.sensors)
        setVis('sensor-cluster-count', layers.sensors)
        setVis('sensor-unclustered', layers.sensors)
      })
    }

    // Update data on changes
    const map = mapRef.current
    if (!map) return

    const updateSources = () => {
      const zc = map.getSource('zone-current') as any
      if (zc) zc.setData(currentZoneFeature as any)
      const zo = map.getSource('zones-overlay') as any
      if (zo) zo.setData(overlayZones as any)
      const baysPoly = map.getSource('bays-poly') as any
      if (baysPoly) baysPoly.setData(bayPolygons as any)
      const baysPt = map.getSource('bays-pt') as any
      if (baysPt) baysPt.setData(bayPoints as any)
      const sensors = map.getSource('sensors') as any
      if (sensors) sensors.setData(sensorPoints as any)
    }

    if (map.isStyleLoaded()) updateSources()
    else map.once('idle', updateSources)

    // Cleanup
    return () => {
      // Keep map across renders; do not destroy here.
    }
  }, [token, center.lat, center.lng, bayPolygons, bayPoints, sensorPoints, currentZoneFeature, overlayZones])

  // Toggle visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const setVis = (id: string, on: boolean) => {
      if (!map.getLayer(id)) return
      map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    }
    setVis('zone-current-fill', layers.zones)
    setVis('zone-current-outline', layers.zones)
    setVis('zones-overlay-fill', layers.zones)
    setVis('zones-overlay-outline', layers.zones)
    setVis('bays-poly-fill', layers.bays)
    setVis('bays-poly-outline', layers.bays)
    setVis('bays-selected-outline', layers.bays)
    setVis('bays-pt', layers.bays)
    setVis('bays-selected-pt', layers.bays)
    setVis('sensor-clusters', layers.sensors)
    setVis('sensor-cluster-count', layers.sensors)
    setVis('sensor-unclustered', layers.sensors)
  }, [layers])

  // Selected bay highlight filter
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const id = selectedBayId ? String(selectedBayId) : '__none__'
    if (map.getLayer('bays-selected-outline')) map.setFilter('bays-selected-outline', ['==', ['get', 'bayId'], id])
    if (map.getLayer('bays-selected-pt')) map.setFilter('bays-selected-pt', ['==', ['get', 'bayId'], id])
  }, [selectedBayId])

  // Destroy on unmount
  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  if (!token) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
        <div className="font-semibold mb-1">Mapbox token missing</div>
        <div>
          Set <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in your environment to enable the live map.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" checked={layers.bays} onChange={(e) => setLayers((s) => ({ ...s, bays: e.target.checked }))} className="w-4 h-4" />
          <span className="font-medium">Bays</span>
        </label>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" checked={layers.sensors} onChange={(e) => setLayers((s) => ({ ...s, sensors: e.target.checked }))} className="w-4 h-4" />
          <span className="font-medium">Sensors (clustered)</span>
        </label>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" checked={layers.zones} onChange={(e) => setLayers((s) => ({ ...s, zones: e.target.checked }))} className="w-4 h-4" />
          <span className="font-medium">Zones overlay (paid/free)</span>
        </label>
      </div>
      <div ref={containerRef} className="w-full flex-1 rounded-lg overflow-hidden" />
      <div className="text-sm text-gray-600 font-medium">
        Tip: click a bay to see details. Click a sensor cluster to zoom in.
      </div>
    </div>
  )
}


