'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid,
  Thermometer,
  Bell,
  Store,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
  Shield,
  Activity,
  Wifi,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
  badge?: number
}

interface Alert {
  id: string
  acknowledged: boolean
}

interface Kitchen {
  id: string
  alerts?: Alert[]
  sensorCount?: number
}

// Reusable NavButton component with Apple-like animations
function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
  isDark,
  badge,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
  isDark: boolean
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 ease-out
        ${active
          ? isDark 
            ? 'bg-orange-500/20 text-white' 
            : 'bg-orange-50 text-gray-900'
          : isDark 
            ? 'text-gray-400 hover:text-white hover:bg-white/5' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }
        hover:scale-[1.02] active:scale-[0.98]
      `}
    >
      {/* Icon with animation */}
      <div className={`
        relative transition-all duration-200
        ${active ? '' : 'group-hover:scale-110'}
      `}>
        <Icon className={`
          h-[18px] w-[18px] transition-colors duration-200
          ${active 
            ? 'text-orange-500' 
            : isDark 
              ? 'text-gray-500 group-hover:text-gray-300' 
              : 'text-gray-400 group-hover:text-gray-600'
          }
        `} strokeWidth={1.75} />
      </div>
      
      {/* Label with slide animation */}
      <span className={`
        flex-1 text-left transition-all duration-200
        ${active ? '' : 'group-hover:translate-x-0.5'}
      `}>
        {label}
      </span>
      
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center shadow-sm transition-transform duration-200 group-hover:scale-110">
          {badge}
        </span>
      )}
      
      {/* Active indicator bar */}
      {active && (
        <div className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full
          bg-orange-500
          transition-all duration-300
        `} />
      )}
    </button>
  )
}

