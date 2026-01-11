'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Bell, Clock, Thermometer, Filter, Check } from 'lucide-react'

interface Alert {
  id: string
  sensorId: string
  kitchenId: string
  kitchenName: string
  sensorLocation: string
  type: 'HIGH_TEMP' | 'LOW_TEMP' | 'BATTERY_LOW' | 'OFFLINE'
  severity: 'critical' | 'warning' | 'info'
  temperature?: number
  threshold?: number
  message: string
  createdAt: string
  acknowledged: boolean
  acknowledgedAt?: string
  acknowledgedBy?: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setAlerts([
      {
        id: 'alert-001',
        sensorId: 'sensor-005',
        kitchenId: 'kitchen-002',
        kitchenName: 'Cloud Kitchen A',
        sensorLocation: 'Display Fridge',
        type: 'HIGH_TEMP',
        severity: 'critical',
        temperature: 9.2,
        threshold: 8,
        message: 'Temperature exceeds safe threshold',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'alert-002',
        sensorId: 'sensor-004',
        kitchenId: 'kitchen-002',
        kitchenName: 'Cloud Kitchen A',
        sensorLocation: 'Main Cooler',
        type: 'BATTERY_LOW',
        severity: 'warning',
        message: 'Battery level below 50%',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'alert-003',
        sensorId: 'sensor-002',
        kitchenId: 'kitchen-001',
        kitchenName: 'Main Kitchen',
        sensorLocation: 'Freezer',
        type: 'HIGH_TEMP',
        severity: 'warning',
        temperature: -15.2,
        threshold: -18,
        message: 'Temperature above target range',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
        acknowledgedBy: 'Ahmed Hassan',
      },
    ])
    setIsLoading(false)
  }

  const handleAcknowledge = async (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'Current User' }
        : a
    ))
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return !a.acknowledged
    if (filter === 'acknowledged') return a.acknowledged
    return true
  })

  const activeCount = alerts.filter(a => !a.acknowledged).length

  const severityConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  }

  const typeLabels = {
    HIGH_TEMP: 'High Temperature',
    LOW_TEMP: 'Low Temperature',
    BATTERY_LOW: 'Low Battery',
    OFFLINE: 'Sensor Offline',
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Temperature and sensor alerts</p>
        </div>
        {activeCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
            <Bell className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">{activeCount} active</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-gray-400" />
        {(['all', 'active', 'acknowledged'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              filter === f
                ? 'bg-[#1d1d1f] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'active' && activeCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Loading alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">All Clear</h3>
          <p className="text-sm text-gray-500">No alerts to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const config = severityConfig[alert.severity]
            return (
              <div
                key={alert.id}
                className={`rounded-2xl p-5 border ${config.bg} ${config.border} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${alert.acknowledged ? 'bg-gray-200' : config.badge.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                    {alert.acknowledged ? (
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                    ) : (
                      <AlertTriangle className={`h-5 w-5 ${config.icon}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
                        {typeLabels[alert.type]}
                      </span>
                      <span className="text-xs text-gray-500">{alert.severity}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{alert.message}</h3>
                    
                    {alert.temperature !== undefined && (
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Thermometer className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{alert.temperature}°C</span>
                          <span className="text-gray-500">/ {alert.threshold}°C threshold</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{alert.kitchenName}</span>
                      <span>•</span>
                      <span>{alert.sensorLocation}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(alert.createdAt)}
                      </span>
                    </div>

                    {alert.acknowledged && (
                      <p className="text-xs text-gray-500 mt-2">
                        Acknowledged by {alert.acknowledgedBy} • {formatTime(alert.acknowledgedAt!)}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
                    >
                      <Check className="h-4 w-4" />
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
