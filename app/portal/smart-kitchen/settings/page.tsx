'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Lock, 
  Bell, 
  Database, 
  Shield, 
  ChevronRight, 
  Check, 
  X,
  Eye,
  EyeOff,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  Loader2,
  Pencil,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { EQUIPMENT_CONFIGS, DANGER_ZONE, COOKING_TEMPS, formatThresholdRange, type EquipmentType } from '../lib/compliance'

interface Profile {
  name: string
  email: string
}

export default function SettingsPage() {
  const { isDark } = useTheme()
  const [profile, setProfile] = useState<Profile>({ name: '', email: '' })
  const [editingProfile, setEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    alertEmail: true,
    alertSms: true,
    alertPush: true,
    readingInterval: 5,
    retentionDays: 90,
    alertOnWarning: true,
    alertOnCritical: true,
  })

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/portal/smart-kitchen/profile')
      const data = await response.json()
      if (data.success) {
        setProfile(data.profile)
        setEditName(data.profile.name)
      }
    } catch {
      // Use default profile
      setProfile({ name: 'Vadim', email: 'vadim@visiondrive.ae' })
      setEditName('Vadim')
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/portal/smart-kitchen/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: profile.email }),
      })
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
        setEditingProfile(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordLoading(true)

    try {
      const response = await fetch('/api/portal/smart-kitchen/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm,
        }),
      })
      const data = await response.json()

      if (data.success) {
        setPasswordSuccess(true)
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess(false)
          setPasswords({ current: '', new: '', confirm: '' })
        }, 1500)
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch {
      setPasswordError('Connection error. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const equipmentTypes: EquipmentType[] = [
    'refrigerator', 'freezer', 'walk_in_cooler', 'walk_in_freezer',
    'display_fridge', 'prep_fridge', 'hot_holding', 'blast_chiller'
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          
          {/* Profile Section */}
          <SettingsCard isDark={isDark}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                {profile.name?.charAt(0) || 'V'}
              </div>
              <div className="flex-1">
                <SectionTitle isDark={isDark}>Profile</SectionTitle>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your personal information
                </p>
              </div>
            </div>

            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-xl text-base
                      ${isDark 
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-orange-500' 
                        : 'bg-gray-50 text-gray-900 border-gray-200 focus:border-orange-500'
                      }
                      border outline-none transition-colors
                    `}
                    placeholder="Enter your name"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditingProfile(false)
                      setEditName(profile.name)
                      setError('')
                    }}
                    className={`
                      flex-1 py-3 rounded-xl font-medium text-sm
                      ${isDark 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                      transition-all active:scale-[0.98]
                    `}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="
                      flex-1 py-3 rounded-xl font-medium text-sm
                      bg-orange-500 text-white hover:bg-orange-600
                      transition-all active:scale-[0.98]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                    "
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ProfileRow
                  icon={User}
                  label="Name"
                  value={profile.name}
                  isDark={isDark}
                  onEdit={() => setEditingProfile(true)}
                />
                <ProfileRow
                  icon={Mail}
                  label="Email"
                  value={profile.email}
                  isDark={isDark}
                />
              </div>
            )}
          </SettingsCard>

          {/* Security Section */}
          <SettingsCard isDark={isDark}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center`}>
                <Shield className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <SectionTitle isDark={isDark}>Security</SectionTitle>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Password and authentication
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <ActionButton
                icon={Lock}
                title="Change Password"
                description="Update your account password"
                onClick={() => setShowPasswordModal(true)}
                isDark={isDark}
              />
              <ActionButton
                icon={Shield}
                title="Two-Factor Authentication"
                description="Add an extra layer of security"
                badge="Not enabled"
                badgeColor="amber"
                isDark={isDark}
              />
            </div>
          </SettingsCard>

          {/* Notifications Section */}
          <SettingsCard isDark={isDark}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'} flex items-center justify-center`}>
                <Bell className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <SectionTitle isDark={isDark}>Notifications</SectionTitle>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  How you receive alerts
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <ToggleRow
                icon={Mail}
                title="Email Notifications"
                description="Receive alerts via email"
                enabled={settings.alertEmail}
                onToggle={() => setSettings({ ...settings, alertEmail: !settings.alertEmail })}
                isDark={isDark}
              />
              <ToggleRow
                icon={Phone}
                title="SMS Notifications"
                description="Receive critical alerts via SMS"
                enabled={settings.alertSms}
                onToggle={() => setSettings({ ...settings, alertSms: !settings.alertSms })}
                isDark={isDark}
              />
              <ToggleRow
                icon={Bell}
                title="Push Notifications"
                description="Receive alerts in your browser"
                enabled={settings.alertPush}
                onToggle={() => setSettings({ ...settings, alertPush: !settings.alertPush })}
                isDark={isDark}
              />
            </div>
          </SettingsCard>

          {/* Data Settings */}
          <SettingsCard isDark={isDark}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'} flex items-center justify-center`}>
                <Database className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div>
                <SectionTitle isDark={isDark}>Data Settings</SectionTitle>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sensor intervals and retention
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Reading Interval"
                value={settings.readingInterval}
                onChange={(value) => setSettings({ ...settings, readingInterval: value })}
                options={[
                  { value: 1, label: 'Every 1 minute' },
                  { value: 5, label: 'Every 5 minutes' },
                  { value: 10, label: 'Every 10 minutes' },
                  { value: 15, label: 'Every 15 minutes' },
                  { value: 30, label: 'Every 30 minutes' },
                ]}
                hint="Recommended: 5 minutes"
                isDark={isDark}
              />
              <SelectField
                label="Data Retention"
                value={settings.retentionDays}
                onChange={(value) => setSettings({ ...settings, retentionDays: value })}
                options={[
                  { value: 30, label: '30 days' },
                  { value: 60, label: '60 days' },
                  { value: 90, label: '90 days' },
                  { value: 180, label: '180 days' },
                  { value: 365, label: '1 year' },
                ]}
                hint="DM recommends 90+ days"
                isDark={isDark}
              />
            </div>
          </SettingsCard>

          {/* Compliance Section */}
          <SettingsCard isDark={isDark}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center`}>
                <FileText className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <SectionTitle isDark={isDark}>Dubai Municipality Requirements</SectionTitle>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Official temperature thresholds
                </p>
              </div>
            </div>

            {/* Reference Card */}
            <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-100'}`}>
              <div className="flex items-start gap-3">
                <Shield className={`h-5 w-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Compliance Reference</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-blue-400/80' : 'text-blue-700'}`}>
                    Document: DM-HSD-GU46-KFPA2
                  </p>
                  <p className={`text-xs ${isDark ? 'text-blue-400/60' : 'text-blue-600'}`}>Version 3 • Issued: 09/05/2024</p>
                </div>
              </div>
            </div>

            {/* Equipment List */}
            <div className="space-y-2">
              {equipmentTypes.map(type => {
                const config = EQUIPMENT_CONFIGS[type]
                return (
                  <div 
                    key={type} 
                    className={`
                      flex items-center justify-between p-4 rounded-xl
                      ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{config.name}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{config.nameAr}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatThresholdRange(type)}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{config.dmReference}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Danger Zone Warning */}
            <div className={`mt-4 p-4 rounded-2xl ${isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-900'}`}>Danger Zone Alert</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-red-400/80' : 'text-red-700'}`}>
                    Temperature between {DANGER_ZONE.min}°C and {DANGER_ZONE.max}°C is unsafe. 
                    Food must be consumed within 2 hours or discarded.
                  </p>
                </div>
              </div>
            </div>

            {/* Cooking Temperature */}
            <div className={`mt-4 p-4 rounded-2xl ${isDark ? 'bg-orange-900/20 border border-orange-800/50' : 'bg-orange-50 border border-orange-200'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">🍳</span>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>Cooking Temperature</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-orange-400/80' : 'text-orange-700'}`}>
                    All foods must reach a minimum core temperature of {COOKING_TEMPS.general}°C.
                  </p>
                </div>
              </div>
            </div>
          </SettingsCard>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {saved && (
              <span className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                <Check className="h-4 w-4" />
                Settings saved
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="
                px-8 py-3 rounded-full font-medium text-sm
                bg-[#1d1d1f] text-white hover:bg-[#2d2d2f]
                transition-all duration-200 active:scale-[0.98]
                shadow-lg
              "
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !passwordLoading && setShowPasswordModal(false)}
          />
          
          {/* Modal */}
          <div className={`
            relative w-full max-w-md rounded-3xl p-6 shadow-2xl
            ${isDark ? 'bg-[#2d2d2f]' : 'bg-white'}
            transform transition-all duration-300 scale-100
          `}>
            {/* Close button */}
            <button
              onClick={() => !passwordLoading && setShowPasswordModal(false)}
              className={`
                absolute top-4 right-4 p-2 rounded-full
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                transition-colors
              `}
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className={`
                w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                ${isDark ? 'bg-orange-900/30' : 'bg-orange-100'}
              `}>
                <Lock className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              </div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Change Password
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Enter your current password and choose a new one
              </p>
            </div>

            {passwordSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Password changed successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
                {/* Current Password */}
                <PasswordInput
                  label="Current Password"
                  value={passwords.current}
                  onChange={(v) => setPasswords({ ...passwords, current: v })}
                  show={showPasswords.current}
                  onToggleShow={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  isDark={isDark}
                />

                {/* New Password */}
                <PasswordInput
                  label="New Password"
                  value={passwords.new}
                  onChange={(v) => setPasswords({ ...passwords, new: v })}
                  show={showPasswords.new}
                  onToggleShow={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  isDark={isDark}
                  hint="At least 8 characters with uppercase, lowercase, and numbers"
                />

                {/* Confirm Password */}
                <PasswordInput
                  label="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(v) => setPasswords({ ...passwords, confirm: v })}
                  show={showPasswords.confirm}
                  onToggleShow={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  isDark={isDark}
                />

                {/* Error */}
                {passwordError && (
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                    <p className="text-sm text-red-500 text-center">{passwordError}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={passwordLoading || !passwords.current || !passwords.new || !passwords.confirm}
                  className="
                    w-full py-4 mt-2 rounded-2xl font-semibold text-base
                    bg-orange-500 text-white hover:bg-orange-600
                    transition-all duration-200 active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Component: Settings Card
function SettingsCard({ 
  children, 
  isDark 
}: { 
  children: React.ReactNode
  isDark: boolean 
}) {
  return (
    <div className={`
      rounded-3xl p-6 
      ${isDark ? 'bg-[#2d2d2f]' : 'bg-white'}
      shadow-sm
      transition-all duration-200
    `}>
      {children}
    </div>
  )
}

// Component: Section Title
function SectionTitle({ 
  children, 
  isDark 
}: { 
  children: React.ReactNode
  isDark: boolean 
}) {
  return (
    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {children}
    </h2>
  )
}

// Component: Profile Row
function ProfileRow({
  icon: Icon,
  label,
  value,
  isDark,
  onEdit,
}: {
  icon: React.ElementType
  label: string
  value: string
  isDark: boolean
  onEdit?: () => void
}) {
  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl
      ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}
    `}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className={`
            p-2 rounded-lg transition-colors
            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
          `}
        >
          <Pencil className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      )}
    </div>
  )
}

// Component: Action Button
function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
  badgeColor = 'gray',
  isDark,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick?: () => void
  badge?: string
  badgeColor?: 'gray' | 'amber' | 'green' | 'red'
  isDark: boolean
}) {
  const badgeColors = {
    gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600',
    amber: isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700',
    green: isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
    red: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700',
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between p-4 rounded-xl
        ${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}
        transition-all duration-200 active:scale-[0.99]
        group
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <div className="text-left">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
        </div>
      </div>
      {badge ? (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeColors[badgeColor]}`}>
          {badge}
        </span>
      ) : (
        <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'} transition-transform duration-200 group-hover:translate-x-0.5`} />
      )}
    </button>
  )
}

// Component: Toggle Row
function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  isDark,
}: {
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
  isDark: boolean
}) {
  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl
      ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}
    `}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`
          relative w-12 h-7 rounded-full transition-colors duration-200
          ${enabled 
            ? 'bg-orange-500' 
            : isDark ? 'bg-gray-700' : 'bg-gray-300'
          }
        `}
      >
        <div className={`
          absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </button>
    </div>
  )
}

// Component: Select Field
function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  isDark,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  options: { value: number; label: string }[]
  hint?: string
  isDark: boolean
}) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
          w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer
          ${isDark 
            ? 'bg-gray-800 text-white border-gray-700' 
            : 'bg-gray-50 text-gray-900 border-gray-200'
          }
          border outline-none
          focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
          transition-colors
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && (
        <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</p>
      )}
    </div>
  )
}

// Component: Password Input
function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  isDark,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggleShow: () => void
  isDark: boolean
  hint?: string
}) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-4 py-3.5 pr-12 rounded-xl text-base
            ${isDark 
              ? 'bg-gray-800 text-white border-gray-700' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
            }
            border outline-none
            focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
            transition-colors
          `}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg
            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
            transition-colors
          `}
        >
          {show ? (
            <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <Eye className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </button>
      </div>
      {hint && (
        <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</p>
      )}
    </div>
  )
}
