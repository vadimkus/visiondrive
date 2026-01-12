'use client'

import { useState } from 'react'
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  Battery,
  ChevronRight,
  Filter
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const SENSORS = [
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
  },
]

export default function OwnerSensors() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [filter, setFilter] = useState('all')

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

  return (
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Sensors</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monitor all temperature sensors</p>
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
              className={`rounded-xl border p-3 hover:shadow-md transition-all cursor-pointer ${
                isDark 
                  ? sensor.status === 'warning' ? 'bg-[#2d2d2f] border-amber-700' :
                    sensor.status === 'critical' ? 'bg-[#2d2d2f] border-red-700' :
                    'bg-[#2d2d2f] border-gray-700'
                  : sensor.status === 'warning' ? 'bg-white border-amber-200' :
                    sensor.status === 'critical' ? 'bg-white border-red-200' :
                    'bg-white border-gray-100'
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
      </div>
    </div>
  )
}
