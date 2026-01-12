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
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Download compliance documents for Dubai Municipality</p>
      </div>

      {/* Generate New Report */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Generate Custom Report</h2>
            <p className="text-blue-100 text-sm">Create a compliance report for any date range</p>
          </div>
          <button className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
            Create Report
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Available Reports</h2>
        
        <div className="relative">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
          >
            <option value="all">All Reports</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {REPORTS.map(report => (
          <div 
            key={report.id}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{report.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {report.period}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {report.generated}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600">
                        {report.complianceRate}% Compliant
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {report.sensors} sensors
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {report.alerts} alerts
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleDownload(report.id)}
                disabled={isGenerating === report.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className={`h-3.5 w-3.5 ${isGenerating === report.id ? 'animate-bounce' : ''}`} />
                {isGenerating === report.id ? 'Preparing...' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DM Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 text-sm">Dubai Municipality Compliance</h3>
            <p className="text-xs text-blue-700 mt-0.5">
              All reports follow DM-HSD-GU46-KFPA2 guidelines. Keep reports for 2 years as required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
