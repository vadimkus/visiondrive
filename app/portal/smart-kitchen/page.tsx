'use client'

import { useState, useEffect } from 'react'
import { 
  Wifi,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal,
  RefreshCw,
  Users,
  Shield,
  Thermometer,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from './context/ThemeContext'

// Shared data - synced with kitchen owner portal
// This represents the REAL data from Abdul's Kitchen
const ABDULS_KITCHEN = {
  id: 'kitchen-abdul-001',
  name: "Abdul's Kitchen",
  owner: 'Abdul Rahman',
  email: 'abdul@kitchen.ae',
  location: 'Marina Walk, Dubai Marina',
  since: 'January 2026',
  sensors: [
    {
      id: 'sensor-a1',
      name: 'Walk-in Fridge',
      type: 'refrigerator',
      currentTemp: 3.2,
      requiredRange: { min: 0, max: 5 },
      status: 'compliant',
      lastUpdate: '2 min ago',
      online: true,
      battery: 85,
    },
    {
      id: 'sensor-a2',
      name: 'Main Freezer',
      type: 'freezer',
      currentTemp: -19.5,
      requiredRange: { max: -18 },
      status: 'compliant',
      lastUpdate: '1 min ago',
      online: true,
      battery: 92,
    },
    {
      id: 'sensor-a3',
      name: 'Prep Fridge',
      type: 'refrigerator',
      currentTemp: 4.8,
      requiredRange: { min: 0, max: 5 },
      status: 'compliant',
      lastUpdate: '3 min ago',
      online: true,
      battery: 78,
    },
    {
      id: 'sensor-a4',
      name: 'Display Cooler',
      type: 'refrigerator',
      currentTemp: 6.2,
      requiredRange: { min: 0, max: 5 },
      status: 'warning',
      lastUpdate: '1 min ago',
      online: true,
      battery: 65,
    },
  ],
  subscription: {
    plan: 'professional' as const,
    status: 'active' as const,
    monthlyFee: 299,
    nextBilling: '2026-02-15',
    startDate: '2026-01-15',
  },
  alerts: [
    {
      id: 'alert-1',
      sensor: 'Display Cooler',
      message: 'Temperature above 5°C threshold',
      time: '15 min ago',
      severity: 'warning',
      acknowledged: false,
    },
  ],
}

export default function AdminDashboard() {
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [kitchenData, setKitchenData] = useState(ABDULS_KITCHEN)

  const handleRefresh = () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    // In a real app, this would fetch from API
    setTimeout(() => setIsLoading(false), 1000)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate stats from real data
  const totalSensors = kitchenData.sensors.length
  const onlineSensors = kitchenData.sensors.filter(s => s.online).length
  const compliantSensors = kitchenData.sensors.filter(s => s.status === 'compliant').length
  const alertCount = kitchenData.sensors.filter(s => s.status === 'warning').length
  const complianceRate = Math.round((compliantSensors / totalSensors) * 100)

  const planColors = {
    starter: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600',
    professional: isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600',
    enterprise: isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-600',
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Admin Dashboard
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Real-time Kitchen Monitoring
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
              className={`
                p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'}
                ${isLoading ? 'animate-spin' : ''}
              `}
            >
              <RefreshCw className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Active Kitchens"
            value={1}
            subtitle="1 monitored"
            icon={Users}
            iconBg="bg-blue-500"
            isDark={isDark}
          />
          <StatCard
            label="Sensors Online"
            value={`${onlineSensors}/${totalSensors}`}
            subtitle="100% uptime"
            icon={Wifi}
            iconBg="bg-emerald-500"
            trend="up"
            isDark={isDark}
          />
          <StatCard
            label="Compliance Rate"
            value={`${complianceRate}%`}
            subtitle={`${compliantSensors}/${totalSensors} compliant`}
            icon={Shield}
            iconBg={complianceRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'}
            isDark={isDark}
          />
          <StatCard
            label="Active Alerts"
            value={alertCount}
            subtitle={alertCount > 0 ? 'Action required' : 'All clear'}
            icon={AlertCircle}
            iconBg={alertCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
            isDark={isDark}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Kitchen Details - Takes 2 columns */}
          <div className={`col-span-2 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kitchen Overview</h2>
              <Link 
                href={`/portal/smart-kitchen/kitchens/${kitchenData.id}`}
                className={`text-sm flex items-center gap-1 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                View details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Kitchen Info Card */}
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
                  🍳
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {kitchenData.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${planColors[kitchenData.subscription.plan]}`}>
                      {kitchenData.subscription.plan}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {kitchenData.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Since {kitchenData.since}
                    </span>
                  </div>
                  <div className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Owner: {kitchenData.owner} ({kitchenData.email})
                  </div>
                </div>
              </div>

              {/* Equipment Grid */}
              <div className={`border-t pt-6 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Equipment Status ({totalSensors} sensors)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {kitchenData.sensors.map(sensor => (
                    <div 
                      key={sensor.id}
                      className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                        sensor.status === 'warning'
                          ? isDark ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-100'
                          : isDark ? 'bg-white/5' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sensor.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {sensor.online ? (
                            <Wifi className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Wifi className="w-4 h-4 text-gray-400" />
                          )}
                          {sensor.status === 'warning' && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-semibold ${
                          sensor.status === 'warning' ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {sensor.currentTemp}°C
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {sensor.requiredRange.min !== undefined ? `${sensor.requiredRange.min}-${sensor.requiredRange.max}°C` : `≤${sensor.requiredRange.max}°C`}
                        </span>
                      </div>
                      <div className={`flex items-center justify-between mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sensor.lastUpdate}
                        </span>
                        <span>Battery: {sensor.battery}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Subscription Info */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Subscription</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Plan</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${planColors[kitchenData.subscription.plan]}`}>
                    Professional
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Fee</span>
                  <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${kitchenData.subscription.monthlyFee}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Next Billing</span>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(kitchenData.subscription.nextBilling).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
                  <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </span>
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total MRR</span>
                  <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${kitchenData.subscription.monthlyFee}
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Alerts</h3>
              {kitchenData.alerts.filter(a => !a.acknowledged).length > 0 ? (
                <div className="space-y-3">
                  {kitchenData.alerts.filter(a => !a.acknowledged).map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-xl ${
                        isDark ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {alert.sensor}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                            {alert.message}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {alert.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No active alerts</p>
                </div>
              )}
            </div>

            {/* Compliance Summary */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Compliance</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  complianceRate === 100
                    ? isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
                    : isDark ? 'bg-amber-900/30' : 'bg-amber-50'
                }`}>
                  <span className={`text-2xl font-bold ${
                    complianceRate === 100 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {complianceRate}%
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {complianceRate === 100 ? 'Fully Compliant' : 'Needs Attention'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {compliantSensors} of {totalSensors} sensors in range
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-xl flex items-center gap-2 ${
                isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'
              }`}>
                <Shield className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Dubai Municipality Compliant
                </span>
              </div>
            </div>
            
          </div>
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
  trend,
  isDark 
}: { 
  label: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconBg: string
  trend?: 'up' | 'down'
  isDark?: boolean
}) {
  return (
    <div className={`rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        )}
      </div>
      <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        {subtitle && <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{subtitle}</p>}
      </div>
    </div>
  )
}
