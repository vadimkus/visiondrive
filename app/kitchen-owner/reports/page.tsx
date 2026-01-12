'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  ChevronDown,
  Printer
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
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const handleDownload = (reportId: string) => {
    setIsGenerating(reportId)
    // Simulate download
    setTimeout(() => {
      setIsGenerating(null)
      // Trigger actual download here
      const link = document.createElement('a')
      link.href = '#'
      link.download = `compliance-report-${reportId}.pdf`
      // In production, this would be an actual PDF URL
      alert('Report downloaded successfully!')
    }, 1500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/kitchen-owner')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500">Download compliance documents</p>
              </div>
            </div>
            
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Generate New Report */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Generate Custom Report</h2>
              <p className="text-blue-100">Create a compliance report for any date range</p>
            </div>
            <button className="px-5 py-2.5 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Create Report
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
          
          <div className="relative">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Reports</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {REPORTS.map(report => (
            <div 
              key={report.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {report.period}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {report.generated}
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600">
                          {report.complianceRate}% Compliant
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {report.sensors} sensors
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {report.alerts} alerts
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDownload(report.id)}
                  disabled={isGenerating === report.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className={`h-4 w-4 ${isGenerating === report.id ? 'animate-bounce' : ''}`} />
                  {isGenerating === report.id ? 'Preparing...' : 'Download PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DM Notice */}
        <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Dubai Municipality Compliance</h3>
              <p className="text-sm text-blue-700 mt-1">
                All reports follow DM-HSD-GU46-KFPA2 guidelines for Occupational Health & Safety in Kitchen/Food Areas.
                Keep these reports for at least 2 years as required by Dubai Municipality food safety regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>VisionDrive Smart Kitchen • DM-HSD-GU46-KFPA2 Compliant</p>
        </footer>
      </main>
    </div>
  )
}
