'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Thermometer,
  Bell,
  FileText,
  Settings,
  LogOut,
  Shield,
  HelpCircle,
  Moon,
  Sun,
  Lock,
  CreditCard,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const OWNER_DATA = {
  name: 'Abdul Rahman',
  email: 'abdul@kitchen.ae',
  kitchen: "Abdul's Kitchen",
  initial: 'A',
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/kitchen-owner' },
  { id: 'sensors', label: 'My Equipment', icon: Thermometer, href: '/kitchen-owner/sensors' },
  { id: 'alerts', label: 'Alerts', icon: Bell, href: '/kitchen-owner/alerts', badge: 1 },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/kitchen-owner/reports' },
  { id: 'compliance', label: 'DM Compliance', icon: Shield, href: '/kitchen-owner/compliance' },
]

const bottomNavItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/kitchen-owner/settings' },
  { id: 'subscription', label: 'Subscription', icon: CreditCard, href: '/kitchen-owner/subscription' },
  { id: 'privacy', label: 'Privacy', icon: Lock, href: '/kitchen-owner/privacy' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/kitchen-owner/help' },
]

export default function OwnerSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'portal=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/kitchen-owner') {
      return pathname === '/kitchen-owner'
    }
    return pathname?.startsWith(href)
  }

  const isDark = theme === 'dark'

  return (
    <aside className={`w-56 flex flex-col h-screen sticky top-0 transition-colors duration-300 ${
      isDark ? 'bg-[#1d1d1f] border-r border-gray-800' : 'bg-white border-r border-gray-200'
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
        <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
          <h1 className={`font-medium text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Smart Kitchen</h1>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Owner Portal</p>
        </div>
        
        {/* Time */}
        <div className={`mt-3 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
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

      {/* Main Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                    : isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className={`my-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`} />

        {/* Bottom Nav */}
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                    : isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-2 ${
            isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-400" />
          )}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* User Info */}
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-md flex items-center justify-center text-white font-semibold text-sm">
            {OWNER_DATA.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{OWNER_DATA.name}</p>
            <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{OWNER_DATA.kitchen}</p>
          </div>
          <button
            onClick={handleLogout}
            className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Sign Out"
          >
            <LogOut className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Compliance Badge */}
        <div className={`mt-2 px-3 py-2 rounded-md border ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>DM Compliant</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
