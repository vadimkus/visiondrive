'use client'

import { useState } from 'react'
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  Battery,
  ChevronRight,
  Filter,
  X,
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Thermometer,
  Edit3,
  Save,
  Info,
  Hash,
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
    icon: '🔪',
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
    icon: '🛒',
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
  {
    id: 'sensor-a5',
    name: 'Hot Holding',
    location: 'Service Area',
    icon: '🔥',
    currentTemp: 68.5,
    requiredRange: { min: 60 },
    status: 'compliant',
    lastUpdate: '2 min ago',
    online: true,
    battery: 88,
    signal: 'strong',
    model: 'Alto-Shaam 500-HW',
    serialNumber: 'ASH-2024-33467',
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

export default function OwnerSensors() {
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

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'compliant': return isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'
      case 'warning': return isDark ? 'bg-amber-900/20' : 'bg-amber-50'
      case 'critical': return isDark ? 'bg-red-900/20' : 'bg-red-50'
      default: return isDark ? 'bg-gray-800' : 'bg-gray-50'
    }
  }

  const formatTemp = (temp: number) => `${temp.toFixed(1)}°C`

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

  // Sensor Detail View
  if (selectedSensor) {
    return (
      <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => setSelectedSensor(null)}
            className={`flex items-center gap-2 mb-4 text-sm font-medium transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sensors
          </button>

          {/* Sensor Header */}
          <div className={`rounded-xl border p-4 mb-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedSensor.icon}</span>
                <div>
                  <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSensor.name}</h1>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedSensor.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getStatusColor(selectedSensor.status)}`}>
                  {formatTemp(selectedSensor.currentTemp)}
                </p>
                <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Required: {formatRange(selectedSensor.requiredRange)}
                </p>
              </div>
            </div>
            
            {/* Equipment Info */}
            {(selectedSensor.model || selectedSensor.serialNumber) && (
              <div className={`mt-3 pt-3 border-t flex flex-wrap gap-x-6 gap-y-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                {selectedSensor.model && (
                  <div className="flex items-center gap-1.5">
                    <Info className={`h-3 w-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Equipment:</span>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedSensor.model}</span>
                  </div>
                )}
                {selectedSensor.serialNumber && (
                  <div className="flex items-center gap-1.5">
                    <Hash className={`h-3 w-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Serial:</span>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedSensor.serialNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Wifi className={`h-3 w-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sensor:</span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dragino PS-NB-NA</span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Mode Banner */}
          {manualEditEnabled && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 ${
              isDark ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <Edit3 className="h-4 w-4 text-emerald-500" />
              <div className="flex-1">
                <p className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  Edit Mode Active
                </p>
                <p className={`text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Click any temperature to adjust readings for compliance
                </p>
              </div>
            </div>
          )}

          {/* Period Tabs */}
          <div className={`flex gap-1 p-1 rounded-lg mb-4 ${isDark ? 'bg-[#2d2d2f]' : 'bg-gray-100'}`}>
            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  selectedPeriod === period
                    ? 'bg-orange-500 text-white'
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Thermometer className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average</p>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.avg.toFixed(1)}°C</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Min</p>
                </div>
                <p className="text-lg font-bold text-blue-500">{stats.min.toFixed(1)}°C</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Max</p>
                </div>
                <p className="text-lg font-bold text-red-500">{stats.max.toFixed(1)}°C</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Compliance</p>
                </div>
                <p className="text-lg font-bold text-emerald-500">
                  {Math.round((stats.compliant / readings.length) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end mb-3">
            <button className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>

          {/* Temperature Log Table */}
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Temperature Log
              </h2>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {readings.length} readings • {selectedPeriod === 'daily' ? 'Hourly' : selectedPeriod === 'weekly' ? 'Every 6 hours' : selectedPeriod === 'monthly' ? 'Daily' : 'Monthly'} intervals
                {manualEditEnabled && ' • Click temperature to edit'}
              </p>
            </div>
            
            {/* Table Header */}
            <div className={`grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider ${
              isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'
            }`}>
              <div className="col-span-3">Time</div>
              <div className="col-span-3 text-right">Temperature</div>
              <div className="col-span-3 text-center">Required</div>
              <div className="col-span-3 text-center">Status</div>
            </div>

            {/* Table Body - Scrollable */}
            <div className="max-h-[400px] overflow-y-auto">
              {readings.map((reading, idx) => (
                <div 
                  key={idx}
                  className={`grid grid-cols-12 gap-2 px-4 py-2 text-xs items-center border-b last:border-b-0 ${
                    isDark ? 'border-gray-700/50' : 'border-gray-50'
                  } ${getStatusBg(reading.status)}`}
                >
                  <div className={`col-span-3 flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Clock className="h-3 w-3 opacity-50" />
                    {reading.time}
                  </div>
                  <div className="col-span-3 text-right">
                    {editingIndex === idx ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={`w-16 px-1.5 py-0.5 text-xs text-right border rounded ${
                            isDark ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(idx)
                            if (e.key === 'Escape') { setEditingIndex(null); setEditValue('') }
                          }}
                        />
                        <button 
                          onClick={() => handleSaveEdit(idx)}
                          className="p-0.5 text-emerald-500 hover:bg-emerald-500/10 rounded"
                        >
                          <Save className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => { setEditingIndex(null); setEditValue('') }}
                          className="p-0.5 text-gray-400 hover:bg-gray-500/10 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span 
                        className={`font-semibold ${getStatusColor(reading.status)} ${
                          manualEditEnabled ? 'cursor-pointer hover:underline' : ''
                        }`}
                        onClick={() => manualEditEnabled && handleStartEdit(idx, reading.temp)}
                      >
                        {reading.temp.toFixed(1)}°C
                      </span>
                    )}
                  </div>
                  <div className={`col-span-3 text-center text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatRange(selectedSensor.requiredRange)}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    {reading.status === 'compliant' ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                        <CheckCircle className="h-2.5 w-2.5" />
                        OK
                      </span>
                    ) : reading.status === 'warning' ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        !
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-medium">
                        <X className="h-2.5 w-2.5" />
                        !!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DM Notice */}
          <div className={`mt-4 p-3 rounded-xl border ${
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'
          }`}>
            <p className={`text-[10px] ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              <strong>DM Compliance:</strong> Temperature logs retained per DM-HSD-GU46-KFPA2 guidelines. Keep records for 2 years.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Sensors List View
  return (
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Sensors</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Click sensor to view detailed stats</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDark ? 'bg-[#2d2d2f] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">All ({SENSORS.length})</option>
              <option value="compliant">Compliant ({SENSORS.filter(s => s.status === 'compliant').length})</option>
              <option value="warning">Warning ({SENSORS.filter(s => s.status === 'warning').length})</option>
            </select>
          </div>
        </div>

        {/* Edit Mode Notice */}
        {manualEditEnabled && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 ${
            isDark ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
          }`}>
            <Edit3 className="h-4 w-4 text-emerald-500" />
            <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              <strong>Edit Mode Active</strong> — Select a sensor to adjust readings for compliance
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
            <p className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{SENSORS.length}</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Online</p>
            <p className="text-xl font-bold text-emerald-500 mt-0.5">{SENSORS.filter(s => s.online).length}</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Warnings</p>
            <p className="text-xl font-bold text-amber-500 mt-0.5">{SENSORS.filter(s => s.status === 'warning').length}</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Battery</p>
            <p className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.round(SENSORS.reduce((a, s) => a + s.battery, 0) / SENSORS.length)}%</p>
          </div>
        </div>

        {/* Sensors List */}
        <div className="space-y-2">
          {filteredSensors.map(sensor => (
            <div 
              key={sensor.id}
              onClick={() => handleSelectSensor(sensor)}
              className={`rounded-xl border p-3 hover:shadow-md transition-all cursor-pointer ${
                isDark 
                  ? sensor.status === 'warning' ? 'bg-[#2d2d2f] border-amber-700 hover:border-amber-600' :
                    sensor.status === 'critical' ? 'bg-[#2d2d2f] border-red-700 hover:border-red-600' :
                    'bg-[#2d2d2f] border-gray-700 hover:border-gray-600'
                  : sensor.status === 'warning' ? 'bg-white border-amber-200 hover:border-amber-300' :
                    sensor.status === 'critical' ? 'bg-white border-red-200 hover:border-red-300' :
                    'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sensor.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{sensor.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        sensor.online 
                          ? isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                          : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sensor.online ? <Wifi className="h-2.5 w-2.5 inline mr-0.5" /> : <WifiOff className="h-2.5 w-2.5 inline mr-0.5" />}
                        {sensor.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{sensor.location} • {sensor.lastUpdate}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getStatusColor(sensor.status)}`}>
                      {formatTemp(sensor.currentTemp)}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{formatRange(sensor.requiredRange)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Battery className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{sensor.battery}%</span>
                    </div>
                    
                    {sensor.status === 'compliant' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    
                    <ChevronRight className={`h-4 w-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hint */}
        <p className={`mt-4 text-center text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          Tap any sensor to view temperature history{manualEditEnabled && ' and adjust readings'}
        </p>
      </div>
    </div>
  )
}
