'use client'

import { useState } from 'react'
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Thermometer,
  Edit3,
  Save,
  X,
  Battery,
  Activity,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

interface Sensor {
  id: string
  name: string
  location: string
  icon: string
  currentTemp: number
  requiredRange: { min?: number; max?: number }
  status: string
  lastUpdate: string
  online: boolean
  battery: number
  signal: string
  model?: string
  serialNumber?: string
}

interface ReadingEntry {
  time: string
  temp: number
  status: 'compliant' | 'warning' | 'critical'
}

const SENSORS: Sensor[] = [
  {
    id: 'sensor-a1',
    name: 'Walk-in Fridge',
    location: 'Main Kitchen',
    icon: '🚪',
    currentTemp: 3.2,
    requiredRange: { min: 0, max: 5 },
    status: 'compliant',
    lastUpdate: '2 min ago',
    online: true,
    battery: 85,
    signal: 'strong',
    model: 'True TWT-48SD',
    serialNumber: 'TWI-2023-45892',
  },
  {
    id: 'sensor-a2',
    name: 'Main Freezer',
    location: 'Main Kitchen',
    icon: '❄️',
    currentTemp: -19.5,
    requiredRange: { max: -18 },
    status: 'compliant',
    lastUpdate: '1 min ago',
    online: true,
    battery: 92,
    signal: 'strong',
    model: 'Liebherr GGv 5060',
    serialNumber: 'LBH-2022-78341',
  },
  {
    id: 'sensor-a3',
    name: 'Prep Fridge',
    location: 'Prep Area',
    icon: '🌡️',
    currentTemp: 4.8,
    requiredRange: { min: 0, max: 5 },
    status: 'compliant',
    lastUpdate: '3 min ago',
    online: true,
    battery: 78,
    signal: 'medium',
    model: 'Hoshizaki CR1S-FS',
    serialNumber: 'HSK-2024-12076',
  },
  {
    id: 'sensor-a4',
    name: 'Display Cooler',
    location: 'Front Counter',
    icon: '🧊',
    currentTemp: 6.2,
    requiredRange: { min: 0, max: 5 },
    status: 'warning',
    lastUpdate: '1 min ago',
    online: true,
    battery: 65,
    signal: 'strong',
    model: 'Turbo Air TOM-40',
    serialNumber: 'TAR-2023-90215',
  },
]

// Generate mock readings for a sensor
const generateReadings = (sensor: Sensor, period: string): ReadingEntry[] => {
  const readings: ReadingEntry[] = []
  const baseTemp = sensor.currentTemp
  const range = sensor.requiredRange
  
  let entries = 24
  
  switch (period) {
    case 'daily':
      entries = 24
      break
    case 'weekly':
      entries = 7 * 4
      break
    case 'monthly':
      entries = 30
      break
    case 'yearly':
      entries = 12
      break
  }
  
  const now = new Date()
  
  for (let i = entries - 1; i >= 0; i--) {
    const variation = (Math.random() - 0.5) * 4
    const temp = baseTemp + variation
    
    let status: 'compliant' | 'warning' | 'critical' = 'compliant'
    if (range.min !== undefined && range.max !== undefined) {
      if (temp < range.min - 2 || temp > range.max + 2) status = 'critical'
      else if (temp < range.min || temp > range.max) status = 'warning'
    } else if (range.min !== undefined) {
      if (temp < range.min - 5) status = 'critical'
      else if (temp < range.min) status = 'warning'
    } else if (range.max !== undefined) {
      if (temp > range.max + 5) status = 'critical'
      else if (temp > range.max) status = 'warning'
    }
    
    let timeStr = ''
    const date = new Date(now)
    
    switch (period) {
      case 'daily':
        date.setHours(now.getHours() - i)
        timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        break
      case 'weekly':
        date.setHours(now.getHours() - (i * 6))
        timeStr = date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' })
        break
      case 'monthly':
        date.setDate(now.getDate() - i)
        timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        break
      case 'yearly':
        date.setMonth(now.getMonth() - i)
        timeStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        break
    }
    
    readings.push({ time: timeStr, temp: parseFloat(temp.toFixed(1)), status })
  }
  
  return readings
}

