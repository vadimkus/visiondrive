'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldAlert,
  MapPin, 
  Activity, 
  Users, 
  BarChart3,
  FileText,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Globe,
  Gauge,
  Settings,
  ScrollText,
  ChefHat
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { LucideIcon } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId?: string | null
}

interface NavItem {
  icon: LucideIcon
  label: string
  path: string
  color: string
  bgColor: string
  adminOnly?: boolean
  masterOnly?: boolean
}

export default function PortalSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
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

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portal-sidebar-collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('portal-sidebar-collapsed', String(newState))
  }

  const isAdmin = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'CUSTOMER_ADMIN'
  const isMasterAdmin = user?.role === 'MASTER_ADMIN'

  const coreItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/portal', color: 'text-blue-700', bgColor: 'bg-blue-50' },
    { icon: ShieldAlert, label: 'Alerts', path: '/portal/alerts', color: 'text-orange-700', bgColor: 'bg-orange-50' },
    { icon: MapPin, label: 'Map', path: '/portal/map', color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: Activity, label: 'Events', path: '/portal/events', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: FileText, label: 'Replay', path: '/portal/replay', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ]

  // Your requested grouping (Special blocks + Reports)
  const reportsItems = [
    { icon: BarChart3, label: 'Sensor Reports', path: '/portal/reports/sensors', color: 'text-teal-700', bgColor: 'bg-teal-50' },
  ]

  const sensorsItems = [
    { icon: Users, label: 'Sensors', path: '/portal/sensors', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { icon: Gauge, label: 'Calibration', path: '/portal/calibration', color: 'text-pink-600', bgColor: 'bg-pink-50', adminOnly: true },
  ]

  const smartKitchenItems = [
    { icon: ChefHat, label: 'Smart Kitchen', path: '/portal/smart-kitchen', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ]

  const financeItems = [
    { icon: DollarSign, label: 'Finance', path: '/portal/admin/finance', color: 'text-green-700', bgColor: 'bg-green-50', masterOnly: true },
  ]

  const adminItems = [
    { icon: Settings, label: 'Admin', path: '/portal/admin', color: 'text-blue-600', bgColor: 'bg-blue-50', adminOnly: true },
    { icon: Settings, label: 'Settings', path: '/portal/settings', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: ScrollText, label: 'Audit Log', path: '/portal/admin/audit', color: 'text-purple-700', bgColor: 'bg-purple-50', adminOnly: true },
    { icon: Globe, label: 'Master View', path: '/portal/admin/tenants', color: 'text-blue-700', bgColor: 'bg-blue-50', masterOnly: true },
  ]

  const checkActive = (path: string) => {
    if (path === '/portal') return pathname === path
    // Exact match to avoid highlighting parent routes
    return pathname === path
  }

  const NavButton = (item: NavItem) => {
    const Icon = item.icon
    const isActive = checkActive(item.path)
    return (
      <button
        key={`${item.path}::${item.label}`}
        onClick={() => router.push(item.path)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
          isActive ? `${item.bgColor} ${item.color} shadow-sm` : 'text-gray-700 hover:bg-gray-50'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Keep icons colored even when not active (faster scanning) */}
        <Icon className={`h-6 w-6 flex-shrink-0 ${item.color}`} />
        {!isCollapsed && <span className="text-sm">{item.label}</span>}
      </button>
    )
  }

  const SectionTitle = ({ label }: { label: string }) =>
    isCollapsed ? null : (
      <div className="px-4 py-2 mt-4">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
    )

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } hidden lg:flex flex-col h-screen sticky top-0`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => router.push('/portal')}
          className={`flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {!logoFailed && logoUrl ? (
            <img
              src={logoUrl}
              alt="VisionDrive"
              className={`rounded-lg border border-gray-200 bg-white object-contain ${
                isCollapsed ? 'h-8 w-8' : 'h-9 w-9'
              }`}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className={`rounded-lg border border-gray-200 bg-white flex items-center justify-center ${
              isCollapsed ? 'h-8 w-8' : 'h-9 w-9'
            }`}>
              <span className="text-xs font-bold text-primary-700">VD</span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span>Vision<span className="text-primary-600">Drive</span></span>
              <span className="text-xs text-gray-500 font-normal ml-[30%]">Portal 🇦🇪</span>
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="flex items-center justify-end px-4 py-2 border-b border-gray-200">
        <button
          onClick={toggleCollapse}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Digital Clock */}
      {!isCollapsed && mounted && (
        <div className="mx-4 mt-4 mb-2 bg-white border-2 border-gray-300 rounded-xl px-4 py-3 shadow-sm">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900 tracking-wide mb-1">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="font-mono text-xs text-gray-600">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {coreItems.map(NavButton)}
        </div>

        {/* Finance */}
        {isMasterAdmin ? (
          <>
            <SectionTitle label="Finance" />
            <div className="space-y-1 px-2">{financeItems.map(NavButton)}</div>
          </>
        ) : null}

        {/* Reports */}
        <SectionTitle label="Report" />
        <div className="space-y-1 px-2">{reportsItems.map(NavButton)}</div>

        {/* Operations */}
        <SectionTitle label="Operations" />
        <div className="space-y-1 px-2">
          {sensorsItems
            .filter((i) => (i.adminOnly ? isAdmin : true))
            .map(NavButton)}
        </div>

        {/* Smart Kitchen */}
        <SectionTitle label="IoT Monitoring" />
        <div className="space-y-1 px-2">
          {smartKitchenItems.map(NavButton)}
        </div>

        {/* Admin */}
        {isAdmin ? (
          <>
            <SectionTitle label="Admin" />
            <div className="space-y-1 px-2">
              {adminItems
                .filter((i) => (i.masterOnly ? isMasterAdmin : true))
                .filter((i) => (i.adminOnly ? isAdmin : true))
                .map(NavButton)}
            </div>
          </>
        ) : null}
      </nav>
    </aside>
  )
}

