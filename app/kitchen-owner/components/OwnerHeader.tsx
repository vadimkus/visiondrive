'use client'

import { useState, useEffect } from 'react'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ThermometerSnowflake,
  Gauge,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Dubai weather condition mapping
const getConditionEmoji = (condition: string): string => {
  const emojiMap: Record<string, string> = {
    'Pleasant': '☀️',
    'Sunny': '☀️',
    'Clear': '🌙',
    'Hot': '🔥',
    'Very Hot': '🥵',
    'Warm': '🌤️',
    'Cloudy': '☁️',
    'Partly Cloudy': '⛅',
    'Humid': '💧',
    'Windy': '💨',
  }
  return emojiMap[condition] || '🌡️'
}

// Simulated kitchen sensor data - in production would come from AWS IoT
const getKitchenData = () => {
  return {
    // Equipment averages from sensors
    avgFridgeTemp: 3.2 + (Math.random() - 0.5) * 0.4,
    avgFreezerTemp: -19.5 + (Math.random() - 0.5) * 0.6,
    equipmentOnline: 4,
    equipmentTotal: 4,
    activeAlerts: 1,
    complianceRate: 75,
    lastSync: new Date(),
  }
}

// Simulated Dubai weather - in production would use OpenWeatherMap API
const getWeatherData = () => {
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour > 19
  
  // Dubai typical temperatures by time
  let baseTemp = 34
  if (hour >= 6 && hour < 10) baseTemp = 28
  else if (hour >= 10 && hour < 14) baseTemp = 36
  else if (hour >= 14 && hour < 18) baseTemp = 38
  else if (hour >= 18 && hour < 21) baseTemp = 32
  else baseTemp = 26
  
  const temp = baseTemp + Math.round((Math.random() - 0.5) * 2)
  const humidity = 45 + Math.round((Math.random() - 0.5) * 10)
  
  let condition = 'Pleasant'
  if (temp >= 40) condition = 'Very Hot'
  else if (temp >= 36) condition = 'Hot'
  else if (temp >= 30) condition = isNight ? 'Clear' : 'Sunny'
  else if (temp >= 25) condition = 'Pleasant'
  else condition = 'Cool'
  
  return {
    temp,
    humidity,
    wind: Math.round((10 + Math.random() * 8) * 10) / 10,
    condition,
    location: 'Dubai Marina'
  }
}

export default function OwnerHeader() {
  const [kitchen, setKitchen] = useState(getKitchenData())
  const [weather, setWeather] = useState(getWeatherData())
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Update data periodically (simulating real-time)
  useEffect(() => {
    // Kitchen data updates every 5 seconds (real sensors report every 5 min)
    const kitchenInterval = setInterval(() => {
      setKitchen(getKitchenData())
    }, 5000)
    
    // Weather updates every 5 minutes
    const weatherInterval = setInterval(() => {
      setWeather(getWeatherData())
    }, 300000)
    
    // Time updates every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => {
      clearInterval(kitchenInterval)
      clearInterval(weatherInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const timeSinceSync = Math.floor((currentTime.getTime() - kitchen.lastSync.getTime()) / 1000)
  const syncText = timeSinceSync < 60 ? `${timeSinceSync}s ago` : `${Math.floor(timeSinceSync / 60)}m ago`

  return (
    <header className={`px-5 py-3 sticky top-0 z-40 transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-b border-gray-800' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left: Kitchen Status */}
        <div className="flex items-center gap-2">
          {/* Live Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className={`h-3.5 w-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
            <span className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>LIVE</span>
          </div>
          
          {/* Equipment Online */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <Activity className={`h-3.5 w-3.5 ${
              kitchen.equipmentOnline === kitchen.equipmentTotal ? 'text-emerald-500' : 'text-amber-500'
            }`} />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {kitchen.equipmentOnline}/{kitchen.equipmentTotal} Online
            </span>
          </div>

          {/* Avg Fridge Temp */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <Thermometer className="h-3.5 w-3.5 text-blue-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Fridges {kitchen.avgFridgeTemp.toFixed(1)}°C
            </span>
          </div>

          {/* Avg Freezer Temp */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Freezers {kitchen.avgFreezerTemp.toFixed(1)}°C
            </span>
          </div>

          {/* Alerts */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            kitchen.activeAlerts > 0
              ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'
              : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {kitchen.activeAlerts > 0 ? (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span className={`text-xs font-medium ${
              kitchen.activeAlerts > 0 
                ? 'text-red-500' 
                : isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              {kitchen.activeAlerts > 0 ? `${kitchen.activeAlerts} Alert` : 'All Clear'}
            </span>
          </div>

          {/* Compliance Rate */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            kitchen.complianceRate >= 90
              ? isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'
              : kitchen.complianceRate >= 70
                ? isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'
                : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'
          }`}>
            <Gauge className={`h-3.5 w-3.5 ${
              kitchen.complianceRate >= 90 ? 'text-emerald-500' :
              kitchen.complianceRate >= 70 ? 'text-amber-500' : 'text-red-500'
            }`} />
            <span className={`text-xs font-medium ${
              kitchen.complianceRate >= 90 
                ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                : kitchen.complianceRate >= 70 
                  ? isDark ? 'text-amber-400' : 'text-amber-600'
                  : 'text-red-500'
            }`}>
              {kitchen.complianceRate}% Compliant
            </span>
          </div>
        </div>

        {/* Right: Weather & Time */}
        <div className="flex items-center gap-2">
          {/* Last Sync */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isDark ? 'bg-gray-800/50' : 'bg-gray-50'
          }`}>
            <Zap className={`h-3 w-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Synced {syncText}
            </span>
          </div>

          {/* Divider */}
          <div className={`h-6 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

          {/* Dubai Weather */}
          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <span className="text-sm">{getConditionEmoji(weather.condition)}</span>
            <div className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {weather.temp}°C
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {weather.humidity}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className={`h-3.5 w-3.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {weather.wind} km/h
              </span>
            </div>
          </div>

          {/* Current Time */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isDark ? 'bg-gray-800/50' : 'bg-gray-50'
          }`}>
            <Clock className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-xs font-medium tabular-nums ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
