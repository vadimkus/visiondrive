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
  CheckCircle,
  Refrigerator,
  ChevronDown,
  ChevronUp,
  Hash,
  Tag
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

// Equipment data with editable fields
interface Equipment {
  id: string
  name: string
  icon: string
  model: string
  serialNumber: string
  sensorId: string
}

const initialEquipment: Equipment[] = [
  { id: 'eq-1', name: 'Walk-in Fridge', icon: '🚪', model: 'True TWT-48SD', serialNumber: 'TWI-2023-45892', sensorId: 'PS-NB-001' },
  { id: 'eq-2', name: 'Main Freezer', icon: '❄️', model: 'Liebherr GGv 5060', serialNumber: 'LBH-2022-78341', sensorId: 'PS-NB-002' },
  { id: 'eq-3', name: 'Prep Fridge', icon: '🔪', model: 'Hoshizaki CR1S-FS', serialNumber: 'HSK-2024-12076', sensorId: 'PS-NB-003' },
  { id: 'eq-4', name: 'Display Cooler', icon: '🛒', model: 'Turbo Air TOM-40', serialNumber: 'TAR-2023-90215', sensorId: 'PS-NB-004' },
  { id: 'eq-5', name: 'Hot Holding', icon: '🔥', model: 'Alto-Shaam 500-HW', serialNumber: 'ASH-2023-33987', sensorId: 'PS-NB-005' },
]

export default function OwnerSettings() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { manualEditEnabled, setManualEditEnabled } = useSettings()
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment)
  const [expandedEquipment, setExpandedEquipment] = useState<string | null>(null)
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

  const updateEquipment = (id: string, field: keyof Equipment, value: string) => {
    setEquipment(prev => prev.map(eq => 
      eq.id === id ? { ...eq, [field]: value } : eq
    ))
  }

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
                        You can now adjust readings in My Equipment to ensure compliance.
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

        {/* Equipment Management Section - Full Width */}
        <div className={`mt-4 rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Refrigerator className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Equipment Management</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              {equipment.length} devices
            </span>
          </div>
          
          <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Assign model names and serial numbers to your kitchen equipment for better tracking and compliance records.
          </p>

          <div className="space-y-2">
            {equipment.map((eq) => (
              <div 
                key={eq.id}
                className={`rounded-lg border overflow-hidden ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                {/* Equipment Header - Clickable */}
                <button
                  onClick={() => setExpandedEquipment(expandedEquipment === eq.id ? null : eq.id)}
                  className={`w-full flex items-center justify-between p-3 transition-colors ${
                    isDark 
                      ? 'bg-gray-800/50 hover:bg-gray-800' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{eq.icon}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {eq.name}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {eq.model || 'No model assigned'} • {eq.serialNumber || 'No serial'}
                      </p>
                    </div>
                  </div>
                  {expandedEquipment === eq.id ? (
                    <ChevronUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  ) : (
                    <ChevronDown className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </button>

                {/* Expanded Form */}
                {expandedEquipment === eq.id && (
                  <div className={`p-3 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={`flex items-center gap-1 text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Tag className="h-3 w-3" />
                          Equipment Model
                        </label>
                        <input 
                          type="text" 
                          value={eq.model}
                          onChange={(e) => updateEquipment(eq.id, 'model', e.target.value)}
                          placeholder="e.g., True TWT-48SD"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`flex items-center gap-1 text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Hash className="h-3 w-3" />
                          Serial Number
                        </label>
                        <input 
                          type="text" 
                          value={eq.serialNumber}
                          onChange={(e) => updateEquipment(eq.id, 'serialNumber', e.target.value)}
                          placeholder="e.g., ABC-123-456"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`flex items-center gap-1 text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          📡 Sensor ID
                        </label>
                        <input 
                          type="text" 
                          value={eq.sensorId}
                          disabled
                          className={`${inputClass} opacity-60 cursor-not-allowed`}
                        />
                      </div>
                    </div>
                    <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      💡 Model and serial number will appear in compliance reports and equipment details.
                    </p>
                  </div>
                )}
              </div>
            ))}
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
