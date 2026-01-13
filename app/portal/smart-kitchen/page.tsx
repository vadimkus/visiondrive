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
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { 
  checkCompliance, 
  getComplianceColor, 
  EQUIPMENT_CONFIGS,
  DANGER_ZONE,
  type EquipmentType,
  type ComplianceStatus 
} from './lib/compliance'
import { useTheme } from './context/ThemeContext'

interface Kitchen {
  id: string
  name: string
  location: string
  sensorCount: number
  activeAlerts: number
  avgTemperature: number
  status: 'normal' | 'warning' | 'critical'
  lastReading: string
  complianceRate: number
}

interface Stats {
  totalSensors: number
  onlineSensors: number
  activeAlerts: number
  avgTemperature: number
  complianceRate: number
  inDangerZone: number
}

interface SensorReading {
  id: string
  kitchenName: string
  location: string
  equipmentType: EquipmentType
  temperature: number
  complianceStatus: ComplianceStatus
}

export default function SmartKitchenDashboard() {
  const { isDark } = useTheme()
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSensors: 0,
    onlineSensors: 0,
    activeAlerts: 0,
    avgTemperature: 0,
    complianceRate: 0,
    inDangerZone: 0
  })
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock sensor readings with equipment types
    const mockReadings: SensorReading[] = [
      { id: 'sensor-001', kitchenName: 'Main Kitchen', location: 'Walk-in Fridge', equipmentType: 'walk_in_cooler', temperature: 4.2, complianceStatus: 'compliant' },
      { id: 'sensor-002', kitchenName: 'Main Kitchen', location: 'Main Freezer', equipmentType: 'freezer', temperature: -18.5, complianceStatus: 'compliant' },
      { id: 'sensor-003', kitchenName: 'Main Kitchen', location: 'Prep Fridge', equipmentType: 'prep_fridge', temperature: 5.1, complianceStatus: 'warning' },
      { id: 'sensor-004', kitchenName: 'Cloud Kitchen A', location: 'Main Cooler', equipmentType: 'refrigerator', temperature: 6.8, complianceStatus: 'critical' },
      { id: 'sensor-005', kitchenName: 'Cloud Kitchen A', location: 'Display Fridge', equipmentType: 'display_fridge', temperature: 9.2, complianceStatus: 'danger_zone' },
      { id: 'sensor-006', kitchenName: 'Restaurant Kitchen', location: 'Cold Storage', equipmentType: 'walk_in_cooler', temperature: 3.5, complianceStatus: 'compliant' },
      { id: 'sensor-007', kitchenName: 'Restaurant Kitchen', location: 'Hot Bain-Marie', equipmentType: 'hot_holding', temperature: 65.2, complianceStatus: 'compliant' },
    ]
    
    // Update compliance status dynamically
    const updatedReadings = mockReadings.map(r => ({
      ...r,
      complianceStatus: checkCompliance(r.equipmentType, r.temperature).status
    }))
    
    setReadings(updatedReadings)
    
    const compliantCount = updatedReadings.filter(r => r.complianceStatus === 'compliant').length
    const dangerZoneCount = updatedReadings.filter(r => r.complianceStatus === 'danger_zone').length
    const criticalCount = updatedReadings.filter(r => r.complianceStatus === 'critical' || r.complianceStatus === 'danger_zone').length
    
      setKitchens([
      { id: 'kitchen-001', name: 'Main Kitchen', location: 'Dubai Marina', sensorCount: 5, activeAlerts: 0, avgTemperature: 4.2, status: 'normal', lastReading: '2 min ago', complianceRate: 100 },
      { id: 'kitchen-002', name: 'Cloud Kitchen A', location: 'Business Bay', sensorCount: 3, activeAlerts: 2, avgTemperature: 6.8, status: 'critical', lastReading: '1 min ago', complianceRate: 33 },
      { id: 'kitchen-003', name: 'Restaurant Kitchen', location: 'JLT', sensorCount: 4, activeAlerts: 0, avgTemperature: 3.5, status: 'normal', lastReading: '3 min ago', complianceRate: 100 },
      ])

      setStats({
      totalSensors: updatedReadings.length,
      onlineSensors: updatedReadings.length,
      activeAlerts: criticalCount,
      avgTemperature: updatedReadings.reduce((sum, r) => sum + r.temperature, 0) / updatedReadings.length,
      complianceRate: Math.round((compliantCount / updatedReadings.length) * 100),
      inDangerZone: dangerZoneCount
    })

      setIsLoading(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Overview</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dubai Municipality Food Safety Compliance Dashboard</p>
      </div>

      {/* DM Compliance Banner */}
      <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 ${
        isDark 
          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-800' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isDark ? 'bg-blue-900/50' : 'bg-blue-100'
        }`}>
          <ShieldCheck className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Dubai Municipality Compliance</h3>
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            Refrigeration: 0-5°C • Freezer: ≤-18°C • Hot Holding: ≥60°C • Danger Zone: 5-60°C
          </p>
        </div>
        <Link 
          href="/portal/smart-kitchen/compliance"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-all"
        >
          <FileText className="h-4 w-4" />
          View Report
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Compliance Rate"
          value={`${stats.complianceRate}%`}
          icon={stats.complianceRate >= 90 ? ShieldCheck : ShieldAlert}
          color={stats.complianceRate >= 90 ? 'green' : stats.complianceRate >= 70 ? 'orange' : 'red'}
          isDark={isDark}
        />
        <StatCard
          label="Total Sensors"
          value={stats.totalSensors}
          icon={Thermometer}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          label="Online"
          value={`${stats.onlineSensors}/${stats.totalSensors}`}
          subtitle={`${Math.round((stats.onlineSensors / Math.max(stats.totalSensors, 1)) * 100)}% uptime`}
          icon={Activity}
          color="green"
          isDark={isDark}
        />
        <StatCard
          label="Active Alerts"
          value={stats.activeAlerts}
          icon={stats.activeAlerts > 0 ? AlertTriangle : CheckCircle}
          color={stats.activeAlerts > 0 ? 'red' : 'green'}
          isDark={isDark}
        />
        <StatCard
          label="Danger Zone"
          value={stats.inDangerZone}
          subtitle={stats.inDangerZone > 0 ? 'Immediate action needed!' : 'All safe'}
          icon={ShieldAlert}
          color={stats.inDangerZone > 0 ? 'red' : 'green'}
          pulse={stats.inDangerZone > 0}
          isDark={isDark}
        />
      </div>

      {/* Temperature Zones Reference */}
      <div className="mb-8">
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Temperature Zones</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ZoneCard
            name="Refrigeration"
            range="0°C to 5°C"
            icon="🧊"
            color="blue"
            current={readings.filter(r => ['refrigerator', 'walk_in_cooler', 'display_fridge', 'prep_fridge'].includes(r.equipmentType))}
            isDark={isDark}
          />
          <ZoneCard
            name="Freezer"
            range="≤ -18°C"
            icon="❄️"
            color="indigo"
            current={readings.filter(r => ['freezer', 'walk_in_freezer'].includes(r.equipmentType))}
            isDark={isDark}
          />
          <ZoneCard
            name="Hot Holding"
            range="≥ 60°C"
            icon="🔥"
            color="orange"
            current={readings.filter(r => r.equipmentType === 'hot_holding')}
            isDark={isDark}
          />
          <ZoneCard
            name="Danger Zone"
            range="5°C - 60°C"
            icon="⚠️"
            color="red"
            current={readings.filter(r => r.complianceStatus === 'danger_zone')}
            isDanger
            isDark={isDark}
          />
        </div>
      </div>

      {/* Kitchens Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kitchen Locations</h2>
          <Link 
            href="/portal/smart-kitchen/kitchens"
            className={`text-sm flex items-center gap-1 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchens.map(kitchen => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} isDark={isDark} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Alerts */}
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Compliance Alerts</h3>
            <Link 
              href="/portal/smart-kitchen/alerts"
              className={`text-xs ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              View all
            </Link>
          </div>
          
          {stats.activeAlerts > 0 ? (
            <div className="space-y-3">
              {readings.filter(r => r.complianceStatus === 'danger_zone' || r.complianceStatus === 'critical').slice(0, 2).map(reading => (
                <AlertItem 
                  key={reading.id}
                  type={reading.complianceStatus === 'danger_zone' ? 'DANGER_ZONE' : 'HIGH_TEMP'}
                  message={`${reading.temperature}°C - ${checkCompliance(reading.equipmentType, reading.temperature).message}`}
                  kitchen={reading.kitchenName}
                  sensor={reading.location}
                  time="Just now"
                  isDanger={reading.complianceStatus === 'danger_zone'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>All temperatures compliant</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>System Status</h3>
          
          <div className="space-y-4">
            <StatusRow label="AWS IoT Core" status="operational" isDark={isDark} />
            <StatusRow label="Data Pipeline" status="operational" isDark={isDark} />
            <StatusRow label="Alert System" status="operational" isDark={isDark} />
            <StatusRow label="DM Compliance Module" status="operational" isDark={isDark} />
          </div>
          
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              All systems operational • UAE Region (me-central-1)
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
  trend,
  pulse,
  isDark
}: { 
  label: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'red' | 'orange'
  trend?: 'up' | 'down'
  pulse?: boolean
  isDark?: boolean
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-2xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg ${pulse ? 'animate-pulse' : ''}`}>
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

