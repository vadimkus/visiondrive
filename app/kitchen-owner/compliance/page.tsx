'use client'

import { Shield, FileText, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>DM Compliance</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dubai Municipality Food Safety Guidelines</p>
        </div>

        {/* DM Reference Banner */}
        <div className={`rounded-xl p-4 mb-4 border ${
          isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <FileText className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <h2 className={`font-semibold text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>DM-HSD-GU46-KFPA2</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Technical Guidelines for OH&S in Kitchen/Food Areas
              </p>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>v3 • 09/05/2024</p>
            </div>
            <a 
              href="https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              PDF
            </a>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Compliant</span>
            </div>
            <p className="text-xl font-bold text-emerald-500 mt-0.5">80%</p>
            <p className={`text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>4 of 5 sensors</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Warnings</span>
            </div>
            <p className="text-xl font-bold text-amber-500 mt-0.5">1</p>
            <p className={`text-[10px] ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Needs attention</p>
          </div>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Danger Zone</span>
            </div>
            <p className="text-xl font-bold text-emerald-500 mt-0.5">0</p>
            <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>All sensors safe</p>
          </div>
        </div>

        {/* Temperature Requirements */}
        <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Temperature Requirements</h2>
        <div className="space-y-2">
          {DM_REQUIREMENTS.map(req => (
            <div 
              key={req.id}
              className={`rounded-xl border p-3 ${
                isDark 
                  ? req.isWarning ? 'bg-[#2d2d2f] border-amber-700' : 'bg-[#2d2d2f] border-gray-700'
                  : req.isWarning ? 'bg-white border-amber-200' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{req.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{req.name}</h3>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({req.arabicName})</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{req.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    req.isWarning ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {req.requirement}
                  </p>
                  {req.isWarning && (
                    <p className="text-[10px] text-amber-500">⚠️ Avoid</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-[#2d2d2f]' : 'bg-gray-50'}`}>
          <h3 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Important Notes</h3>
          <ul className={`space-y-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Keep reports for 2+ years (DM requirement)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Danger zone (5-60°C) max 2 hours total
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Temperature logs must be available for inspection
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Annual sensor calibration required
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