export default function EquipmentPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { manualEditEnabled } = useSettings()
  const [filter, setFilter] = useState('all')
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('daily')
  const [readings, setReadings] = useState<ReadingEntry[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const filteredSensors = filter === 'all' 
    ? SENSORS 
    : SENSORS.filter(s => s.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-emerald-500'
      case 'warning': return 'text-amber-500'
      case 'critical': return 'text-red-500'
      default: return isDark ? 'text-gray-400' : 'text-gray-600'
    }
  }

  const formatTemp = (temp: number) => `${temp.toFixed(1)}°`

  const formatRange = (range: { min?: number; max?: number }) => {
    if (range.min !== undefined && range.max !== undefined) {
      return `${range.min}° to ${range.max}°C`
    } else if (range.min !== undefined) {
      return `≥ ${range.min}°C`
    } else if (range.max !== undefined) {
      return `≤ ${range.max}°C`
    }
    return ''
  }

  // Calculate temperature position for visual indicator (0-100%)
  const getTempPosition = (sensor: Sensor) => {
    const { min, max } = sensor.requiredRange
    const temp = sensor.currentTemp
    
    if (min !== undefined && max !== undefined) {
      // For fridges: map temp to position within safe zone
      const safeMin = min - 3
      const safeMax = max + 3
      const position = ((temp - safeMin) / (safeMax - safeMin)) * 100
      return Math.max(0, Math.min(100, position))
    } else if (max !== undefined) {
      // For freezers: map from very cold to threshold
      const safeMin = max - 10
      const safeMax = max + 5
      const position = ((temp - safeMin) / (safeMax - safeMin)) * 100
      return Math.max(0, Math.min(100, position))
    }
    return 50
  }

  const handleSelectSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor)
    setReadings(generateReadings(sensor, selectedPeriod))
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (selectedSensor) {
      setReadings(generateReadings(selectedSensor, period))
    }
  }

  const handleStartEdit = (index: number, currentTemp: number) => {
    setEditingIndex(index)
    setEditValue(currentTemp.toString())
  }

  const handleSaveEdit = (index: number) => {
    const newTemp = parseFloat(editValue)
    if (!isNaN(newTemp) && selectedSensor) {
      const range = selectedSensor.requiredRange
      let status: 'compliant' | 'warning' | 'critical' = 'compliant'
      
      if (range.min !== undefined && range.max !== undefined) {
        if (newTemp < range.min - 2 || newTemp > range.max + 2) status = 'critical'
        else if (newTemp < range.min || newTemp > range.max) status = 'warning'
      } else if (range.min !== undefined) {
        if (newTemp < range.min - 5) status = 'critical'
        else if (newTemp < range.min) status = 'warning'
      } else if (range.max !== undefined) {
        if (newTemp > range.max + 5) status = 'critical'
        else if (newTemp > range.max) status = 'warning'
      }

      const updatedReadings = [...readings]
      updatedReadings[index] = {
        ...updatedReadings[index],
        temp: newTemp,
        status,
      }
      setReadings(updatedReadings)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const stats = readings.length > 0 ? {
    avg: readings.reduce((a, r) => a + r.temp, 0) / readings.length,
    min: Math.min(...readings.map(r => r.temp)),
    max: Math.max(...readings.map(r => r.temp)),
    compliant: readings.filter(r => r.status === 'compliant').length,
    warnings: readings.filter(r => r.status === 'warning').length,
    critical: readings.filter(r => r.status === 'critical').length,
  } : null

  const onlineCount = SENSORS.filter(s => s.online).length
  const warningCount = SENSORS.filter(s => s.status === 'warning').length
  const compliantCount = SENSORS.filter(s => s.status === 'compliant').length

  // Equipment Detail View
  if (selectedSensor) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f5f5f7]'}`}>
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Back Navigation */}
          <button 
            onClick={() => setSelectedSensor(null)}
            className={`group flex items-center gap-2 mb-8 text-base font-medium transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Equipment
          </button>

          {/* Equipment Header Card */}
          <div className={`rounded-3xl p-8 mb-8 ${
            isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${
                  isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'
                }`}>
                  {selectedSensor.icon}
                </div>
                <div>
                  <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedSensor.name}
                  </h1>
                  <p className={`text-lg mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedSensor.location}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${
                      selectedSensor.online 
                        ? 'text-emerald-500' 
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {selectedSensor.online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                      {selectedSensor.online ? 'Online' : 'Offline'}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Updated {selectedSensor.lastUpdate}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Current Temperature */}
              <div className="text-right">
                <div className={`text-6xl font-light tracking-tight ${getStatusColor(selectedSensor.status)}`}>
                  {formatTemp(selectedSensor.currentTemp)}
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Required: {formatRange(selectedSensor.requiredRange)}
                </p>
              </div>
            </div>

            {/* Equipment Details */}
            <div className={`mt-8 pt-6 border-t grid grid-cols-4 gap-6 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Equipment Model
                </p>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedSensor.model || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Serial Number
                </p>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedSensor.serialNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Sensor Model
                </p>
                <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dragino PS-NB-NA
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Battery Level
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div 
                      className={`h-full rounded-full transition-all ${
                        selectedSensor.battery > 50 ? 'bg-emerald-500' :
                        selectedSensor.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedSensor.battery}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedSensor.battery}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {manualEditEnabled && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-4 ${
              isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50'
            }`}>
              <Edit3 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  Edit Mode Active
                </p>
                <p className={`text-sm ${isDark ? 'text-emerald-400/70' : 'text-emerald-700'}`}>
                  Click any temperature reading to adjust for compliance
                </p>
              </div>
            </div>
          )}

          {/* Period Selector */}
          <div className={`inline-flex p-1 rounded-xl mb-8 ${isDark ? 'bg-[#1c1c1e]' : 'bg-gray-100'}`}>
            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${
                  selectedPeriod === period
                    ? isDark 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average</span>
                </div>
                <p className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.avg.toFixed(1)}°C
                </p>
              </div>
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Minimum</span>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-blue-500">
                  {stats.min.toFixed(1)}°C
                </p>
              </div>
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Maximum</span>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-orange-500">
                  {stats.max.toFixed(1)}°C
                </p>
              </div>
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Compliance</span>
                </div>
                <p className="text-3xl font-semibold tracking-tight text-emerald-500">
                  {Math.round((stats.compliant / readings.length) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Temperature Log */}
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className={`px-6 py-5 flex items-center justify-between border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Temperature Log
                </h2>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {readings.length} readings
                </p>
              </div>
              <button className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}>
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
            
            {/* Table Header */}
            <div className={`grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider ${
              isDark ? 'bg-[#2c2c2e] text-gray-500' : 'bg-gray-50 text-gray-400'
            }`}>
              <div className="col-span-3">Time</div>
              <div className="col-span-3 text-right">Temperature</div>
              <div className="col-span-3 text-center">Required Range</div>
              <div className="col-span-3 text-center">Status</div>
            </div>

            {/* Table Body */}
            <div className="max-h-[480px] overflow-y-auto">
              {readings.map((reading, idx) => (
                <div 
                  key={idx}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b last:border-b-0 transition-colors ${
                    isDark ? 'border-gray-800/50 hover:bg-[#2c2c2e]/50' : 'border-gray-50 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`col-span-3 flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Clock className="h-4 w-4 opacity-40" />
                    {reading.time}
                  </div>
                  <div className="col-span-3 text-right">
                    {editingIndex === idx ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={`w-20 px-3 py-1.5 text-sm text-right rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDark ? 'bg-[#2c2c2e] border-gray-700 text-white' : 'bg-white border-gray-200'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(idx)
                            if (e.key === 'Escape') { setEditingIndex(null); setEditValue('') }
                          }}
                        />
                        <button 
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setEditingIndex(null); setEditValue('') }}
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span 
                        className={`text-sm font-semibold ${getStatusColor(reading.status)} ${
                          manualEditEnabled ? 'cursor-pointer hover:underline' : ''
                        }`}
                        onClick={() => manualEditEnabled && handleStartEdit(idx, reading.temp)}
                      >
                        {reading.temp.toFixed(1)}°C
                      </span>
                    )}
                  </div>
                  <div className={`col-span-3 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatRange(selectedSensor.requiredRange)}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    {reading.status === 'compliant' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Compliant
                      </span>
                    ) : reading.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
                        <X className="h-3.5 w-3.5" />
                        Critical
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DM Notice */}
          <div className={`mt-6 p-4 rounded-2xl ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-50'
          }`}>
            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              <span className="font-medium">Dubai Municipality Compliance:</span> Temperature logs are retained per DM-HSD-GU46-KFPA2 guidelines. Records are kept for 2 years.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Equipment List View - Apple-like Design
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-10">
          <h1 className={`text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Equipment
          </h1>
          <p className={`text-xl mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Monitor your kitchen equipment temperature in real-time.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
              <Activity className={`h-5 w-5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            </div>
            <p className={`text-4xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {SENSORS.length}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>equipment</p>
          </div>
          
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Online</span>
              <Wifi className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-emerald-500">
              {onlineCount}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>connected</p>
          </div>
          
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Compliant</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-emerald-500">
              {compliantCount}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>in safe range</p>
          </div>
          
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Attention</span>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-amber-500">
              {warningCount}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>need attention</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className={`inline-flex p-1 rounded-xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-gray-100'}`}>
            {[
              { value: 'all', label: 'All' },
              { value: 'compliant', label: 'Compliant' },
              { value: 'warning', label: 'Attention' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  filter === option.value
                    ? isDark 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {manualEditEnabled && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
            }`}>
              <Edit3 className="h-4 w-4 text-emerald-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Edit Mode Active
              </span>
            </div>
          )}
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredSensors.map(sensor => (
            <div 
              key={sensor.id}
              onClick={() => handleSelectSensor(sensor)}
              className={`group rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                isDark 
                  ? 'bg-[#1c1c1e] hover:bg-[#2c2c2e]' 
                  : 'bg-white shadow-sm hover:shadow-md'
              } ${
                sensor.status === 'warning' 
                  ? isDark ? 'ring-1 ring-amber-500/30' : 'ring-1 ring-amber-200'
                  : sensor.status === 'critical'
                    ? isDark ? 'ring-1 ring-red-500/30' : 'ring-1 ring-red-200'
                    : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'
                  }`}>
                    {sensor.icon}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {sensor.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {sensor.location}
                    </p>
                    
                    {/* Status indicators */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        sensor.online ? 'text-emerald-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {sensor.online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                        {sensor.online ? 'Online' : 'Offline'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Battery className="h-3.5 w-3.5" />
                        {sensor.battery}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Temperature */}
                <div className="text-right">
                  <div className={`text-3xl font-semibold tracking-tight ${getStatusColor(sensor.status)}`}>
                    {formatTemp(sensor.currentTemp)}
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatRange(sensor.requiredRange)}
                  </p>
                </div>
              </div>
              
              {/* Temperature Visual Indicator */}
              <div className="mt-5">
                <div className={`relative h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#2c2c2e]' : 'bg-gray-100'}`}>
                  {/* Safe zone indicator */}
                  <div 
                    className="absolute h-full bg-emerald-500/20"
                    style={{
                      left: sensor.requiredRange.min !== undefined ? '25%' : '0%',
                      right: '25%',
                    }}
                  />
                  {/* Current temp marker */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm transition-all ${
                      sensor.status === 'compliant' ? 'bg-emerald-500' :
                      sensor.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ left: `calc(${getTempPosition(sensor)}% - 6px)` }}
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className={`flex items-center justify-between mt-5 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Updated {sensor.lastUpdate}
                </span>
                <div className="flex items-center gap-2">
                  {sensor.status === 'compliant' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Compliant
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Attention
                    </span>
                  )}
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSensors.length === 0 && (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
            <Thermometer className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No equipment found
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Try adjusting your filter settings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
