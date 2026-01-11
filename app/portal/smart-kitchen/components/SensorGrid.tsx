'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Thermometer, 
  Battery, 
  Signal, 
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Snowflake,
  Flame
} from 'lucide-react'

interface Sensor {
  id: string
  kitchenId: string
  kitchenName: string
  location: string
  temperature: number
  batteryVoltage: number
  signalStrength: number
  lastSeen: string
  status: 'online' | 'offline' | 'warning'
}

export default function SensorGrid() {
  const router = useRouter()
  
  // Mock data - replace with API call
  const [sensors] = useState<Sensor[]>([
    { id: 'sensor-001', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Walk-in Fridge', temperature: 4.2, batteryVoltage: 3.52, signalStrength: -75, lastSeen: new Date(Date.now() - 5 * 60000).toISOString(), status: 'online' },
    { id: 'sensor-002', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Freezer', temperature: -18.5, batteryVoltage: 3.48, signalStrength: -82, lastSeen: new Date(Date.now() - 3 * 60000).toISOString(), status: 'online' },
    { id: 'sensor-003', kitchenId: 'kitchen-001', kitchenName: 'Main Kitchen', location: 'Display Fridge', temperature: 5.1, batteryVoltage: 3.45, signalStrength: -78, lastSeen: new Date(Date.now() - 8 * 60000).toISOString(), status: 'online' },
    { id: 'sensor-004', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Main Fridge', temperature: 6.8, batteryVoltage: 3.21, signalStrength: -88, lastSeen: new Date(Date.now() - 12 * 60000).toISOString(), status: 'warning' },
    { id: 'sensor-005', kitchenId: 'kitchen-002', kitchenName: 'Cloud Kitchen A', location: 'Cold Storage', temperature: 9.2, batteryVoltage: 3.55, signalStrength: -72, lastSeen: new Date(Date.now() - 2 * 60000).toISOString(), status: 'warning' },
    { id: 'sensor-006', kitchenId: 'kitchen-003', kitchenName: 'Restaurant Kitchen', location: 'Prep Fridge', temperature: 3.5, batteryVoltage: 3.50, signalStrength: -80, lastSeen: new Date(Date.now() - 7 * 60000).toISOString(), status: 'online' },
  ])

  const getTempStatus = (temp: number) => {
    if (temp < -30) return { icon: Snowflake, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Freezer' }
    if (temp < 0) return { icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Cold' }
    if (temp <= 4) return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Optimal' }
    if (temp <= 8) return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Warm' }
    return { icon: Flame, color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' }
  }

  const getBatteryStatus = (voltage: number) => {
    const percent = Math.round(((voltage - 2.5) / (3.6 - 2.5)) * 100)
    if (percent > 60) return { percent, color: 'text-emerald-600', bg: 'bg-emerald-500' }
    if (percent > 30) return { percent, color: 'text-amber-600', bg: 'bg-amber-500' }
    return { percent, color: 'text-red-600', bg: 'bg-red-500' }
  }

  const getSignalStatus = (rssi: number) => {
    if (rssi > -70) return { bars: 4, color: 'text-emerald-600' }
    if (rssi > -80) return { bars: 3, color: 'text-emerald-600' }
    if (rssi > -90) return { bars: 2, color: 'text-amber-600' }
    return { bars: 1, color: 'text-red-600' }
  }

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sensors.map(sensor => {
        const tempStatus = getTempStatus(sensor.temperature)
        const batteryStatus = getBatteryStatus(sensor.batteryVoltage)
        const signalStatus = getSignalStatus(sensor.signalStrength)
        const TempIcon = tempStatus.icon

        return (
          <div 
            key={sensor.id}
            onClick={() => router.push(`/portal/smart-kitchen/sensors/${sensor.id}`)}
            className={`
              bg-white rounded-xl border p-4 cursor-pointer
              hover:shadow-md transition-all group
              ${sensor.status === 'warning' ? 'border-amber-200' : 
                sensor.status === 'offline' ? 'border-red-200' : 'border-gray-200'}
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {sensor.id}
                </h4>
                <p className="text-xs text-gray-500">{sensor.kitchenName} • {sensor.location}</p>
              </div>
              <div className={`p-2 rounded-lg ${tempStatus.bg}`}>
                <TempIcon className={`h-5 w-5 ${tempStatus.color}`} />
              </div>
            </div>

            {/* Temperature Display */}
            <div className="text-center py-4 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center justify-center gap-1">
                <Thermometer className={`h-6 w-6 ${tempStatus.color}`} />
                <span className={`text-3xl font-bold ${tempStatus.color}`}>
                  {sensor.temperature.toFixed(1)}
                </span>
                <span className={`text-lg ${tempStatus.color}`}>°C</span>
              </div>
              <span className={`text-xs font-medium ${tempStatus.color}`}>
                {tempStatus.label}
              </span>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {/* Battery */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Battery className={`h-4 w-4 ${batteryStatus.color}`} />
                  <span className={batteryStatus.color}>{batteryStatus.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${batteryStatus.bg} rounded-full`}
                    style={{ width: `${batteryStatus.percent}%` }}
                  />
                </div>
              </div>

              {/* Signal */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Signal className={`h-4 w-4 ${signalStatus.color}`} />
                  <span className={signalStatus.color}>{sensor.signalStrength}dBm</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map(bar => (
                    <div 
                      key={bar}
                      className={`w-1.5 rounded-sm ${
                        bar <= signalStatus.bars ? signalStatus.color.replace('text-', 'bg-') : 'bg-gray-200'
                      }`}
                      style={{ height: `${bar * 3 + 2}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Last Seen */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{formatLastSeen(sensor.lastSeen)}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  sensor.status === 'online' ? 'bg-emerald-500' : 
                  sensor.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              </div>
            </div>

            {/* View Link */}
            <div className="flex items-center justify-end mt-3 text-xs text-blue-600 font-medium group-hover:text-blue-700">
              Details
              <ChevronRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
