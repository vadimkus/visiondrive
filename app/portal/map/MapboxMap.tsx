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

type Props = {
  meta: MapMeta | null
  items: MapItem[]
  gateways?: GatewayItem[]
  zones?: any[]
  showZones?: boolean
  initialLayers?: { sensors?: boolean; gateways?: boolean; traffic?: boolean }
}

function asFeatureCollection(features: any[]) {
  return { type: 'FeatureCollection', features }
}

function labelFromBayCode(bayCode: string | null | undefined) {
  const s = (bayCode || '').trim()
  if (!s) return ''
  const m = /^A0*(\d+)$/.exec(s)
  if (m?.[1]) return `A${Number(m[1])}`
  return s
}

function colorForState(state: MapItem['state']) {
  // Requested scheme:
  // - free: green
  // - occupied: red
  // - offline: black
  // - online/unknown: blue
  if (state === 'FREE') return '#16a34a' // green-600
  if (state === 'OCCUPIED') return '#dc2626' // red-600
  if (state === 'OFFLINE') return '#000000' // black
  return '#2563eb' // blue-600
}

export default function MapboxMap({ meta, items, gateways, zones, showZones, initialLayers }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const [layers, setLayers] = useState({
    sensors: initialLayers?.sensors ?? true,
    gateways: initialLayers?.gateways ?? true,
    traffic: initialLayers?.traffic ?? false,
  })

  // Update zones visibility when showZones prop changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const setVis = (id: string, on: boolean) => {
      if (!map.getLayer(id)) return
      map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    }
    setVis('zone-fills', showZones ?? false)
    setVis('zone-outlines', showZones ?? false)
    setVis('zone-labels', showZones ?? false)
  }, [showZones])

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
              label: labelFromBayCode(b.bayCode),
            },
          }
        })
        .filter(Boolean)
    )
  }, [items])

  const gatewayPoints = useMemo(() => {
    return asFeatureCollection(
      (gateways || [])
        .map((g) => {
          if (typeof g.lat !== 'number' || typeof g.lng !== 'number') return null
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [g.lng, g.lat] },
            properties: {
              id: g.id,
              name: g.name,
              label: 'G',
              status: g.status || '',
              backhaul: g.backhaul || '',
              lastHeartbeat: g.lastHeartbeat || '',
              ageMinutes: typeof g.ageMinutes === 'number' ? g.ageMinutes : null,
              state: g.state || '',
            },
          }
        })
        .filter(Boolean)
    )
  }, [gateways])

  const zonesGeojson = useMemo(() => {
    if (!zones || !zones.length) return asFeatureCollection([])
    return asFeatureCollection(
      zones
        .filter((z) => z.geojson && z.geojson.geometry)
        .map((z) => ({
          ...z.geojson,
          properties: {
            ...z.geojson.properties,
            zoneId: z.id,
            name: z.name,
            kind: z.kind,
            bayCount: z.bayCount,
            address: z.geojson.properties?.address || z.address || '',
            source: z.geojson.properties?.source || 'VisionDrive',
            tariff: z.tariff ? JSON.stringify(z.tariff) : null,
          },
        }))
    )
  }, [zones])

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
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: 15,
      })
      mapRef.current = map

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

      map.on('load', () => {
        // Add Mapbox Traffic layer (v1 - shows real-time traffic)
        // This layer is part of Mapbox's standard traffic data
        map.addSource('mapbox-traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1',
        } as any)

        // Traffic flow layer (colored lines showing traffic speed)
        map.addLayer({
          id: 'traffic-flow',
          type: 'line',
          source: 'mapbox-traffic',
          'source-layer': 'traffic',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            'visibility': layers.traffic ? 'visible' : 'none',
          },
          paint: {
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3, 18, 6],
            'line-color': [
              'case',
              ['==', 'low', ['get', 'congestion']],
              '#16a34a', // green - free flow
              ['==', 'moderate', ['get', 'congestion']],
              '#f59e0b', // amber - moderate
              ['==', 'heavy', ['get', 'congestion']],
              '#dc2626', // red - heavy
              ['==', 'severe', ['get', 'congestion']],
              '#7f1d1d', // dark red - severe
              '#3b82f6', // blue - default
            ],
          },
        } as any, 'road-label') // Place below road labels

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
            'circle-radius': 4,
            'circle-color': [
              'match',
              ['get', 'state'],
              'FREE',
              '#16a34a',
              'OCCUPIED',
              '#dc2626',
              'OFFLINE',
              '#000000',
              '#2563eb',
            ],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        })

        // Sensor labels (A1..A40)
        map.addLayer({
          id: 'sensor-labels',
          type: 'symbol',
          source: 'sensors',
          filter: ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'label'], '']],
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 10,
            'text-offset': [0, 0.8],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#111827',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.25,
          },
        })

        // Gateways (clustered)
        map.addSource('gateways', {
          type: 'geojson',
          data: gatewayPoints as any,
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 16,
        } as any)
        map.addLayer({
          id: 'gateway-clusters',
          type: 'circle',
          source: 'gateways',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#2563eb',
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
            'circle-opacity': 0.75,
          },
        })
        map.addLayer({
          id: 'gateway-cluster-count',
          type: 'symbol',
          source: 'gateways',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 },
          paint: { 'text-color': '#ffffff' },
        })
        map.addLayer({
          id: 'gateway-unclustered',
          type: 'circle',
          source: 'gateways',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#2563eb',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        })

        // Gateway label ("G")
        map.addLayer({
          id: 'gateway-labels',
          type: 'symbol',
          source: 'gateways',
          filter: ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'label'], '']],
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 10,
            'text-offset': [0, 0.8],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#111827',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.25,
          },
        })

        // Parking Zones (polygons)
        map.addSource('zones', {
          type: 'geojson',
          data: zonesGeojson as any,
        } as any)

        // Zone fill layer
        map.addLayer({
          id: 'zone-fills',
          type: 'fill',
          source: 'zones',
          layout: {
            'visibility': 'none',
          },
          paint: {
            'fill-color': [
              'match',
              ['get', 'kind'],
              'FREE',
              '#10b981', // green
              'PAID',
              '#3b82f6', // blue
              'PRIVATE',
              '#8b5cf6', // purple
              '#6b7280', // gray default
            ],
            'fill-opacity': 0.15,
          },
        })

        // Zone outline layer
        map.addLayer({
          id: 'zone-outlines',
          type: 'line',
          source: 'zones',
          layout: {
            'visibility': 'none',
          },
          paint: {
            'line-color': [
              'match',
              ['get', 'kind'],
              'FREE',
              '#10b981',
              'PAID',
              '#3b82f6',
              'PRIVATE',
              '#8b5cf6',
              '#6b7280',
            ],
            'line-width': 2,
            'line-opacity': 0.8,
          },
        })

        // Zone labels
        map.addLayer({
          id: 'zone-labels',
          type: 'symbol',
          source: 'zones',
          layout: {
            'visibility': 'none',
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#1f2937',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        })

        const gatewayPopup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
        const zonePopup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })

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

        map.on('click', 'gateway-clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['gateway-clusters'] })
          const clusterId = features[0]?.properties?.cluster_id
          const src = map.getSource('gateways') as any
          src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return
            const c = (features[0].geometry as any).coordinates
            map.easeTo({ center: c, zoom })
          })
        })

        map.on('mouseenter', 'gateway-unclustered', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'gateway-unclustered', () => (map.getCanvas().style.cursor = ''))
        map.on('click', 'gateway-unclustered', (e) => {
          const f = e.features?.[0] as any
          if (!f) return
          const coords = (f.geometry.coordinates as [number, number]) || [center.lng, center.lat]
          const p = f.properties || {}
          const name = p.name || 'Gateway'
          const state = p.state || '—'
          const backhaul = p.backhaul || '—'
          const last = p.lastHeartbeat ? new Date(p.lastHeartbeat).toLocaleString() : '—'
          gatewayPopup
            .setLngLat(coords as any)
            .setHTML(
              `<div style="font-family: system-ui; font-size: 14px; line-height: 1.6;">` +
                `<div style="font-weight: 700; font-size: 16px; margin-bottom: 6px;">${name}</div>` +
                `<div style="margin-bottom: 4px;"><b>State:</b> ${state}</div>` +
                `<div style="margin-bottom: 4px;"><b>Backhaul:</b> ${backhaul}</div>` +
                `<div><b>Last heartbeat:</b> ${last}</div>` +
                `</div>`
            )
            .addTo(map)
        })

        // Parking Zones - hover and click handlers
        map.on('mouseenter', 'zone-fills', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'zone-fills', () => (map.getCanvas().style.cursor = ''))
        map.on('click', 'zone-fills', (e) => {
          const f = e.features?.[0] as any
          if (!f) return
          
          // Get center of the zone polygon
          const bounds = new mapboxgl.LngLatBounds()
          if (f.geometry.type === 'Polygon') {
            const coords = f.geometry.coordinates[0]
            coords.forEach((coord: [number, number]) => bounds.extend(coord))
          }
          const center = bounds.getCenter()
          
          const p = f.properties || {}
          const name = p.name || 'Parking Zone'
          const kind = p.kind || 'PAID'
          const address = p.address || '—'
          const source = p.source || 'VisionDrive'
          
          // Parse tariff if available
          let tariffHTML = ''
          if (p.tariff) {
            try {
              const tariff = JSON.parse(p.tariff)
              tariffHTML = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">` +
                `<div style="font-weight: 600; margin-bottom: 4px;">💰 Tariff</div>` +
                `<div style="margin-bottom: 2px;">Rate: ${tariff.rateAedPerHour} AED/hour</div>` +
                `<div style="margin-bottom: 2px;">Hours: ${tariff.hours}</div>` +
                `<div>Max Daily: ${tariff.maxDailyAed} AED</div>` +
                `</div>`
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          // Color-coded badge for zone type
          const kindColor = kind === 'FREE' ? '#10b981' : kind === 'PAID' ? '#3b82f6' : '#8b5cf6'
          const kindEmoji = kind === 'FREE' ? '🆓' : kind === 'PAID' ? '💳' : '🔒'
          
          zonePopup
            .setLngLat(center)
            .setHTML(
              `<div style="font-family: system-ui; font-size: 14px; line-height: 1.6;">` +
                `<div style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">${name}</div>` +
                `<div style="margin-bottom: 4px;">` +
                  `<span style="display: inline-block; padding: 2px 8px; background: ${kindColor}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;">` +
                    `${kindEmoji} ${kind}` +
                  `</span>` +
                `</div>` +
                `<div style="margin-bottom: 4px;"><b>📍 Location:</b> ${address}</div>` +
                `<div style="margin-bottom: 4px; font-size: 12px; color: #6b7280;">Source: ${source}</div>` +
                tariffHTML +
              `</div>`
            )
            .addTo(map)
        })

        // Initial visibility (guard missing layers)
        const setVis = (id: string, on: boolean) => {
          if (!map.getLayer(id)) return
          map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
        }
        setVis('sensor-clusters', layers.sensors)
        setVis('sensor-cluster-count', layers.sensors)
        setVis('sensor-unclustered', layers.sensors)
        setVis('sensor-labels', layers.sensors)
        setVis('gateway-clusters', layers.gateways)
        setVis('gateway-cluster-count', layers.gateways)
        setVis('gateway-unclustered', layers.gateways)
        setVis('gateway-labels', layers.gateways)
      })
    }

    // Update data on changes
    const map = mapRef.current
    if (!map) return

    const updateSources = () => {
      const sensors = map.getSource('sensors') as any
      if (sensors) sensors.setData(sensorPoints as any)
      const gws = map.getSource('gateways') as any
      if (gws) gws.setData(gatewayPoints as any)
      const zns = map.getSource('zones') as any
      if (zns) zns.setData(zonesGeojson as any)
    }

    if (map.isStyleLoaded()) updateSources()
    else map.once('idle', updateSources)

    // Cleanup
    return () => {
      // Keep map across renders; do not destroy here.
    }
  }, [token, center.lat, center.lng, sensorPoints, gatewayPoints, zonesGeojson])

  // Toggle visibility
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const setVis = (id: string, on: boolean) => {
      if (!map.getLayer(id)) return
      map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    }
    setVis('sensor-clusters', layers.sensors)
    setVis('sensor-cluster-count', layers.sensors)
    setVis('sensor-unclustered', layers.sensors)
    setVis('sensor-labels', layers.sensors)
    setVis('gateway-clusters', layers.gateways)
    setVis('gateway-cluster-count', layers.gateways)
    setVis('gateway-unclustered', layers.gateways)
    setVis('gateway-labels', layers.gateways)
    setVis('traffic-flow', layers.traffic)
  }, [layers])

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
          <input type="checkbox" checked={layers.sensors} onChange={(e) => setLayers((s) => ({ ...s, sensors: e.target.checked }))} className="w-4 h-4" />
          <span className="font-medium">Sensors (clustered)</span>
        </label>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" checked={layers.gateways} onChange={(e) => setLayers((s) => ({ ...s, gateways: e.target.checked }))} className="w-4 h-4" />
          <span className="font-medium">Gateways</span>
        </label>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer">
          <input type="checkbox" checked={layers.traffic} onChange={(e) => setLayers((s) => ({ ...s, traffic: e.target.checked }))} className="w-4 h-4" />
          <span className="font-medium">🚦 Live Traffic (Dubai)</span>
        </label>
      </div>
      <div ref={containerRef} className="w-full flex-1 rounded-lg overflow-hidden" />
      <div className="text-sm text-gray-600 font-medium">
        Tip: click a sensor/gateway cluster to zoom in. Toggle traffic to see real-time congestion on Dubai roads.
      </div>
    </div>
  )
}


