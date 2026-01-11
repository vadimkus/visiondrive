'use client'

import { useState, useEffect } from 'react'
import { Search, Thermometer, Battery, Signal, Clock, ChevronRight, Filter, ShieldCheck, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { 
  checkCompliance, 
  getComplianceColor, 
  EQUIPMENT_CONFIGS, 
  formatThresholdRange,
  type EquipmentType,
  type ComplianceStatus 
} from '../lib/compliance'

interface Sensor {
  id: string
  kitchenId: string
  kitchenName: string
  location: string
  equipmentType: EquipmentType
  probeModel: string
  status: 'online' | 'offline' | 'warning'
  currentTemp: number
  batteryLevel: number
  signalStrength: number
  lastSeen: string
  complianceStatus: ComplianceStatus
  complianceMessage: string
}

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'warning' | 'critical' | 'danger_zone'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSensors()
    const interval = setInterval(loadSensors, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSensors = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const rawSensors = [
      { id: 'sensor-001', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Walk-in Fridge', equipmentType: 'walk_in_cooler' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: 4.2, batteryLevel: 85, signalStrength: 92, lastSeen: '2 min ago' },
      { id: 'sensor-002', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Main Freezer', equipmentType: 'freezer' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: -18.5, batteryLevel: 72, signalStrength: 88, lastSeen: '1 min ago' },
      { id: 'sensor-003', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Prep Area Fridge', equipmentType: 'prep_fridge' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: 5.1, batteryLevel: 91, signalStrength: 95, lastSeen: '3 min ago' },
      { id: 'sensor-004', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Main Cooler', equipmentType: 'refrigerator' as EquipmentType, probeModel: 'PT100', status: 'warning' as const, currentTemp: 6.8, batteryLevel: 45, signalStrength: 78, lastSeen: '5 min ago' },
      { id: 'sensor-005', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Display Fridge', equipmentType: 'display_fridge' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: 9.2, batteryLevel: 68, signalStrength: 82, lastSeen: '1 min ago' },
      { id: 'sensor-006', kitchenId: 'kitchen-003', kitchenName: 'Restaurant Kitchen', location: 'Cold Storage', equipmentType: 'walk_in_cooler' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: 3.5, batteryLevel: 95, signalStrength: 97, lastSeen: '30 sec ago' },
      { id: 'sensor-007', kitchenId: 'kitchen-003', kitchenName: 'Restaurant Kitchen', location: 'Hot Bain-Marie', equipmentType: 'hot_holding' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: 65.2, batteryLevel: 88, signalStrength: 94, lastSeen: '1 min ago' },
      { id: 'sensor-008', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Blast Chiller', equipmentType: 'blast_chiller' as EquipmentType, probeModel: 'PT100', status: 'online' as const, currentTemp: 1.5, batteryLevel: 79, signalStrength: 91, lastSeen: '2 min ago' },
    ]
    
    // Calculate compliance for each sensor
    const sensorsWithCompliance: Sensor[] = rawSensors.map(sensor => {
      const compliance = checkCompliance(sensor.equipmentType, sensor.currentTemp)
      return {
        ...sensor,
        complianceStatus: compliance.status,
        complianceMessage: compliance.message,
      }
    })
    
    setSensors(sensorsWithCompliance)
    setIsLoading(false)
  }

  const filteredSensors = sensors.filter(s => {
    const matchesSearch = s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.kitchenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          EQUIPMENT_CONFIGS[s.equipmentType].name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || s.complianceStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const complianceCount = {
    compliant: sensors.filter(s => s.complianceStatus === 'compliant').length,
    warning: sensors.filter(s => s.complianceStatus === 'warning').length,
    critical: sensors.filter(s => s.complianceStatus === 'critical').length,
    danger_zone: sensors.filter(s => s.complianceStatus === 'danger_zone').length,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Sensors</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor temperature compliance across all equipment</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sensors, equipment types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {(['all', 'compliant', 'warning', 'critical', 'danger_zone'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                filterStatus === status
                  ? status === 'danger_zone' ? 'bg-red-600 text-white' : 'bg-[#1d1d1f] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {status === 'danger_zone' ? '⚠️ Danger' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="text-2xl font-semibold text-emerald-700">{complianceCount.compliant}</p>
          </div>
          <p className="text-xs text-emerald-600">Compliant</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
          <p className="text-2xl font-semibold text-amber-700">{complianceCount.warning}</p>
          <p className="text-xs text-amber-600">Warning</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
          <p className="text-2xl font-semibold text-red-700">{complianceCount.critical}</p>
          <p className="text-xs text-red-600">Critical</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${complianceCount.danger_zone > 0 ? 'bg-red-100 border-red-200 animate-pulse' : 'bg-gray-100 border-gray-200'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldAlert className={`h-4 w-4 ${complianceCount.danger_zone > 0 ? 'text-red-700' : 'text-gray-500'}`} />
            <p className={`text-2xl font-semibold ${complianceCount.danger_zone > 0 ? 'text-red-800' : 'text-gray-700'}`}>{complianceCount.danger_zone}</p>
          </div>
          <p className={`text-xs ${complianceCount.danger_zone > 0 ? 'text-red-700' : 'text-gray-600'}`}>Danger Zone</p>
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
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Dubai Municipality Temperature Requirements</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧊</span>
            <div>
              <p className="font-medium text-gray-700">Refrigeration</p>
              <p className="text-gray-500">0°C to 5°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">❄️</span>
            <div>
              <p className="font-medium text-gray-700">Freezer</p>
              <p className="text-gray-500">≤ -18°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="font-medium text-gray-700">Hot Holding</p>
              <p className="text-gray-500">≥ 60°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium text-red-700">Danger Zone</p>
              <p className="text-red-500">5°C - 60°C</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SensorCard({ sensor }: { sensor: Sensor }) {
  const config = EQUIPMENT_CONFIGS[sensor.equipmentType]
  const complianceColors = getComplianceColor(sensor.complianceStatus)
  
  const tempColor = () => {
    switch (sensor.complianceStatus) {
      case 'compliant': return 'text-emerald-600'
      case 'warning': return 'text-amber-600'
      case 'critical': return 'text-red-600'
      case 'danger_zone': return 'text-red-700'
    }
  }

  return (
    <Link href={`/portal/smart-kitchen/sensors/${sensor.id}`}>
      <div className={`bg-white rounded-2xl p-5 border hover:shadow-md transition-all cursor-pointer group ${complianceColors.border} ${sensor.complianceStatus === 'danger_zone' ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {sensor.location}
              </h3>
              <p className="text-xs text-gray-500">{sensor.kitchenName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${complianceColors.bg} ${complianceColors.text}`}>
              {sensor.complianceStatus === 'danger_zone' ? '⚠️ DANGER' : 
               sensor.complianceStatus === 'compliant' ? '✓ Compliant' :
               sensor.complianceStatus.charAt(0).toUpperCase() + sensor.complianceStatus.slice(1)}
            </span>
            <span className="text-xs text-gray-400">{config.name}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`text-3xl font-semibold ${tempColor()}`}>
            {sensor.currentTemp.toFixed(1)}
          </span>
          <span className="text-lg text-gray-500">°C</span>
        </div>

        {/* Threshold Info */}
        <div className="mb-4 text-xs text-gray-500">
          Required: {formatThresholdRange(sensor.equipmentType)}
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
  )
}
