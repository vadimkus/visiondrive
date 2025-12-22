'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

function asFeatureCollection(features: any[]) {
  return { type: 'FeatureCollection', features }
}

function colorForKind(kind: string) {
  if (kind === 'gateway') return '#8b5cf6' // violet-500
  if (kind === 'sensor') return '#3b82f6' // blue-500
  return '#22c55e' // green-500 (site)
}

export default function NetworkOverviewMap({
  nodes,
  links,
}: {
  nodes: any[]
  links: any[]
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)

  const points = useMemo(() => {
    return asFeatureCollection(
      (nodes || [])
        .map((n: any) => {
          if (typeof n?.lat !== 'number' || typeof n?.lng !== 'number') return null
          const kind = String(n.kind || 'site')
          const label =
            kind === 'gateway'
              ? (n.serial ? `${n.name || 'Gateway'} (${n.serial})` : (n.name || 'Gateway'))
              : kind === 'sensor'
                ? (n.bayCode ? `Sensor ${n.devEui || ''} • Bay ${n.bayCode}` : `Sensor ${n.devEui || ''}`)
                : (n.name || 'Site')
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [n.lng, n.lat] },
            properties: {
              id: n.id,
              kind,
              refId: n.refId || null,
              label,
              color: colorForKind(kind),
            },
          }
        })
        .filter(Boolean)
    )
  }, [nodes])

  const lines = useMemo(() => {
    // Draw gateway -> sensor edges if both have coordinates.
    const byId = new Map<string, any>()
    for (const n of nodes || []) byId.set(String(n.id), n)
    const features = (links || [])
      .map((l: any) => {
        const from = byId.get(String(l.from))
        const to = byId.get(String(l.to))
        if (!from || !to) return null
        if (typeof from?.lng !== 'number' || typeof from?.lat !== 'number') return null
        if (typeof to?.lng !== 'number' || typeof to?.lat !== 'number') return null
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [from.lng, from.lat],
              [to.lng, to.lat],
            ],
          },
          properties: {
            from: l.from,
            to: l.to,
            lastSeen: l.lastSeen || null,
          },
        }
      })
      .filter(Boolean)
    return asFeatureCollection(features as any[])
  }, [nodes, links])

  const center = useMemo(() => {
    const coords = (nodes || [])
      .map((n: any) => (typeof n?.lat === 'number' && typeof n?.lng === 'number' ? [n.lng, n.lat] : null))
      .filter(Boolean) as [number, number][]
    if (!coords.length) return { center: [55.1622, 25.1016] as [number, number], zoom: 11 }
    const avgLng = coords.reduce((a, c) => a + c[0], 0) / coords.length
    const avgLat = coords.reduce((a, c) => a + c[1], 0) / coords.length
    return { center: [avgLng, avgLat] as [number, number], zoom: 14 }
  }, [nodes])

  useEffect(() => {
    if (!token) return
    if (!containerRef.current) return
    if (mapRef.current) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Changed to colorful streets style
      center: center.center,
      zoom: center.zoom,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      map.addSource('net-lines', { type: 'geojson', data: lines as any })
      map.addLayer({
        id: 'net-lines',
        type: 'line',
        source: 'net-lines',
        paint: {
          'line-color': '#818cf8', // indigo-400 - more colorful
          'line-width': 3,
          'line-opacity': 0.6,
        },
      })

      map.addSource('net-nodes', {
        type: 'geojson',
        data: points as any,
        cluster: true,
        clusterRadius: 44,
        clusterMaxZoom: 16,
      })
      map.addLayer({
        id: 'net-clusters',
        type: 'circle',
        source: 'net-nodes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#4f46e5', // indigo-600 - more colorful
          'circle-opacity': 0.85,
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 24, 50, 30, 200, 36],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })
      map.addLayer({
        id: 'net-cluster-count',
        type: 'symbol',
        source: 'net-nodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })
      map.addLayer({
        id: 'net-points',
        type: 'circle',
        source: 'net-nodes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.95,
        },
      })

      map.on('click', 'net-clusters', async (e) => {
        const f = e.features?.[0] as any
        const clusterId = f?.properties?.cluster_id
        const source = map.getSource('net-nodes') as mapboxgl.GeoJSONSource & any
        if (!source || typeof clusterId === 'undefined') return
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return
          const coords = f.geometry.coordinates
          map.easeTo({ center: coords, zoom })
        })
      })

      map.on('click', 'net-points', (e) => {
        const f = e.features?.[0] as any
        const label = String(f?.properties?.label || '')
        const coords = f.geometry.coordinates.slice()
        new mapboxgl.Popup({ closeButton: true })
          .setLngLat(coords)
          .setHTML(`<div style="font-size:12px"><strong>${label}</strong></div>`)
          .addTo(map)
      })

      map.on('mouseenter', 'net-points', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'net-points', () => (map.getCanvas().style.cursor = ''))
      map.on('mouseenter', 'net-clusters', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'net-clusters', () => (map.getCanvas().style.cursor = ''))

      setReady(true)
    })
  }, [token, center.center, center.zoom, points, lines])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const pts = map.getSource('net-nodes') as mapboxgl.GeoJSONSource | undefined
    if (pts) pts.setData(points as any)
    const ls = map.getSource('net-lines') as mapboxgl.GeoJSONSource | undefined
    if (ls) ls.setData(lines as any)
  }, [points, lines, ready])

  return <div ref={containerRef} className="w-full h-[520px] rounded-b-xl overflow-hidden" />
}


