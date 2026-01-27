'use client'

import { useState, useEffect } from 'react'
import { 
  Wifi,
  WifiOff,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Thermometer,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from './context/ThemeContext'

// Types
interface Kitchen {
  id: string
  name: string
  owner: string
  location: string
  sensors: {
    total: number
    online: number
    alerts: number
  }
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise'
    status: 'active' | 'past_due' | 'cancelled'
    monthlyFee: number
    nextBilling: string
  }
  compliance: number
  lastActivity: string
}

interface DashboardStats {
  totalKitchens: number
  activeKitchens: number
  totalSensors: number
  onlineSensors: number
  monthlyRevenue: number
  revenueChange: number
  alertsToday: number
  avgCompliance: number
}

// Mock data
const mockKitchens: Kitchen[] = [
  {
    id: 'k1',
    name: "Abdul's Kitchen",
    owner: 'Abdul Rahman',
    location: 'Dubai Marina',
    sensors: { total: 5, online: 5, alerts: 1 },
    subscription: { plan: 'professional', status: 'active', monthlyFee: 299, nextBilling: '2026-02-15' },
    compliance: 80,
    lastActivity: '2 min ago'
  },
  {
    id: 'k2',
    name: 'Marina Bistro',
    owner: 'Sarah Ahmed',
    location: 'JBR Walk',
    sensors: { total: 8, online: 8, alerts: 0 },
    subscription: { plan: 'enterprise', status: 'active', monthlyFee: 599, nextBilling: '2026-02-01' },
    compliance: 100,
    lastActivity: '1 min ago'
  },
  {
    id: 'k3',
    name: 'Cloud Kitchen Hub',
    owner: 'Mohammed Ali',
    location: 'Business Bay',
    sensors: { total: 12, online: 10, alerts: 2 },
    subscription: { plan: 'enterprise', status: 'past_due', monthlyFee: 599, nextBilling: '2026-01-20' },
    compliance: 67,
    lastActivity: '5 min ago'
  },
  {
    id: 'k4',
    name: 'Fresh Bites',
    owner: 'Fatima Hassan',
    location: 'Downtown Dubai',
    sensors: { total: 4, online: 4, alerts: 0 },
    subscription: { plan: 'starter', status: 'active', monthlyFee: 149, nextBilling: '2026-02-10' },
    compliance: 100,
    lastActivity: '30 sec ago'
  },
  {
    id: 'k5',
    name: 'Spice Route',
    owner: 'Raj Patel',
    location: 'DIFC',
    sensors: { total: 6, online: 0, alerts: 0 },
    subscription: { plan: 'professional', status: 'cancelled', monthlyFee: 0, nextBilling: '-' },
    compliance: 0,
    lastActivity: '3 days ago'
  },
]

const mockStats: DashboardStats = {
  totalKitchens: 5,
  activeKitchens: 4,
  totalSensors: 35,
  onlineSensors: 27,
  monthlyRevenue: 1646,
  revenueChange: 12.5,
  alertsToday: 3,
  avgCompliance: 87,
}

