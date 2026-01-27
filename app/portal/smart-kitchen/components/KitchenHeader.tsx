'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, Wifi, WifiOff } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { usePathname } from 'next/navigation'

export default function KitchenHeader() {
  const { isDark } = useTheme()
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/portal/smart-kitchen') return 'Dashboard'
    if (pathname?.includes('/kitchens/')) return 'Kitchen Details'
    if (pathname?.includes('/kitchens')) return 'Kitchens'
    if (pathname?.includes('/sensors/')) return 'Sensor Details'
    if (pathname?.includes('/sensors')) return 'Sensors'
    if (pathname?.includes('/alerts')) return 'Alerts'
    if (pathname?.includes('/reports')) return 'Reports'
    if (pathname?.includes('/compliance')) return 'Compliance'
    if (pathname?.includes('/settings')) return 'Settings'
    return 'Smart Kitchen'
  }

  return (
    <header className={`h-14 border-b sticky top-0 z-40 ${
      isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-[#f5f5f7] border-gray-200'
    }`}>
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isDark ? 'bg-white/5' : 'bg-white'
          }`}>
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input 
              type="text"
              placeholder="Search..."
              className={`bg-transparent text-sm w-40 outline-none ${
                isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'
              }`}
            />
            <kbd className={`text-[10px] px-1.5 py-0.5 rounded ${
              isDark ? 'bg-white/10 text-gray-500' : 'bg-gray-100 text-gray-400'
            }`}>⌘K</kbd>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Wifi className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <WifiOff className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              </>
            )}
          </div>

          {/* Notifications */}
          <button className={`relative p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-white'
          }`}>
            <Bell className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Time */}
          <div className={`text-sm font-medium tabular-nums ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
