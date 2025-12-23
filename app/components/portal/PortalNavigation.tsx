'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  MapPin, 
  Activity, 
  Settings, 
  Users, 
  BarChart3,
  ShieldAlert,
  FileText,
  Network,
  LogOut,
  User,
  DollarSign,
  Gauge,
  Languages,
  ChevronDown,
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  Leaf,
  Radio,
  Shield
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

interface TelemetryData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  pm25: number
  co2: number
}

export default function PortalNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [language, setLanguage] = useState<'EN' | 'AR'>('EN')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    temperature: 34,
    humidity: 42,
    windSpeed: 12,
    windDirection: 'NW',
    pm25: 12,
    co2: 420,
  })

  useEffect(() => {
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false)
      }
    }
    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageMenuOpen])

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('portal-language') as 'EN' | 'AR' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Simulate real-time telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 2),
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        pm25: Math.max(0, prev.pm25 + (Math.random() - 0.5) * 3),
        co2: Math.max(400, prev.co2 + (Math.random() - 0.5) * 10),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLanguageChange = (lang: 'EN' | 'AR') => {
    setLanguage(lang)
    localStorage.setItem('portal-language', lang)
    setIsLanguageMenuOpen(false)
    // TODO: Implement actual language change logic here
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/')
    } catch {
      router.push('/')
    }
  }

  const isAdmin = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CUSTOMER_ADMIN'

  // Color coding for air quality
  const getPM25Status = (value: number) => {
    if (value <= 12) return 'text-green-600'
    if (value <= 35) return 'text-yellow-600'
    if (value <= 55) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCO2Status = (value: number) => {
    if (value <= 450) return 'text-green-600'
    if (value <= 700) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const windDirectionMap: { [key: string]: number } = {
    N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Full-width header so brand/logo stays left-aligned (matches dashboard references) */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Live Indicator + Telemetry Data */}
          <div className="flex items-center gap-3 flex-1">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <div className="relative">
                <Radio className="h-3 w-3 text-green-600" />
                <span className="absolute inset-0 animate-ping">
                  <Radio className="h-3 w-3 text-green-600 opacity-75" />
                </span>
              </div>
              <span className="text-[9px] font-mono font-semibold text-green-600 uppercase tracking-wider hidden sm:inline">
                LIVE
              </span>
            </div>

            {/* Compact Telemetry Data */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Temperature */}
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                <Thermometer className="h-3 w-3 text-blue-600" />
                <span className="font-mono text-xs font-bold text-blue-700">
                  {telemetry.temperature.toFixed(1)}°C
                </span>
              </div>

              {/* Humidity */}
              <div className="flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded border border-cyan-100">
                <Droplets className="h-3 w-3 text-cyan-600" />
                <span className="font-mono text-xs font-bold text-cyan-700">
                  {telemetry.humidity.toFixed(0)}%
                </span>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                <Wind 
                  className="h-3 w-3 text-indigo-600 transition-transform duration-500" 
                  style={{ transform: `rotate(${windDirectionMap[telemetry.windDirection] || 0}deg)` }}
                />
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {telemetry.windDirection} {telemetry.windSpeed.toFixed(0)}
                </span>
              </div>

              {/* PM2.5 */}
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100">
                <Leaf className="h-3 w-3 text-green-600" />
                <span className={`font-mono text-xs font-bold ${getPM25Status(telemetry.pm25)}`}>
                  PM2.5: {telemetry.pm25.toFixed(0)}
                </span>
              </div>

              {/* CO2 */}
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                <Cloud className="h-3 w-3 text-gray-600" />
                <span className={`font-mono text-xs font-bold ${getCO2Status(telemetry.co2)}`}>
                  {telemetry.co2.toFixed(0)} ppm
                </span>
              </div>
            </div>
          </div>

          {/* User Menu & Language Toggle */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span>{language}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => handleLanguageChange('EN')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      language === 'EN' ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'EN' && <span className="text-primary-600">✓</span>}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('AR')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                      language === 'AR' ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                    }`}
                  >
                    <span>العربية</span>
                    {language === 'AR' && <span className="text-primary-600">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className={`h-5 w-5 ${isAdmin ? 'text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{user?.name || user?.email || 'User'}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      router.push('/portal/settings')
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Shows sidebar items */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - Includes sidebar items */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-1">
              {/* Sidebar items for mobile */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Core</p>
                {[
                  { icon: ShieldAlert, label: 'Alerts', path: '/portal/alerts', color: 'text-orange-600' },
                  { icon: MapPin, label: 'Map', path: '/portal/map', color: 'text-green-600' },
                  { icon: Activity, label: 'Events', path: '/portal/events', color: 'text-purple-600' },
                  { icon: FileText, label: 'Replay', path: '/portal/replay', color: 'text-amber-600' },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path || (item.path !== '/portal' && pathname?.startsWith(item.path))
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? item.color : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}

                {user?.role === 'MASTER_ADMIN' ? (
                  <>
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Finance</p>
                    <button
                      onClick={() => {
                        router.push('/portal/admin/finance')
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        pathname?.startsWith('/portal/admin/finance') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <span>Finance</span>
                    </button>
                  </>
                ) : null}

                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Reports</p>
                {[
                  { icon: BarChart3, label: 'Sensor Reports', path: '/portal/reports/sensors', color: 'text-teal-600' },
                  { icon: Network, label: 'Gateway Reports', path: '/portal/reports/gateways', color: 'text-slate-700' },
                  { icon: Network, label: 'Network Overview', path: '/portal/reports/network', color: 'text-gray-700' },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path || pathname?.startsWith(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? item.color : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}

                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Operations</p>
                {[
                  { icon: Users, label: 'Sensors', path: '/portal/sensors', color: 'text-indigo-600' },
                  { icon: Gauge, label: 'Calibration', path: '/portal/calibration', color: 'text-pink-600', adminOnly: true },
                ]
                  .filter((i) => (!i.adminOnly ? true : isAdmin))
                  .map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path || pathname?.startsWith(item.path)
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          router.push(item.path)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${isActive ? item.color : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}

                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Network</p>
                <button
                  onClick={() => {
                    router.push('/portal/reports/network')
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    pathname?.startsWith('/portal/reports/network') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Network className="h-6 w-6 text-gray-700" />
                  <span>Network</span>
                </button>
              </div>

              <div className="pt-2 border-t border-gray-200 mt-2">
                <button
                  onClick={() => {
                    router.push('/portal/settings')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-6 w-6 text-gray-500" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

