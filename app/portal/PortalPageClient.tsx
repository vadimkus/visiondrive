'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Clock, 
  TrendingUp, 
  Settings, 
  CircleDot, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  BarChart4, 
  Network,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  MapPinned,
  Radio
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

interface TrendItem {
  bucket: string
  online: number
  offline: number
  total: number
  count: number
}

interface KPIs {
  totalBays: number
  freeBays: number
  occupiedBays: number
  offlineBays: number
  offlineSensors: number
  openAlerts: number
  criticalAlerts: number
  lowBatterySensors: number
  deadLetters24h: number
}

interface Dashboard {
  kpis: KPIs
  trend: TrendItem[]
  lastUpdated?: string
}

interface ZoneItem {
  id: string
  name: string
  bayCount: number
  address?: string
}

export default function PortalPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [zones, setZones] = useState<ZoneItem[]>([])
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

  const refreshDashboard = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 text-lg">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const defaultKpis: KPIs = {
    totalBays: 0,
    freeBays: 0,
    occupiedBays: 0,
    offlineBays: 0,
    offlineSensors: 0,
    openAlerts: 0,
    criticalAlerts: 0,
    lowBatterySensors: 0,
    deadLetters24h: 0,
  }
  const kpis = dashboard?.kpis || defaultKpis
  const zoneLabel = zones.find((z) => String(z.id) === String(zoneId))?.name || (zoneId === 'all' ? 'All Zones' : 'Selected Zone')
  const occupancyRate = kpis.totalBays > 0 ? ((kpis.occupiedBays / kpis.totalBays) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{zoneLabel}</h1>
            <p className="text-gray-600">
              {zones.find((z) => String(z.id) === String(zoneId))?.address || 'Overview across all zones'} · Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={zoneId}
              onChange={(e) => {
                const next = e.target.value
                const qs = new URLSearchParams(searchParams.toString())
                qs.set('zoneId', next)
                router.push(`/portal?${qs.toString()}`)
              }}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="all">All Zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} {z.bayCount > 0 ? `(${z.bayCount} bays)` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={refreshDashboard}
              className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Bays */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CircleDot className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Bays</div>
            <div className="text-3xl font-bold text-blue-700">{kpis.totalBays ?? 0}</div>
          </div>

          {/* Free Bays */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Available</div>
            <div className="text-3xl font-bold text-green-700">{kpis.freeBays ?? 0}</div>
            <div className="text-xs text-gray-600 mt-2">{((kpis.freeBays / (kpis.totalBays || 1)) * 100).toFixed(0)}% free</div>
          </div>

          {/* Occupied Bays */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Occupied</div>
            <div className="text-3xl font-bold text-red-700">{kpis.occupiedBays ?? 0}</div>
            <div className="text-xs text-gray-600 mt-2">{occupancyRate}% occupancy</div>
          </div>

          {/* Offline Bays */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Offline</div>
            <div className="text-3xl font-bold text-yellow-700">{kpis.offlineBays ?? 0}</div>
            <div className="text-xs text-gray-600 mt-2">{kpis.offlineSensors ?? 0} sensors</div>
          </div>

          {/* Open Alerts */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <ShieldAlert className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Alerts</div>
            <div className="text-3xl font-bold text-orange-700">{kpis.openAlerts ?? 0}</div>
            <div className="text-xs text-gray-600 mt-2">{kpis.criticalAlerts ?? 0} critical</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Analytics Chart - Takes 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Sensor Analytics</h2>
                    <p className="text-sm text-gray-600">Events per hour (last 24h)</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/portal/events')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {!dashboard?.trend?.length ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <BarChart3 className="h-16 w-16 text-gray-300 mb-3" />
                  <p className="font-medium">No trend data available yet</p>
                  <p className="text-sm text-gray-400 mt-1">Data will appear as events are recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.trend.slice(-10).map((t: TrendItem) => (
                    <div key={t.bucket} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-600 font-medium">
                        {new Date(t.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all" 
                          style={{ width: `${Math.min(100, (t.count / 50) * 100)}%` }} 
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-900 font-bold text-right">{t.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System Health - Takes 1/3 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-xl">
                  <Activity className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">System Health</h2>
                  <p className="text-sm text-gray-600">Status overview</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Offline Sensors</p>
                  <p className="text-xs text-gray-600 mt-1">{kpis.offlineSensors ?? 0} sensors require attention</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Low Battery</p>
                  <p className="text-xs text-gray-600 mt-1">{kpis.lowBatterySensors ?? 0} sensors below threshold</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Open Alerts</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {kpis.openAlerts ?? 0} total ({kpis.criticalAlerts ?? 0} critical)
                  </p>
                  <button 
                    onClick={() => router.push(`/portal/alerts?zoneId=${encodeURIComponent(zoneId)}`)} 
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-2 flex items-center gap-1"
                  >
                    View Alerts <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Dead Letters (24h)</p>
                  <p className="text-xs text-gray-600 mt-1">{kpis.deadLetters24h ?? 0} failed ingestion events</p>
                  <button 
                    onClick={() => router.push('/portal/replay')} 
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium mt-2 flex items-center gap-1"
                  >
                    Open Tools <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600">Access key features and reports</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push(`/portal/map?zoneId=${encodeURIComponent(zoneId)}`)} 
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 text-left transition-all group"
              >
                <MapPinned className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-gray-900 mb-1">Live Map</p>
                <p className="text-sm text-gray-600">Real-time bay status visualization</p>
              </button>
              
              <button 
                onClick={() => router.push(`/portal/alerts?zoneId=${encodeURIComponent(zoneId)}`)} 
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 text-left transition-all group"
              >
                <ShieldAlert className="h-8 w-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-gray-900 mb-1">Alerts</p>
                <p className="text-sm text-gray-600">Monitor and manage system alerts</p>
              </button>
              
              <button 
                onClick={() => router.push(`/portal/events?zoneId=${encodeURIComponent(zoneId)}`)} 
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 text-left transition-all group"
              >
                <Activity className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-gray-900 mb-1">Events</p>
                <p className="text-sm text-gray-600">Time-series data and CSV export</p>
              </button>
              
              <button 
                onClick={() => router.push(`/portal/sensors?zoneId=${encodeURIComponent(zoneId)}`)} 
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 text-left transition-all group"
              >
                <Radio className="h-8 w-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-gray-900 mb-1">Sensors</p>
                <p className="text-sm text-gray-600">Fleet health and maintenance</p>
              </button>
              
              <button 
                onClick={() => router.push(`/portal/reports/sensors?zoneId=${encodeURIComponent(zoneId)}`)} 
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 text-left transition-all group"
              >
                <BarChart4 className="h-8 w-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-gray-900 mb-1">Reports</p>
                <p className="text-sm text-gray-600">Performance analytics and insights</p>
              </button>
              
              {/* Network/Gateway/Weather views removed (NB-IoT migration cleanup) */}
            </div>
          </div>
        </div>

        {/* Admin Actions (if applicable) */}
        {(user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CUSTOMER_ADMIN') && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Settings className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Administration</h2>
                  <p className="text-sm text-gray-600">Manage system settings and configuration</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/portal/admin')} 
                  className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 text-left transition-all group"
                >
                  <Settings className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-gray-900 mb-1">Admin Panel</p>
                  <p className="text-sm text-gray-600">Users, thresholds, and settings</p>
                </button>
                
                <button 
                  onClick={() => router.push('/portal/settings')} 
                  className="p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 text-left transition-all group"
                >
                  <Users className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-gray-900 mb-1">Settings</p>
                  <p className="text-sm text-gray-600">Profile and preferences</p>
                </button>
                
                {user?.role === 'MASTER_ADMIN' && (
                  <button 
                    onClick={() => router.push('/portal/admin/tenants')} 
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 text-left transition-all group"
                  >
                    <Building2 className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-gray-900 mb-1">Master Admin</p>
                    <p className="text-sm text-gray-600">Global map and tenant management</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
