'use client'

import { useState, useEffect, useCallback } from 'react'
import { Thermometer, Droplets, Wind, Wifi, RefreshCw } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Weather condition to emoji mapping
const getConditionEmoji = (condition: string): string => {
  const emojiMap: Record<string, string> = {
    'Pleasant': '☀️',
    'Sunny': '☀️',
    'Clear': '🌙',
    'Mostly Clear': '🌤️',
    'Hot': '🔥',
    'Very Hot': '🥵',
    'Warm': '🌤️',
    'Cloudy': '☁️',
    'Partly Cloudy': '⛅',
    'Overcast': '🌥️',
    'Humid': '💧',
    'Windy': '💨',
    'Foggy': '🌫️',
    'Dusty': '🌫️',
    'Sandstorm': '🏜️',
    'Rainy': '🌧️',
    'Showers': '🌦️',
    'Drizzle': '🌧️',
    'Thunderstorm': '⛈️',
    'Stormy': '⛈️',
    'Cool': '🌬️',
    'Cold': '❄️',
    'Snowy': '❄️',
  }
  return emojiMap[condition] || '🌡️'
}

interface WeatherData {
  temp: number
  humidity: number
  wind: number
  condition: string
  location: string
  timestamp: string
  fallback?: boolean
}

export default function OwnerHeader() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Fetch real weather data from API
  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch('/api/weather')
      if (response.ok) {
        const data = await response.json()
        setWeather(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Initial fetch and periodic updates
  useEffect(() => {
    fetchWeather()
    
    // Update weather every 5 minutes (real-time but not too frequent)
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchWeather])

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
        
        {isLoading ? (
          // Loading state
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <RefreshCw className={`h-4 w-4 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading weather...</span>
          </div>
        ) : weather ? (
          <>
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
              <span className="text-base">{getConditionEmoji(weather.condition)}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{weather.condition}</span>
            </div>

            {/* Location indicator */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                📍 {weather.location}
              </span>
              {weather.fallback && (
                <span className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>(cached)</span>
              )}
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}
