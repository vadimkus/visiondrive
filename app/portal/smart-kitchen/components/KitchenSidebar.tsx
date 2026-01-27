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
  CreditCard,
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

export default function KitchenSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
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
    { icon: Bell, label: 'Alerts', path: '/portal/smart-kitchen/alerts', badge: 3 },
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
    <aside className={`w-64 flex flex-col h-screen sticky top-0 select-none border-r ${
      isDark ? 'bg-[#1c1c1e] border-gray-800' : 'bg-white border-gray-200'
    }`}>
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <span className="text-base">🍳</span>
          </div>
          <div>
            <h1 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Smart Kitchen</h1>
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Admin Portal</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className={`mx-4 mb-4 p-3 rounded-xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>All Systems Operational</span>
        </div>
        <div className={`flex items-center gap-4 mt-2 text-[10px] ${isDark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`}>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> 27/35 online
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" /> 99.9% uptime
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
          <div className="space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    active
                      ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? 'text-orange-500' : ''}`} strokeWidth={1.75} />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                      isDark ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="mb-6">
          <p className={`px-3 mb-2 text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Analytics
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    active
                      ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? 'text-orange-500' : ''}`} strokeWidth={1.75} />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings */}
        <div>
          <p className={`px-3 mb-2 text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            System
          </p>
          <div className="space-y-0.5">
            <button
              onClick={() => router.push('/portal/smart-kitchen/settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                pathname.includes('/settings')
                  ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span className="flex-1 text-left font-medium">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all mb-2 ${
            isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User */}
        {user && (
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
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
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-white/5' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Back Link */}
        <button
          onClick={() => router.push('/portal')}
          className={`w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-xs transition-all ${
            isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ChevronLeft className="h-3 w-3" />
          <span>Back to Main Portal</span>
        </button>
      </div>
    </aside>
  )
}
