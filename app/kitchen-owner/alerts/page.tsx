'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Bell,
  Filter,
  Check,
  MessageCircle,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'

const ALERTS = [
  {
    id: 'alert-1',
    sensor: 'Display Cooler',
    sensorIcon: '🧊',
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
]

export default function OwnerAlerts() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alerts</h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All acknowledged'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDark ? 'bg-[#2d2d2f] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">All</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="warning">Warnings</option>
            </select>
            
            {unreadCount > 0 && (
              <button
                onClick={handleAcknowledgeAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Ack All
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp Status Banner */}
        <div className={`rounded-xl border p-3 mb-4 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <MessageCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                    WhatsApp Alerts
                  </p>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isDark ? 'bg-green-800 text-green-300' : 'bg-green-200 text-green-700'}`}>
                    Active
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  Sending alerts to +971-50-123-4567
                </p>
              </div>
            </div>
            <Link 
              href="/kitchen-owner/settings"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDark ? 'bg-green-800/50 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Settings className="h-3 w-3" />
              Configure
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <Bell className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
            </div>
            <p className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{alerts.length}</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Warnings</span>
            </div>
            <p className="text-xl font-bold text-amber-500 mt-0.5">{alerts.filter(a => a.severity === 'warning').length}</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Resolved</span>
            </div>
            <p className="text-xl font-bold text-emerald-500 mt-0.5">{alerts.filter(a => a.acknowledged).length}</p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className={`rounded-xl border p-6 text-center ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No alerts</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>All systems running smoothly</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`rounded-xl border p-3 transition-all ${
                  isDark 
                    ? !alert.acknowledged ? 'bg-[#2d2d2f] border-amber-700' : 'bg-[#2d2d2f] border-gray-700'
                    : !alert.acknowledged ? 'bg-white border-amber-200 shadow-sm' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
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
                      <div className="flex items-center gap-2">
                        <span className="text-base">{alert.sensorIcon}</span>
                        <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.sensor}</h3>
                        {!alert.acknowledged && (
                          <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-500 text-[10px] font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{alert.message}</p>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{alert.details}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{alert.time}</p>
                    {!alert.acknowledged && (
                      <button 
                        onClick={() => handleAcknowledge(alert.id)}
                        className="mt-1 text-xs text-orange-500 hover:text-orange-400 font-medium"
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
    </div>
  )
}
