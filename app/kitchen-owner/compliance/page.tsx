'use client'

import { Shield, FileText, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

const DM_REQUIREMENTS = [
  {
    id: 'cold-storage',
    name: 'Cold Storage',
    arabicName: 'غرفة تبريد',
    emoji: '🧊',
    requirement: '0°C to 5°C',
    description: 'Walk-in fridges, refrigerators, prep fridges',
    status: 'compliant',
  },
  {
    id: 'freezer',
    name: 'Freezer Storage',
    arabicName: 'فريزر',
    emoji: '❄️',
    requirement: '≤ -18°C',
    description: 'Frozen foods, ice cream storage',
    status: 'compliant',
  },
  {
    id: 'hot-holding',
    name: 'Hot Holding',
    arabicName: 'حفظ ساخن',
    emoji: '🔥',
    requirement: '≥ 60°C',
    description: 'Bain-marie, hot display, warming stations',
    status: 'compliant',
  },
  {
    id: 'danger-zone',
    name: 'Danger Zone',
    arabicName: 'منطقة الخطر',
    emoji: '⚠️',
    requirement: '5°C - 60°C',
    description: 'Food unsafe - maximum 2 hours exposure',
    status: 'warning',
    isWarning: true,
  },
  {
    id: 'cooking',
    name: 'Cooking Temperature',
    arabicName: 'درجة حرارة الطهي',
    emoji: '🍳',
    requirement: '≥ 75°C',
    description: 'Core temperature for cooked foods',
    status: 'info',
  },
]

export default function OwnerCompliance() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">DM Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">Dubai Municipality Food Safety Guidelines</p>
      </div>

      {/* DM Reference Banner */}
      <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-blue-900">DM-HSD-GU46-KFPA2</h2>
            <p className="text-sm text-blue-700 mt-1">
              Technical Guidelines for Occupational Health & Safety in Kitchen/Food Areas
            </p>
            <p className="text-xs text-blue-600 mt-2">Version 3 • Last updated: 09/05/2024</p>
          </div>
          <a 
            href="https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View PDF
          </a>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-emerald-700">Compliant</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">80%</p>
          <p className="text-xs text-emerald-600 mt-1">4 of 5 sensors</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-amber-700">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
          <p className="text-xs text-amber-600 mt-1">Needs attention</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Danger Zone</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">0</p>
          <p className="text-xs text-gray-500 mt-1">All sensors safe</p>
        </div>
      </div>

      {/* Temperature Requirements */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperature Requirements</h2>
      <div className="space-y-3">
        {DM_REQUIREMENTS.map(req => (
          <div 
            key={req.id}
            className={`bg-white rounded-xl border p-4 ${
              req.isWarning ? 'border-amber-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{req.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{req.name}</h3>
                    <span className="text-sm text-gray-400">({req.arabicName})</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{req.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-xl font-bold ${
                  req.isWarning ? 'text-amber-500' : 'text-gray-900'
                }`}>
                  {req.requirement}
                </p>
                {req.isWarning && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Avoid at all costs</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            Keep compliance reports for at least 2 years as required by Dubai Municipality
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            Food in the danger zone (5-60°C) should not exceed 2 hours total
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            Temperature logs must be available for inspection at all times
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            Sensors should be calibrated annually by certified technicians
          </li>
        </ul>
      </div>
    </div>
  )
}
