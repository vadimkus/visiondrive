'use client'

import { useState } from 'react'
import { Download, Calendar, FileText, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7d')

  const reports = [
    { 
      id: 'weekly-summary',
      title: 'Weekly Temperature Summary',
      description: 'Average temperatures and alerts for all kitchens',
      type: 'summary',
      lastGenerated: '2 hours ago',
      size: '245 KB'
    },
    { 
      id: 'compliance-report',
      title: 'Food Safety Compliance Report',
      description: 'Temperature compliance for health authority requirements',
      type: 'compliance',
      lastGenerated: '1 day ago',
      size: '512 KB'
    },
    { 
      id: 'alert-history',
      title: 'Alert History Report',
      description: 'Complete log of all temperature alerts and actions taken',
      type: 'alerts',
      lastGenerated: '3 hours ago',
      size: '128 KB'
    },
  ]

  const stats = [
    { label: 'Avg Temperature', value: '4.5°C', change: -0.3, period: 'vs last week' },
    { label: 'Total Alerts', value: '12', change: -25, period: 'vs last week' },
    { label: 'Compliance Rate', value: '98.5%', change: 2.1, period: 'vs last month' },
    { label: 'Uptime', value: '99.9%', change: 0.1, period: 'vs last month' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and compliance reports</p>
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
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
              <span className={`flex items-center text-xs font-medium ${
                stat.change > 0 ? 'text-emerald-600' : stat.change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.change > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : stat.change < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{stat.period}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Temperature Trends</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              Main Kitchen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Cloud Kitchen A
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Restaurant Kitchen
            </span>
          </div>
        </div>
        
        {/* Placeholder Chart */}
        <div className="h-64 bg-gradient-to-b from-gray-50 to-white rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Temperature chart will appear here</p>
            <p className="text-xs text-gray-400">Connect sensors to see data</p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="space-y-3">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{report.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.lastGenerated}
                  </span>
                  <span>{report.size}</span>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded-full hover:bg-[#2d2d2f] transition-all flex-shrink-0">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Custom Report */}
      <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Custom Report</h3>
            <p className="text-sm text-gray-600 mt-1">Generate a custom report with your specific parameters</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-all">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}
