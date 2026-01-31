'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  Calendar, 
  FileText, 
  MapPin,
  ChevronDown,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  FilePieChart
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface Kitchen {
  id: string
  name: string
  address: string
  emirate: string
  sensorCount: number
  complianceStatus: 'compliant' | 'non_compliant' | 'not_monitored'
}

interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ElementType
  format: 'PDF' | 'CSV' | 'XLSX'
}

export default function ReportsPage() {
  const { isDark } = useTheme()
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [selectedKitchen, setSelectedKitchen] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedKitchens, setExpandedKitchens] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const reportTypes: ReportType[] = [
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Food safety compliance status for health authority requirements',
      icon: CheckCircle,
      format: 'PDF'
    },
    {
      id: 'alerts',
      title: 'Alert History',
      description: 'Complete log of all temperature alerts and actions taken',
      icon: AlertTriangle,
      format: 'PDF'
    },
    {
      id: 'equipment',
      title: 'Equipment Summary',
      description: 'List of all registered equipment and their status',
      icon: FileSpreadsheet,
      format: 'XLSX'
    },
    {
      id: 'audit',
      title: 'Audit Trail',
      description: 'Detailed log of all system activities and changes',
      icon: FilePieChart,
      format: 'CSV'
    }
  ]

  useEffect(() => {
    loadKitchens()
  }, [])

  const loadKitchens = async () => {
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
                const sensorCount = detailData.kitchen.equipment?.length || 0
                return {
                  ...k,
                  sensorCount,
                  complianceStatus: sensorCount === 0 ? 'not_monitored' : 'compliant'
                }
              }
            } catch {
              // Ignore errors
            }
            return { ...k, sensorCount: 0, complianceStatus: 'not_monitored' as const }
          })
        )
        setKitchens(kitchensWithDetails)
      }
    } catch (err) {
      console.error('Failed to load kitchens:', err)
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

  const handleGenerateReport = async (kitchenId: string, reportType: string) => {
    const key = `${kitchenId}-${reportType}`
    setIsGenerating(key)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, this would trigger a download
    alert(`Report "${reportType}" for ${kitchenId === 'all' ? 'All Locations' : kitchens.find(k => k.id === kitchenId)?.name} would be downloaded here.`)
    
    setIsGenerating(null)
  }

  const totalSensors = kitchens.reduce((sum, k) => sum + k.sensorCount, 0)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Reports
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Generate compliance and analytics reports by location
            </p>
          </div>
          <button
            onClick={loadKitchens}
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

        {/* Date Range Selector */}
        <div className={`rounded-2xl p-4 mb-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Report Period
              </span>
            </div>
            <div className={`flex items-center gap-1 p-1 rounded-full ${isDark ? 'bg-black/30' : 'bg-gray-100'}`}>
              {(['7d', '30d', '90d'] as const).map(range => (
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
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading locations...</p>
          </div>
        ) : kitchens.length === 0 ? (
          <EmptyState isDark={isDark} type="no-kitchens" />
        ) : totalSensors === 0 ? (
          <EmptyState isDark={isDark} type="no-sensors" />
        ) : (
          <>
            {/* All Locations Report Section */}
            <div className={`rounded-2xl overflow-hidden mb-4 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
              <button
                onClick={() => toggleKitchen('all')}
                className={`
                  w-full flex items-center justify-between p-5
                  transition-colors
                  ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
                    <Building2 className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      All Locations
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {kitchens.length} location{kitchens.length !== 1 ? 's' : ''} • {totalSensors} sensor{totalSensors !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'} ${expandedKitchens.has('all') ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedKitchens.has('all') && (
                <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div className="p-4 grid gap-3 sm:grid-cols-2">
                    {reportTypes.map(report => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        isDark={isDark}
                        isGenerating={isGenerating === `all-${report.id}`}
                        onGenerate={() => handleGenerateReport('all', report.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Individual Location Reports */}
            <div className="space-y-3">
              <p className={`text-xs font-medium uppercase tracking-wider px-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                By Location
              </p>
              
              {kitchens.map(kitchen => (
                <div 
                  key={kitchen.id}
                  className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}
                >
                  <button
                    onClick={() => toggleKitchen(kitchen.id)}
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
                      <span className={`
                        px-3 py-1.5 rounded-full text-xs font-medium
                        ${kitchen.sensorCount === 0
                          ? isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                          : isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                        }
                      `}>
                        {kitchen.sensorCount === 0 ? 'No Sensors' : `${kitchen.sensorCount} Sensor${kitchen.sensorCount !== 1 ? 's' : ''}`}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isDark ? 'text-gray-500' : 'text-gray-400'} ${expandedKitchens.has(kitchen.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {expandedKitchens.has(kitchen.id) && (
                    <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                      {kitchen.sensorCount === 0 ? (
                        <div className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No sensors registered for this location.</p>
                          <p className="text-xs mt-1">Add equipment to generate reports.</p>
                        </div>
                      ) : (
                        <div className="p-4 grid gap-3 sm:grid-cols-2">
                          {reportTypes.map(report => (
                            <ReportCard
                              key={report.id}
                              report={report}
                              isDark={isDark}
                              isGenerating={isGenerating === `${kitchen.id}-${report.id}`}
                              onGenerate={() => handleGenerateReport(kitchen.id, report.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Report Card Component
function ReportCard({
  report,
  isDark,
  isGenerating,
  onGenerate
}: {
  report: ReportType
  isDark: boolean
  isGenerating: boolean
  onGenerate: () => void
}) {
  const Icon = report.icon

  return (
    <div className={`
      flex items-center gap-4 p-4 rounded-xl
      ${isDark ? 'bg-black/20' : 'bg-gray-50'}
    `}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
        <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {report.title}
        </h4>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {report.format}
        </p>
      </div>
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          transition-all active:scale-95
          ${isGenerating
            ? isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            : isDark 
              ? 'bg-white text-black hover:bg-gray-200' 
              : 'bg-[#1d1d1f] text-white hover:bg-[#2d2d2f]'
          }
        `}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Generate</span>
          </>
        )}
      </button>
    </div>
  )
}

// Empty State Component
function EmptyState({ isDark, type }: { isDark: boolean; type: 'no-kitchens' | 'no-sensors' }) {
  const config = {
    'no-kitchens': {
      icon: Building2,
      title: 'No Locations Yet',
      description: 'Add kitchens to start generating reports',
      iconColor: isDark ? 'text-gray-700' : 'text-gray-300'
    },
    'no-sensors': {
      icon: FileText,
      title: 'No Sensors Registered',
      description: 'Add equipment to your kitchens to generate reports',
      iconColor: isDark ? 'text-amber-500/50' : 'text-amber-300'
    }
  }

  const { icon: Icon, title, description, iconColor } = config[type]

  return (
    <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
      <Icon className={`w-16 h-16 mx-auto mb-4 ${iconColor}`} />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        {description}
      </p>
    </div>
  )
}
