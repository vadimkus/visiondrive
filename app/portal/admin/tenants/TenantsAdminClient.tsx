'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { 
  Building2, 
  Activity, 
  ShieldAlert, 
  Users, 
  Plus, 
  Power, 
  ExternalLink, 
  RefreshCw, 
  Map, 
  Satellite, 
  Box,
  Globe,
  Loader2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import MasterSitesMap from './MasterSitesMap'

type Overview = {
  kpis: {
    tenantsTotal: number
    tenantsActive: number
    sitesTotal: number
    installedSensors: number
    onlineSensors: number
    offlineSensors: number
    openAlerts: number
    criticalAlerts: number
    eventsPerMin5m: number
  }
  sites: any[]
  top: { sites: any[]; sensors: any[] }
}

type TenantRow = {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string | null
  sitesCount: number
  installedSensors: number
  onlineSensors: number
  offlineSensors: number
  openAlerts: number
  criticalAlerts: number
  lastEventTime: string | null
}

function pillClass(kind: string) {
  if (kind === 'CRITICAL') return 'bg-red-50 border-red-200 text-red-700'
  if (kind === 'WARNING') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  if (kind === 'OK') return 'bg-green-50 border-green-200 text-green-700'
  return 'bg-gray-50 border-gray-200 text-gray-700'
}

