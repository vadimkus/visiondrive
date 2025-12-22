'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { 
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  ArrowLeft,
  Save,
  RefreshCw
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [pwdBusy, setPwdBusy] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use portal settings profile endpoint (tenant-aware role + supports profile updates)
        const response = await fetch('/api/portal/settings/profile', {
          credentials: 'include',
        })

        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setName(data.user.name || '')
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
    try {
      const e = localStorage.getItem('vd.settings.emailNotifs')
      const p = localStorage.getItem('vd.settings.pushNotifs')
      if (e !== null) setEmailNotifs(e === 'true')
      if (p !== null) setPushNotifs(p === 'true')
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('vd.settings.emailNotifs', String(emailNotifs))
      localStorage.setItem('vd.settings.pushNotifs', String(pushNotifs))
    } catch {
      // ignore
    }
  }, [emailNotifs, pushNotifs])

  const refresh = async () => {
    setLoading(true)
    setStatusMsg(null)
    try {
      const response = await fetch('/api/portal/settings/profile', { credentials: 'include' })
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      if (data.success && data.user) {
        setUser(data.user)
        setName(data.user.name || '')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSavingName(true)
    setStatusMsg(null)
    try {
      const res = await fetch('/api/portal/settings/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json.success) {
        setStatusMsg(json.error || 'Failed to save profile')
        return
      }
      setStatusMsg('Profile updated')
      await refresh()
    } finally {
      setSavingName(false)
    }
  }

  const changePassword = async () => {
    setPwdBusy(true)
    setStatusMsg(null)
    try {
      if (!currentPassword || !newPassword) {
        setStatusMsg('Please enter current and new password')
        return
      }
      if (newPassword.length < 8) {
        setStatusMsg('New password must be at least 8 characters long')
        return
      }
      if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
        setStatusMsg('Password must contain at least one letter and one number')
        return
      }
      if (newPassword !== confirmPassword) {
        setStatusMsg('New password and confirmation do not match')
        return
      }
      if (currentPassword === newPassword) {
        setStatusMsg('New password must be different from current password')
        return
      }
      const res = await fetch('/api/portal/settings/password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json.success) {
        setStatusMsg(json.error || 'Failed to change password')
        return
      }
      setStatusMsg('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setPwdBusy(false)
    }
  }

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Section>
    )
  }

  return (
    <>
      <Section className="pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/portal')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {statusMsg ? (
            <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              statusMsg.includes('successfully') || statusMsg === 'Password changed'
                ? 'bg-green-50 border border-green-200 text-green-900'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-900'
            }`}>
              {statusMsg}
            </div>
          ) : null}

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={savingName}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save profile
                  </button>
                  <button
                    onClick={refresh}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">Change password</p>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Password requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains at least one letter</li>
                      <li>• Contains at least one number</li>
                      <li>• Different from current password</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-300 bg-red-50'
                            : confirmPassword && newPassword === confirmPassword
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={changePassword}
                    disabled={pwdBusy || !currentPassword || !newPassword || !confirmPassword}
                    className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {pwdBusy ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coming next (TOTP + recovery codes). For now, use strong passwords and the Audit Log to monitor changes.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive alerts and reports via email (stored locally for now)</p>
                  </div>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive real-time alerts (stored locally for now)</p>
                  </div>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                  />
                </label>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">System</h2>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="text-gray-600">Active tenant:</span>{' '}
                    <span className="font-mono">{user?.tenantId || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href="/portal/admin" className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                      Admin
                    </a>
                    {user?.role === 'MASTER_ADMIN' ? (
                      <>
                        <a href="/portal/admin/tenants" className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                          Master Admin
                        </a>
                        <a href="/portal/admin/finance" className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                          Finance
                        </a>
                        <a href="/portal/admin/audit" className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                          Audit Log
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}




