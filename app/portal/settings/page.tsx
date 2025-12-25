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
  RefreshCw,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Plus
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
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'zones' | 'system'>('profile')

  // zones import (GeoJSON + tariff JSON)
  const [zones, setZones] = useState<any[]>([])
  const [zoneName, setZoneName] = useState('RTA Zone A (Demo Import)')
  const [zoneKind, setZoneKind] = useState('PAID')
  const [zoneGeojsonText, setZoneGeojsonText] = useState('')
  const [zoneTariffText, setZoneTariffText] = useState('')
  const [zoneImportStatus, setZoneImportStatus] = useState<string | null>(null)

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

        // Load zones for admin users
        if (data.user && ['MASTER_ADMIN', 'CUSTOMER_ADMIN'].includes(data.user.role)) {
          const zRes = await fetch('/api/portal/admin/zones', { credentials: 'include' })
          const zJson = await zRes.json()
          if (zJson.success) setZones(zJson.zones || [])
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

        // Reload zones for admin users
        if (['MASTER_ADMIN', 'CUSTOMER_ADMIN'].includes(data.user.role)) {
          const zRes = await fetch('/api/portal/admin/zones', { credentials: 'include' })
          const zJson = await zRes.json()
          if (zJson.success) setZones(zJson.zones || [])
        }
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
    await refresh()
  }

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </Section>
    )
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'zones' as const, label: 'Zones', icon: MapPin },
    { id: 'system' as const, label: 'System', icon: Settings },
  ]

  return (
    <>
      <Section className="pt-6 pb-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/portal')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Settings
                </h1>
                <p className="text-gray-600">Manage your account preferences and security</p>
              </div>
              <button
                onClick={refresh}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className={`mb-6 rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm ${
              statusMsg.includes('successfully') || statusMsg.includes('changed') || statusMsg.includes('updated')
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              {statusMsg.includes('successfully') || statusMsg.includes('changed') || statusMsg.includes('updated') ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${
                statusMsg.includes('successfully') || statusMsg.includes('changed') || statusMsg.includes('updated')
                  ? 'text-green-900'
                  : 'text-amber-900'
              }`}>
                {statusMsg}
              </p>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50/50">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-medium transition-all relative ${
                        isActive
                          ? 'text-primary-600 bg-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </div>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">{renderTabContent()}</div>
          </div>
        </div>
      </Section>
    </>
  )

  function renderTabContent() {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'security':
        return renderSecurityTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'zones':
        return renderZonesTab()
      case 'system':
        return renderSystemTab()
      default:
        return null
    }
  }

  function renderProfileTab() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Information</h2>
          <p className="text-sm text-gray-600">Update your personal information and account details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {user?.tenantId && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tenant ID
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={user.tenantId}
                  disabled
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={saveProfile}
            disabled={savingName}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-medium"
          >
            {savingName ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  function renderSecurityTab() {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Security Settings</h2>
          <p className="text-sm text-gray-600">Manage your password and authentication preferences</p>
        </div>

        {/* Change Password Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Lock className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                At least 8 characters long
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Contains at least one letter
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Contains at least one number
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Different from current password
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                      : confirmPassword && newPassword === confirmPassword
                      ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={changePassword}
              disabled={pwdBusy || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-medium"
            >
              {pwdBusy ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Coming Soon:</span> TOTP authentication with recovery codes. 
              In the meantime, use strong passwords and monitor the Audit Log for account activity.
            </p>
          </div>
        </div>
      </div>
    )
  }

  function renderNotificationsTab() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
          <p className="text-sm text-gray-600">Choose how you want to receive updates and alerts</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
            <label className="flex items-start justify-between cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive alerts and reports via email</p>
                  <p className="text-xs text-gray-500 mt-1">(Preferences stored locally)</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  emailNotifs ? 'bg-primary-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                    emailNotifs ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
            <label className="flex items-start justify-between cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive real-time alerts in your browser</p>
                  <p className="text-xs text-gray-500 mt-1">(Preferences stored locally)</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  pushNotifs ? 'bg-primary-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                    pushNotifs ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    )
  }

  function renderZonesTab() {
    // Only admins can access zones
    if (!user || !['MASTER_ADMIN', 'CUSTOMER_ADMIN'].includes(user.role)) {
      return (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Admin access required</p>
          <p className="text-sm text-gray-500 mt-1">Only administrators can manage parking zones</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Parking Zones Management</h2>
          <p className="text-sm text-gray-600">Import and manage parking zones from GeoJSON sources</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-900 mb-2">
            Need to fix sensor placement? Use{' '}
            <a href="/portal/calibration" className="text-blue-700 hover:underline font-semibold">
              Map Calibration (Sensors)
            </a>
          </p>
          <p className="text-sm text-blue-900">
            Want to review hardware issues? Open{' '}
            <a href="/portal/alerts" className="text-blue-700 hover:underline font-semibold">
              Alerts
            </a>
          </p>
        </div>

        {/* Zone Import Form */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Import New Zone</h3>
              <p className="text-sm text-gray-600">Add zones from Dubai Pulse or other GeoJSON sources</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zone name</label>
                <input 
                  value={zoneName} 
                  onChange={(e) => setZoneName(e.target.value)} 
                  placeholder="Enter zone name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kind</label>
                <select 
                  value={zoneKind} 
                  onChange={(e) => setZoneKind(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                >
                  <option value="PAID">PAID</option>
                  <option value="FREE">FREE</option>
                  <option value="RESIDENT">RESIDENT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GeoJSON</label>
                <textarea
                  value={zoneGeojsonText}
                  onChange={(e) => setZoneGeojsonText(e.target.value)}
                  placeholder='{"type":"FeatureCollection","features":[...]}'
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tariff JSON (optional)</label>
                <textarea
                  value={zoneTariffText}
                  onChange={(e) => setZoneTariffText(e.target.value)}
                  placeholder='{"rateAedPerHour":4,"hours":"8:00-22:00"}'
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>
            
            {zoneImportStatus && (
              <div className={`p-3 rounded-xl flex items-center gap-2 ${
                zoneImportStatus.includes('failed') || zoneImportStatus.includes('Invalid')
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {zoneImportStatus.includes('failed') || zoneImportStatus.includes('Invalid') ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <p className={`text-sm font-medium ${
                  zoneImportStatus.includes('failed') || zoneImportStatus.includes('Invalid') 
                    ? 'text-red-900' 
                    : 'text-green-900'
                }`}>{zoneImportStatus}</p>
              </div>
            )}

            <button 
              onClick={importZone} 
              className="inline-flex items-center px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Import Zone
            </button>
          </div>
        </div>

        {/* Existing Zones */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zones in Tenant</h3>
          {zones.length > 0 ? (
            <div className="space-y-2">
              {zones.slice(0, 20).map((z) => (
                <div key={z.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <span className="font-semibold text-gray-900">{z.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-lg font-medium ${
                      z.kind === 'PAID' ? 'bg-blue-100 text-blue-700' :
                      z.kind === 'FREE' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {z.kind}
                    </span>
                    <span className="text-gray-600">
                      geojson: {z.hasGeojson ? '✓' : '✗'} · tariff: {z.hasTariff ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No zones yet</p>
              <p className="text-sm text-gray-400 mt-1">Import your first zone above</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            💡 View overlays on <span className="font-mono bg-white px-2 py-1 rounded border border-blue-200">/portal/map</span> using the "Zones overlay" toggle.
          </p>
        </div>
      </div>
    )
  }

  function renderSystemTab() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">System Information</h2>
          <p className="text-sm text-gray-600">View system details and quick access to admin tools</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Active Tenant</span>
              <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                {user?.tenantId || 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Account Role</span>
              <span className="font-semibold text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-gray-600">User ID</span>
              <span className="font-mono text-sm text-gray-700">
                {user?.id}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a
              href="/portal/admin"
              className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
            >
              <Settings className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
              <span className="font-medium text-gray-900">Admin Panel</span>
            </a>
            
            {user?.role === 'MASTER_ADMIN' && (
              <>
                <a
                  href="/portal/admin/tenants"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <Building className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                  <span className="font-medium text-gray-900">Tenants</span>
                </a>
                <a
                  href="/portal/admin/finance"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <Shield className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                  <span className="font-medium text-gray-900">Finance</span>
                </a>
                <a
                  href="/portal/admin/audit"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <Lock className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                  <span className="font-medium text-gray-900">Audit Log</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
}





