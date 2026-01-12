'use client'

import { useState, useEffect } from 'react'
import { Thermometer, Droplets, Wind, Wifi, Cloud } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Simulate live weather data updates
const getWeatherData = () => {
  // Add slight variations to simulate live data
  const baseTemp = 34
  const baseHumidity = 42
  const baseWind = 11.6
  
  return {
    temp: baseTemp + Math.round((Math.random() - 0.5) * 2),
    humidity: baseHumidity + Math.round((Math.random() - 0.5) * 4),
    wind: Math.round((baseWind + (Math.random() - 0.5) * 2) * 10) / 10,
    condition: 'Pleasant'
  }
}

export default function OwnerHeader() {
  const [weather, setWeather] = useState(getWeatherData())
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Update weather data every 30 seconds (live mode)
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(getWeatherData())
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <header className={`px-5 py-3 sticky top-0 z-40 transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-b border-gray-800' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="flex items-center gap-3">
        {/* Live Status */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
          isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-white border-gray-200'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
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
          <Wind className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
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
    </header>
  )
}
