'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Download, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'
import { 
  EQUIPMENT_CONFIGS, 
  DANGER_ZONE, 
  COOKING_TEMPS,
  checkCompliance,
  formatThresholdRange,
  type EquipmentType 
} from '../lib/compliance'

interface ComplianceRecord {
  date: string
  totalReadings: number
  compliantReadings: number
  complianceRate: number
  violations: number
  dangerZoneEvents: number
}

interface SensorCompliance {
  id: string
  location: string
  kitchenName: string
  equipmentType: EquipmentType
  avgTemp: number
  minTemp: number
  maxTemp: number
  complianceRate: number
  violationCount: number
  lastViolation?: string
}

export default function CompliancePage() {
  const [dateRange, setDateRange] = useState('7d')
  const [complianceHistory, setComplianceHistory] = useState<ComplianceRecord[]>([])
  const [sensorCompliance, setSensorCompliance] = useState<SensorCompliance[]>([])
  const [overallRate, setOverallRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComplianceData()
  }, [dateRange])

  const loadComplianceData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock compliance history
    const history: ComplianceRecord[] = [
      { date: '2026-01-12', totalReadings: 168, compliantReadings: 142, complianceRate: 84.5, violations: 26, dangerZoneEvents: 3 },
      { date: '2026-01-11', totalReadings: 168, compliantReadings: 156, complianceRate: 92.8, violations: 12, dangerZoneEvents: 1 },
      { date: '2026-01-10', totalReadings: 168, compliantReadings: 163, complianceRate: 97.0, violations: 5, dangerZoneEvents: 0 },
      { date: '2026-01-09', totalReadings: 168, compliantReadings: 160, complianceRate: 95.2, violations: 8, dangerZoneEvents: 0 },
      { date: '2026-01-08', totalReadings: 168, compliantReadings: 158, complianceRate: 94.0, violations: 10, dangerZoneEvents: 1 },
      { date: '2026-01-07', totalReadings: 168, compliantReadings: 165, complianceRate: 98.2, violations: 3, dangerZoneEvents: 0 },
      { date: '2026-01-06', totalReadings: 168, compliantReadings: 161, complianceRate: 95.8, violations: 7, dangerZoneEvents: 0 },
    ]

    // Mock sensor compliance
    const sensors: SensorCompliance[] = [
      { id: 'sensor-001', location: 'Walk-in Fridge', kitchenName: 'Main Kitchen', equipmentType: 'walk_in_cooler', avgTemp: 3.8, minTemp: 2.1, maxTemp: 4.9, complianceRate: 100, violationCount: 0 },
      { id: 'sensor-002', location: 'Main Freezer', kitchenName: 'Main Kitchen', equipmentType: 'freezer', avgTemp: -19.2, minTemp: -21.5, maxTemp: -17.8, complianceRate: 98.5, violationCount: 2, lastViolation: '2 days ago' },
      { id: 'sensor-003', location: 'Prep Area Fridge', kitchenName: 'Main Kitchen', equipmentType: 'prep_fridge', avgTemp: 4.8, minTemp: 3.2, maxTemp: 6.1, complianceRate: 85.2, violationCount: 18, lastViolation: 'Today' },
      { id: 'sensor-004', location: 'Main Cooler', kitchenName: 'Cloud Kitchen A', equipmentType: 'refrigerator', avgTemp: 5.9, minTemp: 4.1, maxTemp: 7.8, complianceRate: 72.4, violationCount: 35, lastViolation: 'Today' },
      { id: 'sensor-005', location: 'Display Fridge', kitchenName: 'Cloud Kitchen A', equipmentType: 'display_fridge', avgTemp: 7.2, minTemp: 5.5, maxTemp: 9.8, complianceRate: 42.1, violationCount: 68, lastViolation: 'Today' },
      { id: 'sensor-006', location: 'Cold Storage', kitchenName: 'Restaurant Kitchen', equipmentType: 'walk_in_cooler', avgTemp: 3.2, minTemp: 1.8, maxTemp: 4.5, complianceRate: 100, violationCount: 0 },
      { id: 'sensor-007', location: 'Hot Bain-Marie', kitchenName: 'Restaurant Kitchen', equipmentType: 'hot_holding', avgTemp: 67.5, minTemp: 62.1, maxTemp: 72.8, complianceRate: 100, violationCount: 0 },
    ]

    setComplianceHistory(history)
    setSensorCompliance(sensors)
    setOverallRate(history.reduce((sum, h) => sum + h.complianceRate, 0) / history.length)
    setIsLoading(false)
  }

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-emerald-600'
    if (rate >= 80) return 'text-amber-600'
    return 'text-red-600'
  }

  const getComplianceBg = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-50 border-emerald-200'
    if (rate >= 80) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    
    try {
      // Dynamically import html2canvas and jspdf
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      
      if (!reportRef.current) return

      // Create a clone for PDF rendering with white background
      const element = reportRef.current
      
      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      })

      const imgData = canvas.toDataURL('image/png')
      
      // Calculate PDF dimensions (A4)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      // Add header
      pdf.setFontSize(10)
      pdf.setTextColor(100)
      pdf.text('VisionDrive Smart Kitchen - Compliance Report', 14, 8)
      pdf.text(new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }), pdfWidth - 14, 8, { align: 'right' })

      // Calculate if we need multiple pages
      const scaledHeight = imgHeight * ratio
      let heightLeft = scaledHeight
      let position = imgY

      // Add the image, potentially across multiple pages
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio)
        heightLeft -= pdfHeight - 20
        if (heightLeft > 0) {
          pdf.addPage()
          position = -pdfHeight + 30
        }
      }

      // Add footer on last page
      const pageCount = pdf.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150)
        pdf.text(
          `Reference: DM-HSD-GU46-KFPA2 | Dubai Municipality Food Safety Guidelines`,
          14,
          pdfHeight - 10
        )
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 14, pdfHeight - 10, { align: 'right' })
      }

      // Generate filename with date
      const fileName = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to print dialog
      window.print()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Compliance Report</h1>
          <p className="text-sm text-gray-500 mt-1">Dubai Municipality Food Safety Compliance Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1">
            {['24h', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  dateRange === range
                    ? 'bg-[#1d1d1f] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={exportToPDF}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded-full hover:bg-[#2d2d2f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Export Content */}
      <div ref={reportRef} className="bg-white">
      {/* DM Reference Banner */}
      <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Reference: DM-HSD-GU46-KFPA2</p>
            <p className="text-xs text-blue-700">Technical Guidelines for Occupational Health & Safety in Kitchens (Version 3, 09/05/2024)</p>
          </div>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`col-span-1 md:col-span-2 rounded-2xl p-6 border ${getComplianceBg(overallRate)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Compliance Rate</p>
              <p className={`text-5xl font-bold ${getComplianceColor(overallRate)}`}>
                {overallRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">Last {dateRange}</p>
            </div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${overallRate >= 95 ? 'bg-emerald-100' : overallRate >= 80 ? 'bg-amber-100' : 'bg-red-100'}`}>
              {overallRate >= 95 ? (
                <ShieldCheck className={`h-10 w-10 ${getComplianceColor(overallRate)}`} />
              ) : (
                <ShieldAlert className={`h-10 w-10 ${getComplianceColor(overallRate)}`} />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-gray-600">Total Violations</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {complianceHistory.reduce((sum, h) => sum + h.violations, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Last {dateRange}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <p className="text-sm text-gray-600">Danger Zone Events</p>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {complianceHistory.reduce((sum, h) => sum + h.dangerZoneEvents, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Immediate food safety risk</p>
        </div>
      </div>

      {/* Daily Compliance Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Compliance Trend</h2>
        <div className="space-y-3">
          {complianceHistory.map((record, idx) => (
            <div key={record.date} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    record.complianceRate >= 95 ? 'bg-emerald-500' :
                    record.complianceRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${record.complianceRate}%` }}
                />
              </div>
              <div className={`w-16 text-right font-medium ${getComplianceColor(record.complianceRate)}`}>
                {record.complianceRate.toFixed(1)}%
              </div>
              {record.dangerZoneEvents > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  ⚠️ {record.dangerZoneEvents}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Compliance Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Sensor Compliance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-medium">Sensor</th>
                <th className="pb-3 font-medium">Equipment</th>
                <th className="pb-3 font-medium">Required</th>
                <th className="pb-3 font-medium text-center">Avg Temp</th>
                <th className="pb-3 font-medium text-center">Range</th>
                <th className="pb-3 font-medium text-center">Compliance</th>
                <th className="pb-3 font-medium text-center">Violations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sensorCompliance.map(sensor => {
                const config = EQUIPMENT_CONFIGS[sensor.equipmentType]
                return (
                  <tr key={sensor.id} className="text-sm">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{sensor.location}</p>
                          <p className="text-xs text-gray-500">{sensor.kitchenName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{config.name}</td>
                    <td className="py-4 text-gray-600">{formatThresholdRange(sensor.equipmentType)}</td>
                    <td className="py-4 text-center">
                      <span className={`font-medium ${
                        checkCompliance(sensor.equipmentType, sensor.avgTemp).status === 'compliant' 
                          ? 'text-gray-900' : 'text-red-600'
                      }`}>
                        {sensor.avgTemp.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-4 text-center text-gray-500 text-xs">
                      {sensor.minTemp.toFixed(1)}° - {sensor.maxTemp.toFixed(1)}°
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sensor.complianceRate >= 95 ? 'bg-emerald-100 text-emerald-700' :
                        sensor.complianceRate >= 80 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sensor.complianceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      {sensor.violationCount > 0 ? (
                        <div>
                          <p className="font-medium text-red-600">{sensor.violationCount}</p>
                          <p className="text-xs text-gray-400">{sensor.lastViolation}</p>
                        </div>
                      ) : (
                        <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DM Requirements Reference */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Dubai Municipality Temperature Requirements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🧊</span>
              <span className="font-medium text-gray-900">Refrigeration</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">0-5°C</p>
            <p className="text-xs text-gray-500 mt-1">Cold storage</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">❄️</span>
              <span className="font-medium text-gray-900">Freezer</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">≤ -18°C</p>
            <p className="text-xs text-gray-500 mt-1">Frozen foods</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔥</span>
              <span className="font-medium text-gray-900">Hot Holding</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">≥ 60°C</p>
            <p className="text-xs text-gray-500 mt-1">Bain-marie</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <span className="font-medium text-red-900">Danger Zone</span>
            </div>
            <p className="text-2xl font-bold text-red-600">5-60°C</p>
            <p className="text-xs text-red-600 mt-1">Food unsafe (2hr max)</p>
          </div>
        </div>
      </div>
      </div>
      {/* End PDF Export Content */}
    </div>
  )
}
