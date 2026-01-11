'use client'

import { useState, useEffect } from 'react'
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  Battery, 
  Signal, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChefHat
} from 'lucide-react'
import KitchenCard from './components/KitchenCard'
import AlertsPanel from './components/AlertsPanel'
import TemperatureChart from './components/TemperatureChart'
import SensorGrid from './components/SensorGrid'

interface Kitchen {
  id: string
  name: string
  location: string
  sensorCount: number
  activeAlerts: number
  avgTemperature: number
  status: 'normal' | 'warning' | 'critical'
}

interface Alert {
  id: string
  deviceId: string
  kitchenId: string
  kitchenName: string
  type: 'HIGH_TEMP' | 'LOW_TEMP' | 'BATTERY_LOW' | 'OFFLINE'
  temperature?: number
  threshold?: number
  createdAt: string
  acknowledged: boolean
}

interface Stats {
  totalSensors: number
  onlineSensors: number
  activeAlerts: number
  avgTemperature: number
}

export default function SmartKitchenDashboard() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSensors: 0,
    onlineSensors: 0,
    activeAlerts: 0,
    avgTemperature: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    loadDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API calls
      // const [kitchensRes, alertsRes, statsRes] = await Promise.all([
      //   fetch('/api/portal/smart-kitchen/kitchens'),
      //   fetch('/api/portal/smart-kitchen/alerts?active=true'),
      //   fetch('/api/portal/smart-kitchen/stats')
      // ])

      // Mock data for now
      setKitchens([
        { id: 'kitchen-001', name: 'Main Kitchen', location: 'Dubai Marina', sensorCount: 5, activeAlerts: 0, avgTemperature: 4.2, status: 'normal' },
        { id: 'kitchen-002', name: 'Cloud Kitchen A', location: 'Business Bay', sensorCount: 3, activeAlerts: 1, avgTemperature: 6.8, status: 'warning' },
        { id: 'kitchen-003', name: 'Restaurant Kitchen', location: 'JLT', sensorCount: 4, activeAlerts: 0, avgTemperature: 3.5, status: 'normal' },
      ])

      setAlerts([
        { 
          id: 'alert-001', 
          deviceId: 'sensor-005', 
          kitchenId: 'kitchen-002', 
          kitchenName: 'Cloud Kitchen A',
          type: 'HIGH_TEMP', 
          temperature: 9.2, 
          threshold: 8,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          acknowledged: false
        },
      ])

      setStats({
        totalSensors: 12,
        onlineSensors: 11,
        activeAlerts: 1,
        avgTemperature: 4.5
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    // TODO: Call API to acknowledge alert
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-emerald-600'
      case 'warning': return 'text-amber-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-emerald-50'
      case 'warning': return 'bg-amber-50'
      case 'critical': return 'bg-red-50'
      default: return 'bg-gray-50'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-orange-500" />
            Smart Kitchen Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time temperature monitoring for all kitchen locations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sensors"
          value={stats.totalSensors}
          icon={Thermometer}
          color="blue"
        />
        <StatCard
          title="Online"
          value={`${stats.onlineSensors}/${stats.totalSensors}`}
          subtitle={`${Math.round((stats.onlineSensors / stats.totalSensors) * 100)}% uptime`}
          icon={Signal}
          color="green"
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={stats.activeAlerts > 0 ? AlertTriangle : CheckCircle}
          color={stats.activeAlerts > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Avg Temperature"
          value={`${stats.avgTemperature.toFixed(1)}°C`}
          icon={Thermometer}
          color="cyan"
          trend={stats.avgTemperature > 5 ? 'up' : stats.avgTemperature < 3 ? 'down' : 'stable'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kitchens List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Kitchen Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kitchens.map(kitchen => (
              <KitchenCard key={kitchen.id} kitchen={kitchen} />
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div>
          <AlertsPanel 
            alerts={alerts} 
            onAcknowledge={handleAcknowledgeAlert}
          />
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature Trends (24h)</h2>
        <TemperatureChart />
      </div>

      {/* Sensor Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Sensors</h2>
        <SensorGrid />
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  trend 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'red' | 'cyan' | 'orange'
  trend?: 'up' | 'down' | 'stable'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  }

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    red: 'text-red-500',
    cyan: 'text-cyan-500',
    orange: 'text-orange-500',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />
          {trend && (
            <TrendIcon className={`h-4 w-4 ${
              trend === 'up' ? 'text-red-500' : 
              trend === 'down' ? 'text-blue-500' : 
              'text-gray-400'
            }`} />
          )}
        </div>
      </div>
    </div>
  )
}
