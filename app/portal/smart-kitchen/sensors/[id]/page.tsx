'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Thermometer, 
  Battery, 
  Signal,
  Clock,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Wifi,
  Calendar,
  Activity
} from 'lucide-react'
import TemperatureChart from '../../components/TemperatureChart'

interface SensorDetails {
  id: string
  kitchenId: string
  kitchenName: string
  location: string
  probeModel: string
  installDate: string
  status: 'online' | 'offline' | 'warning'
  temperature: number
  batteryVoltage: number
  batteryPercent: number
  signalStrength: number
  lastSeen: string
  transmissionInterval: number
  alertThresholds: {
    min: number
    max: number
  }
  totalReadings: number
  uptime: number
}

export default function SensorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sensorId = params.id as string
  
  const [sensor, setSensor] = useState<SensorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview')

  useEffect(() => {
    loadSensorData()
  }, [sensorId])

  const loadSensorData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/portal/smart-kitchen/sensors/${sensorId}`)
      
      // Mock data
      setSensor({
        id: sensorId,
        kitchenId: 'kitchen-001',
        kitchenName: 'Main Kitchen',
        location: 'Walk-in Fridge',
        probeModel: 'PT100 4-20mA',
        installDate: '2026-01-01',
        status: 'online',
        temperature: 4.2,
        batteryVoltage: 3.52,
        batteryPercent: 85,
        signalStrength: -75,
        lastSeen: new Date(Date.now() - 3 * 60000).toISOString(),
        transmissionInterval: 300,
        alertThresholds: { min: 0, max: 8 },
        totalReadings: 15840,
        uptime: 99.5
      })
    } catch (error) {
      console.error('Failed to load sensor data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !sensor) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  const getTempStatus = (temp: number, thresholds: { min: number; max: number }) => {
    if (temp < thresholds.min) return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (temp > thresholds.max) return { label: 'High', color: 'text-red-600', bg: 'bg-red-50' }
    return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  }

  const tempStatus = getTempStatus(sensor.temperature, sensor.alertThresholds)

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    return `${Math.floor(diffMins / 60)} hours ago`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sensor.id}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />
              {sensor.kitchenName} • {sensor.location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
            sensor.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
            sensor.status === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              sensor.status === 'online' ? 'bg-emerald-500' :
              sensor.status === 'warning' ? 'bg-amber-500' :
              'bg-red-500'
            }`} />
            {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
          </span>
          <button
            onClick={loadSensorData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Temperature Display */}
      <div className={`rounded-2xl p-8 ${tempStatus.bg} border ${tempStatus.color.replace('text-', 'border-')}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm">
              <Thermometer className={`h-12 w-12 ${tempStatus.color}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${tempStatus.color} opacity-80`}>Current Temperature</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${tempStatus.color}`}>
                  {sensor.temperature.toFixed(1)}
                </span>
                <span className={`text-2xl ${tempStatus.color}`}>°C</span>
              </div>
              <p className={`text-sm ${tempStatus.color} mt-1`}>
                Status: <span className="font-medium">{tempStatus.label}</span>
                <span className="opacity-70"> (threshold: {sensor.alertThresholds.min}°C - {sensor.alertThresholds.max}°C)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className={`h-4 w-4 ${tempStatus.color} opacity-70`} />
            <span className={`${tempStatus.color} opacity-70`}>Last reading: {formatLastSeen(sensor.lastSeen)}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Battery */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Battery className={`h-5 w-5 ${
              sensor.batteryPercent > 60 ? 'text-emerald-500' :
              sensor.batteryPercent > 30 ? 'text-amber-500' : 'text-red-500'
            }`} />
            <span className="text-sm font-medium text-gray-700">Battery</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sensor.batteryPercent}%</p>
          <p className="text-xs text-gray-500">{sensor.batteryVoltage}V</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                sensor.batteryPercent > 60 ? 'bg-emerald-500' :
                sensor.batteryPercent > 30 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${sensor.batteryPercent}%` }}
            />
          </div>
        </div>

        {/* Signal */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Signal className={`h-5 w-5 ${
              sensor.signalStrength > -70 ? 'text-emerald-500' :
              sensor.signalStrength > -85 ? 'text-amber-500' : 'text-red-500'
            }`} />
            <span className="text-sm font-medium text-gray-700">Signal</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sensor.signalStrength} dBm</p>
          <p className="text-xs text-gray-500">
            {sensor.signalStrength > -70 ? 'Excellent' :
             sensor.signalStrength > -85 ? 'Good' : 'Weak'}
          </p>
        </div>

        {/* Uptime */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sensor.uptime}%</p>
          <p className="text-xs text-gray-500">{sensor.totalReadings.toLocaleString()} readings</p>
        </div>

        {/* Interval */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Interval</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sensor.transmissionInterval / 60}m</p>
          <p className="text-xs text-gray-500">Transmission rate</p>
        </div>
      </div>

      {/* Device Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Device ID</p>
            <p className="font-mono text-gray-900">{sensor.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Probe Model</p>
            <p className="text-gray-900">{sensor.probeModel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Install Date</p>
            <p className="text-gray-900">{new Date(sensor.installDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kitchen</p>
            <p className="text-gray-900">{sensor.kitchenName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-900">{sensor.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alert Thresholds</p>
            <p className="text-gray-900">{sensor.alertThresholds.min}°C - {sensor.alertThresholds.max}°C</p>
          </div>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature History</h2>
        <TemperatureChart />
      </div>
    </div>
  )
}
