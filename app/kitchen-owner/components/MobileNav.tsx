'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="relative flex flex-col items-center justify-center min-w-[64px] py-2 px-3"
            >
              {/* Icon container */}
              <div className="relative flex items-center justify-center w-7 h-7 mb-0.5">
                <motion.div
                  animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-200 ${
                      active 
                        ? 'text-orange-500' 
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </motion.div>
                
                {/* Alert Badge (red) with animation */}
                <AnimatePresence>
                  {item.badge && item.badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="
                        absolute -top-1 -right-1
                        min-w-[18px] h-[18px]
                        flex items-center justify-center
                        bg-red-500 text-white
                        text-[10px] font-bold
                        rounded-full
                        px-1
                      "
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Sensor Count Badge (emerald) with animation */}
                <AnimatePresence>
                  {'sensorCount' in item && item.sensorCount && item.sensorCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="
                        absolute -top-1 -right-1
                        min-w-[18px] h-[18px]
                        flex items-center justify-center
                        bg-emerald-500 text-white
                        text-[10px] font-bold
                        rounded-full
                        px-1
                      "
                    >
                      {item.sensorCount}
                    </motion.span>
                  )}
                </AnimatePresence>
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
              <AnimatePresence>
                {active && (
                  <motion.div 
                    layoutId="activeIndicator"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
      
      {/* Home indicator area (for iPhones with notch) */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
