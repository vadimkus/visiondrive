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
  ChevronRight,
  MessageCircle,
  Send,
  AlertCircle,
  Plus,
  Minus,
  Users,
  Thermometer,
  ThermometerSnowflake,
  RotateCcw,
  Info,
  FileText,
  MapPin,
  Phone,
  AtSign,
  BadgeCheck,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

// Dubai Municipality Regulation Defaults
const DM_REGULATIONS = {
  fridge: { min: 0, max: 5, label: 'Refrigerator', description: 'DM-HSD-GU46: Chilled food storage' },
  freezer: { max: -18, label: 'Freezer', description: 'DM-HSD-GU46: Frozen food storage' },
  dangerZone: { min: 5, max: 60, label: 'Danger Zone', description: 'Temperature range where bacteria multiply rapidly' },
}

// Equipment data
interface Equipment {
  id: string
  name: string
  icon: string
  type: 'fridge' | 'freezer'
  model: string
  serialNumber: string
  sensorId: string
}

const initialEquipment: Equipment[] = [
  { id: 'eq-1', name: 'Walk-in Fridge', icon: '🚪', type: 'fridge', model: 'True TWT-48SD', serialNumber: 'TWI-2023-45892', sensorId: 'PS-NB-001' },
  { id: 'eq-2', name: 'Main Freezer', icon: '❄️', type: 'freezer', model: 'Liebherr GGv 5060', serialNumber: 'LBH-2022-78341', sensorId: 'PS-NB-002' },
  { id: 'eq-3', name: 'Prep Fridge', icon: '🌡️', type: 'fridge', model: 'Hoshizaki CR1S-FS', serialNumber: 'HSK-2024-12076', sensorId: 'PS-NB-003' },
  { id: 'eq-4', name: 'Display Cooler', icon: '🧊', type: 'fridge', model: 'Turbo Air TOM-40', serialNumber: 'TAR-2023-90215', sensorId: 'PS-NB-004' },
]

