'use client'

import { useState } from 'react'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Shield, 
  User,
  Building,
  Save,
  Edit3,
  CheckCircle
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

export default function OwnerSettings() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { manualEditEnabled, setManualEditEnabled } = useSettings()
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

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = `w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
    isDark ? 'bg-[#1a1a1a] border-gray-700 text-white' : 'border-gray-200 text-gray-900'
  }`

  return (
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage account & notifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Account Info */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <User className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Account</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
                  <input type="text" defaultValue="Abdul Rahman" className={inputClass} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                  <input type="email" defaultValue="abdul@kitchen.ae" className={inputClass} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                  <input type="tel" defaultValue="+971-50-123-4567" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Kitchen Info */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Building className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Kitchen</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
                  <input type="text" defaultValue="Abdul's Kitchen" className={inputClass} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Address</label>
                  <input type="text" defaultValue="Marina Walk, Dubai Marina" className={inputClass} />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Trade License</label>
                  <input type="text" defaultValue="DM-12345678" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Manual Edit Section */}
            <div className={`rounded-xl border p-4 ${
              manualEditEnabled 
                ? isDark ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-200'
                : isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className={`h-4 w-4 ${manualEditEnabled ? 'text-emerald-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Manual Edit</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enable Temperature Editing
                    </span>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Allow manual amendments to sensor readings
                    </p>
                  </div>
                  <button
                    onClick={() => setManualEditEnabled(!manualEditEnabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      manualEditEnabled ? 'bg-emerald-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        manualEditEnabled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                      style={{ transform: manualEditEnabled ? 'translateX(18px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>

                {manualEditEnabled && (
                  <div className={`flex items-start gap-2 p-2 rounded-lg ${
                    isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
                  }`}>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-[10px] font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                        Edit Mode Enabled
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        You can now adjust sensor readings in My Sensors to ensure compliance.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Notifications */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Bell className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>SMS</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Warning Alerts</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.warningAlerts}
                    onChange={(e) => setNotifications({ ...notifications, warningAlerts: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Critical (Always On)</span>
                  <input type="checkbox" checked={true} disabled className="w-3.5 h-3.5 text-orange-600 rounded opacity-50" />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Daily Summary</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.dailyReport}
                    onChange={(e) => setNotifications({ ...notifications, dailyReport: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Weekly Report</span>
                  <input 
                    type="checkbox" 
                    checked={notifications.weeklyReport}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                    className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Temperature Thresholds */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Thresholds (DM)</h2>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fridge Min</label>
                    <input 
                      type="number" 
                      value={thresholds.fridgeMin}
                      onChange={(e) => setThresholds({ ...thresholds, fridgeMin: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fridge Max</label>
                    <input 
                      type="number" 
                      value={thresholds.fridgeMax}
                      onChange={(e) => setThresholds({ ...thresholds, fridgeMax: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Freezer Max</label>
                  <input 
                    type="number" 
                    value={thresholds.freezerMax}
                    onChange={(e) => setThresholds({ ...thresholds, freezerMax: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hot Holding Min</label>
                  <input 
                    type="number" 
                    value={thresholds.hotHoldingMin}
                    onChange={(e) => setThresholds({ ...thresholds, hotHoldingMin: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              saved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
