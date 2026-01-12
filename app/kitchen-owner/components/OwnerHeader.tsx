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
    <header className={`px-4 py-2 sticky top-0 z-40 transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-b border-gray-800' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left - Status */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
            isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
          }`}>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Live</span>
          </div>
          
          {/* Weather Pills - Compact */}
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Thermometer className="h-3 w-3 text-orange-500" />
              <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.temp}°</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Droplets className="h-3 w-3 text-blue-500" />
              <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Right - Refresh */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full transition-colors ${
              isDark 
                ? 'bg-white text-gray-900 hover:bg-gray-200' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  )
}
