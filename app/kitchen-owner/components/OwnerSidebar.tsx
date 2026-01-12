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
  ChefHat,
  Shield,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react'

const OWNER_DATA = {
  name: 'Abdul Rahman',
  email: 'abdul@kitchen.ae',
  kitchen: "Abdul's Kitchen",
  initial: 'A',
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/kitchen-owner' },
  { id: 'sensors', label: 'My Sensors', icon: Thermometer, href: '/kitchen-owner/sensors' },
  { id: 'alerts', label: 'Alerts', icon: Bell, href: '/kitchen-owner/alerts', badge: 1 },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/kitchen-owner/reports' },
  { id: 'compliance', label: 'DM Compliance', icon: Shield, href: '/kitchen-owner/compliance' },
]

const bottomNavItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/kitchen-owner/settings' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/kitchen-owner/help' },
]

export default function OwnerSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Smart Kitchen</h1>
            <p className="text-xs text-gray-500">Owner Portal</p>
          </div>
        </div>
        
        {/* Time */}
        <div className="mt-4 px-3 py-2.5 bg-gray-50 rounded-xl">
          <p className="text-2xl font-light text-gray-900 tabular-nums">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            <span className="text-sm text-gray-400 ml-1">
              {currentTime.toLocaleTimeString('en-US', { second: '2-digit' }).slice(-2)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : 'text-gray-400'}`} />
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
        <div className="my-4 border-t border-gray-100" />

        {/* Bottom Nav */}
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer - User & Actions */}
      <div className="p-3 border-t border-gray-100">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all mb-2"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-gray-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-400" />
          )}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
            {OWNER_DATA.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{OWNER_DATA.name}</p>
            <p className="text-xs text-gray-500 truncate">{OWNER_DATA.kitchen}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Compliance Badge */}
        <div className="mt-3 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">DM Compliant</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">DM-HSD-GU46-KFPA2</p>
        </div>
      </div>
    </aside>
  )
}
