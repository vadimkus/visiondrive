'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  AlertTriangle, 
  Thermometer,
  Download,
  RefreshCw,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
  Shield,
  FileText
} from 'lucide-react'

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAllSensors, setShowAllSensors] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'portal=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

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
    return `${temp > 0 ? '' : ''}${temp.toFixed(1)}°C`
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
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200">
                A
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{OWNER_DATA.kitchen.name}</h1>
                <p className="text-sm text-gray-500">{OWNER_DATA.kitchen.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {warningCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Overall Status Hero */}
        <div className={`rounded-3xl p-8 mb-8 ${
          overallStatus === 'good' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
          overallStatus === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
          'bg-gradient-to-br from-red-500 to-red-600'
        } text-white shadow-xl`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {overallStatus === 'good' ? (
                  <CheckCircle className="h-10 w-10" />
                ) : (
                  <AlertTriangle className="h-10 w-10" />
                )}
                <div>
                  <h2 className="text-3xl font-bold">
                    {overallStatus === 'good' ? 'All Clear' : 
                     overallStatus === 'warning' ? 'Attention Needed' : 
                     'Immediate Action Required'}
                  </h2>
                  <p className="text-white/80 text-lg">
                    {overallStatus === 'good' 
                      ? 'All temperatures are within safe ranges' 
                      : `${warningCount + criticalCount} sensor${warningCount + criticalCount > 1 ? 's' : ''} need${warningCount + criticalCount === 1 ? 's' : ''} attention`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{complianceRate}%</p>
                  <p className="text-sm text-white/70">Compliance</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-4xl font-bold">{onlineCount}/{SENSORS.length}</p>
                  <p className="text-sm text-white/70">Online</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-4xl font-bold">{RECENT_ALERTS.filter(a => !a.acknowledged).length}</p>
                  <p className="text-sm text-white/70">Alerts</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-white/60 text-sm">Last updated</p>
              <p className="text-2xl font-light tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => router.push('/kitchen-owner/reports')}
            className="bg-white rounded-2xl p-5 text-left hover:shadow-lg transition-all group border border-gray-100"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Download Report</h3>
            <p className="text-sm text-gray-500 mt-1">Get compliance PDF</p>
          </button>
          
          <button className="bg-white rounded-2xl p-5 text-left hover:shadow-lg transition-all group border border-gray-100">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">View History</h3>
            <p className="text-sm text-gray-500 mt-1">Temperature trends</p>
          </button>
          
          <button className="bg-white rounded-2xl p-5 text-left hover:shadow-lg transition-all group border border-gray-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">DM Guidelines</h3>
            <p className="text-sm text-gray-500 mt-1">Food safety rules</p>
          </button>
        </div>

        {/* Sensors Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Sensors</h2>
            <button 
              onClick={() => setShowAllSensors(!showAllSensors)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {showAllSensors ? 'Show Less' : 'View All'}
              <ChevronRight className={`h-4 w-4 transition-transform ${showAllSensors ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllSensors ? SENSORS : SENSORS.slice(0, 3)).map(sensor => (
              <div 
                key={sensor.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                  sensor.status === 'warning' ? 'border-amber-200' :
                  sensor.status === 'critical' ? 'border-red-200' :
                  'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sensor.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
                      <p className="text-xs text-gray-500">Updated {sensor.lastUpdate}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(sensor.status)} ${getStatusColor(sensor.status)}`}>
                    {sensor.online ? (
                      <>
                        <Wifi className="h-3 w-3" />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" />
                        Offline
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-4xl font-bold ${getStatusColor(sensor.status)}`}>
                      {formatTemp(sensor.currentTemp)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Required: {formatRange(sensor.requiredRange)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {sensor.status === 'compliant' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-500 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Check
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Battery indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Battery</span>
                    <span>{sensor.battery}%</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        sensor.battery > 50 ? 'bg-emerald-500' :
                        sensor.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${sensor.battery}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="divide-y divide-gray-50">
            {RECENT_ALERTS.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-600">No alerts - everything is running smoothly!</p>
              </div>
            ) : (
              RECENT_ALERTS.map(alert => (
                <div key={alert.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.severity === 'warning' ? 'bg-amber-100' :
                      alert.severity === 'critical' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {alert.severity === 'info' ? (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.severity === 'warning' ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.sensor}</p>
                      <p className="text-sm text-gray-500">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{alert.time}</p>
                    {!alert.acknowledged && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>VisionDrive Smart Kitchen • DM-HSD-GU46-KFPA2 Compliant</p>
          <p className="mt-1">UAE Data Residency (me-central-1) 🇦🇪</p>
        </footer>
      </main>
    </div>
  )
}
