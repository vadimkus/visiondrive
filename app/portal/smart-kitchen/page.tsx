'use client'

import { useState, useEffect } from 'react'
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface Kitchen {
  id: string
  name: string
  location: string
  sensorCount: number
  activeAlerts: number
  avgTemperature: number
  status: 'normal' | 'warning' | 'critical'
  lastReading: string
}

interface Stats {
  totalSensors: number
  onlineSensors: number
  activeAlerts: number
  avgTemperature: number
}

export default function SmartKitchenDashboard() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSensors: 0,
    onlineSensors: 0,
    activeAlerts: 0,
    avgTemperature: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    // Mock data - replace with API calls
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setKitchens([
      { id: 'kitchen-001', name: 'Main Kitchen', location: 'Dubai Marina', sensorCount: 5, activeAlerts: 0, avgTemperature: 4.2, status: 'normal', lastReading: '2 min ago' },
      { id: 'kitchen-002', name: 'Cloud Kitchen A', location: 'Business Bay', sensorCount: 3, activeAlerts: 1, avgTemperature: 6.8, status: 'warning', lastReading: '1 min ago' },
      { id: 'kitchen-003', name: 'Restaurant Kitchen', location: 'JLT', sensorCount: 4, activeAlerts: 0, avgTemperature: 3.5, status: 'normal', lastReading: '3 min ago' },
    ])

    setStats({
      totalSensors: 12,
      onlineSensors: 11,
      activeAlerts: 1,
      avgTemperature: 4.5
    })

    setIsLoading(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time temperature monitoring across all locations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Sensors"
          value={stats.totalSensors}
          icon={Thermometer}
          color="blue"
        />
        <StatCard
          label="Online"
          value={`${stats.onlineSensors}/${stats.totalSensors}`}
          subtitle={`${Math.round((stats.onlineSensors / Math.max(stats.totalSensors, 1)) * 100)}% uptime`}
          icon={Activity}
          color="green"
        />
        <StatCard
          label="Active Alerts"
          value={stats.activeAlerts}
          icon={stats.activeAlerts > 0 ? AlertTriangle : CheckCircle}
          color={stats.activeAlerts > 0 ? 'red' : 'green'}
        />
        <StatCard
          label="Avg Temperature"
          value={`${stats.avgTemperature.toFixed(1)}°C`}
          icon={Thermometer}
          color="orange"
          trend={stats.avgTemperature > 5 ? 'up' : 'down'}
        />
      </div>

      {/* Kitchens Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Kitchen Locations</h2>
          <Link 
            href="/portal/smart-kitchen/kitchens"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchens.map(kitchen => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
            <Link 
              href="/portal/smart-kitchen/alerts"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              View all
            </Link>
          </div>
          
          {stats.activeAlerts > 0 ? (
            <div className="space-y-3">
              <AlertItem 
                type="HIGH_TEMP"
                message="Temperature 9.2°C exceeds threshold 8°C"
                kitchen="Cloud Kitchen A"
                sensor="sensor-005"
                time="15 min ago"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">All temperatures normal</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
          
          <div className="space-y-4">
            <StatusRow label="AWS IoT Core" status="operational" />
            <StatusRow label="Data Pipeline" status="operational" />
            <StatusRow label="Alert System" status="operational" />
            <StatusRow label="API Gateway" status="operational" />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              All systems operational • UAE Region
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  subtitle,
  icon: Icon, 
  color,
  trend 
}: { 
  label: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'red' | 'orange'
  trend?: 'up' | 'down'
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{trend === 'up' ? 'Above' : 'Below'} target</span>
        </div>
      )}
    </div>
  )
}

function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  const statusColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  }

  return (
    <Link href={`/portal/smart-kitchen/kitchens/${kitchen.id}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {kitchen.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{kitchen.location}</p>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${statusColors[kitchen.status]}`} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {kitchen.avgTemperature.toFixed(1)}°
            </p>
            <p className="text-xs text-gray-500">Avg Temp</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{kitchen.sensorCount}</p>
            <p className="text-xs text-gray-500">Sensors</p>
          </div>
          <div>
            <p className={`text-2xl font-semibold ${kitchen.activeAlerts > 0 ? 'text-red-500' : 'text-gray-900'}`}>
              {kitchen.activeAlerts}
            </p>
            <p className="text-xs text-gray-500">Alerts</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {kitchen.lastReading}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

function AlertItem({ 
  type, 
  message, 
  kitchen, 
  sensor, 
  time 
}: { 
  type: string
  message: string
  kitchen: string
  sensor: string
  time: string 
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="h-4 w-4 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-900">{message}</p>
        <p className="text-xs text-red-600 mt-0.5">
          {kitchen} • {sensor} • {time}
        </p>
      </div>
    </div>
  )
}

function StatusRow({ label, status }: { label: string; status: 'operational' | 'degraded' | 'down' }) {
  const statusConfig = {
    operational: { color: 'bg-emerald-500', text: 'Operational' },
    degraded: { color: 'bg-amber-500', text: 'Degraded' },
    down: { color: 'bg-red-500', text: 'Down' },
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
        <span className="text-xs text-gray-500">{statusConfig[status].text}</span>
      </div>
    </div>
  )
}
