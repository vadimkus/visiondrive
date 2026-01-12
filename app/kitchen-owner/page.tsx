'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  AlertTriangle, 
  Wifi,
  WifiOff,
  TrendingUp,
  Shield,
  FileText,
  ChevronRight
} from 'lucide-react'
import { useTheme } from './context/ThemeContext'

// Abdul's Kitchen Data
const OWNER_DATA = {
  name: 'Abdul Rahman',
  email: 'abdul@kitchen.ae',
  kitchen: {
    id: 'kitchen-abdul-001',
    name: "Abdul's Kitchen",
    location: 'Marina Walk, Dubai Marina',
    since: 'January 2026',
  }
}

// Abdul's 5 Sensors
const SENSORS = [
  {
    id: 'sensor-a1',
    name: 'Walk-in Fridge',
    type: 'refrigerator',
    icon: '🚪',
    currentTemp: 3.2,
    requiredRange: { min: 0, max: 5 },
    status: 'compliant',
    lastUpdate: '2 min ago',
    online: true,
    battery: 85,
  },
  {
    id: 'sensor-a2',
    name: 'Main Freezer',
    type: 'freezer',
    icon: '❄️',
    currentTemp: -19.5,
    requiredRange: { max: -18 },
    status: 'compliant',
    lastUpdate: '1 min ago',
    online: true,
    battery: 92,
  },
  {
    id: 'sensor-a3',
    name: 'Prep Fridge',
    type: 'refrigerator',
    icon: '🔪',
    currentTemp: 4.8,
    requiredRange: { min: 0, max: 5 },
    status: 'compliant',
    lastUpdate: '3 min ago',
    online: true,
    battery: 78,
  },
  {
    id: 'sensor-a4',
    name: 'Display Cooler',
    type: 'refrigerator',
    icon: '🛒',
    currentTemp: 6.2,
    requiredRange: { min: 0, max: 5 },
    status: 'warning',
    lastUpdate: '1 min ago',
    online: true,
    battery: 65,
  },
  {
    id: 'sensor-a5',
    name: 'Hot Holding',
    type: 'hot_holding',
    icon: '🔥',
    currentTemp: 68.5,
    requiredRange: { min: 60 },
    status: 'compliant',
    lastUpdate: '2 min ago',
    online: true,
    battery: 88,
  },
]

// Recent alerts for Abdul
const RECENT_ALERTS = [
  {
    id: 'alert-1',
    sensor: 'Display Cooler',
    message: 'Temperature above 5°C threshold',
    time: '15 minutes ago',
    severity: 'warning',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    sensor: 'Main Freezer',
    message: 'Temperature recovered to safe range',
    time: '2 hours ago',
    severity: 'info',
    acknowledged: true,
  },
]

