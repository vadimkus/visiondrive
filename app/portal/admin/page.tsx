'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  ShieldAlert, 
  Users as UsersIcon,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

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
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [createStatus, setCreateStatus] = useState<string | null>(null)

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
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createUser = async () => {
    setGeneratedPassword(null)
    setCreateStatus(null)
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
      setCreateStatus('User created successfully!')
      await load()
    } else {
      setCreateStatus(`Error: ${json.error || 'Failed to create user'}`)
    }
  }

  const saveThresholds = async () => {
    setSaveStatus(null)
    await fetch('/api/portal/admin/settings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ thresholds }),
    })
    setSaveStatus('Thresholds saved successfully!')
    await load()
    setTimeout(() => setSaveStatus(null), 3000)
  }

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading admin panel...</p>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Administrator</h1>
          <p className="text-gray-600">Manage tenant settings, users, and parking zones</p>
        </div>

        {/* Master Admin Banner */}
        {me?.role === 'MASTER_ADMIN' && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Master Admin Access</h2>
                </div>
                <p className="text-blue-100">Global view across all tenants with enhanced permissions</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/portal/admin/audit"
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all font-medium"
                >
                  Audit Log
                </a>
                <a
                  href="/portal/admin/finance"
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-all font-medium shadow-lg"
                >
                  Finance
                </a>
                <a
                  href="/portal/admin/tenants"
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all font-medium"
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Global View
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Banner */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-sm p-6 border border-green-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Looking for Parking Zones?</h3>
              <p className="text-sm text-gray-600">Manage GeoJSON zone imports and tariffs in Settings</p>
            </div>
            <a
              href="/portal/settings"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Go to Settings → Zones
            </a>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Tenant Thresholds Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <SettingsIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tenant Thresholds</h2>
                  <p className="text-sm text-gray-600">Configure alert trigger values</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Offline minutes</label>
                  <input
                    type="number"
                    value={thresholds.offlineMinutes ?? 60}
                    onChange={(e) => setThresholds({ ...thresholds, offlineMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Low battery %</label>
                  <input
                    type="number"
                    value={thresholds.lowBatteryPct ?? 20}
                    onChange={(e) => setThresholds({ ...thresholds, lowBatteryPct: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stale event minutes</label>
                  <input
                    type="number"
                    value={thresholds.staleEventMinutes ?? 15}
                    onChange={(e) => setThresholds({ ...thresholds, staleEventMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
              {saveStatus && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">{saveStatus}</p>
                </div>
              )}
              <button 
                onClick={saveThresholds} 
                className="mt-4 inline-flex items-center px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Thresholds
              </button>
            </div>
          </div>

          {/* Create User Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create User</h2>
                  <p className="text-sm text-gray-600">Add new team member</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="CUSTOMER_ADMIN">CUSTOMER_ADMIN</option>
                    <option value="CUSTOMER_OPS">CUSTOMER_OPS</option>
                    <option value="CUSTOMER_ANALYST">CUSTOMER_ANALYST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password (optional)</label>
                  <input 
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Leave empty to auto-generate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  />
                </div>
              </div>
              {generatedPassword && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm font-semibold text-amber-900 mb-1">Generated password (copy now):</p>
                  <p className="font-mono text-lg font-bold text-amber-700">{generatedPassword}</p>
                </div>
              )}
              {createStatus && (
                <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
                  createStatus.includes('Error') 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  {createStatus.includes('Error') ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    createStatus.includes('Error') ? 'text-red-900' : 'text-green-900'
                  }`}>{createStatus}</p>
                </div>
              )}
              <button 
                onClick={createUser} 
                className="mt-4 inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-white p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Users in this tenant</h2>
                <p className="text-sm text-gray-600">{users.length} team member{users.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{u.email}</div>
                      {u.name && <div className="text-sm text-gray-600">{u.name}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">
                        {u.tenantRole}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        u.membershipStatus === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UsersIcon className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No users yet</p>
                        <p className="text-sm text-gray-400">Create your first user above</p>
                      </div>
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


