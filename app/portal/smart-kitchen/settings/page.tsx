'use client'

import { useState } from 'react'
import { Bell, Thermometer, Mail, Phone, Shield, Database, ChevronRight, Check, ToggleLeft, ToggleRight, FileText, AlertTriangle } from 'lucide-react'
import { EQUIPMENT_CONFIGS, DANGER_ZONE, COOKING_TEMPS, formatThresholdRange, type EquipmentType } from '../lib/compliance'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    alertEmail: true,
    alertSms: true,
    alertPush: true,
    readingInterval: 5,
    retentionDays: 90,
    alertOnWarning: true,
    alertOnCritical: true,
    alertOnDangerZone: true,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const equipmentTypes: EquipmentType[] = [
    'refrigerator', 'freezer', 'walk_in_cooler', 'walk_in_freezer',
    'display_fridge', 'prep_fridge', 'hot_holding', 'blast_chiller'
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure alerts and compliance monitoring</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Dubai Municipality Requirements */}
        <SettingsSection
          icon={FileText}
          title="Dubai Municipality Requirements"
          description="Official temperature thresholds from DM Food Safety Code"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        >
          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Compliance Reference</p>
                <p className="text-xs text-blue-700 mt-1">
                  Document: DM-HSD-GU46-KFPA2 (Technical Guidelines for Occupational Health & Safety in Kitchens)
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Version 3 • Issued: 09/05/2024</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {equipmentTypes.map(type => {
              const config = EQUIPMENT_CONFIGS[type]
              return (
                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{config.name}</p>
                      <p className="text-xs text-gray-500">{config.nameAr}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatThresholdRange(type)}</p>
                    <p className="text-xs text-gray-500">{config.dmReference}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Danger Zone Warning */}
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Danger Zone Alert</p>
                <p className="text-xs text-red-700 mt-1">
                  Temperature between {DANGER_ZONE.min}°C and {DANGER_ZONE.max}°C is unsafe. 
                  Food must be consumed within 2 hours or discarded.
                </p>
                <p className="text-xs text-red-600 mt-1">{DANGER_ZONE.dmReference}</p>
              </div>
            </div>
          </div>

          {/* Cooking Requirements */}
          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-start gap-3">
              <span className="text-xl">🍳</span>
              <div>
                <p className="text-sm font-medium text-orange-900">Cooking Temperature</p>
                <p className="text-xs text-orange-700 mt-1">
                  All foods must reach a minimum core temperature of {COOKING_TEMPS.general}°C to eliminate harmful bacteria.
                </p>
                <p className="text-xs text-orange-600 mt-1">{COOKING_TEMPS.dmReference}</p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Alert Notifications */}
        <SettingsSection
          icon={Bell}
          title="Alert Notifications"
          description="Choose how you want to receive compliance alerts"
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
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4">Alert Triggers</p>
            <div className="space-y-3">
              <ToggleRow
                icon={AlertTriangle}
                title="Warning Alerts"
                description="Alert when temperature approaches threshold"
                enabled={settings.alertOnWarning}
                onToggle={() => setSettings({ ...settings, alertOnWarning: !settings.alertOnWarning })}
              />
              <ToggleRow
                icon={AlertTriangle}
                title="Critical Alerts"
                description="Alert when temperature exceeds threshold"
                enabled={settings.alertOnCritical}
                onToggle={() => setSettings({ ...settings, alertOnCritical: !settings.alertOnCritical })}
              />
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">Danger Zone Alerts</p>
                      <p className="text-xs text-red-600">Immediate alert for food safety violations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-medium">Always On</span>
                    <div className="w-7 h-7 rounded-lg bg-red-200 flex items-center justify-center">
                      <Check className="h-4 w-4 text-red-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <p className="text-xs text-gray-500 mt-1">Recommended: 5 minutes for compliance monitoring</p>
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
              <p className="text-xs text-gray-500 mt-1">DM recommends minimum 90 days for audit purposes</p>
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
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-600',
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
  iconBg?: string
  iconColor?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
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