export default function OwnerDashboard() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAllSensors, setShowAllSensors] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const compliantCount = SENSORS.filter(s => s.status === 'compliant').length
  const warningCount = SENSORS.filter(s => s.status === 'warning').length
  const criticalCount = SENSORS.filter(s => s.status === 'critical').length
  const onlineCount = SENSORS.filter(s => s.online).length
  
  const overallStatus = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'good'
  const complianceRate = Math.round((compliantCount / SENSORS.length) * 100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-emerald-600'
      case 'warning': return 'text-amber-500'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-emerald-50'
      case 'warning': return 'bg-amber-50'
      case 'critical': return 'bg-red-50'
      default: return 'bg-gray-50'
    }
  }

  const formatTemp = (temp: number) => {
    return `${temp.toFixed(1)}°C`
  }

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
    <div className={`p-5 md:p-7 lg:p-9 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
      {/* Overall Status Hero */}
      <div className={`rounded-xl p-5 mb-5 ${
        overallStatus === 'good' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
        overallStatus === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
        'bg-gradient-to-r from-red-500 to-red-600'
      } text-white shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {overallStatus === 'good' ? (
              <CheckCircle className="h-7 w-7" />
            ) : (
              <AlertTriangle className="h-7 w-7" />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {overallStatus === 'good' ? 'All Clear' : 
                 overallStatus === 'warning' ? 'Attention Needed' : 
                 'Action Required'}
              </h2>
              <p className="text-white/80 text-base">
                {overallStatus === 'good' 
                  ? 'All temperatures within safe ranges' 
                  : `${warningCount + criticalCount} sensor${warningCount + criticalCount > 1 ? 's' : ''} need${warningCount + criticalCount === 1 ? 's' : ''} attention`}
              </p>
            </div>
            
            <div className="flex items-center gap-5 ml-7 pl-7 border-l border-white/20">
              <div className="text-center">
                <p className="text-3xl font-bold">{complianceRate}%</p>
                <p className="text-sm text-white/70">Compliance</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{onlineCount}/{SENSORS.length}</p>
                <p className="text-sm text-white/70">Online</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{RECENT_ALERTS.filter(a => !a.acknowledged).length}</p>
                <p className="text-sm text-white/70">Alerts</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-medium tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-white/70 text-sm">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <button 
          onClick={() => router.push('/kitchen-owner/reports')}
          className={`rounded-xl p-4 text-left hover:shadow-sm transition-all group flex items-center gap-4 ${
            isDark ? 'bg-[#2d2d2f] border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-100'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <FileText className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className={`font-medium text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Download Report</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>PDF</p>
          </div>
        </button>
        
        <button className={`rounded-xl p-4 text-left hover:shadow-sm transition-all group flex items-center gap-4 ${
          isDark ? 'bg-[#2d2d2f] border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-100'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-purple-900/30' : 'bg-purple-50'
          }`}>
            <TrendingUp className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <h3 className={`font-medium text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>View History</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Trends</p>
          </div>
        </button>
        
        <button 
          onClick={() => router.push('/kitchen-owner/compliance')}
          className={`rounded-xl p-4 text-left hover:shadow-sm transition-all group flex items-center gap-4 ${
            isDark ? 'bg-[#2d2d2f] border border-gray-700 hover:border-gray-600' : 'bg-white border border-gray-100'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
          }`}>
            <Shield className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <div>
            <h3 className={`font-medium text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>DM Guidelines</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Safety</p>
          </div>
        </button>
      </div>

      {/* Sensors Grid */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Sensors</h2>
          <button 
            onClick={() => setShowAllSensors(!showAllSensors)}
            className="text-sm text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1"
          >
            {showAllSensors ? 'Less' : 'All'}
            <ChevronRight className={`h-4 w-4 transition-transform ${showAllSensors ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showAllSensors ? SENSORS : SENSORS.slice(0, 5)).map(sensor => (
            <div 
              key={sensor.id}
              className={`rounded-xl p-4 border transition-all hover:shadow-sm ${
                isDark 
                  ? `bg-[#2d2d2f] ${
                      sensor.status === 'warning' ? 'border-amber-700' :
                      sensor.status === 'critical' ? 'border-red-700' :
                      'border-gray-700'
                    }`
                  : `bg-white ${
                      sensor.status === 'warning' ? 'border-amber-200' :
                      sensor.status === 'critical' ? 'border-red-200' :
                      'border-gray-100'
                    }`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sensor.icon}</span>
                  <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{sensor.name}</span>
                </div>
                {sensor.online ? (
                  <Wifi className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getStatusColor(sensor.status)}`}>
                    {formatTemp(sensor.currentTemp)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatRange(sensor.requiredRange)}
                  </p>
                </div>
                
                {sensor.status === 'compliant' ? (
                  <CheckCircle className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              
              {/* Battery - inline */}
              <div className={`mt-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div 
                    className={`h-full rounded-full ${
                      sensor.battery > 50 ? 'bg-emerald-500' :
                      sensor.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sensor.battery}%` }}
                  />
                </div>
                <span className="text-xs">{sensor.battery}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Alerts</h2>
          <button 
            onClick={() => router.push('/kitchen-owner/alerts')}
            className="text-sm text-orange-500 hover:text-orange-400 font-medium"
          >
            All
          </button>
        </div>
        
        <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-50'}`}>
          {RECENT_ALERTS.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <CheckCircle className={`h-7 w-7 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No alerts</p>
            </div>
          ) : (
            RECENT_ALERTS.map(alert => (
              <div key={alert.id} className={`px-4 py-3 flex items-center justify-between transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDark
                      ? alert.severity === 'warning' ? 'bg-amber-900/30' :
                        alert.severity === 'critical' ? 'bg-red-900/30' : 'bg-blue-900/30'
                      : alert.severity === 'warning' ? 'bg-amber-100' :
                        alert.severity === 'critical' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {alert.severity === 'info' ? (
                      <CheckCircle className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'warning' 
                          ? isDark ? 'text-amber-400' : 'text-amber-600' 
                          : isDark ? 'text-red-400' : 'text-red-600'
                      }`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.sensor}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{alert.message}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{alert.time}</p>
                  {!alert.acknowledged && (
                    <button className="text-xs text-orange-500 hover:text-orange-400 font-medium">
                      Ack
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
