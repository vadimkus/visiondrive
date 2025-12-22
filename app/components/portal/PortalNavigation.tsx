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
  Gauge
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

export default function PortalNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFailed, setLogoFailed] = useState(false)

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

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch('/api/images/logo', { credentials: 'include' })
        const json = await res.json().catch(() => ({}))
        if (json?.success && json?.image?.data) {
          setLogoUrl(String(json.image.data))
        }
      } catch {
        // ignore
      }
    }
    loadLogo()
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/')
    } catch {
      router.push('/')
    }
  }

  const isAdmin = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CUSTOMER_ADMIN'

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Full-width header so brand/logo stays left-aligned (matches dashboard references) */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/portal')}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {!logoFailed && logoUrl ? (
                <img
                  src={logoUrl}
                  alt="VisionDrive"
                  className="h-9 w-9 rounded-lg border border-gray-200 bg-white object-contain"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="h-9 w-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">VD</span>
                </div>
              )}
              <div className="flex flex-col items-start">
                <span>Vision<span className="text-primary-600">Drive</span></span>
                <span className="text-xs text-gray-500 font-normal ml-[30%]">Portal</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center" />

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="h-5 w-5" />
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

