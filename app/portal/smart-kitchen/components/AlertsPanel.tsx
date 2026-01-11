'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  Thermometer, 
  Battery, 
  Wifi, 
  CheckCircle,
  Clock,
  ChevronRight,
  Bell
} from 'lucide-react'

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

interface AlertsPanelProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
}

export default function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'active'>('active')

  const filteredAlerts = filter === 'active' 
    ? alerts.filter(a => !a.acknowledged)
    : alerts

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'HIGH_TEMP':
      case 'LOW_TEMP':
        return Thermometer
      case 'BATTERY_LOW':
        return Battery
      case 'OFFLINE':
        return Wifi
      default:
        return AlertTriangle
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'HIGH_TEMP':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
      case 'LOW_TEMP':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
      case 'BATTERY_LOW':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
      case 'OFFLINE':
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
      default:
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
    }
  }

  const getAlertMessage = (alert: Alert) => {
    switch (alert.type) {
      case 'HIGH_TEMP':
        return `Temperature ${alert.temperature?.toFixed(1)}°C exceeds threshold ${alert.threshold}°C`
      case 'LOW_TEMP':
        return `Temperature ${alert.temperature?.toFixed(1)}°C below threshold ${alert.threshold}°C`
      case 'BATTERY_LOW':
        return 'Battery level critically low'
      case 'OFFLINE':
        return 'Sensor offline - no data received'
      default:
        return 'Unknown alert'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Alerts</h3>
            {filteredAlerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                {filteredAlerts.filter(a => !a.acknowledged).length}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === 'active' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">All Clear!</p>
            <p className="text-sm text-gray-500">No active alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAlerts.map(alert => {
              const Icon = getAlertIcon(alert.type)
              const colors = getAlertColor(alert.type)
              
              return (
                <div 
                  key={alert.id}
                  className={`p-4 ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                          {alert.type.replace('_', ' ')}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-xs text-gray-500">Acknowledged</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mt-1">
                        {getAlertMessage(alert)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{alert.kitchenName}</span>
                        <span>•</span>
                        <span>{alert.deviceId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(alert.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!alert.acknowledged && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Acknowledge
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button className="w-full flex items-center justify-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">
          View All Alerts
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
