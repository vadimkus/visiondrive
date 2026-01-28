'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Wifi, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Gauge,
  Navigation,
  Sun,
  Sunrise,
  Sunset,
  Eye,
  CloudRain,
} from 'lucide-react'
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
  // Extended data
  feelsLike?: number
  tempMin?: number
  tempMax?: number
  humidityDescription?: string
  dewPoint?: number
  pressure?: number
  windDirection?: string
  windDirectionDegrees?: number
  windGusts?: number
  conditionDescription?: string
  uvIndex?: number
  uvLevel?: string
  uvAdvice?: string
  visibility?: number
  sunrise?: string
  sunset?: string
}

// Apple-style hover dropdown component
function WeatherDropdown({ 
  children, 
  content,
  isDark 
}: { 
  children: React.ReactNode
  content: React.ReactNode
  isDark: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      
      {/* Dropdown */}
      <div className={`
        absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
        transition-all duration-200 ease-out origin-top
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }
      `}>
        {/* Arrow */}
        <div className={`
          absolute -top-2 left-1/2 -translate-x-1/2 
          w-4 h-4 rotate-45
          ${isDark ? 'bg-[#2c2c2e]' : 'bg-white'}
          ${isDark ? '' : 'shadow-sm'}
        `} />
        
        {/* Content Card */}
        <div className={`
          relative min-w-[240px] p-4 rounded-2xl
          ${isDark 
            ? 'bg-[#2c2c2e] border border-gray-700/50' 
            : 'bg-white border border-gray-100 shadow-xl shadow-black/10'
          }
        `}>
          {content}
        </div>
      </div>
    </div>
  )
}

export default function OwnerHeader() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Fetch real weather data from API
  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch('/api/weather')
      if (response.ok) {
        const data = await response.json()
        setWeather(data)
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
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <RefreshCw className={`h-4 w-4 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</span>
          </div>
        ) : weather ? (
          <>
            {/* Temperature with Dropdown */}
            <WeatherDropdown 
              isDark={isDark}
              content={
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Temperature
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Feels Like</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.feelsLike}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>High</span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.tempMax}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Low</span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.tempMin}°C
                    </span>
                  </div>
                </div>
              }
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-default transition-all hover:shadow-md ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{weather.temp}°</span>
              </div>
            </WeatherDropdown>
            
            {/* Humidity with Dropdown */}
            <WeatherDropdown 
              isDark={isDark}
              content={
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Humidity
                    </span>
                  </div>
                  
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {weather.humidityDescription}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dew Point</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.dewPoint}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-gray-400" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pressure</span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.pressure} hPa
                    </span>
                  </div>
                </div>
              }
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-default transition-all hover:shadow-md ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{weather.humidity}%</span>
              </div>
            </WeatherDropdown>
            
            {/* Wind with Dropdown */}
            <WeatherDropdown 
              isDark={isDark}
              content={
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Wind className="h-5 w-5 text-cyan-500" />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Wind
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Navigation 
                        className="h-3.5 w-3.5 text-gray-400" 
                        style={{ transform: `rotate(${(weather.windDirectionDegrees || 0) + 180}deg)` }}
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Direction</span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.windDirection} ({weather.windDirectionDegrees}°)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Speed</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.wind} km/h
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gusts</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.windGusts} km/h
                    </span>
                  </div>
                </div>
              }
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-default transition-all hover:shadow-md ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <Wind className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{weather.wind} km/h</span>
              </div>
            </WeatherDropdown>
            
            {/* Condition with Dropdown */}
            <WeatherDropdown 
              isDark={isDark}
              content={
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xl">{getConditionEmoji(weather.condition)}</span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.condition}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {weather.conditionDescription}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-yellow-500" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>UV Index</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        (weather.uvIndex || 0) >= 8 ? 'text-red-500' :
                        (weather.uvIndex || 0) >= 6 ? 'text-orange-500' :
                        (weather.uvIndex || 0) >= 3 ? 'text-yellow-500' : 
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {weather.uvIndex} ({weather.uvLevel})
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {weather.uvAdvice}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-gray-400" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Visibility</span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {weather.visibility} km
                    </span>
                  </div>
                  
                  <div className={`pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sunrise className="h-3.5 w-3.5 text-orange-400" />
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sunrise</span>
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {weather.sunrise}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        <Sunset className="h-3.5 w-3.5 text-orange-500" />
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sunset</span>
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {weather.sunset}
                      </span>
                    </div>
                  </div>
                </div>
              }
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-default transition-all hover:shadow-md ${
                isDark ? 'bg-emerald-900/20 border-emerald-800 hover:bg-emerald-900/30' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <span className="text-base">{getConditionEmoji(weather.condition)}</span>
                <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{weather.condition}</span>
              </div>
            </WeatherDropdown>

            {/* Location indicator */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                📍 {weather.location}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}
