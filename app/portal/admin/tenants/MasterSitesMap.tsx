'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

type SitePoint = {
  id: string
  tenantId: string
  tenantName: string
  name: string
  address: string | null
  centerLat: number | null
  centerLng: number | null
  installedSensors: number
  onlineSensors: number
  offlineSensors: number
  openAlerts: number
  criticalAlerts: number
  lastEventTime: string | null
  health: 'OK' | 'WARNING' | 'CRITICAL'
}

function asFeatureCollection(features: any[]) {
  return { type: 'FeatureCollection', features }
}

export default function MasterSitesMap({
  sites,
  selectedSiteId,
  onSelectSite,
  satellite,
  enable3d,
}: {
  sites: SitePoint[]
  selectedSiteId: string | null
  onSelectSite: (siteId: string | null) => void
  satellite: boolean
  enable3d: boolean
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)

  const points = useMemo(() => {
    return asFeatureCollection(
      sites
        .map((s) => {
          if (typeof s.centerLat !== 'number' || typeof s.centerLng !== 'number') return null
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [s.centerLng, s.centerLat] },
            properties: {
              id: s.id,
              tenantId: s.tenantId,
              tenantName: s.tenantName,
              name: s.name,
              health: s.health,
              openAlerts: s.openAlerts,
              criticalAlerts: s.criticalAlerts,
              offlineSensors: s.offlineSensors,
            },
          }
        })
        .filter(Boolean)
    )
  }, [sites])

  const boundsCenter = useMemo(() => {
    const coords = sites
      .map((s) => (typeof s.centerLat === 'number' && typeof s.centerLng === 'number' ? [s.centerLng, s.centerLat] : null))
      .filter(Boolean) as [number, number][]
    if (!coords.length) return { center: [55.1622, 25.1016] as [number, number], zoom: 10 }
    const avgLng = coords.reduce((a, c) => a + c[0], 0) / coords.length
    const avgLat = coords.reduce((a, c) => a + c[1], 0) / coords.length
    return { center: [avgLng, avgLat] as [number, number], zoom: 10 }
  }, [sites])

  // init map
  useEffect(() => {
    if (!token) return
    if (!containerRef.current) return
    if (mapRef.current) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/light-v11',
      center: boundsCenter.center,
      zoom: boundsCenter.zoom,
      attributionControl: false,
    })
    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      map.addSource('sites', {
        type: 'geojson',
        data: points as any,
        cluster: true,
        clusterRadius: 44,
        clusterMaxZoom: 14,
      })

      // cluster circles
      map.addLayer({
        id: 'sites-clusters',
        type: 'circle',
        source: 'sites',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#111827',
          'circle-opacity': 0.75,
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 50, 28, 200, 34],
        },
      })
      map.addLayer({
        id: 'sites-cluster-count',
        type: 'symbol',
        source: 'sites',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // site points
      map.addLayer({
        id: 'sites-points',
        type: 'circle',
        source: 'sites',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-color': [
            'match',
            ['get', 'health'],
            'CRITICAL',
            '#ef4444',
            'WARNING',
            '#f59e0b',
            '#22c55e',
          ],
          'circle-opacity': 0.9,
        },
      })

      // selected highlight
      map.addSource('selected-site', { type: 'geojson', data: asFeatureCollection([]) as any })
      map.addLayer({
        id: 'sites-selected',
        type: 'circle',
        source: 'selected-site',
        paint: {
          'circle-radius': 12,
          'circle-color': '#facc15',
          'circle-opacity': 0.35,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#facc15',
        },
      })

      // click behavior
      map.on('click', 'sites-points', (e) => {
        const f = e.features?.[0] as any
        const siteId = String(f?.properties?.id || '')
        onSelectSite(siteId || null)
      })
      map.on('click', 'sites-clusters', async (e) => {
        const f = e.features?.[0] as any
        const clusterId = f?.properties?.cluster_id
        const source = map.getSource('sites') as mapboxgl.GeoJSONSource & any
        if (!source || typeof clusterId === 'undefined') return
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return
          const coords = f.geometry.coordinates
          map.easeTo({ center: coords, zoom })
        })
      })

      map.on('mouseenter', 'sites-points', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'sites-points', () => (map.getCanvas().style.cursor = ''))
      map.on('mouseenter', 'sites-clusters', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'sites-clusters', () => (map.getCanvas().style.cursor = ''))

      setReady(true)
    })
  }, [token, satellite, boundsCenter.center, boundsCenter.zoom, points, onSelectSite])

  // update style (satellite / 3d)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const style = satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/light-v11'
    map.setStyle(style)
  }, [satellite])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    try {
      if (enable3d && map.getStyle()?.layers?.some((l) => l.id === '3d-buildings')) return
      if (enable3d) {
        const layers = map.getStyle().layers || []
        const labelLayerId = layers.find((l) => l.type === 'symbol' && (l.layout as any)?.['text-field'])?.id
        map.addLayer(
          {
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
              'fill-extrusion-opacity': 0.25,
            },
          } as any,
          labelLayerId
        )
        map.easeTo({ pitch: 60 })
      } else {
        if (map.getLayer('3d-buildings')) map.removeLayer('3d-buildings')
        map.easeTo({ pitch: 0 })
      }
    } catch {
      // style not ready yet
    }
  }, [enable3d, ready])

  // update data
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const src = map.getSource('sites') as mapboxgl.GeoJSONSource | undefined
    if (src) src.setData(points as any)
  }, [points, ready])

  // selected highlight
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const s = sites.find((x) => x.id === selectedSiteId)
    const data =
      s && typeof s.centerLat === 'number' && typeof s.centerLng === 'number'
        ? asFeatureCollection([
            { type: 'Feature', geometry: { type: 'Point', coordinates: [s.centerLng, s.centerLat] } },
          ])
        : asFeatureCollection([])
    const src = map.getSource('selected-site') as mapboxgl.GeoJSONSource | undefined
    if (src) src.setData(data as any)
  }, [selectedSiteId, sites, ready])

  if (!token) {
    return (
      <div className="p-4 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg">
        Set <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to enable the global map.
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-[520px] lg:h-[560px] rounded-lg overflow-hidden border border-gray-200" />
}


