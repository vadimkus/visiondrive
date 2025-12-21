'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart3, MapPin, Users, Clock, TrendingUp, Settings, ParkingCircle, Activity, AlertTriangle } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

export default function PortalPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<any>(null)
  const [zones, setZones] = useState<any[]>([])
  const [zoneId, setZoneId] = useState<string>('all')

  useEffect(() => {
    // Fetch user data from API
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    // Read zone selection from URL
    const z = searchParams.get('zoneId') || 'all'
    setZoneId(z)
  }, [searchParams])

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/portal/zones', { credentials: 'include' })
        const json = await res.json()
        if (json.success) setZones(json.zones || [])
      } catch {
        // ignore
      }
    }
    if (!loading && user) fetchZones()
  }, [loading, user])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const qs = new URLSearchParams()
        if (zoneId) qs.set('zoneId', zoneId)
        const res = await fetch(`/api/portal/dashboard?${qs.toString()}`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setDashboard(json)
      } catch {
        // ignore
      }
    }
    if (!loading && user) fetchDashboard()
  }, [loading, user, zoneId])

  if (loading) {
    return (
      <div className="pt-20 sm:pt-24 md:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const kpis = dashboard?.kpis || {}
  const stats = [
    { icon: ParkingCircle, label: 'Total Bays', value: String(kpis.totalBays ?? 0), color: 'text-blue-600' },
    { icon: Activity, label: 'Free Bays', value: String(kpis.freeBays ?? 0), color: 'text-green-600' },
    { icon: TrendingUp, label: 'Occupied Bays', value: String(kpis.occupiedBays ?? 0), color: 'text-red-600' },
    { icon: AlertTriangle, label: 'Offline Bays', value: String(kpis.offlineBays ?? 0), color: 'text-yellow-700' },
    { icon: Clock, label: 'Dead Letters (24h)', value: String(kpis.deadLetters24h ?? 0), color: 'text-orange-600' },
  ]

  const zoneLabel = zones.find((z) => String(z.id) === String(zoneId))?.name || (zoneId === 'all' ? 'All Zones' : 'Selected Zone')

  return (
    <>
      <div className="pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{zoneLabel}</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {zones.find((z) => String(z.id) === String(zoneId))?.address || 'Tenant-wide view'} · Welcome back, {user?.name || user?.email || 'User'}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <select
                value={zoneId}
                onChange={(e) => {
                  const next = e.target.value
                  const qs = new URLSearchParams(searchParams.toString())
                  qs.set('zoneId', next)
                  router.push(`/portal?${qs.toString()}`)
                }}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
              >
                {(zones.length ? zones : [{ id: 'all', name: 'All Zones' }]).map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} {typeof z.bayCount === 'number' ? `(${z.bayCount})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() => router.push('/portal/settings')}
                className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>

          {/* Bay status (quick glance) */}
          <div className="flex flex-wrap gap-2 text-sm mb-4 sm:mb-6">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Total: {kpis.totalBays ?? 0}</span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Free: {kpis.freeBays ?? 0}</span>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Occupied: {kpis.occupiedBays ?? 0}</span>
            <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">Offline: {kpis.offlineBays ?? 0}</span>
            <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">Unknown: {kpis.unknownBays ?? 0}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{stat.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} flex-shrink-0 ml-2`} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mb-6 sm:mb-8 text-xs text-gray-600">
            Bay states: {kpis.freeBays ?? 0} free + {kpis.occupiedBays ?? 0} occupied + {kpis.offlineBays ?? 0} offline + {kpis.unknownBays ?? 0} unknown ={' '}
            {kpis.totalBays ?? 0} total
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Analytics Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Parking Analytics</h2>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-700">Events/hour (last 24h)</p>
                  <a href="/portal/events" className="text-sm text-primary-700 hover:underline">
                    Open Events
                  </a>
                </div>
                {!dashboard?.trend?.length ? (
                  <div className="h-40 flex items-center justify-center text-gray-600">
                    <BarChart3 className="h-10 w-10 text-gray-400 mr-2" />
                    No trend data yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dashboard.trend.slice(-8).map((t: any) => (
                      <div key={t.bucket} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-gray-600">{new Date(t.bucket).toLocaleTimeString()}</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600" style={{ width: `${Math.min(100, (t.count / 50) * 100)}%` }} />
                        </div>
                        <div className="w-10 text-xs text-gray-700 text-right">{t.count}</div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-2">Next upgrade: proper chart component + selectable range.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Offline sensors</p>
                    <p className="text-xs text-gray-500">{kpis.offlineSensors ?? 0} sensors require attention</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Offline bays</p>
                    <p className="text-xs text-gray-500">{kpis.offlineBays ?? 0} bays have offline sensors</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Low battery</p>
                    <p className="text-xs text-gray-500">{kpis.lowBatterySensors ?? 0} sensors below threshold</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Dead letters (24h)</p>
                    <p className="text-xs text-gray-500">{kpis.deadLetters24h ?? 0} invalid rows from uploads</p>
                    <button onClick={() => router.push('/portal/replay')} className="text-xs text-primary-700 hover:underline mt-1">
                      Open Replay Tools
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 sm:mt-6 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button onClick={() => router.push(`/portal/events?zoneId=${encodeURIComponent(zoneId)}`)} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
                <p className="font-medium text-sm sm:text-base text-gray-900">Events & Export</p>
                <p className="text-xs sm:text-sm text-gray-600">Time-series viewer + CSV</p>
              </button>
              <button onClick={() => router.push(`/portal/map?zoneId=${encodeURIComponent(zoneId)}`)} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
                <p className="font-medium text-sm sm:text-base text-gray-900">Live Map</p>
                <p className="text-xs sm:text-sm text-gray-600">Bay colors + confidence</p>
              </button>
              <button onClick={() => router.push('/portal/replay')} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
                <p className="font-medium text-sm sm:text-base text-gray-900">Replay & Decoder Tools</p>
                <p className="text-xs sm:text-sm text-gray-600">Upload/replay events and test decoders</p>
              </button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button onClick={() => router.push(`/portal/sensors?zoneId=${encodeURIComponent(zoneId)}`)} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
                <p className="font-medium text-sm sm:text-base text-gray-900">Sensors</p>
                <p className="text-xs sm:text-sm text-gray-600">Health + maintenance notes</p>
              </button>
              <button onClick={() => router.push('/portal/admin')} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mb-2" />
                <p className="font-medium text-sm sm:text-base text-gray-900">Admin</p>
                <p className="text-xs sm:text-sm text-gray-600">Users + thresholds</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


