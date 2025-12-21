'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, Plus, Save } from 'lucide-react'

type PortalUser = {
  id: string
  email: string
  name: string | null
  status: string
  tenantRole: string
  membershipStatus: string
  createdAt: string
}

export default function PortalAdminPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [users, setUsers] = useState<PortalUser[]>([])
  const [thresholds, setThresholds] = useState<any>({ offlineMinutes: 60, lowBatteryPct: 20, staleEventMinutes: 15 })
  const [loading, setLoading] = useState(true)

  // create user form
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('CUSTOMER_OPS')
  const [password, setPassword] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

  // zones import (GeoJSON + tariff JSON)
  const [zones, setZones] = useState<any[]>([])
  const [zoneName, setZoneName] = useState('RTA Zone A (Demo Import)')
  const [zoneKind, setZoneKind] = useState('PAID')
  const [zoneGeojsonText, setZoneGeojsonText] = useState('')
  const [zoneTariffText, setZoneTariffText] = useState('')
  const [zoneImportStatus, setZoneImportStatus] = useState<string | null>(null)

  const load = async () => {
    const meRes = await fetch('/api/auth/me', { credentials: 'include' })
    if (!meRes.ok) {
      router.push('/login')
      return
    }
    const meJson = await meRes.json()
    setMe(meJson.user)
    if (!['MASTER_ADMIN', 'CUSTOMER_ADMIN'].includes(meJson.user?.role)) {
      router.push('/portal')
      return
    }

    const [uRes, sRes] = await Promise.all([
      fetch('/api/portal/admin/users', { credentials: 'include' }),
      fetch('/api/portal/admin/settings', { credentials: 'include' }),
    ])
    const uJson = await uRes.json()
    if (uJson.success) setUsers(uJson.users || [])
    const sJson = await sRes.json()
    if (sJson.success) setThresholds(sJson.thresholds || thresholds)

    const zRes = await fetch('/api/portal/admin/zones', { credentials: 'include' })
    const zJson = await zRes.json()
    if (zJson.success) setZones(zJson.zones || [])
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createUser = async () => {
    setGeneratedPassword(null)
    const res = await fetch('/api/portal/admin/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name, role, password: password || undefined }),
    })
    const json = await res.json()
    if (json.success) {
      setEmail('')
      setName('')
      setPassword('')
      if (json.generatedPassword) setGeneratedPassword(json.generatedPassword)
      await load()
    }
  }

  const saveThresholds = async () => {
    await fetch('/api/portal/admin/settings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ thresholds }),
    })
    await load()
  }

  const importZone = async () => {
    setZoneImportStatus(null)
    let geojson: any = null
    let tariff: any = null
    try {
      geojson = zoneGeojsonText.trim() ? JSON.parse(zoneGeojsonText) : null
    } catch {
      setZoneImportStatus('Invalid GeoJSON JSON (cannot parse).')
      return
    }
    try {
      tariff = zoneTariffText.trim() ? JSON.parse(zoneTariffText) : null
    } catch {
      setZoneImportStatus('Invalid Tariff JSON (cannot parse).')
      return
    }

    const res = await fetch('/api/portal/admin/zones', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: zoneName, kind: zoneKind, geojson, tariff }),
    })
    const json = await res.json()
    if (!json.success) {
      setZoneImportStatus(`Import failed: ${json.error || 'UNKNOWN'}`)
      return
    }
    setZoneImportStatus(`Imported: ${json.id}`)
    await load()
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
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/portal')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-600">Tenant settings + user management (customer admin view).</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Thresholds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Offline minutes</label>
                <input
                  type="number"
                  value={thresholds.offlineMinutes ?? 60}
                  onChange={(e) => setThresholds({ ...thresholds, offlineMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Low battery %</label>
                <input
                  type="number"
                  value={thresholds.lowBatteryPct ?? 20}
                  onChange={(e) => setThresholds({ ...thresholds, lowBatteryPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stale event minutes</label>
                <input
                  type="number"
                  value={thresholds.staleEventMinutes ?? 15}
                  onChange={(e) => setThresholds({ ...thresholds, staleEventMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button onClick={saveThresholds} className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create User</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <option value="CUSTOMER_ADMIN">CUSTOMER_ADMIN</option>
                  <option value="CUSTOMER_OPS">CUSTOMER_OPS</option>
                  <option value="CUSTOMER_ANALYST">CUSTOMER_ANALYST</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password (optional)</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <button onClick={createUser} className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </button>
            {generatedPassword && (
              <p className="mt-3 text-sm text-gray-700">
                Generated password (copy now): <span className="font-mono font-semibold">{generatedPassword}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Parking Zones (GeoJSON import)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Paste a GeoJSON <span className="font-mono">Feature</span> or <span className="font-mono">FeatureCollection</span> and optional tariff JSON (e.g. from Dubai Pulse exports).
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Need to fix sensor placement? Use{' '}
            <a href="/portal/calibration" className="text-primary-700 hover:underline font-medium">
              Map Calibration (Sensors)
            </a>
            .
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone name</label>
              <input value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kind</label>
              <select value={zoneKind} onChange={(e) => setZoneKind(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="PAID">PAID</option>
                <option value="FREE">FREE</option>
                <option value="RESIDENT">RESIDENT</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={importZone} className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">
                <Plus className="h-4 w-4 mr-2" />
                Import
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GeoJSON</label>
              <textarea
                value={zoneGeojsonText}
                onChange={(e) => setZoneGeojsonText(e.target.value)}
                placeholder='{"type":"FeatureCollection","features":[...]}'
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tariff JSON (optional)</label>
              <textarea
                value={zoneTariffText}
                onChange={(e) => setZoneTariffText(e.target.value)}
                placeholder='{"rateAedPerHour":4,"hours":"8:00-22:00"}'
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
          {zoneImportStatus && <p className="mt-3 text-sm text-gray-700">{zoneImportStatus}</p>}

          <div className="mt-5 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Zones in tenant</h3>
            <div className="text-xs text-gray-600">
              {zones.length ? (
                <ul className="space-y-1">
                  {zones.slice(0, 20).map((z) => (
                    <li key={z.id} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{z.name}</span>
                      <span className="text-gray-600">
                        {z.kind} · geojson: {z.hasGeojson ? 'yes' : 'no'} · tariff: {z.hasTariff ? 'yes' : 'no'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span>No zones yet.</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              View overlays on <span className="font-mono">/portal/map</span> using the “Zones overlay” toggle.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-auto">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Users in this tenant</h2>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{u.tenantRole}</td>
                  <td className="px-4 py-3 text-gray-700">{u.membershipStatus}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No users yet
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


