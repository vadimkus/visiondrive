'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  AlertTriangle, 
  Wifi,
  WifiOff,
  TrendingUp,
  Shield,
  FileText,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { useTheme } from './context/ThemeContext'
import { SkeletonDashboard } from './components/ui/Skeleton'
import { haptic } from './hooks/useHaptic'

// Abdul's Kitchen Data
const OWNER_DATA = {
  name: 'Abdul',
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
    icon: '🌡️',
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
    icon: '🧊',
    currentTemp: 6.2,
    requiredRange: { min: 0, max: 5 },
    status: 'warning',
    lastUpdate: '1 min ago',
    online: true,
    battery: 65,
  },
]

// Initial alerts data
const INITIAL_ALERTS = [
  {
    id: 'alert-1',
    sensor: 'Display Cooler',
    message: 'Temperature above 5°C threshold',
    time: '15 min ago',
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
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setIsVisible(true), 50)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAcknowledge = (alertId: string) => {
    haptic('success')
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    haptic('medium')
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
    haptic('success')
  }, [])

  const handleNavigation = (path: string) => {
    haptic('selection')
    router.push(path)
  }

  const compliantCount = SENSORS.filter(s => s.status === 'compliant').length
  const warningCount = SENSORS.filter(s => s.status === 'warning').length
  const criticalCount = SENSORS.filter(s => s.status === 'critical').length
  const onlineCount = SENSORS.filter(s => s.online).length
  
  const overallStatus = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'good'
  const complianceRate = Math.round((compliantCount / SENSORS.length) * 100)
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length

  const formatTemp = (temp: number) => `${temp.toFixed(1)}°`

  const formatRange = (range: { min?: number; max?: number }) => {
    if (range.min !== undefined && range.max !== undefined) {
      return `${range.min}° - ${range.max}°C`
    } else if (range.min !== undefined) {
      return `≥ ${range.min}°C`
    } else if (range.max !== undefined) {
      return `≤ ${range.max}°C`
    }
    return ''
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className={`min-h-full ${isDark ? 'bg-[#000000]' : 'bg-[#f5f5f7]'}`}>
        <SkeletonDashboard />
      </div>
    )
  }

  return (
    <div className={`min-h-full transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-2xl mx-auto px-4 py-4 md:px-6 md:py-6 pb-28 md:pb-16">
        
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="flex justify-center py-4">
            <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Status Card - Softer, more professional colors */}
        <div 
          className={`
            rounded-3xl p-5 mb-5 
            ${overallStatus === 'good' 
              ? isDark 
                ? 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90' 
                : 'bg-gradient-to-br from-emerald-400 to-teal-500'
              : overallStatus === 'warning' 
                ? isDark
                  ? 'bg-gradient-to-br from-amber-600/80 to-orange-700/80'
                  : 'bg-gradient-to-br from-amber-400 to-amber-500'
                : isDark
                  ? 'bg-gradient-to-br from-red-600/90 to-rose-700/90'
                  : 'bg-gradient-to-br from-red-400 to-rose-500'
            } 
            text-white shadow-lg
            ${overallStatus === 'good' ? 'shadow-emerald-500/20' : overallStatus === 'warning' ? 'shadow-amber-500/20' : 'shadow-red-500/20'}
            transition-all duration-500 active:scale-[0.98]
            ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          `}
          style={{ transitionDelay: '50ms' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {overallStatus === 'good' ? (
                  <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-gray-800" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-gray-800" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {overallStatus === 'good' ? 'All Clear' : 
                     overallStatus === 'warning' ? 'Attention Needed' : 
                     'Action Required'}
                  </h2>
                  <p className="text-gray-700 text-sm">
                    {overallStatus === 'good' 
                      ? 'All temperatures in safe range' 
                      : `${warningCount + criticalCount} sensor needs attention`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Row - Color coded by status */}
          <div className="flex items-center gap-3 mt-4">
            {/* Compliance */}
            <div 
              className={`flex-1 rounded-2xl px-4 py-3 text-center ${
                complianceRate >= 90 
                  ? 'bg-emerald-500/90' 
                  : complianceRate >= 70 
                    ? 'bg-amber-500/90' 
                    : 'bg-red-500/90'
              }`}
            >
              <p className="text-2xl font-bold text-white">{complianceRate}%</p>
              <p className="text-xs text-white/90 mt-0.5">Compliance</p>
            </div>
            
            {/* Online Sensors */}
            <div 
              className={`flex-1 rounded-2xl px-4 py-3 text-center ${
                onlineCount === SENSORS.length 
                  ? 'bg-emerald-500/90' 
                  : onlineCount > 0 
                    ? 'bg-amber-500/90' 
                    : 'bg-red-500/90'
              }`}
            >
              <p className="text-2xl font-bold text-white">{onlineCount}/{SENSORS.length}</p>
              <p className="text-xs text-white/90 mt-0.5">Online</p>
            </div>
            
            {/* Alerts */}
            <div 
              className={`flex-1 rounded-2xl px-4 py-3 text-center ${
                unacknowledgedAlerts === 0 
                  ? 'bg-emerald-500/90' 
                  : 'bg-red-500/90'
              }`}
            >
              <p className="text-2xl font-bold text-white">{unacknowledgedAlerts}</p>
              <p className="text-xs text-white/90 mt-0.5">Alerts</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '100ms' }}
        >
          {[
            { icon: FileText, label: 'Reports', color: isDark ? 'from-blue-600 to-blue-700' : 'from-blue-400 to-blue-500', shadow: 'shadow-blue-500/20', path: '/kitchen-owner/reports' },
            { icon: TrendingUp, label: 'History', color: isDark ? 'from-violet-600 to-purple-700' : 'from-violet-400 to-purple-500', shadow: 'shadow-purple-500/20', path: '/kitchen-owner/equipment' },
            { icon: Shield, label: 'Compliance', color: isDark ? 'from-emerald-600 to-teal-700' : 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20', path: '/kitchen-owner/compliance' },
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => handleNavigation(action.path)}
              className={`
                rounded-2xl p-4 text-center
                transition-all duration-200 active:scale-95
                ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}
                shadow-sm
              `}
            >
              <div className={`
                w-12 h-12 mx-auto rounded-2xl mb-2
                flex items-center justify-center
                bg-gradient-to-br ${action.color}
                shadow-md ${action.shadow}
              `}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.label}</p>
            </button>
          ))}
        </div>

        {/* Sensors Section */}
        <div 
          className={`mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '150ms' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Sensors
            </h2>
            <button 
              onClick={() => handleNavigation('/kitchen-owner/equipment')}
              className="text-sm text-orange-500 font-medium flex items-center gap-0.5 active:opacity-70"
            >
              See All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Sensor Cards - Horizontal scroll with snap */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide scroll-touch">
            {SENSORS.map((sensor, index) => (
              <div 
                key={sensor.id}
                className={`
                  flex-shrink-0 w-[160px] snap-start
                  rounded-2xl p-4
                  transition-all duration-300 active:scale-[0.97]
                  ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}
                  ${sensor.status === 'warning' 
                    ? isDark ? 'ring-2 ring-amber-500/50' : 'ring-2 ring-amber-500/30'
                    : sensor.status === 'critical'
                      ? isDark ? 'ring-2 ring-red-500/50' : 'ring-2 ring-red-500/30'
                      : ''
                  }
                  shadow-sm
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                `}
                style={{ transitionDelay: `${200 + index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{sensor.icon}</span>
                  {sensor.online ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <Wifi className={`h-3.5 w-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    </div>
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </div>
                
                {/* Temperature */}
                <p className={`
                  text-3xl font-bold tracking-tight mb-1
                  ${sensor.status === 'compliant' 
                    ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                    : sensor.status === 'warning'
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }
                `}>
                  {formatTemp(sensor.currentTemp)}
                </p>
                
                {/* Name & Range */}
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {sensor.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatRange(sensor.requiredRange)}
                </p>
                
                {/* Battery */}
                <div className="flex items-center gap-2 mt-3">
                  <div className={`flex-1 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        sensor.battery > 50 ? 'bg-emerald-500' :
                        sensor.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: isVisible ? `${sensor.battery}%` : '0%', transitionDelay: `${400 + index * 50}ms` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {sensor.battery}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Section */}
        <div 
          className={`mb-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Alerts
            </h2>
            <button 
              onClick={() => handleNavigation('/kitchen-owner/alerts')}
              className="text-sm text-orange-500 font-medium flex items-center gap-0.5 active:opacity-70"
            >
              See All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} shadow-sm`}>
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle className={`h-10 w-10 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No alerts</p>
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                {alerts.map((alert, index) => (
                  <div 
                    key={alert.id}
                    className={`
                      px-4 py-3.5 flex items-center gap-3
                      transition-all duration-300
                      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ transitionDelay: `${350 + index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${alert.severity === 'warning' 
                        ? isDark ? 'bg-amber-900/30' : 'bg-amber-100'
                        : alert.severity === 'critical'
                          ? isDark ? 'bg-red-900/30' : 'bg-red-100'
                          : isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                      }
                    `}>
                      {alert.severity === 'info' ? (
                        <CheckCircle className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.severity === 'warning' 
                            ? isDark ? 'text-amber-400' : 'text-amber-600'
                            : isDark ? 'text-red-400' : 'text-red-600'
                        }`} />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {alert.sensor}
                      </p>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {alert.message}
                      </p>
                    </div>
                    
                    {/* Action */}
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{alert.time}</p>
                      {!alert.acknowledged ? (
                        <button 
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs text-orange-500 font-medium mt-0.5 active:opacity-70"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dubai Municipality Badge */}
        <div 
          className={`
            rounded-2xl p-4
            ${isDark ? 'bg-emerald-900/20 border border-emerald-800/50' : 'bg-emerald-50 border border-emerald-100'}
            transition-all duration-500 active:scale-[0.98]
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-xl
              flex items-center justify-center
              ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}
            `}>
              <Shield className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Dubai Municipality Compliant
              </p>
              <p className={`text-xs ${isDark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>
                DM-HSD-GU46-KFPA2 Guidelines
              </p>
            </div>
            <CheckCircle className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
        </div>

      </div>
    </div>
  )
}