// Apple-style Toggle Component
function Toggle({ 
  enabled, 
  onChange, 
  color = 'emerald' 
}: { 
  enabled: boolean
  onChange: (value: boolean) => void
  color?: 'emerald' | 'green' | 'orange'
}) {
  const colors = {
    emerald: 'bg-emerald-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }

  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
        enabled ? colors[color] : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Apple-style Section Card
function Section({ 
  title, 
  icon: Icon, 
  children, 
  badge,
  isDark 
}: { 
  title: string
  icon: React.ElementType
  children: React.ReactNode
  badge?: string
  isDark: boolean
}) {
  return (
    <div className={`rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
      <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  )
}

// Apple-style Input Row
function InputRow({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  type = 'text',
  placeholder,
  disabled,
  isDark 
}: { 
  label: string
  icon?: React.ElementType
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  isDark: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-b-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`text-right text-sm font-medium bg-transparent border-0 outline-none w-48 ${
          disabled 
            ? isDark ? 'text-gray-500' : 'text-gray-400'
            : isDark ? 'text-white' : 'text-gray-900'
        } placeholder:text-gray-400`}
      />
    </div>
  )
}

// Apple-style Toggle Row
function ToggleRow({ 
  label, 
  description,
  icon: Icon, 
  enabled, 
  onChange,
  disabled,
  color,
  isDark 
}: { 
  label: string
  description?: string
  icon?: React.ElementType
  enabled: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  color?: 'emerald' | 'green' | 'orange'
  isDark: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-b-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
        <div>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
          {description && (
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
          )}
        </div>
      </div>
      {disabled ? (
        <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Always On</span>
      ) : (
        <Toggle enabled={enabled} onChange={onChange} color={color} />
      )}
    </div>
  )
}

export default function OwnerSettings() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { manualEditEnabled, setManualEditEnabled } = useSettings()
  
  const [account, setAccount] = useState({
    name: 'Abdul Rahman',
    email: 'abdul@kitchen.ae',
    phone: '+971-50-123-4567',
  })

  const [kitchen, setKitchen] = useState({
    name: "Abdul's Kitchen",
    address: 'Marina Walk, Dubai Marina',
    license: 'DM-12345678',
  })

  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    warningAlerts: true,
    criticalAlerts: true,
    dailyReport: true,
    weeklyReport: true,
  })

  // Thresholds with custom overrides
  const [thresholds, setThresholds] = useState({
    fridgeMin: DM_REGULATIONS.fridge.min,
    fridgeMax: DM_REGULATIONS.fridge.max,
    freezerMax: DM_REGULATIONS.freezer.max,
    useCustom: false,
  })

  const isThresholdModified = 
    thresholds.fridgeMin !== DM_REGULATIONS.fridge.min ||
    thresholds.fridgeMax !== DM_REGULATIONS.fridge.max ||
    thresholds.freezerMax !== DM_REGULATIONS.freezer.max

  const resetThresholds = () => {
    setThresholds({
      fridgeMin: DM_REGULATIONS.fridge.min,
      fridgeMax: DM_REGULATIONS.fridge.max,
      freezerMax: DM_REGULATIONS.freezer.max,
      useCustom: false,
    })
  }

  // WhatsApp
  const MAX_WHATSAPP_NUMBERS = 4
  const [whatsApp, setWhatsApp] = useState({
    enabled: false,
    numbers: ['+971-50-123-4567'] as string[],
    testSent: false,
    testSending: false,
  })

  const addWhatsAppNumber = () => {
    if (whatsApp.numbers.length < MAX_WHATSAPP_NUMBERS) {
      setWhatsApp(prev => ({ ...prev, numbers: [...prev.numbers, ''] }))
    }
  }

  const removeWhatsAppNumber = (index: number) => {
    if (whatsApp.numbers.length > 1) {
      setWhatsApp(prev => ({ ...prev, numbers: prev.numbers.filter((_, i) => i !== index) }))
    }
  }

  const updateWhatsAppNumber = (index: number, value: string) => {
    setWhatsApp(prev => ({ ...prev, numbers: prev.numbers.map((n, i) => i === index ? value : n) }))
  }

  const handleTestWhatsApp = () => {
    setWhatsApp(prev => ({ ...prev, testSending: true }))
    setTimeout(() => {
      setWhatsApp(prev => ({ ...prev, testSending: false, testSent: true }))
      setTimeout(() => setWhatsApp(prev => ({ ...prev, testSent: false })), 3000)
    }, 1500)
  }

  const updateEquipment = (id: string, field: keyof Equipment, value: string) => {
    setEquipment(prev => prev.map(eq => eq.id === id ? { ...eq, [field]: value } : eq))
  }

  const [saved, setSaved] = useState(false)
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h1>
          <p className={`text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your account, notifications, and equipment.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Account Section */}
          <Section title="Account" icon={User} isDark={isDark}>
            <InputRow 
              label="Name" 
              icon={User}
              value={account.name} 
              onChange={(v) => setAccount({ ...account, name: v })} 
              isDark={isDark} 
            />
            <InputRow 
              label="Email" 
              icon={AtSign}
              value={account.email} 
              onChange={(v) => setAccount({ ...account, email: v })} 
              type="email"
              isDark={isDark} 
            />
            <InputRow 
              label="Phone" 
              icon={Phone}
              value={account.phone} 
              onChange={(v) => setAccount({ ...account, phone: v })} 
              type="tel"
              isDark={isDark} 
            />
          </Section>

          {/* Kitchen Section */}
          <Section title="Kitchen" icon={Building} isDark={isDark}>
            <InputRow 
              label="Business Name" 
              value={kitchen.name} 
              onChange={(v) => setKitchen({ ...kitchen, name: v })} 
              isDark={isDark} 
            />
            <InputRow 
              label="Location" 
              icon={MapPin}
              value={kitchen.address} 
              onChange={(v) => setKitchen({ ...kitchen, address: v })} 
              isDark={isDark} 
            />
            <InputRow 
              label="Trade License" 
              icon={FileText}
              value={kitchen.license} 
              onChange={(v) => setKitchen({ ...kitchen, license: v })} 
              isDark={isDark} 
            />
          </Section>

          {/* Temperature Thresholds - DM Compliant */}
          <Section title="Temperature Thresholds" icon={Shield} badge="DM Compliant" isDark={isDark}>
            {/* DM Regulation Notice */}
            <div className={`mb-5 p-4 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <div className="flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Dubai Municipality Guidelines
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                    Default thresholds follow DM-HSD-GU46-KFPA2 food safety regulations. 
                    You may customize for specific equipment needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Fridge Thresholds */}
            <div className={`mb-4 pb-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="h-4 w-4 text-blue-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Refrigerator
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  (Chilled storage)
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Minimum Temperature
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.fridgeMin}
                      onChange={(e) => setThresholds({ ...thresholds, fridgeMin: Number(e.target.value), useCustom: true })}
                      className={`w-full px-4 py-3 rounded-xl text-lg font-semibold text-center ${
                        isDark 
                          ? 'bg-[#2c2c2e] text-white border border-gray-700 focus:border-blue-500' 
                          : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500'
                      } outline-none transition-colors`}
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>°C</span>
                  </div>
                  <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    DM Default: {DM_REGULATIONS.fridge.min}°C
                  </p>
                </div>
                
                <div>
                  <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Maximum Temperature
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={thresholds.fridgeMax}
                      onChange={(e) => setThresholds({ ...thresholds, fridgeMax: Number(e.target.value), useCustom: true })}
                      className={`w-full px-4 py-3 rounded-xl text-lg font-semibold text-center ${
                        isDark 
                          ? 'bg-[#2c2c2e] text-white border border-gray-700 focus:border-blue-500' 
                          : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-blue-500'
                      } outline-none transition-colors`}
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>°C</span>
                  </div>
                  <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    DM Default: {DM_REGULATIONS.fridge.max}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Freezer Thresholds */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <ThermometerSnowflake className="h-4 w-4 text-cyan-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Freezer
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  (Frozen storage)
                </span>
              </div>
              
              <div className="max-w-[200px]">
                <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Maximum Temperature
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={thresholds.freezerMax}
                    onChange={(e) => setThresholds({ ...thresholds, freezerMax: Number(e.target.value), useCustom: true })}
                    className={`w-full px-4 py-3 rounded-xl text-lg font-semibold text-center ${
                      isDark 
                        ? 'bg-[#2c2c2e] text-white border border-gray-700 focus:border-cyan-500' 
                        : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-cyan-500'
                    } outline-none transition-colors`}
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>°C</span>
                </div>
                <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  DM Default: {DM_REGULATIONS.freezer.max}°C
                </p>
              </div>
            </div>

            {/* Reset Button */}
            {isThresholdModified && (
              <button
                onClick={resetThresholds}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                Reset to DM Defaults
              </button>
            )}

            {/* Danger Zone Info */}
            <div className={`mt-5 p-4 rounded-xl ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    Danger Zone: {DM_REGULATIONS.dangerZone.min}°C to {DM_REGULATIONS.dangerZone.max}°C
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                    Food should not remain in this temperature range for more than 2 hours total.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Notifications Section */}
          <Section title="Notifications" icon={Bell} isDark={isDark}>
            <ToggleRow 
              label="Email Notifications" 
              icon={Mail}
              enabled={notifications.email} 
              onChange={(v) => setNotifications({ ...notifications, email: v })} 
              isDark={isDark} 
            />
            <ToggleRow 
              label="SMS Notifications" 
              icon={Smartphone}
              enabled={notifications.sms} 
              onChange={(v) => setNotifications({ ...notifications, sms: v })} 
              isDark={isDark} 
            />
            <ToggleRow 
              label="Warning Alerts" 
              description="When temperature approaches threshold"
              enabled={notifications.warningAlerts} 
              onChange={(v) => setNotifications({ ...notifications, warningAlerts: v })} 
              color="orange"
              isDark={isDark} 
            />
            <ToggleRow 
              label="Critical Alerts" 
              description="When temperature exceeds threshold"
              enabled={true} 
              onChange={() => {}} 
              disabled={true}
              isDark={isDark} 
            />
            <ToggleRow 
              label="Daily Summary" 
              enabled={notifications.dailyReport} 
              onChange={(v) => setNotifications({ ...notifications, dailyReport: v })} 
              isDark={isDark} 
            />
            <ToggleRow 
              label="Weekly Report" 
              enabled={notifications.weeklyReport} 
              onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })} 
              isDark={isDark} 
            />
          </Section>

          {/* WhatsApp Alerts */}
          <Section title="WhatsApp Alerts" icon={MessageCircle} badge="via Twilio" isDark={isDark}>
            <ToggleRow 
              label="Enable WhatsApp" 
              description="Receive instant alerts on WhatsApp"
              enabled={whatsApp.enabled} 
              onChange={(v) => setWhatsApp({ ...whatsApp, enabled: v })} 
              color="green"
              isDark={isDark} 
            />

            {whatsApp.enabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Users className="h-4 w-4" />
                      Phone Numbers
                    </label>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {whatsApp.numbers.length}/{MAX_WHATSAPP_NUMBERS}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {whatsApp.numbers.map((number, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input 
                          type="tel" 
                          value={number}
                          onChange={(e) => updateWhatsAppNumber(index, e.target.value)}
                          placeholder="+971-50-123-4567"
                          className={`flex-1 px-4 py-3 rounded-xl text-sm ${
                            isDark 
                              ? 'bg-[#2c2c2e] text-white border border-gray-700 placeholder:text-gray-600' 
                              : 'bg-gray-50 text-gray-900 border border-gray-200 placeholder:text-gray-400'
                          } outline-none focus:border-green-500 transition-colors`}
                        />
                        {whatsApp.numbers.length > 1 && (
                          <button
                            onClick={() => removeWhatsAppNumber(index)}
                            className={`p-3 rounded-xl transition-colors ${
                              isDark 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                : 'bg-red-50 text-red-500 hover:bg-red-100'
                            }`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {whatsApp.numbers.length < MAX_WHATSAPP_NUMBERS && (
                    <button
                      onClick={addWhatsAppNumber}
                      className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl border-2 border-dashed transition-colors ${
                        isDark 
                          ? 'border-gray-700 text-gray-400 hover:border-green-700 hover:text-green-400' 
                          : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Number
                    </button>
                  )}
                </div>

                <button
                  onClick={handleTestWhatsApp}
                  disabled={whatsApp.testSending}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    whatsApp.testSent
                      ? 'bg-green-500 text-white'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {whatsApp.testSending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : whatsApp.testSent ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Test Sent!
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Test Message
                    </>
                  )}
                </button>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    <span className="font-medium">Alert types:</span> Critical temperature breaches, 
                    Danger Zone warnings, Equipment offline alerts.
                  </p>
                </div>
              </div>
            )}
          </Section>

          {/* Manual Edit Section */}
          <Section title="Advanced" icon={Edit3} isDark={isDark}>
            <ToggleRow 
              label="Manual Temperature Editing" 
              enabled={manualEditEnabled} 
              onChange={setManualEditEnabled} 
              isDark={isDark} 
            />
            
            {manualEditEnabled && (
              <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Edit Mode Active
                  </p>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                  Go to Equipment page to modify temperature readings.
                </p>
              </div>
            )}
          </Section>

          {/* Equipment Management */}
          <Section title="Equipment" icon={Thermometer} badge={`${equipment.length} devices`} isDark={isDark}>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage model names and serial numbers for compliance records.
            </p>
            
            <div className="space-y-2">
              {equipment.map((eq) => (
                <div 
                  key={eq.id}
                  className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'}`}
                >
                  <button
                    onClick={() => setSelectedEquipment(selectedEquipment === eq.id ? null : eq.id)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${
                      isDark ? 'hover:bg-[#3c3c3e]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{eq.icon}</span>
                      <div className="text-left">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {eq.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {eq.model} • {eq.sensorId}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${
                      selectedEquipment === eq.id ? 'rotate-90' : ''
                    } ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>

                  {selectedEquipment === eq.id && (
                    <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Equipment Model
                          </label>
                          <input 
                            type="text" 
                            value={eq.model}
                            onChange={(e) => updateEquipment(eq.id, 'model', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                              isDark 
                                ? 'bg-[#1c1c1e] text-white border border-gray-700' 
                                : 'bg-white text-gray-900 border border-gray-200'
                            } outline-none focus:border-orange-500`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Serial Number
                          </label>
                          <input 
                            type="text" 
                            value={eq.serialNumber}
                            onChange={(e) => updateEquipment(eq.id, 'serialNumber', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                              isDark 
                                ? 'bg-[#1c1c1e] text-white border border-gray-700' 
                                : 'bg-white text-gray-900 border border-gray-200'
                            } outline-none focus:border-orange-500`}
                          />
                        </div>
                      </div>
                      <div className={`mt-3 flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Info className="h-3.5 w-3.5" />
                        Sensor ID: {eq.sensorId} (assigned by VisionDrive)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                saved 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
