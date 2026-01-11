'use client'

import { useState } from 'react'
import { Bell, Thermometer, Mail, Phone, Shield, Database, ChevronRight, Check, ToggleLeft, ToggleRight } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    highTempThreshold: 8,
    lowTempThreshold: 0,
    alertEmail: true,
    alertSms: true,
    alertPush: true,
    readingInterval: 5,
    retentionDays: 90,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure alerts and monitoring preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Temperature Thresholds */}
        <SettingsSection
          icon={Thermometer}
          title="Temperature Thresholds"
          description="Set alert thresholds for refrigeration"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                High Temperature Alert
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.highTempThreshold}
                  onChange={(e) => setSettings({ ...settings, highTempThreshold: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Alert when temperature exceeds this value</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Temperature Alert
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.lowTempThreshold}
                  onChange={(e) => setSettings({ ...settings, lowTempThreshold: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Alert when temperature drops below this value</p>
            </div>
          </div>
        </SettingsSection>

        {/* Alert Notifications */}
        <SettingsSection
          icon={Bell}
          title="Alert Notifications"
          description="Choose how you want to receive alerts"
        >
          <div className="space-y-4">
            <ToggleRow
              icon={Mail}
              title="Email Notifications"
              description="Receive alerts via email"
              enabled={settings.alertEmail}
              onToggle={() => setSettings({ ...settings, alertEmail: !settings.alertEmail })}
            />
            <ToggleRow
              icon={Phone}
              title="SMS Notifications"
              description="Receive critical alerts via SMS"
              enabled={settings.alertSms}
              onToggle={() => setSettings({ ...settings, alertSms: !settings.alertSms })}
            />
            <ToggleRow
              icon={Bell}
              title="Push Notifications"
              description="Receive alerts in your browser"
              enabled={settings.alertPush}
              onToggle={() => setSettings({ ...settings, alertPush: !settings.alertPush })}
            />
          </div>
        </SettingsSection>

        {/* Data Settings */}
        <SettingsSection
          icon={Database}
          title="Data Settings"
          description="Configure sensor reading intervals and data retention"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reading Interval
              </label>
              <select
                value={settings.readingInterval}
                onChange={(e) => setSettings({ ...settings, readingInterval: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value={1}>Every 1 minute</option>
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention
              </label>
              <select
                value={settings.retentionDays}
                onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection
          icon={Shield}
          title="Security"
          description="Account and access settings"
        >
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Not enabled</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">API Keys</p>
                <p className="text-xs text-gray-500">Manage API access tokens</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </SettingsSection>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex items-center justify-end gap-4">
        {saved && (
          <span className="flex items-center gap-2 text-emerald-600 text-sm">
            <Check className="h-4 w-4" />
            Settings saved
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#1d1d1f] text-white text-sm font-medium rounded-full hover:bg-[#2d2d2f] transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button onClick={onToggle} className="text-orange-500">
        {enabled ? (
          <ToggleRight className="h-7 w-7" />
        ) : (
          <ToggleLeft className="h-7 w-7 text-gray-300" />
        )}
      </button>
    </div>
  )
}
