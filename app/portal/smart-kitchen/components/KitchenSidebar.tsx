'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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

export default function KitchenSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

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
  }, [])

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

  const navItems: NavItem[] = [
    { icon: LayoutGrid, label: 'Overview', path: '/portal/smart-kitchen' },
    { icon: Store, label: 'Kitchens', path: '/portal/smart-kitchen/kitchens' },
    { icon: Thermometer, label: 'Sensors', path: '/portal/smart-kitchen/sensors' },
    { icon: Bell, label: 'Alerts', path: '/portal/smart-kitchen/alerts', badge: 1 },
    { icon: BarChart3, label: 'Reports', path: '/portal/smart-kitchen/reports' },
  ]

  const isActive = (path: string) => {
    if (path === '/portal/smart-kitchen') return pathname === path
    return pathname.startsWith(path)
  }

  if (!mounted) return null

  return (
    <aside className="w-72 bg-[#1d1d1f] text-white flex flex-col h-screen sticky top-0 select-none">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <span className="text-lg">🍳</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Smart Kitchen</h1>
            <p className="text-xs text-gray-400">Temperature Monitoring</p>
          </div>
        </div>

        {/* Clock */}
        <div className="bg-[#2d2d2f] rounded-2xl p-4 mb-2">
          <div className="text-center">
            <div className="text-3xl font-light tracking-wide text-white/90 font-mono">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
              <span className="text-lg text-white/40 ml-1">
                {currentTime.toLocaleTimeString('en-US', { second: '2-digit' }).slice(-2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-orange-400' : ''}`} strokeWidth={1.5} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-6 mx-4 border-t border-white/10" />

        {/* Settings */}
        <div className="space-y-1">
          <button
            onClick={() => router.push('/portal/smart-kitchen/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname.includes('/settings')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-3"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.email.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Back to Parking Portal */}
        <button
          onClick={() => router.push('/portal')}
          className="w-full flex items-center gap-2 px-4 py-2 mt-3 rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="h-3 w-3" />
          <span>Back to Parking Portal</span>
        </button>
      </div>
    </aside>
  )
}
