'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  CreditCard,
  ScrollText,
  Lock,
  Moon,
  Sun,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const OWNER_DATA = {
  name: 'Abdul Rahman',
  email: 'abdul@kitchen.ae',
  kitchen: "Abdul's Kitchen",
  initial: 'A',
  location: 'Dubai Marina',
}

const menuItems = [
  { id: 'compliance', label: 'DM Compliance', icon: Shield, href: '/kitchen-owner/compliance' },
  { id: 'subscription', label: 'Subscription', icon: CreditCard, href: '/kitchen-owner/subscription' },
  { id: 'terms', label: 'Terms of Service', icon: ScrollText, href: '/kitchen-owner/terms' },
  { id: 'privacy', label: 'Privacy Policy', icon: Lock, href: '/kitchen-owner/privacy' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/kitchen-owner/help' },
]

export default function MobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'portal=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login')
  }

  const getPageTitle = () => {
    if (pathname === '/kitchen-owner') return 'Dashboard'
    if (pathname?.includes('/sensors')) return 'My Sensors'
    if (pathname?.includes('/alerts')) return 'Alerts'
    if (pathname?.includes('/reports')) return 'Reports'
    if (pathname?.includes('/compliance')) return 'Compliance'
    if (pathname?.includes('/settings')) return 'Settings'
    if (pathname?.includes('/subscription')) return 'Subscription'
    if (pathname?.includes('/terms')) return 'Terms'
    if (pathname?.includes('/privacy')) return 'Privacy'
    if (pathname?.includes('/help')) return 'Help'
    return 'Smart Kitchen'
  }

  return (
    <>
      {/* Mobile Header */}
      <header className={`
        md:hidden
        sticky top-0 z-40
        px-4 py-3
        ${isDark 
          ? 'bg-[#1d1d1f]/95 border-b border-gray-800' 
          : 'bg-white/95 border-b border-gray-100'
        }
        backdrop-blur-xl
        safe-area-inset-top
      `}>
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo/logo.jpg" 
              alt="VisionDrive" 
              className="h-8 w-8 rounded-lg object-contain"
            />
            <div>
              <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`
              p-2 rounded-full
              transition-colors duration-200
              active:scale-95
              ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
          >
            <Menu className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
      </header>

      {/* Full-screen Menu Overlay - z-60 to be above bottom nav */}
      <div className={`
        fixed inset-0 z-[60]
        transition-all duration-300 ease-out
        md:hidden
        ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div 
          className={`
            absolute inset-0 bg-black/50
            transition-opacity duration-300
            ${isMenuOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel - Slides from right */}
        <div className={`
          absolute top-0 right-0 bottom-0
          w-[85%] max-w-[320px]
          ${isDark ? 'bg-[#1d1d1f]' : 'bg-white'}
          transition-transform duration-300 ease-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          safe-area-inset-top safe-area-inset-bottom
          flex flex-col
        `}>
          {/* Menu Header */}
          <div className={`px-5 pt-4 pb-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Menu
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`
                  p-2 -mr-2 rounded-full
                  transition-colors
                  ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                `}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
            
            {/* User Card */}
            <div className={`
              p-4 rounded-2xl
              ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}
            `}>
              <div className="flex items-center gap-3">
                <div className="
                  w-12 h-12 rounded-full
                  bg-gradient-to-br from-orange-400 to-red-500
                  flex items-center justify-center
                  text-white font-bold text-lg
                  shadow-lg shadow-orange-500/30
                ">
                  {OWNER_DATA.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {OWNER_DATA.name}
                  </p>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {OWNER_DATA.kitchen}
                  </p>
                </div>
              </div>
              
              {/* Compliance Badge */}
              <div className={`
                mt-3 px-3 py-2 rounded-xl
                flex items-center gap-2
                ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}
              `}>
                <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Dubai Municipality Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href)
                    setIsMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4
                    transition-colors
                    active:bg-gray-100 dark:active:bg-gray-800
                    ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl
                    flex items-center justify-center
                    ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
                  `}>
                    <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <span className={`flex-1 text-left font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </span>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className={`p-5 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                w-full flex items-center gap-4 px-4 py-3 mb-3
                rounded-xl
                transition-colors
                ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
              `}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-4 px-4 py-3
                rounded-xl
                transition-colors
                ${isDark ? 'bg-red-900/30 hover:bg-red-900/50' : 'bg-red-50 hover:bg-red-100'}
              `}
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
