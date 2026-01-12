'use client'

import { useState } from 'react'
import { 
  Download,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  ChevronDown,
  Thermometer,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Sensors data
const SENSORS = [
  { id: 'sensor-1', name: 'Walk-in Fridge', icon: '🚪', compliance: 98 },
  { id: 'sensor-2', name: 'Main Freezer', icon: '❄️', compliance: 100 },
  { id: 'sensor-3', name: 'Prep Fridge', icon: '🔪', compliance: 95 },
  { id: 'sensor-4', name: 'Display Cooler', icon: '🛒', compliance: 87 },
  { id: 'sensor-5', name: 'Hot Holding', icon: '🔥', compliance: 99 },
]

// Time periods
const PERIODS = [
  { id: 'daily', name: 'Daily', description: 'Last 24 hours' },
  { id: 'weekly', name: 'Weekly', description: 'Last 7 days' },
  { id: 'monthly', name: 'Monthly', description: 'Last 30 days' },
  { id: 'yearly', name: 'Yearly', description: 'Last 12 months' },
]

// Sample generated reports
const GENERATED_REPORTS = [
  {
    id: 'report-1',
    name: 'Weekly Compliance Report',
    period: 'Jan 6 - Jan 12, 2026',
    generated: 'Jan 12, 2026',
    complianceRate: 98,
    sensors: 5,
    alerts: 2,
  },
  {
    id: 'report-2',
    name: 'Monthly Compliance Report',
    period: 'December 2025',
    generated: 'Jan 1, 2026',
    complianceRate: 97,
    sensors: 5,
    alerts: 8,
  },
]

export default function OwnerReports() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedSensor, setSelectedSensor] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('weekly')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  const handleDownload = (sensorId: string, period: string) => {
    const key = `${sensorId}-${period}`
    setIsGenerating(key)
    setTimeout(() => {
      setIsGenerating(null)
      const sensorName = sensorId === 'all' ? 'All Sensors' : SENSORS.find(s => s.id === sensorId)?.name
      const periodName = PERIODS.find(p => p.id === period)?.name
      alert(`${periodName} report for ${sensorName} downloaded successfully!`)
    }, 1500)
  }

  const handleQuickDownload = (reportId: string) => {
    setIsGenerating(reportId)
    setTimeout(() => {
      setIsGenerating(null)
      alert('Report downloaded successfully!')
    }, 1500)
  }

  return (
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download compliance reports per sensor</p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-lg mb-4 ${isDark ? 'bg-[#2d2d2f]' : 'bg-gray-100'}`}>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'generate'
                ? isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900 shadow-sm'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Generate Reports
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900 shadow-sm'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Report History
          </button>
        </div>

        {activeTab === 'generate' ? (
          <>
            {/* Sensor Selection */}
            <div className={`rounded-xl border p-4 mb-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Select Sensor</h2>
                <div className="relative">
                  <select
                    value={selectedSensor}
                    onChange={(e) => setSelectedSensor(e.target.value)}
                    className={`appearance-none border rounded-lg px-3 py-1.5 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                      isDark ? 'bg-[#1a1a1a] border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <option value="all">All Sensors</option>
                    {SENSORS.map(sensor => (
                      <option key={sensor.id} value={sensor.id}>{sensor.icon} {sensor.name}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Sensor Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <button
                  onClick={() => setSelectedSensor('all')}
                  className={`p-2 rounded-lg text-center transition-all ${
                    selectedSensor === 'all'
                      ? 'bg-orange-500 text-white'
                      : isDark ? 'bg-[#1a1a1a] hover:bg-gray-800 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Thermometer className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-[10px] font-medium">All Sensors</p>
                </button>
                {SENSORS.map(sensor => (
                  <button
                    key={sensor.id}
                    onClick={() => setSelectedSensor(sensor.id)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      selectedSensor === sensor.id
                        ? 'bg-orange-500 text-white'
                        : isDark ? 'bg-[#1a1a1a] hover:bg-gray-800 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{sensor.icon}</span>
                    <p className="text-[10px] font-medium mt-0.5 truncate">{sensor.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Period Selection & Download */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Select Time Period</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PERIODS.map(period => {
                  const downloadKey = `${selectedSensor}-${period.id}`
                  const isDownloading = isGenerating === downloadKey
                  
                  return (
                    <div
                      key={period.id}
                      className={`relative rounded-lg border p-3 transition-all ${
                        selectedPeriod === period.id
                          ? isDark ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500 bg-orange-50'
                          : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedPeriod(period.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className={`h-3.5 w-3.5 ${
                            selectedPeriod === period.id ? 'text-orange-500' : isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                          <span className={`text-xs font-semibold ${
                            selectedPeriod === period.id 
                              ? 'text-orange-500' 
                              : isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {period.name}
                          </span>
                        </div>
                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {period.description}
                        </p>
                      </button>
                      
                      <button
                        onClick={() => handleDownload(selectedSensor, period.id)}
                        disabled={isDownloading}
                        className={`mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors disabled:opacity-50 ${
                          isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        <Download className={`h-3 w-3 ${isDownloading ? 'animate-bounce' : ''}`} />
                        {isDownloading ? 'Generating...' : 'Download PDF'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Selected Summary */}
              <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSensor === 'all' ? 'All Sensors' : SENSORS.find(s => s.id === selectedSensor)?.name}
                      {' • '}
                      {PERIODS.find(p => p.id === selectedPeriod)?.name} Report
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Includes temperature logs, compliance status, and alerts
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedSensor, selectedPeriod)}
                    disabled={isGenerating === `${selectedSensor}-${selectedPeriod}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    <Download className={`h-3.5 w-3.5 ${isGenerating === `${selectedSensor}-${selectedPeriod}` ? 'animate-bounce' : ''}`} />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Report History */}
            <div className="space-y-2">
              {GENERATED_REPORTS.map(report => (
                <div 
                  key={report.id}
                  className={`rounded-xl border p-3 hover:shadow-md transition-all ${
                    isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{report.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Calendar className="h-3 w-3" />
                            {report.period}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock className="h-3 w-3" />
                            {report.generated}
                          </span>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-medium text-emerald-500">
                              {report.complianceRate}%
                            </span>
                          </div>
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                          <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {report.sensors} sensors
                          </span>
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                          <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {report.alerts} alerts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleQuickDownload(report.id)}
                      disabled={isGenerating === report.id}
                      className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      <Download className={`h-3 w-3 ${isGenerating === report.id ? 'animate-bounce' : ''}`} />
                      {isGenerating === report.id ? '...' : 'Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* DM Notice */}
        <div className={`mt-4 p-3 rounded-xl border ${
          isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-start gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <FileText className={`h-3.5 w-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`font-medium text-xs ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>DM Compliance</h3>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Reports follow DM-HSD-GU46-KFPA2. Keep for 2 years as required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
