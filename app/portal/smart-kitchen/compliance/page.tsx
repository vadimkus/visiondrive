'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Download, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  ChevronDown,
  Building2,
  RefreshCw,
  Thermometer
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { 
  EQUIPMENT_CONFIGS, 
  formatThresholdRange,
  type EquipmentType 
} from '../lib/compliance'

interface Equipment {
  id: string
  name: string
  type: EquipmentType
  currentTemp?: number
  status: string
}

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  equipment: Equipment[]
  sensorCount: number
  complianceRate: number
  violations: number
}

export default function CompliancePage() {
  const { isDark } = useTheme()
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedKitchens, setExpandedKitchens] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadComplianceData()
  }, [dateRange])

  const loadComplianceData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/portal/smart-kitchen/kitchens')
      const data = await response.json()
      
      if (data.success && data.kitchens) {
        // Fetch details for each kitchen
        const kitchensWithDetails = await Promise.all(
          data.kitchens.map(async (k: { id: string; name: string; address: string; emirate: string }) => {
            try {
              const detailResponse = await fetch(`/api/portal/smart-kitchen/kitchens/${k.id}`)
              const detailData = await detailResponse.json()
              if (detailData.success && detailData.kitchen) {
                const equipment = detailData.kitchen.equipment || []
                const sensorCount = equipment.length
                // Calculate compliance based on equipment status
                const compliantCount = equipment.filter((e: Equipment) => e.status === 'normal' || e.status === 'online').length
                const complianceRate = sensorCount > 0 ? (compliantCount / sensorCount) * 100 : 0
                
                return {
                  ...k,
                  equipment,
                  sensorCount,
                  complianceRate,
                  violations: sensorCount - compliantCount
                }
              }
            } catch {
              // Ignore errors
            }
            return { ...k, equipment: [], sensorCount: 0, complianceRate: 0, violations: 0 }
          })
        )
        setKitchens(kitchensWithDetails)
      }
    } catch (err) {
      console.error('Failed to load compliance data:', err)
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

  const exportToPDF = () => {
    setIsExporting(true)
    setTimeout(() => {
      window.print()
      setIsExporting(false)
    }, 100)
  }

  // Calculate totals
  const totalSensors = kitchens.reduce((sum, k) => sum + k.sensorCount, 0)
  const totalViolations = kitchens.reduce((sum, k) => sum + k.violations, 0)
  const overallRate = totalSensors > 0 
    ? kitchens.reduce((sum, k) => sum + (k.complianceRate * k.sensorCount), 0) / totalSensors 
    : 0
  const locationsMonitored = kitchens.filter(k => k.sensorCount > 0).length

  const getComplianceColor = (rate: number, isDark: boolean) => {
    if (rate >= 95) return isDark ? 'text-emerald-400' : 'text-emerald-600'
    if (rate >= 80) return isDark ? 'text-amber-400' : 'text-amber-600'
    return isDark ? 'text-red-400' : 'text-red-600'
  }

  const getComplianceBadge = (rate: number, isDark: boolean) => {
    if (rate >= 95) return isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
    if (rate >= 80) return isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
    return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Compliance
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Dubai Municipality food safety compliance by location
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadComplianceData}
              disabled={isLoading}
              className={`
                p-2.5 rounded-xl transition-all print:hidden
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'}
                ${isLoading ? 'animate-spin' : ''}
              `}
            >
              <RefreshCw className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <button 
              onClick={exportToPDF}
              disabled={isExporting || isLoading}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                transition-all print:hidden
                ${isDark 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-[#1d1d1f] text-white hover:bg-[#2d2d2f]'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* DM Reference Banner */}
        <div className={`mb-6 p-4 rounded-2xl ${isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-100'}`}>
          <div className="flex items-center gap-3">
            <FileText className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Reference: DM-HSD-GU46-KFPA2</p>
              <p className={`text-xs ${isDark ? 'text-blue-400/70' : 'text-blue-700'}`}>Technical Guidelines for Occupational Health & Safety in Kitchens</p>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className={`rounded-2xl p-4 mb-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Compliance Period
            </span>
            <div className={`flex items-center gap-1 p-1 rounded-full ${isDark ? 'bg-black/30' : 'bg-gray-100'}`}>
              {(['24h', '7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-full transition-all
                    ${dateRange === range
                      ? isDark 
                        ? 'bg-white text-black' 
                        : 'bg-[#1d1d1f] text-white'
                      : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Overall Compliance"
            value={totalSensors > 0 ? `${overallRate.toFixed(1)}%` : '—'}
            subtext={totalSensors > 0 ? (overallRate >= 95 ? 'Excellent' : overallRate >= 80 ? 'Good' : 'Needs Attention') : 'No sensors'}
            icon={overallRate >= 95 ? ShieldCheck : ShieldAlert}
            iconBg={totalSensors > 0 ? (overallRate >= 95 ? 'bg-emerald-500' : overallRate >= 80 ? 'bg-amber-500' : 'bg-red-500') : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Locations Monitored"
            value={locationsMonitored}
            subtext={`of ${kitchens.length} total`}
            icon={Building2}
            iconBg={locationsMonitored > 0 ? 'bg-blue-500' : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Active Sensors"
            value={totalSensors}
            subtext="Equipment monitored"
            icon={Thermometer}
            iconBg={totalSensors > 0 ? 'bg-orange-500' : 'bg-gray-400'}
            isDark={isDark}
          />
          <StatCard
            label="Violations"
            value={totalViolations}
            subtext={`Last ${dateRange}`}
            icon={AlertTriangle}
            iconBg={totalViolations > 0 ? 'bg-red-500' : 'bg-emerald-500'}
            isDark={isDark}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading compliance data...</p>
          </div>
        ) : kitchens.length === 0 ? (
          <EmptyState isDark={isDark} />
        ) : (
          <>
            {/* Location Compliance Cards */}
            <div className="space-y-3 mb-8">
              <p className={`text-xs font-medium uppercase tracking-wider px-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Compliance by Location
              </p>
              
              {kitchens.map(kitchen => (
                <LocationComplianceCard
                  key={kitchen.id}
                  kitchen={kitchen}
                  isExpanded={expandedKitchens.has(kitchen.id)}
                  onToggle={() => toggleKitchen(kitchen.id)}
                  isDark={isDark}
                  getComplianceColor={getComplianceColor}
                  getComplianceBadge={getComplianceBadge}
                />
              ))}
            </div>

            {/* DM Requirements Reference */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Dubai Municipality Temperature Requirements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TempCard 
                  icon="🧊" 
                  label="Refrigeration" 
                  temp="0-5°C" 
                  subtext="Cold storage"
                  color="blue"
                  isDark={isDark}
                />
                <TempCard 
                  icon="❄️" 
                  label="Freezer" 
                  temp="≤ -18°C" 
                  subtext="Frozen foods"
                  color="indigo"
                  isDark={isDark}
                />
                <TempCard 
                  icon="🔥" 
                  label="Hot Holding" 
                  temp="≥ 60°C" 
                  subtext="Bain-marie"
                  color="orange"
                  isDark={isDark}
                />
                <TempCard 
                  icon="⚠️" 
                  label="Danger Zone" 
                  temp="5-60°C" 
                  subtext="Food unsafe (2hr max)"
                  color="red"
                  isDark={isDark}
                  danger
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body > * { visibility: hidden; }
          nav, header, aside, [role="complementary"], [role="navigation"] { display: none !important; }
          main, main * { visibility: visible; }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            margin: 0 !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4; margin: 15mm; }
          main::before {
            content: "VisionDrive Smart Kitchen - Compliance Report";
            display: block;
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ccc;
          }
          main::after {
            content: "Reference: DM-HSD-GU46-KFPA2 | Dubai Municipality Food Safety Guidelines";
            display: block;
            font-size: 8pt;
            color: #666;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
          }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
          .rounded-2xl { page-break-inside: avoid; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  subtext,
  icon: Icon, 
  iconBg,
  isDark 
}: { 
  label: string
  value: string | number
  subtext: string
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
      <p className={`text-xs mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{subtext}</p>
    </div>
  )
}

// Location Compliance Card
function LocationComplianceCard({
  kitchen,
  isExpanded,
  onToggle,
  isDark,
  getComplianceColor,
  getComplianceBadge
}: {
  kitchen: Kitchen
  isExpanded: boolean
  onToggle: () => void
  isDark: boolean
  getComplianceColor: (rate: number, isDark: boolean) => string
  getComplianceBadge: (rate: number, isDark: boolean) => string
}) {
  const hasEquipment = kitchen.sensorCount > 0

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
        
        <div className="flex items-center gap-3">
          {hasEquipment ? (
            <>
              <div className="text-right mr-2">
                <p className={`text-lg font-semibold ${getComplianceColor(kitchen.complianceRate, isDark)}`}>
                  {kitchen.complianceRate.toFixed(0)}%
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {kitchen.sensorCount} sensor{kitchen.sensorCount !== 1 ? 's' : ''}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getComplianceBadge(kitchen.complianceRate, isDark)}`}>
                {kitchen.complianceRate >= 95 ? 'Compliant' : kitchen.complianceRate >= 80 ? 'Warning' : 'Non-Compliant'}
              </span>
            </>
          ) : (
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              Not Monitored
            </span>
          )}
          <ChevronDown className={`w-5 h-5 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'} ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Equipment Details */}
      {isExpanded && (
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          {!hasEquipment ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Thermometer className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No equipment registered for this location.</p>
              <p className="text-xs mt-1">Add sensors to track compliance.</p>
            </div>
          ) : (
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className={`text-left text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <th className="pb-3 font-medium">Equipment</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-center">Required</th>
                    <th className="pb-3 font-medium text-center">Current</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                  {kitchen.equipment.map((equip: Equipment) => {
                    const config = EQUIPMENT_CONFIGS[equip.type] || { name: equip.type, icon: '📊' }
                    const isCompliant = equip.status === 'normal' || equip.status === 'online'
                    
                    return (
                      <tr key={equip.id} className="text-sm">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{config.icon}</span>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{equip.name}</span>
                          </div>
                        </td>
                        <td className={`py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {config.name}
                        </td>
                        <td className={`py-3 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatThresholdRange(equip.type)}
                        </td>
                        <td className={`py-3 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {equip.currentTemp !== undefined ? `${equip.currentTemp.toFixed(1)}°C` : '—'}
                        </td>
                        <td className="py-3 text-center">
                          {isCompliant ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                              <CheckCircle className="w-3 h-3" />
                              OK
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                              <AlertTriangle className="w-3 h-3" />
                              Alert
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Temperature Requirement Card
function TempCard({ 
  icon, 
  label, 
  temp, 
  subtext, 
  color, 
  isDark,
  danger 
}: { 
  icon: string
  label: string
  temp: string
  subtext: string
  color: 'blue' | 'indigo' | 'orange' | 'red'
  isDark: boolean
  danger?: boolean
}) {
  const colorStyles = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    indigo: isDark ? 'text-indigo-400' : 'text-indigo-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
    red: isDark ? 'text-red-400' : 'text-red-600'
  }

  return (
    <div className={`rounded-xl p-4 ${
      danger 
        ? isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
        : isDark ? 'bg-black/20' : 'bg-gray-50'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorStyles[color]}`}>{temp}</p>
      <p className={`text-xs mt-1 ${danger ? (isDark ? 'text-red-400/70' : 'text-red-600') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>{subtext}</p>
    </div>
  )
}

// Empty State Component
function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <Building2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No Locations Yet
      </h3>
      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Add kitchens to start tracking compliance
      </p>
    </div>
  )
}
