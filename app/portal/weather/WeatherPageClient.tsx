'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import { 
  CloudSun, 
  Download, 
  Loader2, 
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

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
  if (vals.length < 2) return <div className="h-12 text-xs text-gray-400 flex items-center">No data</div>

  const w = 160
  const h = 48
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

  // Calculate trend
  const trend = vals[vals.length - 1] - vals[0]
  const trendPercent = min !== 0 ? ((vals[vals.length - 1] - vals[0]) / Math.abs(vals[0])) * 100 : 0

  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} className="block">
        {/* Grid lines */}
        <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
        {/* Gradient fill under line */}
        <defs>
          <linearGradient id={`gradient-${valueKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#gradient-${valueKey})`} />
        {/* Line */}
        <path d={d} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current value dot */}
        <circle cx={w} cy={scaleY(vals[vals.length - 1])} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
      </svg>
      <div className="text-xs">
        {trend > 0 ? (
          <TrendingUp className="h-4 w-4 text-green-600" />
        ) : trend < 0 ? (
          <TrendingDown className="h-4 w-4 text-red-600" />
        ) : null}
      </div>
    </div>
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
          'circle-color': '#3b82f6',
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 26, 30, 32],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      map.addLayer({
        id: 'weather-cluster-count',
        type: 'symbol',
        source: 'weather-stations',
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 13, 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'] },
        paint: { 'text-color': '#ffffff' },
      })

      // Unclustered dots colored by selected metric
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
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['==', ['get', 'online'], 0],
            '#000000',
            colorExpr,
          ],
          'circle-stroke-width': 3,
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
          'text-size': 12,
          'text-offset': [0, 1],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#111827',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Configuration Required</h3>
                <p className="text-sm text-yellow-800">
                  Set <code className="font-mono font-semibold bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to use Weather Dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1920px] mx-auto flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-blue-200 opacity-50 rounded-full"></div>
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6 relative" />
            </div>
            <p className="text-xl text-gray-700 font-semibold">Loading weather dashboard…</p>
            <p className="text-sm text-gray-500 mt-2">Fetching environmental data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <CloudSun className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Weather Equipment
                </h1>
              </div>
              <p className="text-base text-gray-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Multi-location environmental monitoring · Spot anomalies (storms, dust, poor air quality)
              </p>
            </div>
            <div>
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
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Stations</div>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{kpis?.total ?? items.length}</div>
            <div className="text-xs text-gray-500 mt-1">Active deployments</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-green-700 uppercase tracking-wider">Online</div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-700">{kpis?.online ?? 0}</div>
            <div className="text-xs text-green-600 mt-1">Transmitting data</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Offline</div>
              <Zap className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{kpis?.offline ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Requires attention</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-orange-700 uppercase tracking-wider">Avg Temp</div>
              <Thermometer className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-700">
              {typeof kpis?.avgTempC === 'number' ? `${kpis.avgTempC}°C` : '—'}
            </div>
            <div className="text-xs text-orange-600 mt-1">Current average</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-red-700 uppercase tracking-wider">Alerts</div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-700">{kpis?.derivedAlerts ?? 0}</div>
            <div className="text-xs text-red-600 mt-1">Active warnings</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map - 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Live Map
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Color by:</span>
                  {(
                    [
                      ['temperatureC', 'Temp', Thermometer],
                      ['aqi', 'AQI', Eye],
                      ['pm25', 'PM2.5', Wind],
                      ['humidityPct', 'Humidity', Droplets],
                      ['windMps', 'Wind', Wind],
                    ] as const
                  ).map(([k, label, Icon]) => (
                    <button
                      key={k}
                      onClick={() => setMetric(k)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        metric === k 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-[700px] lg:h-[800px]">
              <div ref={mapElRef} className="w-full h-full" />
            </div>
          </div>

          {/* Stations Sidebar - 1/3 width */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
              <h2 className="text-xl font-bold text-gray-900">Weather Stations</h2>
              <p className="text-sm text-gray-600 mt-1">{items.length} total stations</p>
            </div>
            
            <div className="flex-1 overflow-auto">
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left p-5 border-b border-gray-100 hover:bg-blue-50 transition-all ${
                    selectedId === s.id ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 truncate text-base">{s.name}</div>
                      <div className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {s.siteName || '—'}
                      </div>
                    </div>
                    <div className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-semibold ${
                      s.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {s.online ? '● Online' : '○ Offline'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <Thermometer className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                      <div className="font-bold text-orange-900">
                        {typeof s.metrics.temperatureC === 'number' ? `${s.metrics.temperatureC}°C` : '—'}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <Eye className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <div className="font-bold text-blue-900">
                        {typeof s.metrics.aqi === 'number' ? s.metrics.aqi : '—'}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 text-center">
                      <Wind className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                      <div className="font-bold text-purple-900">
                        {typeof s.metrics.pm25 === 'number' ? s.metrics.pm25 : '—'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-3">
                    Last seen: {s.lastSeen ? new Date(s.lastSeen).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '—'}
                  </div>
                </button>
              ))}
              {!items.length && (
                <div className="p-12 text-center">
                  <CloudSun className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No weather stations yet</p>
                  <p className="text-sm text-gray-400 mt-1">Stations will appear here once deployed</p>
                </div>
              )}
            </div>

            {/* Selected Station Details */}
            {selected && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Trends Analysis</h3>
                    <div className="flex items-center gap-2">
                      {(['1h', '24h', '7d'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRange(r)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            range === r 
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                      <a
                        href={`/api/portal/weather/stations/${encodeURIComponent(selected.id)}/export?range=${encodeURIComponent(range)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-semibold text-gray-700">Temperature</span>
                        </div>
                        <span className="text-xs text-gray-500">{range}</span>
                      </div>
                      <Sparkline points={trends} valueKey="temperatureC" />
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-700">Air Quality Index</span>
                        </div>
                        <span className="text-xs text-gray-500">{range}</span>
                      </div>
                      <Sparkline points={trends} valueKey="aqi" />
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-semibold text-gray-700">Wind Speed</span>
                        </div>
                        <span className="text-xs text-gray-500">{range}</span>
                      </div>
                      <Sparkline points={trends} valueKey="windMps" />
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-cyan-600" />
                          <span className="text-xs font-semibold text-gray-700">Humidity</span>
                        </div>
                        <span className="text-xs text-gray-500">{range}</span>
                      </div>
                      <Sparkline points={trends} valueKey="humidityPct" />
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-700">PM2.5</span>
                        </div>
                        <span className="text-xs text-gray-500">{range}</span>
                      </div>
                      <Sparkline points={trends} valueKey="pm25" />
                    </div>
                  </div>
                </div>

                {selected.derivedAlerts?.length ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Active Alerts</h3>
                    </div>
                    <div className="space-y-2">
                      {selected.derivedAlerts.slice(0, 5).map((a, idx) => (
                        <div 
                          key={idx} 
                          className={`text-xs rounded-xl p-3 border-l-4 ${
                            a.severity === 'CRITICAL' 
                              ? 'bg-red-50 border-l-red-600 text-red-900' 
                              : a.severity === 'WARNING'
                              ? 'bg-yellow-50 border-l-yellow-600 text-yellow-900'
                              : 'bg-blue-50 border-l-blue-600 text-blue-900'
                          }`}
                        >
                          <span className="font-bold">{a.severity}</span> · {a.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <p className="font-semibold mb-1">Coming Soon: Scheduled Reports</p>
                      <p className="text-blue-700">Daily summary reports via email will be available in Phase 10.13.4.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