export default function AdminDashboard() {
  const { isDark } = useTheme()
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [kitchens, setKitchens] = useState<Kitchen[]>(mockKitchens)
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = () => {
    setIsLoading(true)
    setLastRefresh(new Date())
    setTimeout(() => setIsLoading(false), 1000)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const planColors = {
    starter: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600',
    professional: isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600',
    enterprise: isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-600',
  }

  const statusColors = {
    active: isDark ? 'text-emerald-400' : 'text-emerald-600',
    past_due: isDark ? 'text-amber-400' : 'text-amber-600',
    cancelled: isDark ? 'text-gray-500' : 'text-gray-400',
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
              Kitchen Equipment & Revenue Overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button 
              onClick={handleRefresh}
              className={`
                p-2 rounded-xl transition-all
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'}
                ${isLoading ? 'animate-spin' : ''}
              `}
            >
              <RefreshCw className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid - Apple-like cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Kitchens"
            value={stats.totalKitchens}
            subtitle={`${stats.activeKitchens} active`}
            icon={Users}
            iconBg="bg-blue-500"
            isDark={isDark}
          />
          <StatCard
            label="Sensors Online"
            value={`${stats.onlineSensors}/${stats.totalSensors}`}
            subtitle={`${Math.round((stats.onlineSensors / stats.totalSensors) * 100)}% uptime`}
            icon={Wifi}
            iconBg="bg-emerald-500"
            trend={stats.onlineSensors === stats.totalSensors ? 'up' : undefined}
            isDark={isDark}
          />
          <StatCard
            label="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle={`${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% vs last month`}
            icon={DollarSign}
            iconBg="bg-purple-500"
            trend={stats.revenueChange > 0 ? 'up' : 'down'}
            isDark={isDark}
          />
          <StatCard
            label="Alerts Today"
            value={stats.alertsToday}
            subtitle={stats.alertsToday > 0 ? 'Action required' : 'All clear'}
            icon={AlertCircle}
            iconBg={stats.alertsToday > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
            isDark={isDark}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Kitchens List - Takes 2 columns */}
          <div className={`col-span-2 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kitchen Overview</h2>
              <Link 
                href="/portal/smart-kitchen/kitchens" 
                className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Table Header */}
            <div className={`grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-500 bg-black/20' : 'text-gray-400 bg-gray-50'}`}>
              <div className="col-span-3">Kitchen</div>
              <div className="col-span-2">Equipment</div>
              <div className="col-span-2">Compliance</div>
              <div className="col-span-2">Subscription</div>
              <div className="col-span-2">Revenue</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Table Body */}
            <div className={`divide-y ${isDark ? 'divide-gray-800/50' : 'divide-gray-100'}`}>
              {kitchens.map(kitchen => (
                <div 
                  key={kitchen.id} 
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                  {/* Kitchen Info */}
                  <div className="col-span-3">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{kitchen.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{kitchen.location}</p>
                  </div>
                  
                  {/* Equipment Status */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {kitchen.sensors.online === kitchen.sensors.total ? (
                        <Wifi className="w-4 h-4 text-emerald-500" />
                      ) : kitchen.sensors.online > 0 ? (
                        <Wifi className="w-4 h-4 text-amber-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {kitchen.sensors.online}/{kitchen.sensors.total}
                      </span>
                      {kitchen.sensors.alerts > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                          {kitchen.sensors.alerts}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Compliance */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-full rounded-full ${
                            kitchen.compliance >= 90 ? 'bg-emerald-500' :
                            kitchen.compliance >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${kitchen.compliance}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        kitchen.compliance >= 90 ? 'text-emerald-500' :
                        kitchen.compliance >= 70 ? 'text-amber-500' :
                        kitchen.compliance > 0 ? 'text-red-500' : (isDark ? 'text-gray-600' : 'text-gray-400')
                      }`}>
                        {kitchen.compliance}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Subscription */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${planColors[kitchen.subscription.plan]}`}>
                        {kitchen.subscription.plan}
                      </span>
                      <span className={`text-xs ${statusColors[kitchen.subscription.status]}`}>
                        {kitchen.subscription.status === 'active' && '●'}
                        {kitchen.subscription.status === 'past_due' && '!'}
                        {kitchen.subscription.status === 'cancelled' && '○'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Revenue */}
                  <div className="col-span-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {kitchen.subscription.monthlyFee > 0 ? `$${kitchen.subscription.monthlyFee}/mo` : '-'}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <Link href={`/portal/smart-kitchen/kitchens/${kitchen.id}`}>
                      <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <MoreHorizontal className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Revenue Breakdown */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue by Plan</h3>
              <div className="space-y-4">
                <RevenueRow label="Enterprise" value={1198} count={2} color="bg-purple-500" isDark={isDark} />
                <RevenueRow label="Professional" value={299} count={1} color="bg-blue-500" isDark={isDark} />
                <RevenueRow label="Starter" value={149} count={1} color="bg-gray-400" isDark={isDark} />
              </div>
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total MRR</span>
                  <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>$1,646</span>
                </div>
              </div>
            </div>

            {/* Equipment Health */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Equipment Health</h3>
              <div className="space-y-3">
                <HealthRow 
                  label="All Online" 
                  count={kitchens.filter(k => k.sensors.online === k.sensors.total).length}
                  total={kitchens.length}
                  color="emerald"
                  isDark={isDark}
                />
                <HealthRow 
                  label="Partial Outage" 
                  count={kitchens.filter(k => k.sensors.online > 0 && k.sensors.online < k.sensors.total).length}
                  total={kitchens.length}
                  color="amber"
                  isDark={isDark}
                />
                <HealthRow 
                  label="Offline" 
                  count={kitchens.filter(k => k.sensors.online === 0).length}
                  total={kitchens.length}
                  color="red"
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Payment Alerts */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Status</h3>
              {kitchens.filter(k => k.subscription.status !== 'active').length > 0 ? (
                <div className="space-y-3">
                  {kitchens.filter(k => k.subscription.status !== 'active').map(kitchen => (
                    <div 
                      key={kitchen.id}
                      className={`p-3 rounded-xl ${
                        kitchen.subscription.status === 'past_due' 
                          ? isDark ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-100'
                          : isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{kitchen.name}</p>
                          <p className={`text-xs ${kitchen.subscription.status === 'past_due' ? 'text-amber-600' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {kitchen.subscription.status === 'past_due' ? 'Payment overdue' : 'Subscription cancelled'}
                          </p>
                        </div>
                        <CreditCard className={`w-4 h-4 ${kitchen.subscription.status === 'past_due' ? 'text-amber-500' : isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>All payments up to date</p>
                </div>
              )}
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
    <div className={`rounded-2xl p-5 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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

// Revenue Row Component
function RevenueRow({ label, value, count, color, isDark }: { label: string; value: number; count: number; color: string; isDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${value}</span>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{count} kitchen{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}

// Health Row Component
function HealthRow({ label, count, total, color, isDark }: { label: string; count: number; total: number; color: 'emerald' | 'amber' | 'red'; isDark?: boolean }) {
  const colors = {
    emerald: isDark ? 'text-emerald-400 bg-emerald-400' : 'text-emerald-600 bg-emerald-500',
    amber: isDark ? 'text-amber-400 bg-amber-400' : 'text-amber-600 bg-amber-500',
    red: isDark ? 'text-red-400 bg-red-400' : 'text-red-600 bg-red-500',
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[color].split(' ')[1]}`} />
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
      </div>
      <span className={`text-sm font-medium ${colors[color].split(' ')[0]}`}>{count}</span>
    </div>
  )
}
