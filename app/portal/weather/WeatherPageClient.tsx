'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import { CloudSun, Download, Loader2, RefreshCw } from 'lucide-react'

type Station = {
  id: string
  devEui: string
  name: string
  siteName: string | null
  zoneName: string | null
  lat: number | null
  lng: number | null
  lastSeen: string | null
  ageMinutes: number | null
  online: boolean
  batteryPct: number | null
  metrics: {
    temperatureC: number | null
    humidityPct: number | null
    windMps: number | null
    gustMps: number | null
    pm25: number | null
    pm10: number | null
    aqi: number | null
    rain: boolean | null
  }
  derivedAlerts: Array<{ type: string; severity: 'INFO' | 'WARNING' | 'CRITICAL'; message: string }>
}

type TrendsPoint = {
  t: string | null
  temperatureC: number | null
  humidityPct: number | null
  windMps: number | null
  gustMps: number | null
  pm25: number | null
  pm10: number | null
  aqi: number | null
}

function Sparkline({ points, valueKey }: { points: TrendsPoint[]; valueKey: keyof TrendsPoint }) {
  const vals = points
    .map((p) => (typeof p[valueKey] === 'number' ? (p[valueKey] as number) : null))
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (vals.length < 2) return <div className="h-10 text-xs text-gray-500">No data</div>

  const w = 140
  const h = 40
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const scaleY = (v: number) => {
    if (max === min) return h / 2
    return h - ((v - min) / (max - min)) * (h - 6) - 3
  }
  const step = w / (vals.length - 1)
  const d = vals
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${Math.round(i * step)} ${Math.round(scaleY(v))}`)
    .join(' ')

  return (
    <svg width={w} height={h} className="block">
      <path d={d} fill="none" stroke="#2563eb" strokeWidth="2" />
    </svg>
  )
}

export default function WeatherPageClient() {
  const router = useRouter()
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Station[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [trends, setTrends] = useState<TrendsPoint[]>([])
  const [metric, setMetric] = useState<'temperatureC' | 'aqi' | 'humidityPct' | 'windMps' | 'pm25'>('temperatureC')

  const selected = useMemo(() => items.find((s) => s.id === selectedId) || null, [items, selectedId])

  // Map
  const mapElRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const fc = useMemo(() => {
    const features = items
      .map((s) => {
        if (typeof s.lat !== 'number' || typeof s.lng !== 'number') return null
        const v = (s.metrics as any)[metric]
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
          properties: {
            id: s.id,
            name: s.name,
            online: s.online ? 1 : 0,
            value: typeof v === 'number' ? v : null,
          },
        }
      })
      .filter(Boolean) as any[]
    return { type: 'FeatureCollection', features }
  }, [items, metric])

  useEffect(() => {
    const run = async () => {
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (!me.ok) {
          router.push('/login')
          return
        }
        const res = await fetch('/api/portal/weather/stations', { credentials: 'include' })
        const json = await res.json()
        if (json.success) {
          setItems(json.items || [])
          setKpis(json.kpis || null)
          if (!selectedId && json.items?.[0]?.id) setSelectedId(json.items[0].id)
        }
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const run = async () => {
      if (!selectedId) return
      const res = await fetch(`/api/portal/weather/stations/${encodeURIComponent(selectedId)}/trends?range=${encodeURIComponent(range)}`, {
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (json?.success) setTrends(json.points || [])
    }
    run()
  }, [selectedId, range])

  useEffect(() => {
    if (!token) return
    if (!mapElRef.current) return
    if (mapRef.current) return
    ;(mapboxgl as any).accessToken = token
    const map = new mapboxgl.Map({
      container: mapElRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [55.2708, 25.2048],
      zoom: 10.5,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

    map.on('load', () => {
      map.addSource('weather-stations', { type: 'geojson', data: fc as any, cluster: true, clusterRadius: 50 } as any)

      map.addLayer({
        id: 'weather-clusters',
        type: 'circle',
        source: 'weather-stations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#111827',
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
          'circle-opacity': 0.75,
        },
      })
      map.addLayer({
        id: 'weather-cluster-count',
        type: 'symbol',
        source: 'weather-stations',
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 },
        paint: { 'text-color': '#ffffff' },
      })

      // Unclustered dots colored by selected metric (simple interpolation)
      const colorExpr =
        metric === 'temperatureC'
          ? ([
              'interpolate',
              ['linear'],
              ['get', 'value'],
              10,
              '#3b82f6',
              25,
              '#f59e0b',
              40,
              '#dc2626',
            ] as any)
          : metric === 'aqi'
            ? ([
                'interpolate',
                ['linear'],
                ['get', 'value'],
                0,
                '#16a34a',
                100,
                '#f59e0b',
                150,
                '#dc2626',
                250,
                '#7f1d1d',
              ] as any)
            : ([
                'interpolate',
                ['linear'],
                ['get', 'value'],
                0,
                '#3b82f6',
                50,
                '#60a5fa',
                100,
                '#1d4ed8',
              ] as any)

      map.addLayer({
        id: 'weather-unclustered',
        type: 'circle',
        source: 'weather-stations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'case',
            ['==', ['get', 'online'], 0],
            '#000000',
            colorExpr,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      })

      map.addLayer({
        id: 'weather-labels',
        type: 'symbol',
        source: 'weather-stations',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 0.9],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#111827',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      })

      map.on('click', 'weather-unclustered', (e) => {
        const f = e.features?.[0] as any
        const id = f?.properties?.id ? String(f.properties.id) : ''
        if (id) setSelectedId(id)
      })
      map.on('mouseenter', 'weather-unclustered', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'weather-unclustered', () => (map.getCanvas().style.cursor = ''))
      map.on('click', 'weather-clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['weather-clusters'] })
        const clusterId = features[0]?.properties?.cluster_id
        const src = map.getSource('weather-stations') as any
        src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return
          const c = (features[0].geometry as any).coordinates
          map.easeTo({ center: c, zoom })
        })
      })
    })
  }, [token])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const src = map.getSource('weather-stations') as any
    if (src) src.setData(fc as any)
  }, [fc])

  if (!token) {
    return (
      <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6 shadow-lg">
        <p className="text-sm text-yellow-900">
          Set <code className="font-mono font-semibold">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to use Weather Dashboard.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1920px] mx-auto flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-sky-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading weather dashboard…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 inline-flex items-center gap-3">
              <CloudSun className="h-9 w-9 text-sky-600" />
              Weather Equipment
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Multi-location environmental monitoring · spot anomalies (storms, dust, poor air quality)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  const res = await fetch('/api/portal/weather/stations', { credentials: 'include' })
                  const json = await res.json()
                  if (json.success) {
                    setItems(json.items || [])
                    setKpis(json.kpis || null)
                  }
                } finally {
                  setLoading(false)
                }
              }}
              className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold">Stations</div>
            <div className="text-2xl font-bold text-gray-900">{kpis?.total ?? items.length}</div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold">Online</div>
            <div className="text-2xl font-bold text-green-700">{kpis?.online ?? 0}</div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold">Offline</div>
            <div className="text-2xl font-bold text-gray-900">{kpis?.offline ?? 0}</div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold">Avg Temp</div>
            <div className="text-2xl font-bold text-gray-900">{typeof kpis?.avgTempC === 'number' ? `${kpis.avgTempC}°C` : '—'}</div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 font-semibold">Derived Alerts</div>
            <div className="text-2xl font-bold text-orange-700">{kpis?.derivedAlerts ?? 0}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Live Map</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Color by:</span>
                {(
                  [
                    ['temperatureC', 'Temp'],
                    ['aqi', 'AQI'],
                    ['pm25', 'PM2.5'],
                    ['humidityPct', 'Humidity'],
                    ['windMps', 'Wind'],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setMetric(k)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border-2 ${
                      metric === k ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[650px] lg:h-[900px] rounded-lg overflow-hidden border border-gray-200">
              <div ref={mapElRef} className="w-full h-full" />
            </div>
          </div>

          {/* Stations */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Stations</h2>
            <div className="flex-1 overflow-auto -mx-6 border-t border-gray-100">
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left px-6 py-4 border-b border-gray-100 hover:bg-gray-50 ${
                    selectedId === s.id ? 'bg-sky-50 border-l-4 border-l-sky-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-600 truncate">{s.siteName || '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {s.online ? (
                          <span className="text-green-700 font-medium">Online</span>
                        ) : (
                          <span className="text-gray-900 font-medium">Offline</span>
                        )}{' '}
                        · {s.lastSeen ? new Date(s.lastSeen).toLocaleString() : '—'}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <div className="font-semibold text-gray-900">{typeof s.metrics.temperatureC === 'number' ? `${s.metrics.temperatureC}°C` : '—'}</div>
                      <div>AQI: {typeof s.metrics.aqi === 'number' ? s.metrics.aqi : '—'}</div>
                      <div>PM2.5: {typeof s.metrics.pm25 === 'number' ? s.metrics.pm25 : '—'}</div>
                    </div>
                  </div>
                </button>
              ))}
              {!items.length && <div className="p-8 text-center text-gray-500">No weather stations yet.</div>}
            </div>

            {/* Selected details */}
            {selected ? (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-900">Trends</div>
                  <div className="flex items-center gap-2">
                    {(['1h', '24h', '7d'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          range === r ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <a
                      href={`/api/portal/weather/stations/${encodeURIComponent(selected.id)}/export?range=${encodeURIComponent(range)}`}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-600">Temp</div>
                    <Sparkline points={trends} valueKey="temperatureC" />
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-600">AQI</div>
                    <Sparkline points={trends} valueKey="aqi" />
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-600">Wind</div>
                    <Sparkline points={trends} valueKey="windMps" />
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-600">Humidity</div>
                    <Sparkline points={trends} valueKey="humidityPct" />
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-600">PM2.5</div>
                    <Sparkline points={trends} valueKey="pm25" />
                  </div>
                </div>
                {selected.derivedAlerts?.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Derived Alerts</div>
                    <div className="space-y-2">
                      {selected.derivedAlerts.slice(0, 5).map((a, idx) => (
                        <div key={idx} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
                          <span className="font-semibold">{a.severity}</span> · {a.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  Scheduled daily summary report (email) is wired via report subscriptions next (Phase 10.13.4). UI hookup will be added next.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}


