'use client'

import { useState } from 'react'
import { 
  Download,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Sample report data
const REPORTS = [
  {
    id: 'report-1',
    name: 'Weekly Compliance Report',
    period: 'Jan 6 - Jan 12, 2026',
    generated: 'Jan 12, 2026',
    status: 'compliant',
    complianceRate: 98,
    sensors: 5,
    alerts: 2,
  },
  {
    id: 'report-2',
    name: 'Weekly Compliance Report',
    period: 'Dec 30 - Jan 5, 2026',
    generated: 'Jan 5, 2026',
    status: 'compliant',
    complianceRate: 100,
    sensors: 5,
    alerts: 0,
  },
  {
    id: 'report-3',
    name: 'Weekly Compliance Report',
    period: 'Dec 23 - Dec 29, 2025',
    generated: 'Dec 29, 2025',
    status: 'compliant',
    complianceRate: 96,
    sensors: 5,
    alerts: 3,
  },
  {
    id: 'report-4',
    name: 'Monthly Compliance Report',
    period: 'December 2025',
    generated: 'Jan 1, 2026',
    status: 'compliant',
    complianceRate: 97,
    sensors: 5,
    alerts: 8,
  },
]

export default function OwnerReports() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const handleDownload = (reportId: string) => {
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
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download compliance documents</p>
        </div>

        {/* Generate New Report */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Generate Custom Report</h2>
              <p className="text-blue-100 text-xs">Create report for any date range</p>
            </div>
            <button className="px-3 py-1.5 bg-white text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-50 transition-colors">
              Create
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Available Reports</h2>
          
          <div className="relative">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`appearance-none border rounded-lg px-3 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                isDark ? 'bg-[#2d2d2f] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">All</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-2">
          {REPORTS.map(report => (
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
                  onClick={() => handleDownload(report.id)}
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
                Reports follow DM-HSD-GU46-KFPA2. Keep for 2 years.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