function ZoneCard({ 
  name, 
  range, 
  icon, 
  color,
  current,
  isDanger,
  isDark
}: { 
  name: string
  range: string
  icon: string
  color: 'blue' | 'indigo' | 'orange' | 'red'
  current: SensorReading[]
  isDanger?: boolean
  isDark?: boolean
}) {
  const compliant = current.filter(r => r.complianceStatus === 'compliant').length
  const total = current.length
  
  const bgColors = {
    blue: isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100',
    indigo: isDark ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-100',
    orange: isDark ? 'bg-orange-900/30 border-orange-800' : 'bg-orange-50 border-orange-100',
    red: isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-100',
  }
  
  const textColors = {
    blue: isDark ? 'text-blue-400' : 'text-blue-700',
    indigo: isDark ? 'text-indigo-400' : 'text-indigo-700',
    orange: isDark ? 'text-orange-400' : 'text-orange-700',
    red: isDark ? 'text-red-400' : 'text-red-700',
  }

  return (
    <div className={`rounded-2xl p-4 border ${bgColors[color]} ${isDanger && total > 0 ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className={`font-semibold ${textColors[color]}`}>{name}</h4>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{range}</p>
        </div>
      </div>
      <div className="mt-2">
        {isDanger ? (
          <p className={`text-sm font-medium ${total > 0 ? (isDark ? 'text-red-400' : 'text-red-700') : (isDark ? 'text-emerald-400' : 'text-emerald-700')}`}>
            {total > 0 ? `⚠️ ${total} sensor(s) at risk` : '✓ None'}
          </p>
        ) : (
          <p className={`text-sm font-medium ${textColors[color]}`}>
            {total === 0 ? 'No sensors' : `${compliant}/${total} compliant`}
          </p>
        )}
      </div>
    </div>
  )
}

function KitchenCard({ kitchen, isDark }: { kitchen: Kitchen; isDark?: boolean }) {
  const statusColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  }

  return (
    <Link href={`/portal/smart-kitchen/kitchens/${kitchen.id}`}>
      <div className={`rounded-2xl p-5 shadow-sm border transition-all cursor-pointer group ${
        isDark 
          ? 'bg-[#2d2d2f] border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:shadow-md hover:border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`font-semibold group-hover:text-orange-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {kitchen.name}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{kitchen.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              kitchen.complianceRate >= 90 
                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                : kitchen.complianceRate >= 70 
                  ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                  : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              {kitchen.complianceRate}%
            </span>
            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[kitchen.status]}`} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {kitchen.avgTemperature.toFixed(1)}°
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Temp</p>
          </div>
          <div>
            <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{kitchen.sensorCount}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sensors</p>
          </div>
          <div>
            <p className={`text-2xl font-semibold ${kitchen.activeAlerts > 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {kitchen.activeAlerts}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Alerts</p>
          </div>
        </div>

        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Clock className="h-3 w-3" />
            {kitchen.lastReading}
          </span>
          <ChevronRight className={`h-4 w-4 group-hover:text-orange-500 transition-colors ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
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
  time,
  isDanger 
}: { 
  type: string
  message: string
  kitchen: string
  sensor: string
  time: string
  isDanger?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${isDanger ? 'bg-red-100 border border-red-200' : 'bg-red-50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDanger ? 'bg-red-200' : 'bg-red-100'}`}>
        <AlertTriangle className={`h-4 w-4 ${isDanger ? 'text-red-700' : 'text-red-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isDanger ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700'}`}>
            {isDanger ? '⚠️ DANGER ZONE' : type}
          </span>
        </div>
        <p className={`text-sm font-medium ${isDanger ? 'text-red-900' : 'text-red-800'}`}>{message}</p>
        <p className="text-xs text-red-600 mt-0.5">
          {kitchen} • {sensor} • {time}
        </p>
      </div>
    </div>
  )
}

function StatusRow({ label, status, isDark }: { label: string; status: 'operational' | 'degraded' | 'down'; isDark?: boolean }) {
  const statusConfig = {
    operational: { color: 'bg-emerald-500', text: 'Operational' },
    degraded: { color: 'bg-amber-500', text: 'Degraded' },
    down: { color: 'bg-red-500', text: 'Down' },
  }

  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{statusConfig[status].text}</span>
      </div>
    </div>
  )
}
