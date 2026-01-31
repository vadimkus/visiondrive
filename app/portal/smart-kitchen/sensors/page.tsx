'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Thermometer, 
  Battery, 
  Signal, 
  Clock, 
  ChevronDown,
  ChevronRight,
  MapPin,
  Plus,
  RefreshCw,
  Building2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'

interface Equipment {
  id: string
  name: string
  type: string
  location: string | null
  currentTemp: number | null
  minTemp: number
  maxTemp: number
  status: string
  batteryLevel: number | null
  signalStrength: number | null
  lastReadingAt: string | null
}

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  equipment: Equipment[]
}

export default function SensorsPage() {
  const { isDark } = useTheme()
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedKitchens, setExpandedKitchens] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSensors()
    const interval = setInterval(loadSensors, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSensors = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens')
      const data = await response.json()
      
      if (data.success && data.kitchens) {
        // For each kitchen, fetch full details including equipment
        const kitchensWithEquipment = await Promise.all(
          data.kitchens.map(async (k: { id: string }) => {
            try {
              const detailResponse = await fetch(`/api/portal/smart-kitchen/kitchens/${k.id}`)
              const detailData = await detailResponse.json()
              if (detailData.success && detailData.kitchen) {
                return detailData.kitchen
              }
            } catch {
              // Return kitchen without equipment on error
            }
            return { ...k, equipment: [] }
          })
        )
        setKitchens(kitchensWithEquipment)
        
        // Auto-expand kitchens that have equipment
        const withEquipment = kitchensWithEquipment
          .filter((k: Kitchen) => k.equipment && k.equipment.length > 0)
          .map((k: Kitchen) => k.id)
        setExpandedKitchens(new Set(withEquipment))
      } else {
        setError(data.error || 'Failed to load kitchens')
      }
    } catch (err) {
      console.error('Failed to load sensors:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleKitchen = (kitchenId: string) => {
    setExpandedKitchens(prev => {
      const next = new Set(prev)
      if (next.has(kitchenId)) {
        next.delete(kitchenId)
      } else {
        next.add(kitchenId)
      }
      return next
    })
  }

  // Calculate totals
  const totalSensors = kitchens.reduce((sum, k) => sum + (k.equipment?.length || 0), 0)
  const onlineSensors = kitchens.reduce((sum, k) => 
    sum + (k.equipment?.filter(e => e.status === 'ACTIVE').length || 0), 0
  )

  // Filter kitchens by search
  const filteredKitchens = kitchens.filter(k => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.equipment?.some(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sensors
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Monitor temperature sensors by location
            </p>
          </div>
          <button
            onClick={loadSensors}
            disabled={isLoading}
            className={`
              p-2.5 rounded-xl transition-all
              ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'}
              ${isLoading ? 'animate-spin' : ''}
            `}
          >
            <RefreshCw className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Locations"
            value={kitchens.length}
            icon={MapPin}
            iconBg="bg-blue-500"
            isDark={isDark}
          />
          <StatCard
            label="Total Sensors"
            value={totalSensors}
            icon={Thermometer}
            iconBg={totalSensors > 0 ? 'bg-emerald-500' : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Online"
            value={onlineSensors}
            icon={Signal}
            iconBg={onlineSensors > 0 ? 'bg-emerald-500' : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Offline"
            value={totalSensors - onlineSensors}
            icon={AlertTriangle}
            iconBg={totalSensors - onlineSensors > 0 ? 'bg-amber-500' : 'bg-gray-400'}
            isDark={isDark}
          />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search locations or sensors..."
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

        {/* Locations List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading sensors...</p>
          </div>
        ) : filteredKitchens.length === 0 ? (
          <EmptyState isDark={isDark} hasSearch={searchQuery.length > 0} />
        ) : (
          <div className="space-y-3">
            {filteredKitchens.map(kitchen => (
              <LocationCard
                key={kitchen.id}
                kitchen={kitchen}
                isExpanded={expandedKitchens.has(kitchen.id)}
                onToggle={() => toggleKitchen(kitchen.id)}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {/* No Sensors Message */}
        {!isLoading && totalSensors === 0 && kitchens.length > 0 && (
          <div className={`mt-6 p-6 rounded-2xl text-center ${isDark ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-200'}`}>
            <Thermometer className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
            <h3 className={`font-semibold mb-1 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              No Sensors Registered
            </h3>
            <p className={`text-sm ${isDark ? 'text-amber-400/70' : 'text-amber-700'}`}>
              Add equipment with sensors to your kitchens to start monitoring temperatures.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  iconBg,
  isDark 
}: { 
  label: string
  value: number
  icon: React.ElementType
  iconBg: string
  isDark: boolean
}) {
  return (
    <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        </div>
      </div>
    </div>
  )
}

// Location Card with expandable sensors
function LocationCard({
  kitchen,
  isExpanded,
  onToggle,
  isDark
}: {
  kitchen: Kitchen
  isExpanded: boolean
  onToggle: () => void
  isDark: boolean
}) {
  const sensorCount = kitchen.equipment?.length || 0
  const hasSensors = sensorCount > 0

  return (
    <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      {/* Location Header */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-5
          transition-colors
          ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
            🍳
          </div>
          <div className="text-left">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {kitchen.name}
            </h3>
            <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <MapPin className="w-3.5 h-3.5" />
              {kitchen.address}, {kitchen.emirate}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {sensorCount}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {sensorCount === 1 ? 'sensor' : 'sensors'}
            </p>
          </div>
          {hasSensors ? (
            <ChevronDown className={`w-5 h-5 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'} ${isExpanded ? 'rotate-180' : ''}`} />
          ) : (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              No sensors
            </span>
          )}
        </div>
      </button>

      {/* Sensors List (Expandable) */}
      {isExpanded && hasSensors && (
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="p-3 space-y-2">
            {kitchen.equipment.map(sensor => (
              <SensorRow key={sensor.id} sensor={sensor} kitchenId={kitchen.id} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Add Sensor CTA for empty locations */}
      {isExpanded && !hasSensors && (
        <div className={`border-t p-4 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <Link 
            href={`/portal/smart-kitchen/kitchens/${kitchen.id}`}
            className={`
              flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium
              ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
              transition-colors
            `}
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </Link>
        </div>
      )}
    </div>
  )
}

// Sensor Row Component
function SensorRow({
  sensor,
  kitchenId,
  isDark
}: {
  sensor: Equipment
  kitchenId: string
  isDark: boolean
}) {
  const isOnline = sensor.status === 'ACTIVE'
  const isWithinRange = sensor.currentTemp !== null && 
    sensor.currentTemp >= sensor.minTemp && 
    sensor.currentTemp <= sensor.maxTemp
  
  const getTempColor = () => {
    if (sensor.currentTemp === null) return isDark ? 'text-gray-500' : 'text-gray-400'
    if (isWithinRange) return 'text-emerald-500'
    return 'text-red-500'
  }

  const getStatusBadge = () => {
    if (!isOnline) {
      return { bg: isDark ? 'bg-gray-800' : 'bg-gray-100', text: isDark ? 'text-gray-400' : 'text-gray-500', label: 'Offline' }
    }
    if (sensor.currentTemp === null) {
      return { bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50', text: isDark ? 'text-amber-400' : 'text-amber-600', label: 'No Data' }
    }
    if (isWithinRange) {
      return { bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50', text: isDark ? 'text-emerald-400' : 'text-emerald-600', label: 'Compliant' }
    }
    return { bg: isDark ? 'bg-red-900/30' : 'bg-red-50', text: isDark ? 'text-red-400' : 'text-red-600', label: 'Alert' }
  }

  const status = getStatusBadge()

  return (
    <Link href={`/portal/smart-kitchen/sensors/${sensor.id}`}>
      <div className={`
        flex items-center justify-between p-4 rounded-xl
        transition-all cursor-pointer group
        ${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          <div>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{sensor.name}</p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {sensor.type} • {sensor.location || 'No location'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Temperature */}
          <div className="text-right">
            <p className={`text-lg font-semibold ${getTempColor()}`}>
              {sensor.currentTemp !== null ? `${sensor.currentTemp.toFixed(1)}°C` : '—'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {sensor.minTemp}° - {sensor.maxTemp}°
            </p>
          </div>

          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>

          {/* Battery & Signal */}
          {sensor.batteryLevel !== null && (
            <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Battery className="w-3.5 h-3.5" />
              {sensor.batteryLevel}%
            </div>
          )}

          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-300'} group-hover:text-orange-500 transition-colors`} />
        </div>
      </div>
    </Link>
  )
}

// Empty State Component
function EmptyState({ isDark, hasSearch }: { isDark: boolean; hasSearch: boolean }) {
  return (
    <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <Building2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {hasSearch ? 'No Results Found' : 'No Locations Yet'}
      </h3>
      <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        {hasSearch 
          ? 'Try adjusting your search query'
          : 'Add kitchens to start monitoring sensors'
        }
      </p>
      {!hasSearch && (
        <Link
          href="/portal/smart-kitchen/kitchens"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Kitchen
        </Link>
      )}
    </div>
  )
}
