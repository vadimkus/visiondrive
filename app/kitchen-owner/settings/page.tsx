'use client'

import { useState } from 'react'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Shield, 
  User,
  Building,
  Save
} from 'lucide-react'

export default function OwnerSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    warningAlerts: true,
    criticalAlerts: true,
    dailyReport: true,
    weeklyReport: true,
  })

  const [thresholds, setThresholds] = useState({
    fridgeMin: 0,
    fridgeMax: 5,
    freezerMax: -18,
    hotHoldingMin: 60,
  })

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and notification preferences</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Account Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Owner Name</label>
                <input 
                  type="text" 
                  defaultValue="Abdul Rahman"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input 
                  type="email" 
                  defaultValue="abdul@kitchen.ae"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <input 
                  type="tel" 
                  defaultValue="+971-50-123-4567"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Kitchen Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Kitchen Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Kitchen Name</label>
                <input 
                  type="text" 
                  defaultValue="Abdul's Kitchen"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Address</label>
                <input 
                  type="text" 
                  defaultValue="Marina Walk, Dubai Marina"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Trade License</label>
                <input 
                  type="text" 
                  defaultValue="DM-12345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Email Notifications</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">SMS Alerts</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Warning Alerts</span>
                <input 
                  type="checkbox" 
                  checked={notifications.warningAlerts}
                  onChange={(e) => setNotifications({ ...notifications, warningAlerts: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Critical Alerts (Always On)</span>
                <input 
                  type="checkbox" 
                  checked={true}
                  disabled
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 opacity-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Daily Summary Report</span>
                <input 
                  type="checkbox" 
                  checked={notifications.dailyReport}
                  onChange={(e) => setNotifications({ ...notifications, dailyReport: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Weekly Compliance Report</span>
                <input 
                  type="checkbox" 
                  checked={notifications.weeklyReport}
                  onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Temperature Thresholds */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Alert Thresholds (DM Compliant)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fridge Min (°C)</label>
                  <input 
                    type="number" 
                    value={thresholds.fridgeMin}
                    onChange={(e) => setThresholds({ ...thresholds, fridgeMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fridge Max (°C)</label>
                  <input 
                    type="number" 
                    value={thresholds.fridgeMax}
                    onChange={(e) => setThresholds({ ...thresholds, fridgeMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Freezer Max (°C)</label>
                <input 
                  type="number" 
                  value={thresholds.freezerMax}
                  onChange={(e) => setThresholds({ ...thresholds, freezerMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hot Holding Min (°C)</label>
                <input 
                  type="number" 
                  value={thresholds.hotHoldingMin}
                  onChange={(e) => setThresholds({ ...thresholds, hotHoldingMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
