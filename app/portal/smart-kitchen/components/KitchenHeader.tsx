'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Wifi, WifiOff, Cloud, Droplets, Wind, Thermometer } from 'lucide-react'

interface WeatherData {
  temp: number
  humidity: number
  wind: number
  condition: string
}

export default function KitchenHeader() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 34,
    humidity: 42,
    wind: 11.6,
    condition: 'Pleasant'
  })
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Status indicators */}
          <div className="flex items-center gap-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-500">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>

            {/* Weather Pills */}
            <div className="hidden md:flex items-center gap-2">
              <WeatherPill 
                icon={Thermometer} 
                value={`${weather.temp}°`} 
                color="text-orange-600" 
                bg="bg-orange-50"
              />
              <WeatherPill 
                icon={Droplets} 
                value={`${weather.humidity}%`} 
                color="text-blue-600" 
                bg="bg-blue-50"
              />
              <WeatherPill 
                icon={Wind} 
                value={`${weather.wind} km/h`} 
                color="text-gray-600" 
                bg="bg-gray-100"
              />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                <Cloud className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">{weather.condition}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded-full hover:bg-[#2d2d2f] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function WeatherPill({ 
  icon: Icon, 
  value, 
  color, 
  bg 
}: { 
  icon: React.ElementType
  value: string
  color: string
  bg: string 
}) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 ${bg} rounded-full`}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{value}</span>
    </div>
  )
}
