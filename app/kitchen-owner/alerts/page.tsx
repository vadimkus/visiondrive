'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Bell,
  Filter,
  Check
} from 'lucide-react'

const ALERTS = [
  {
    id: 'alert-1',
    sensor: 'Display Cooler',
    sensorIcon: '🛒',
    message: 'Temperature above 5°C threshold',
    details: 'Current: 6.2°C | Required: 0-5°C',
    time: '15 minutes ago',
    timestamp: new Date(),
    severity: 'warning',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    sensor: 'Main Freezer',
    sensorIcon: '❄️',
    message: 'Temperature recovered to safe range',
    details: 'Current: -19.5°C | Required: ≤-18°C',
    time: '2 hours ago',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'info',
    acknowledged: true,
  },
  {
    id: 'alert-3',
    sensor: 'Walk-in Fridge',
    sensorIcon: '🚪',
    message: 'Door left open warning',
    details: 'Temperature rising - check door seal',
    time: 'Yesterday',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    severity: 'warning',
    acknowledged: true,
  },
  {
    id: 'alert-4',
    sensor: 'Hot Holding',
    sensorIcon: '🔥',
    message: 'Temperature stable in safe range',
    details: 'Current: 68.5°C | Required: ≥60°C',
    time: '3 days ago',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    severity: 'info',
    acknowledged: true,
  },
]

export default function OwnerAlerts() {
  const [filter, setFilter] = useState('all')
  const [alerts, setAlerts] = useState(ALERTS)

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'unread'
    ? alerts.filter(a => !a.acknowledged)
    : alerts.filter(a => a.severity === filter)

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ))
  }

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }

  const unreadCount = alerts.filter(a => !a.acknowledged).length

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts acknowledged'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Alerts</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Acknowledge All
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{alerts.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-amber-700">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{alerts.filter(a => a.severity === 'warning').length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-emerald-700">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{alerts.filter(a => a.acknowledged).length}</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">No alerts to show</p>
            <p className="text-sm text-gray-500 mt-1">All systems are running smoothly</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`bg-white rounded-xl border p-4 transition-all ${
                !alert.acknowledged ? 'border-amber-200 shadow-sm' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
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
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{alert.sensorIcon}</span>
                      <h3 className="font-semibold text-gray-900">{alert.sensor}</h3>
                      {!alert.acknowledged && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.details}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">{alert.time}</p>
                  {!alert.acknowledged && (
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
