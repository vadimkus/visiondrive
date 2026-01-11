'use client'

import { useState, useEffect } from 'react'
import { Search, Thermometer, Battery, Signal, Clock, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'

interface Sensor {
  id: string
  kitchenId: string
  kitchenName: string
  location: string
  probeModel: string
  status: 'online' | 'offline' | 'warning'
  currentTemp: number
  batteryLevel: number
  signalStrength: number
  lastSeen: string
}

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'warning'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSensors()
    const interval = setInterval(loadSensors, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSensors = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setSensors([
      { id: 'sensor-001', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Walk-in Fridge', probeModel: 'PT100', status: 'online', currentTemp: 4.2, batteryLevel: 85, signalStrength: 92, lastSeen: '2 min ago' },
      { id: 'sensor-002', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Freezer', probeModel: 'PT100', status: 'online', currentTemp: -18.5, batteryLevel: 72, signalStrength: 88, lastSeen: '1 min ago' },
      { id: 'sensor-003', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Prep Area Fridge', probeModel: 'PT100', status: 'online', currentTemp: 5.1, batteryLevel: 91, signalStrength: 95, lastSeen: '3 min ago' },
      { id: 'sensor-004', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Main Cooler', probeModel: 'PT100', status: 'warning', currentTemp: 6.8, batteryLevel: 45, signalStrength: 78, lastSeen: '5 min ago' },
      { id: 'sensor-005', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Display Fridge', probeModel: 'PT100', status: 'online', currentTemp: 9.2, batteryLevel: 68, signalStrength: 82, lastSeen: '1 min ago' },
      { id: 'sensor-006', kitchenId: 'kitchen-003', kitchenName: 'Restaurant Kitchen', location: 'Cold Storage', probeModel: 'PT100', status: 'online', currentTemp: 3.5, batteryLevel: 95, signalStrength: 97, lastSeen: '30 sec ago' },
    ])
    setIsLoading(false)
  }

  const filteredSensors = sensors.filter(s => {
    const matchesSearch = s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.kitchenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    warning: 'bg-amber-500',
  }

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    warning: 'Warning',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Sensors</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor all temperature sensors across kitchens</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sensors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {(['all', 'online', 'warning', 'offline'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                filterStatus === status
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-emerald-700">
            {sensors.filter(s => s.status === 'online').length}
          </p>
          <p className="text-xs text-emerald-600">Online</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-amber-700">
            {sensors.filter(s => s.status === 'warning').length}
          </p>
          <p className="text-xs text-amber-600">Warning</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-gray-700">
            {sensors.filter(s => s.status === 'offline').length}
          </p>
          <p className="text-xs text-gray-600">Offline</p>
        </div>
      </div>

      {/* Sensors Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Loading sensors...</p>
        </div>
      ) : filteredSensors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Thermometer className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sensors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSensors.map(sensor => (
            <Link key={sensor.id} href={`/portal/smart-kitchen/sensors/${sensor.id}`}>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[sensor.status]}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {sensor.location}
                      </h3>
                      <p className="text-xs text-gray-500">{sensor.kitchenName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    sensor.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
                    sensor.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {statusLabels[sensor.status]}
                  </span>
                </div>

                {/* Temperature */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-3xl font-semibold ${
                    sensor.currentTemp > 8 ? 'text-red-600' :
                    sensor.currentTemp < 0 ? 'text-blue-600' :
                    'text-gray-900'
                  }`}>
                    {sensor.currentTemp.toFixed(1)}
                  </span>
                  <span className="text-lg text-gray-500">°C</span>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Battery className={`h-3.5 w-3.5 ${sensor.batteryLevel < 20 ? 'text-red-500' : ''}`} />
                    <span>{sensor.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Signal className="h-3.5 w-3.5" />
                    <span>{sensor.signalStrength}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{sensor.lastSeen}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-300 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
