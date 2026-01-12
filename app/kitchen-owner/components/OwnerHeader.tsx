'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Wifi, Thermometer, Droplets, Wind } from 'lucide-react'

export default function OwnerHeader() {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Mock weather data for Dubai
  const weather = {
    temp: 34,
    humidity: 42,
    wind: 11.6,
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setLastUpdate(new Date())
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">Live</span>
          </div>
          
          {/* Weather Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full">
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-medium text-gray-700">{weather.temp}°</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-gray-700">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full">
              <Wind className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">{weather.wind} km/h</span>
            </div>
          </div>
        </div>

        {/* Right - Refresh */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}