export default function TenantsAdminClient() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  // filters
  const [tenantFilter, setTenantFilter] = useState<string>('all')
  const [healthFilter, setHealthFilter] = useState<string>('all')
  const [q, setQ] = useState<string>('')

  // create tenant
  const [newTenantName, setNewTenantName] = useState('')
  const [newTenantSlug, setNewTenantSlug] = useState('')

  // create customer admin
  const [adminTenantId, setAdminTenantId] = useState<string>('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

  // map state
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [satellite, setSatellite] = useState(false)
  const [enable3d, setEnable3d] = useState(false)

  const load = async () => {
    setLoading(true)
    setGeneratedPassword(null)
    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' })
      if (!meRes.ok) {
        router.push('/login')
        return
      }
      const meJson = await meRes.json()
      setMe(meJson.user)
      if (meJson.user?.role !== 'MASTER_ADMIN') {
        router.push('/portal')
        return
      }

      const [oRes, tRes] = await Promise.all([
        fetch('/api/portal/admin/tenants/overview', { credentials: 'include' }),
        fetch('/api/portal/admin/tenants', { credentials: 'include' }),
      ])
      const oJson = await oRes.json()
      const tJson = await tRes.json()
      if (oJson.success) setOverview(oJson)
      if (tJson.success) setTenants(tJson.tenants || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredSites = useMemo(() => {
    const sites = overview?.sites || []
    const t = q.trim().toLowerCase()
    return sites.filter((s: any) => {
      if (tenantFilter !== 'all' && String(s.tenantId) !== String(tenantFilter)) return false
      if (healthFilter !== 'all' && String(s.health) !== String(healthFilter)) return false
      if (!t) return true
      return (
        String(s.name || '').toLowerCase().includes(t) ||
        String(s.address || '').toLowerCase().includes(t) ||
        String(s.tenantName || '').toLowerCase().includes(t)
      )
    })
  }, [overview?.sites, tenantFilter, healthFilter, q])

  const uniqueTenants = useMemo(() => {
    return tenants.map((t) => ({ id: t.id, name: t.name }))
  }, [tenants])

  const createTenant = async () => {
    setActionBusy('createTenant')
    try {
      const res = await fetch('/api/portal/admin/tenants', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newTenantName, slug: newTenantSlug }),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to create tenant')
        return
      }
      setNewTenantName('')
      setNewTenantSlug('')
      await load()
    } finally {
      setActionBusy(null)
    }
  }

  const toggleTenant = async (tenantId: string, nextStatus: 'ACTIVE' | 'INACTIVE') => {
    setActionBusy(`toggle:${tenantId}`)
    try {
      const res = await fetch(`/api/portal/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (!json.success) alert(json.error || 'Failed')
      await load()
    } finally {
      setActionBusy(null)
    }
  }

  const createCustomerAdmin = async () => {
    if (!adminTenantId) return alert('Select tenant')
    setActionBusy('createAdmin')
    setGeneratedPassword(null)
    try {
      const res = await fetch(`/api/portal/admin/tenants/${adminTenantId}/admins`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          name: adminName,
          password: adminPassword || undefined,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to create admin')
        return
      }
      setAdminEmail('')
      setAdminName('')
      setAdminPassword('')
      setGeneratedPassword(json.generatedPassword || null)
      await load()
    } finally {
      setActionBusy(null)
    }
  }

  const switchTenantAndOpen = async (tenantId: string, href: string) => {
    setActionBusy(`switch:${tenantId}`)
    try {
      const res = await fetch('/api/portal/admin/tenants/switch', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || 'Failed to switch tenant')
        return
      }
      router.push(href)
      router.refresh()
    } finally {
      setActionBusy(null)
    }
  }

  if (loading) {
    return (
      <Section className="pt-6 pb-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading Master View...</p>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Master View</h1>
                <p className="text-gray-600">Global monitoring dashboard · All tenants & sites</p>
              </div>
            </div>
          </div>
          <button
            onClick={load}
            disabled={!!actionBusy}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-md font-medium"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${actionBusy ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { 
              icon: Building2, 
              label: 'Tenants', 
              value: `${overview?.kpis.tenantsActive ?? 0}/${overview?.kpis.tenantsTotal ?? 0}`, 
              subtext: 'Active / Total',
              color: 'from-blue-500 to-blue-600',
              iconColor: 'text-blue-600'
            },
            { 
              icon: Map, 
              label: 'Sites', 
              value: String(overview?.kpis.sitesTotal ?? 0), 
              subtext: 'Monitored locations',
              color: 'from-indigo-500 to-indigo-600',
              iconColor: 'text-indigo-600'
            },
            { 
              icon: Activity, 
              label: 'Sensors', 
              value: `${overview?.kpis.onlineSensors ?? 0}/${overview?.kpis.installedSensors ?? 0}`, 
              subtext: 'Online / Installed',
              color: 'from-green-500 to-green-600',
              iconColor: 'text-green-600'
            },
            { 
              icon: ShieldAlert, 
              label: 'Alerts', 
              value: String(overview?.kpis.openAlerts ?? 0),
              subtext: `${overview?.kpis.criticalAlerts ?? 0} critical`,
              color: 'from-orange-500 to-orange-600',
              iconColor: 'text-orange-600'
            },
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-1">{card.label}</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
                    <div className="text-xs text-gray-500">{card.subtext}</div>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${card.color} rounded-xl shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Map - Full Width, Larger */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Map Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Live Site Map</h2>
                  <p className="text-sm text-gray-600">
                    {filteredSites.length} sites {selectedSiteId && '· Click to deselect'}
                  </p>
                </div>
              </div>

              {/* Map Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={tenantFilter} 
                  onChange={(e) => setTenantFilter(e.target.value)} 
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All tenants</option>
                  {uniqueTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <select 
                  value={healthFilter} 
                  onChange={(e) => setHealthFilter(e.target.value)} 
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All health</option>
                  <option value="OK">OK</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search sites..."
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setSatellite((s) => !s)}
                  className={`inline-flex items-center px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                    satellite 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Satellite className="h-4 w-4 mr-2" />
                  Satellite
                </button>
                <button
                  onClick={() => setEnable3d((s) => !s)}
                  className={`inline-flex items-center px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                    enable3d 
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

          {/* Map Container - Bigger! */}
          <div className="relative">
            <MasterSitesMap
              sites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={(id) => setSelectedSiteId(id === selectedSiteId ? null : id)}
              satellite={satellite}
              enable3d={enable3d}
            />
            
            {/* Selected Site Info Overlay */}
            {selectedSiteId && (() => {
              const site = filteredSites.find((s: any) => s.id === selectedSiteId)
              if (!site) return null
              return (
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur border border-gray-300 rounded-xl shadow-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Selected Site</div>
                      <div className="text-lg font-bold text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-700">{site.tenantName}</div>
                      {site.address && <div className="text-xs text-gray-500 mt-1">{site.address}</div>}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sensors</div>
                      <div className="text-2xl font-bold text-gray-900">{site.onlineSensors}/{site.installedSensors}</div>
                      <div className="text-xs text-red-600">
                        {site.offlineSensors} offline
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Alerts</div>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{site.openAlerts}</div>
                          <div className="text-xs text-gray-500">Open</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">{site.criticalAlerts}</div>
                          <div className="text-xs text-gray-500">Critical</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Two Column Layout: Top Failing & Management */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Top Failing Sites - 1 column */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h2 className="font-bold text-gray-900">Top Failing Sites</h2>
              </div>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {(overview?.top.sites || []).map((s: any) => (
                  <div key={s.id} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-all">
                    <div className="font-semibold text-gray-900 mb-1">{s.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{s.tenantName}</div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-red-600">
                        <strong>{s.criticalAlerts}</strong> critical
                      </span>
                      <span className="text-orange-600">
                        <strong>{s.offlineSensors}</strong> offline
                      </span>
                    </div>
                  </div>
                ))}
                {!(overview?.top.sites || []).length && (
                  <div className="text-center py-8 text-gray-500">All systems operational</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Failing Sensors - 1 column */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h2 className="font-bold text-gray-900">Top Failing Sensors</h2>
              </div>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {(overview?.top.sensors || []).map((s: any) => (
                  <div key={s.id} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-all">
                    <div className="font-mono text-sm text-gray-900 mb-1">{s.devEui}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      {s.tenantName}{s.siteName ? ` · ${s.siteName}` : ''}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-red-600">
                        <strong>{s.criticalAlerts}</strong> critical
                      </span>
                      <span className="text-orange-600">
                        <strong>{s.openAlerts}</strong> open
                      </span>
                    </div>
                  </div>
                ))}
                {!(overview?.top.sensors || []).length && (
                  <div className="text-center py-8 text-gray-500">All sensors healthy</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions - 1 column */}
          <div className="space-y-4">
            {/* Create Tenant */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Create Tenant</h3>
              </div>
              <div className="space-y-3">
                <input 
                  value={newTenantName} 
                  onChange={(e) => setNewTenantName(e.target.value)} 
                  placeholder="Tenant name"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 text-sm" 
                />
                <input 
                  value={newTenantSlug} 
                  onChange={(e) => setNewTenantSlug(e.target.value)} 
                  placeholder="slug-name"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                />
                <button
                  onClick={createTenant}
                  disabled={actionBusy === 'createTenant'}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all font-medium shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </button>
              </div>
            </div>

            {/* Create Admin */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Create Admin</h3>
              </div>
              <div className="space-y-3">
                <select 
                  value={adminTenantId} 
                  onChange={(e) => setAdminTenantId(e.target.value)} 
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Select tenant...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <input 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  placeholder="Email"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 text-sm" 
                />
                <input 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)} 
                  placeholder="Name"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 text-sm" 
                />
                <button
                  onClick={createCustomerAdmin}
                  disabled={actionBusy === 'createAdmin'}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all font-medium shadow-md"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create Admin
                </button>
                {generatedPassword && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="text-xs text-amber-800 mb-1">Generated password:</div>
                    <div className="font-mono text-sm font-bold text-gray-900">{generatedPassword}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">All Tenants</h2>
              <div className="text-sm text-gray-600">{tenants.length} total</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Sensors</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Alerts</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Event</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{t.slug}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          t.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-xs text-gray-500">{t.sitesCount} sites</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        <span className="text-lg font-bold text-green-600">{t.onlineSensors}</span>
                        <span className="text-gray-500"> / {t.installedSensors}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="text-red-600">{t.offlineSensors} offline</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          pillClass(t.criticalAlerts > 0 ? 'CRITICAL' : t.openAlerts > 0 ? 'WARNING' : 'OK')
                        }`}>
                          {t.openAlerts} open
                        </span>
                        <span className="text-xs text-red-600">
                          {t.criticalAlerts} critical
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {t.lastEventTime ? new Date(t.lastEventTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => switchTenantAndOpen(t.id, '/portal')}
                          disabled={actionBusy === `switch:${t.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium transition-all"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Portal
                        </button>
                        <button
                          onClick={() => switchTenantAndOpen(t.id, '/portal/map')}
                          disabled={actionBusy === `switch:${t.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                          <Map className="h-3 w-3 mr-1" />
                          Map
                        </button>
                        <button
                          onClick={() => toggleTenant(t.id, t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          disabled={actionBusy === `toggle:${t.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                          <Power className="h-3 w-3 mr-1" />
                          {t.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No tenants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}