export default function KitchenSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [alertCount, setAlertCount] = useState(0)
  const [sensorCount, setSensorCount] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)

  // Fetch active alerts count from API
  const fetchAlertCount = useCallback(async () => {
    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens')
      const data = await response.json()
      
      if (data.success && data.kitchens) {
        let totalAlerts = 0
        let totalSensors = 0
        
        // Fetch details for each kitchen to get alerts
        await Promise.all(
          data.kitchens.map(async (k: Kitchen) => {
            try {
              const detailResponse = await fetch(`/api/portal/smart-kitchen/kitchens/${k.id}`)
              const detailData = await detailResponse.json()
              if (detailData.success && detailData.kitchen) {
                // Count unacknowledged alerts
                const activeAlerts = (detailData.kitchen.alerts || []).filter((a: Alert) => !a.acknowledged)
                totalAlerts += activeAlerts.length
                totalSensors += detailData.kitchen.equipment?.length || 0
              }
            } catch {
              // Ignore errors for individual kitchens
            }
          })
        )
        
        setAlertCount(totalAlerts)
        setSensorCount(totalSensors)
        setOnlineCount(totalSensors) // Assume all online for now
      }
    } catch {
      // Ignore errors
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch {
        // ignore
      }
    }
    fetchUser()
    fetchAlertCount()
    
    // Refresh alert count every 30 seconds
    const alertInterval = setInterval(fetchAlertCount, 30000)
    return () => clearInterval(alertInterval)
  }, [fetchAlertCount])

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    router.push('/login')
  }

  const mainNav: NavItem[] = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/portal/smart-kitchen' },
    { icon: Store, label: 'Kitchens', path: '/portal/smart-kitchen/kitchens' },
    { icon: Thermometer, label: 'Sensors', path: '/portal/smart-kitchen/sensors' },
    { icon: Bell, label: 'Alerts', path: '/portal/smart-kitchen/alerts', badge: alertCount },
  ]

  const secondaryNav: NavItem[] = [
    { icon: BarChart3, label: 'Reports', path: '/portal/smart-kitchen/reports' },
    { icon: Shield, label: 'Compliance', path: '/portal/smart-kitchen/compliance' },
  ]

  const isActive = (path: string) => {
    if (path === '/portal/smart-kitchen') return pathname === path
    return pathname.startsWith(path)
  }

  if (!mounted) return null

  return (
    <aside className={`w-64 flex flex-col h-screen sticky top-0 select-none border-r transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-gray-800' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {/* VisionDrive Branding */}
        <div className="flex items-center gap-2.5 mb-3">
          <img 
            src="/images/logo/logo.jpg" 
            alt="VisionDrive" 
            className="h-8 w-8 object-contain rounded-lg"
          />
          <span className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Vision<span className="text-orange-500">Drive</span>
          </span>
        </div>
        
        {/* Smart Kitchen Label */}
        <div className={`px-3 py-2 rounded-xl ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
          <h1 className={`font-medium text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Smart Kitchen</h1>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admin Portal</p>
        </div>
        
        {/* Time */}
        <div className={`mt-3 px-3 py-2 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-xl font-light tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            <span className={`text-sm ml-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {currentTime.toLocaleTimeString('en-US', { second: '2-digit' }).slice(-2)}
            </span>
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className={`mx-4 my-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] ${
        sensorCount === 0 
          ? isDark ? 'bg-gray-800/50' : 'bg-gray-50'
          : isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${sensorCount === 0 ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse'}`} />
          <span className={`text-xs font-medium ${
            sensorCount === 0
              ? isDark ? 'text-gray-400' : 'text-gray-500'
              : isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            {sensorCount === 0 ? 'No Sensors Connected' : 'All Systems Operational'}
          </span>
        </div>
        <div className={`flex items-center gap-4 mt-2 text-[10px] ${
          sensorCount === 0
            ? isDark ? 'text-gray-500' : 'text-gray-400'
            : isDark ? 'text-emerald-500/70' : 'text-emerald-600/70'
        }`}>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> {onlineCount}/{sensorCount} online
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" /> {sensorCount > 0 ? '100%' : '—'} uptime
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Main Navigation */}
        <div className="mb-6">
          <p className={`px-3 mb-2 text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Monitor
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavButton
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={isActive(item.path)}
                onClick={() => router.push(item.path)}
                isDark={isDark}
                badge={item.badge}
              />
            ))}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="mb-6">
          <p className={`px-3 mb-2 text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Analytics
          </p>
          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <NavButton
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={isActive(item.path)}
                onClick={() => router.push(item.path)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <p className={`px-3 mb-2 text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            System
          </p>
          <div className="space-y-1">
            <NavButton
              icon={Settings}
              label="Settings"
              active={pathname?.includes('/settings') || false}
              onClick={() => router.push('/portal/smart-kitchen/settings')}
              isDark={isDark}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-2
            transition-all duration-200 ease-out
            hover:scale-[1.02] active:scale-[0.98]
            ${isDark 
              ? 'text-gray-400 hover:text-white hover:bg-white/5' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12">
            {isDark ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            )}
          </div>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* User */}
        {user && (
          <div className={`
            group flex items-center gap-3 px-3 py-2.5 rounded-xl
            transition-all duration-200
            ${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}
          `}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-transform duration-200 group-hover:scale-105">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user.name || user.email.split('@')[0]}
              </p>
              <p className={`text-[10px] truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className={`
                p-2 rounded-lg transition-all duration-200
                hover:scale-110 active:scale-95
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
              `}
              title="Sign Out"
            >
              <LogOut className={`h-4 w-4 transition-colors duration-200 ${isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </div>
        )}

        {/* Back Link */}
        <button
          onClick={() => router.push('/portal')}
          className={`
            group w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-xs
            transition-all duration-200
            hover:scale-[1.01] active:scale-[0.99]
            ${isDark ? 'text-gray-600 hover:text-gray-400 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
          `}
        >
          <ChevronLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">Back to Main Portal</span>
        </button>
      </div>
    </aside>
  )
}
