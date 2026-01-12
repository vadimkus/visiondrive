'use client'

import { useState } from 'react'
import { RefreshCw, Thermometer, Droplets, Wind } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function OwnerHeader() {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
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
    <header className={`px-6 py-3 sticky top-0 z-40 transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-b border-gray-800' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left - Status */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
          }`}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Live</span>
          </div>
          
          {/* Weather Pills */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.temp}°</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.humidity}%</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Wind className={`h-3.5 w-3.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.wind} km/h</span>
            </div>
          </div>
        </div>

        {/* Right - Refresh */}
        <div className="flex items-center gap-3">
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              isDark 
                ? 'bg-white text-gray-900 hover:bg-gray-200' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}
