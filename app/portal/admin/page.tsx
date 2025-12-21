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

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  return (
    <Section className="pt-24 pb-12">
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


