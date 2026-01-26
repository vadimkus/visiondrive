'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Thermometer,
  Bell,
  FileText,
  User,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Active sensors count - in production this would come from API/context
const ACTIVE_SENSORS = 5

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, href: '/kitchen-owner' },
  { id: 'sensors', label: 'Sensors', icon: Thermometer, href: '/kitchen-owner/sensors', sensorCount: ACTIVE_SENSORS },
  { id: 'alerts', label: 'Alerts', icon: Bell, href: '/kitchen-owner/alerts', badge: 1 },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/kitchen-owner/reports' },
  { id: 'profile', label: 'Profile', icon: User, href: '/kitchen-owner/settings' },
]

export default function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const isActive = (href: string) => {
    if (href === '/kitchen-owner') {
      return pathname === '/kitchen-owner'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50 
      md:hidden
      safe-area-inset-bottom
      ${isDark 
        ? 'bg-[#1d1d1f]/95 border-t border-gray-800' 
        : 'bg-white/95 border-t border-gray-200'
      }
      backdrop-blur-xl
    `}>
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[64px] py-2 px-3
                transition-all duration-200 ease-out
                active:scale-95
              `}
            >
              {/* Icon container */}
              <div className={`
                relative flex items-center justify-center
                w-7 h-7 mb-0.5
                transition-colors duration-200
              `}>
                <Icon 
                  className={`w-6 h-6 transition-colors duration-200 ${
                    active 
                      ? 'text-orange-500' 
                      : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                
                {/* Alert Badge (red) */}
                {item.badge && item.badge > 0 && (
                  <span className="
                    absolute -top-1 -right-1
                    min-w-[18px] h-[18px]
                    flex items-center justify-center
                    bg-red-500 text-white
                    text-[10px] font-bold
                    rounded-full
                    px-1
                  ">
                    {item.badge}
                  </span>
                )}
                
                {/* Sensor Count Badge (emerald) */}
                {'sensorCount' in item && item.sensorCount && item.sensorCount > 0 && (
                  <span className="
                    absolute -top-1 -right-1
                    min-w-[18px] h-[18px]
                    flex items-center justify-center
                    bg-emerald-500 text-white
                    text-[10px] font-bold
                    rounded-full
                    px-1
                  ">
                    {item.sensorCount}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={`
                text-[10px] font-medium
                transition-colors duration-200
                ${active 
                  ? 'text-orange-500' 
                  : isDark ? 'text-gray-500' : 'text-gray-400'
                }
              `}>
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {active && (
                <div className="
                  absolute -bottom-1
                  w-1 h-1 rounded-full
                  bg-orange-500
                " />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Home indicator area (for iPhones with notch) */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
