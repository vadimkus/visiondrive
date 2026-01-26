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
import { haptic } from '../hooks/useHaptic'

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

  const handleNavigation = (href: string) => {
    haptic('selection')
    router.push(href)
  }

  return (
    <nav 
      className={`
        fixed left-0 right-0 z-50 
        md:hidden
        ${isDark 
          ? 'bg-[#1d1d1f] border-t border-gray-800' 
          : 'bg-white border-t border-gray-200'
        }
      `}
      style={{
        bottom: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className="
                relative flex flex-col items-center justify-center
                min-w-[64px] py-1.5 px-3
                transition-transform duration-150
                active:scale-90
              "
            >
              {/* Icon container */}
              <div className={`
                relative flex items-center justify-center
                w-7 h-7 mb-0.5
                transition-transform duration-200
                ${active ? 'scale-110' : 'scale-100'}
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
              <div className={`
                absolute -bottom-0.5
                w-1 h-1 rounded-full
                bg-orange-500
                transition-all duration-200
                ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              `} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
