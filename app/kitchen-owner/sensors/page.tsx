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
  const [filter, setFilter] = useState('all')

  const filteredSensors = filter === 'all' 
    ? SENSORS 
    : SENSORS.filter(s => s.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-emerald-600'
      case 'warning': return 'text-amber-500'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
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
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sensors</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all temperature sensors in your kitchen</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Sensors ({SENSORS.length})</option>
            <option value="compliant">Compliant ({SENSORS.filter(s => s.status === 'compliant').length})</option>
            <option value="warning">Warning ({SENSORS.filter(s => s.status === 'warning').length})</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Sensors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{SENSORS.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Online</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{SENSORS.filter(s => s.online).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Warnings</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{SENSORS.filter(s => s.status === 'warning').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Avg Battery</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(SENSORS.reduce((a, s) => a + s.battery, 0) / SENSORS.length)}%</p>
        </div>
      </div>

      {/* Sensors List */}
      <div className="space-y-3">
        {filteredSensors.map(sensor => (
          <div 
            key={sensor.id}
            className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
              sensor.status === 'warning' ? 'border-amber-200' :
              sensor.status === 'critical' ? 'border-red-200' :
              'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{sensor.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      sensor.online ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sensor.online ? <Wifi className="h-3 w-3 inline mr-1" /> : <WifiOff className="h-3 w-3 inline mr-1" />}
                      {sensor.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{sensor.location} • Updated {sensor.lastUpdate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getStatusColor(sensor.status)}`}>
                    {formatTemp(sensor.currentTemp)}
                  </p>
                  <p className="text-xs text-gray-500">Required: {formatRange(sensor.requiredRange)}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Battery className="h-4 w-4" />
                      <span className="text-sm font-medium">{sensor.battery}%</span>
                    </div>
                  </div>
                  
                  {sensor.status === 'compliant' ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  )}
                  
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
