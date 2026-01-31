'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  Clock, 
  Thermometer, 
  Check,
  RefreshCw,
  MapPin,
  ChevronDown,
  BellOff,
  Shield,
  Battery,
  Wifi,
  Building2
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface Alert {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'temperature' | 'battery' | 'offline' | 'maintenance'
  severity: 'info' | 'warning' | 'critical'
  message: string
  acknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  createdAt: string
}

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  alerts: Alert[]
  sensorCount: number
}

export default function AlertsPage() {
  const { isDark } = useTheme()
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedKitchens, setExpandedKitchens] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens')
      const data = await response.json()
      
      if (data.success && data.kitchens) {
        // Fetch full details for each kitchen including alerts
        const kitchensWithAlerts = await Promise.all(
          data.kitchens.map(async (k: { id: string; name: string; address: string; emirate: string; sensorCount: number }) => {
            try {
              const detailResponse = await fetch(`/api/portal/smart-kitchen/kitchens/${k.id}`)
              const detailData = await detailResponse.json()
              if (detailData.success && detailData.kitchen) {
                return {
                  ...detailData.kitchen,
                  sensorCount: detailData.kitchen.equipment?.length || 0
                }
              }
            } catch {
              // Return kitchen without alerts on error
            }
            return { ...k, alerts: [], sensorCount: k.sensorCount || 0 }
          })
        )
        setKitchens(kitchensWithAlerts)
        
        // Auto-expand kitchens that have active alerts
        const withActiveAlerts = kitchensWithAlerts
          .filter((k: Kitchen) => k.alerts?.some((a: Alert) => !a.acknowledged))
          .map((k: Kitchen) => k.id)
        setExpandedKitchens(new Set(withActiveAlerts))
      } else {
        setError(data.error || 'Failed to load alerts')
      }
    } catch (err) {
      console.error('Failed to load alerts:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcknowledge = async (kitchenId: string, alertId: string) => {
    // Optimistic update
    setKitchens(prev => prev.map(k => {
      if (k.id !== kitchenId) return k
      return {
        ...k,
        alerts: k.alerts.map(a => 
          a.id === alertId 
            ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'Admin' }
            : a
        )
      }
    }))

    // TODO: Call API to acknowledge alert
    // await fetch(`/api/portal/smart-kitchen/kitchens/${kitchenId}/alerts/${alertId}/acknowledge`, { method: 'POST' })
  }

  const toggleKitchen = (kitchenId: string) => {
    setExpandedKitchens(prev => {
      const next = new Set(prev)
      if (next.has(kitchenId)) {
        next.delete(kitchenId)
      } else {
        next.add(kitchenId)
      }
      return next
    })
  }

  // Calculate totals
  const allAlerts = kitchens.flatMap(k => k.alerts || [])
  const activeAlerts = allAlerts.filter(a => !a.acknowledged)
  const acknowledgedAlerts = allAlerts.filter(a => a.acknowledged)
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length
  const totalSensors = kitchens.reduce((sum, k) => sum + (k.sensorCount || 0), 0)

  // Filter alerts per kitchen
  const getFilteredAlerts = (alerts: Alert[]) => {
    if (filter === 'active') return alerts.filter(a => !a.acknowledged)
    if (filter === 'acknowledged') return alerts.filter(a => a.acknowledged)
    return alerts
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Alerts
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Temperature and sensor alerts by location
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeAlerts.length > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <Bell className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                  {activeAlerts.length} active
                </span>
              </div>
            )}
            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className={`
                p-2.5 rounded-xl transition-all
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'}
                ${isLoading ? 'animate-spin' : ''}
              `}
            >
              <RefreshCw className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Critical"
            value={criticalCount}
            icon={AlertTriangle}
            iconBg={criticalCount > 0 ? 'bg-red-500' : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Warning"
            value={warningCount}
            icon={AlertTriangle}
            iconBg={warningCount > 0 ? 'bg-amber-500' : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Acknowledged"
            value={acknowledgedAlerts.length}
            icon={CheckCircle}
            iconBg="bg-emerald-500"
            isDark={isDark}
          />
          <StatCard
            label="Total Sensors"
            value={totalSensors}
            icon={Thermometer}
            iconBg={totalSensors > 0 ? 'bg-blue-500' : 'bg-gray-400'}
            isDark={isDark}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'active', 'acknowledged'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2.5 text-sm font-medium rounded-full transition-all
                ${filter === f
                  ? isDark 
                    ? 'bg-white text-black' 
                    : 'bg-[#1d1d1f] text-white'
                  : isDark
                    ? 'bg-[#1c1c1e] text-gray-400 hover:text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'active' && activeAlerts.length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === f 
                    ? isDark ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {activeAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${isDark ? 'bg-red-900/20 border border-red-800/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading alerts...</p>
          </div>
        ) : kitchens.length === 0 ? (
          <EmptyState isDark={isDark} type="no-kitchens" />
        ) : totalSensors === 0 ? (
          <EmptyState isDark={isDark} type="no-sensors" />
        ) : allAlerts.length === 0 ? (
          <EmptyState isDark={isDark} type="all-clear" />
        ) : (
          <div className="space-y-3">
            {kitchens.map(kitchen => {
              const filteredAlerts = getFilteredAlerts(kitchen.alerts || [])
              if (filteredAlerts.length === 0 && filter !== 'all') return null
              
              return (
                <LocationAlertCard
                  key={kitchen.id}
                  kitchen={kitchen}
                  alerts={filteredAlerts}
                  isExpanded={expandedKitchens.has(kitchen.id)}
                  onToggle={() => toggleKitchen(kitchen.id)}
                  onAcknowledge={(alertId) => handleAcknowledge(kitchen.id, alertId)}
                  formatTime={formatTime}
                  isDark={isDark}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  iconBg,
  isDark 
}: { 
  label: string
  value: number
  icon: React.ElementType
  iconBg: string
  isDark: boolean
}) {
  return (
    <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        </div>
      </div>
    </div>
  )
}

// Location Alert Card
function LocationAlertCard({
  kitchen,
  alerts,
  isExpanded,
  onToggle,
  onAcknowledge,
  formatTime,
  isDark
}: {
  kitchen: Kitchen
  alerts: Alert[]
  isExpanded: boolean
  onToggle: () => void
  onAcknowledge: (alertId: string) => void
  formatTime: (iso: string) => string
  isDark: boolean
}) {
  const activeCount = alerts.filter(a => !a.acknowledged).length
  const hasAlerts = alerts.length > 0

  return (
    <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      {/* Location Header */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-5
          transition-colors
          ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
            🍳
          </div>
          <div className="text-left">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {kitchen.name}
            </h3>
            <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <MapPin className="w-3.5 h-3.5" />
              {kitchen.address}, {kitchen.emirate}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {activeCount > 0 ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <Bell className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                {activeCount} active
              </span>
            </div>
          ) : hasAlerts ? (
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              All acknowledged
            </span>
          ) : (
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              No alerts
            </span>
          )}
          
          {hasAlerts && (
            <ChevronDown className={`w-5 h-5 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'} ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Alerts List */}
      {isExpanded && hasAlerts && (
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="p-3 space-y-2">
            {alerts.map(alert => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onAcknowledge={() => onAcknowledge(alert.id)}
                formatTime={formatTime}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Alert Row Component
function AlertRow({
  alert,
  onAcknowledge,
  formatTime,
  isDark
}: {
  alert: Alert
  onAcknowledge: () => void
  formatTime: (iso: string) => string
  isDark: boolean
}) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'temperature': return Thermometer
      case 'battery': return Battery
      case 'offline': return Wifi
      default: return AlertTriangle
    }
  }

  const getSeverityStyles = () => {
    if (alert.acknowledged) {
      return {
        bg: isDark ? 'bg-gray-800/50' : 'bg-gray-50',
        iconBg: isDark ? 'bg-gray-700' : 'bg-gray-200',
        iconColor: isDark ? 'text-gray-400' : 'text-gray-500',
        badge: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
      }
    }
    switch (alert.severity) {
      case 'critical':
        return {
          bg: isDark ? 'bg-red-900/20' : 'bg-red-50',
          iconBg: isDark ? 'bg-red-900/50' : 'bg-red-100',
          iconColor: isDark ? 'text-red-400' : 'text-red-500',
          badge: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
        }
      case 'warning':
        return {
          bg: isDark ? 'bg-amber-900/20' : 'bg-amber-50',
          iconBg: isDark ? 'bg-amber-900/50' : 'bg-amber-100',
          iconColor: isDark ? 'text-amber-400' : 'text-amber-500',
          badge: isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'
        }
      default:
        return {
          bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
          iconBg: isDark ? 'bg-blue-900/50' : 'bg-blue-100',
          iconColor: isDark ? 'text-blue-400' : 'text-blue-500',
          badge: isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
        }
    }
  }

  const Icon = getAlertIcon()
  const styles = getSeverityStyles()

  return (
    <div className={`
      flex items-center justify-between p-4 rounded-xl
      ${styles.bg}
      ${alert.acknowledged ? 'opacity-60' : ''}
    `}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          {alert.acknowledged ? (
            <CheckCircle className={`w-5 h-5 ${styles.iconColor}`} />
          ) : (
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.badge}`}>
              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {alert.equipmentName}
            </span>
          </div>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {alert.message}
          </p>
          <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            {formatTime(alert.createdAt)}
            {alert.acknowledged && alert.acknowledgedBy && (
              <span> • Acknowledged by {alert.acknowledgedBy}</span>
            )}
          </p>
        </div>
      </div>

      {!alert.acknowledged && (
        <button
          onClick={onAcknowledge}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all active:scale-95
            ${isDark 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <Check className="w-4 h-4" />
          Acknowledge
        </button>
      )}
    </div>
  )
}

// Empty State Component
function EmptyState({ isDark, type }: { isDark: boolean; type: 'no-kitchens' | 'no-sensors' | 'all-clear' }) {
  const config = {
    'no-kitchens': {
      icon: Building2,
      title: 'No Locations Yet',
      description: 'Add kitchens to start monitoring alerts',
      iconColor: isDark ? 'text-gray-700' : 'text-gray-300'
    },
    'no-sensors': {
      icon: Thermometer,
      title: 'No Sensors Registered',
      description: 'Add equipment to your kitchens to receive alerts',
      iconColor: isDark ? 'text-amber-500/50' : 'text-amber-300'
    },
    'all-clear': {
      icon: Shield,
      title: 'All Clear',
      description: 'No alerts to display. All systems operating normally.',
      iconColor: isDark ? 'text-emerald-500' : 'text-emerald-400'
    }
  }

  const { icon: Icon, title, description, iconColor } = config[type]

  return (
    <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <Icon className={`w-16 h-16 mx-auto mb-4 ${iconColor}`} />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        {description}
      </p>
    </div>
  )
}
