'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, Building2, Activity, ShieldAlert, Users, Plus, Power, ExternalLink, RefreshCw, Map, Satellite, Box } from 'lucide-react'
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
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/portal/admin')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Master Admin — Global View</h1>
            <p className="text-sm text-gray-600">All tenants, all sites. Clustered map + cross-tenant KPIs + drilldown.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push('/portal/admin/audit')}
              disabled={!!actionBusy}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Audit Log
            </button>
            <button
              onClick={() => router.push('/portal/admin/finance')}
              disabled={!!actionBusy}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
            >
              Finance
            </button>
            <button
              onClick={load}
              disabled={!!actionBusy}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI row (Flowly/Airport-ops style cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Building2, label: 'Tenants', value: `${overview?.kpis.tenantsActive ?? 0}/${overview?.kpis.tenantsTotal ?? 0}`, color: 'text-blue-700' },
            { icon: Map, label: 'Sites', value: String(overview?.kpis.sitesTotal ?? 0), color: 'text-indigo-700' },
            { icon: Activity, label: 'Sensors Online', value: `${overview?.kpis.onlineSensors ?? 0}/${overview?.kpis.installedSensors ?? 0}`, color: 'text-green-700' },
            { icon: ShieldAlert, label: 'Open Alerts', value: `${overview?.kpis.openAlerts ?? 0} (${overview?.kpis.criticalAlerts ?? 0} critical)`, color: 'text-orange-700' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-600">{c.label}</div>
                    <div className="text-xl font-bold text-gray-900">{c.value}</div>
                    <div className="text-xs text-gray-500 mt-1">Events/min (5m): {overview?.kpis.eventsPerMin5m ?? 0}</div>
                  </div>
                  <Icon className={`h-8 w-8 ${c.color}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Map + filters */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Global Map</h2>
              <span className="text-xs text-gray-500">Click a site dot to select</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
                <option value="all">All tenants</option>
                {uniqueTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg">
                <option value="all">All health</option>
                <option value="OK">OK</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search site/tenant/address…"
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => setSatellite((s) => !s)}
                className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Satellite className="h-4 w-4 mr-1" />
                Satellite
              </button>
              <button
                onClick={() => setEnable3d((s) => !s)}
                className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Box className="h-4 w-4 mr-1" />
                3D
              </button>
            </div>
          </div>

          <MasterSitesMap
            sites={filteredSites}
            selectedSiteId={selectedSiteId}
            onSelectSite={(id) => setSelectedSiteId(id)}
            satellite={satellite}
            enable3d={enable3d}
          />

          {selectedSiteId ? (
            <div className="mt-3 text-sm text-gray-700">
              Selected site: <span className="font-semibold">{filteredSites.find((s: any) => s.id === selectedSiteId)?.name || selectedSiteId}</span>
            </div>
          ) : null}
        </div>

        {/* Top failing */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Top failing sites</h2>
            <div className="space-y-2 text-sm">
              {(overview?.top.sites || []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">{s.tenantName}</div>
                  </div>
                  <div className="text-xs text-gray-700 text-right">
                    <div>Critical: <span className="font-semibold">{s.criticalAlerts}</span></div>
                    <div>Offline sensors: <span className="font-semibold">{s.offlineSensors}</span></div>
                  </div>
                </div>
              ))}
              {!(overview?.top.sites || []).length && <div className="text-sm text-gray-500">No data</div>}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Top failing sensors</h2>
            <div className="space-y-2 text-sm">
              {(overview?.top.sensors || []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                  <div className="min-w-0">
                    <div className="font-mono text-gray-900 truncate">{s.devEui}</div>
                    <div className="text-xs text-gray-500 truncate">{s.tenantName}{s.siteName ? ` · ${s.siteName}` : ''}</div>
                  </div>
                  <div className="text-xs text-gray-700 text-right">
                    <div>Critical: <span className="font-semibold">{s.criticalAlerts}</span></div>
                    <div>Open: <span className="font-semibold">{s.openAlerts}</span></div>
                  </div>
                </div>
              ))}
              {!(overview?.top.sensors || []).length && <div className="text-sm text-gray-500">No data</div>}
            </div>
          </div>
        </div>

        {/* Create tenant + create admin */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Create tenant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tenant name</label>
                <input value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                <input value={newTenantSlug} onChange={(e) => setNewTenantSlug(e.target.value)} placeholder="acme-parking" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" />
              </div>
            </div>
            <button
              onClick={createTenant}
              disabled={actionBusy === 'createTenant'}
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Create Customer Admin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tenant</label>
                <select value={adminTenantId} onChange={(e) => setAdminTenantId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <option value="">Select tenant…</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password (optional)</label>
                <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <button
              onClick={createCustomerAdmin}
              disabled={actionBusy === 'createAdmin'}
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Create admin
            </button>
            {generatedPassword && (
              <div className="mt-3 text-sm text-gray-700">
                Generated password (copy now): <span className="font-mono font-semibold">{generatedPassword}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tenants table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tenants</h2>
            <div className="text-xs text-gray-500">Logged in as {me?.email}</div>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Tenant</th>
                <th className="text-left px-4 py-3">Sensors</th>
                <th className="text-left px-4 py-3">Alerts</th>
                <th className="text-left px-4 py-3">Last event</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{t.slug}</div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full border ${t.status === 'ACTIVE' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                        {t.status}
                      </span>
                      <span className="ml-2 text-gray-500">Sites: {t.sitesCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">
                      <span className="font-semibold text-green-700">{t.onlineSensors}</span> / {t.installedSensors}{' '}
                      <span className="text-gray-500">(offline {t.offlineSensors})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded-full border ${pillClass(t.criticalAlerts > 0 ? 'CRITICAL' : t.openAlerts > 0 ? 'WARNING' : 'OK')}`}>
                        {t.openAlerts} open
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border ${pillClass('CRITICAL')}`}>{t.criticalAlerts} critical</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.lastEventTime ? new Date(t.lastEventTime).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => switchTenantAndOpen(t.id, '/portal')}
                        disabled={actionBusy === `switch:${t.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open portal
                      </button>
                      <button
                        onClick={() => switchTenantAndOpen(t.id, '/portal/map')}
                        disabled={actionBusy === `switch:${t.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Map className="h-4 w-4 mr-1" />
                        Map
                      </button>
                      <button
                        onClick={() => toggleTenant(t.id, t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                        disabled={actionBusy === `toggle:${t.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Power className="h-4 w-4 mr-1" />
                        {t.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No tenants
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}


