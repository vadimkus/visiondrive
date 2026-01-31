'use client'

import { useState, useEffect } from 'react'
import { 
  Wifi,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Users,
  Shield,
  Thermometer,
  MapPin,
  Building2,
  Plus,
  Search,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from './context/ThemeContext'

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  contactName: string | null
  contactPhone: string | null
  sensorCount: number
  ownerCount: number
  activeAlerts: number
  avgTemperature: number | null
  status: 'normal' | 'warning' | 'critical'
  createdAt: string
}

export default function KitchenOverview() {
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadKitchens = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens')
      const data = await response.json()
      
      if (data.success) {
        setKitchens(data.kitchens)
      } else {
        setError(data.error || 'Failed to load kitchens')
      }
    } catch (err) {
      console.error('Failed to load kitchens:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    loadKitchens()
  }, [])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => loadKitchens(), 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    loadKitchens()
  }

  // Calculate aggregate stats
  const totalKitchens = kitchens.length
  const totalSensors = kitchens.reduce((sum, k) => sum + k.sensorCount, 0)
  const totalAlerts = kitchens.reduce((sum, k) => sum + k.activeAlerts, 0)
  // Only count kitchens WITH sensors for compliance - no sensors = not monitored
  const monitoredKitchens = kitchens.filter(k => k.sensorCount > 0)
  const compliantKitchens = monitoredKitchens.filter(k => k.status === 'normal').length
  const complianceRate = monitoredKitchens.length > 0 
    ? Math.round((compliantKitchens / monitoredKitchens.length) * 100) 
    : 0 // No sensors = 0% compliance (not monitored)

  // Filter kitchens by search
  const filteredKitchens = kitchens.filter(k => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    not_monitored: 'bg-gray-400',
  }

  const statusText: Record<string, string> = {
    normal: 'Compliant',
    warning: 'Warning',
    critical: 'Critical',
    not_monitored: 'Not Monitored',
  }

  // Get effective status - no sensors means not monitored
  const getKitchenStatus = (kitchen: Kitchen) => {
    if (kitchen.sensorCount === 0) return 'not_monitored'
    return kitchen.status
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Kitchen Overview
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Manage and monitor all your kitchens
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Live
              </span>
            </div>
            <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className={`
                p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'}
                ${isLoading ? 'animate-spin' : ''}
              `}
            >
              <RefreshCw className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <Link
              href="/portal/smart-kitchen/kitchens"
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                ${isDark ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white'}
              `}
            >
              <Plus className="w-4 h-4" />
              Add Kitchen
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Kitchens"
            value={totalKitchens}
            subtitle={`${totalKitchens} monitored`}
            icon={Building2}
            iconBg="bg-blue-500"
            isDark={isDark}
          />
          <StatCard
            label="Total Sensors"
            value={totalSensors}
            subtitle="Active equipment"
            icon={Thermometer}
            iconBg="bg-emerald-500"
            isDark={isDark}
          />
          <StatCard
            label="Compliance Rate"
            value={totalSensors > 0 ? `${complianceRate}%` : '—'}
            subtitle={totalSensors > 0 
              ? `${compliantKitchens}/${monitoredKitchens.length} compliant` 
              : 'No sensors yet'}
            icon={Shield}
            iconBg={totalSensors === 0 ? 'bg-gray-400' : complianceRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'}
            isDark={isDark}
          />
          <StatCard
            label="Active Alerts"
            value={totalAlerts}
            subtitle={totalAlerts > 0 ? 'Action required' : 'All clear'}
            icon={AlertCircle}
            iconBg={totalAlerts > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
            isDark={isDark}
          />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search kitchens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all
              ${isDark 
                ? 'bg-[#1c1c1e] border-gray-800 text-white placeholder-gray-500 focus:ring-orange-500/20 focus:border-orange-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-orange-500/20 focus:border-orange-500'
              }
              border focus:outline-none focus:ring-2
            `}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${isDark ? 'bg-red-900/20 border border-red-800/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Kitchens List */}
        <div className={`rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Kitchens ({filteredKitchens.length})
            </h2>
            <Link 
              href="/portal/smart-kitchen/kitchens"
              className={`text-sm flex items-center gap-1 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Manage all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading kitchens...</p>
            </div>
          ) : filteredKitchens.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`mb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {searchQuery ? 'No kitchens match your search' : 'No kitchens found'}
              </p>
              {!searchQuery && (
                <Link
                  href="/portal/smart-kitchen/kitchens"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Kitchen
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredKitchens.map(kitchen => (
                <Link key={kitchen.id} href={`/portal/smart-kitchen/kitchens/${kitchen.id}`}>
                  <div className={`
                    p-5 transition-all cursor-pointer group
                    ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                  `}>
                    <div className="flex items-center gap-4">
                      {/* Kitchen Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
                        🍳
                      </div>
                      
                      {/* Kitchen Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold transition-colors ${isDark ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'}`}>
                            {kitchen.name}
                          </h3>
                          {(() => {
                            const status = getKitchenStatus(kitchen)
                            const statusStyles = {
                              normal: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
                              warning: isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700',
                              critical: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700',
                              not_monitored: isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500',
                            }
                            return (
                              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`} />
                                {statusText[status]}
                              </span>
                            )
                          })()}
                          {kitchen.activeAlerts > 0 && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                              <AlertTriangle className="h-3 w-3" />
                              {kitchen.activeAlerts} alert{kitchen.activeAlerts > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <MapPin className="h-3.5 w-3.5" />
                          {kitchen.address}, {kitchen.emirate}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-8">
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {kitchen.avgTemperature !== null ? `${kitchen.avgTemperature.toFixed(1)}°C` : '—'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Avg Temp</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {kitchen.sensorCount}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Equipment</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {kitchen.ownerCount}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Owners</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className={`h-5 w-5 flex-shrink-0 transition-colors ${isDark ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-300 group-hover:text-orange-500'}`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dubai Municipality Compliance Badge */}
        <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
          <Shield className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Dubai Municipality Compliant Temperature Monitoring
          </span>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  subtitle, 
  icon: Icon, 
  iconBg,
  isDark 
}: { 
  label: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconBg: string
  isDark?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        {subtitle && <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{subtitle}</p>}
      </div>
    </div>
  )
}
