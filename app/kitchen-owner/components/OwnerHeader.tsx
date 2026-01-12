'use client'

import { useState } from 'react'
import { RefreshCw, Thermometer, Droplets, Wind, Wifi, Cloud } from 'lucide-react'
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
    condition: 'Pleasant'
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setLastUpdate(new Date())
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <header className={`px-5 py-3 sticky top-0 z-40 transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-b border-gray-800' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left - Status & Weather Pills */}
        <div className="flex items-center gap-3">
          {/* Live Status */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-white border-gray-200'
          }`}>
            <Wifi className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Live</span>
          </div>
          
          {/* Temperature */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{weather.temp}°</span>
          </div>
          
          {/* Humidity */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{weather.humidity}%</span>
          </div>
          
          {/* Wind */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <Wind className="h-4 w-4 text-gray-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{weather.wind} km/h</span>
          </div>
          
          {/* Condition */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-white border-gray-200'
          }`}>
            <Cloud className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{weather.condition}</span>
          </div>
        </div>

        {/* Right - Refresh */}
        <div className="flex items-center gap-3">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 p-2.5 text-sm font-medium rounded-full transition-colors ${
              isDark 
                ? 'bg-white text-gray-900 hover:bg-gray-200' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  )
}
