'use client'

import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Thermometer,
  ThermometerSnowflake,
  Flame,
  Clock,
  BookOpen,
  BadgeCheck,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Dubai Municipality Temperature Guidelines
const DM_REQUIREMENTS = [
  {
    id: 'cold-storage',
    name: 'Refrigerated Storage',
    arabicName: 'تخزين مبرد',
    icon: Thermometer,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    requirement: '0°C to 5°C',
    description: 'Walk-in fridges, refrigerators, prep fridges, display coolers',
    details: 'Maintain temperature for all chilled foods including dairy, meat, and prepared items.',
    status: 'compliant',
    currentReading: '3.2°C',
  },
  {
    id: 'freezer',
    name: 'Frozen Storage',
    arabicName: 'تخزين مجمد',
    icon: ThermometerSnowflake,
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    requirement: '≤ -18°C',
    description: 'Freezers, ice cream storage, frozen goods',
    details: 'All frozen products must be stored at or below -18°C at all times.',
    status: 'compliant',
    currentReading: '-19.5°C',
  },
  {
    id: 'danger-zone',
    name: 'Danger Zone',
    arabicName: 'منطقة الخطر',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    requirement: '5°C to 60°C',
    description: 'Temperature range where bacteria multiply rapidly',
    details: 'Food should not remain in this range for more than 2 hours total (cumulative).',
    status: 'warning',
    isWarning: true,
  },
  {
    id: 'cooking',
    name: 'Cooking Temperature',
    arabicName: 'درجة حرارة الطهي',
    icon: Flame,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    requirement: '≥ 75°C',
    description: 'Minimum core temperature for cooked foods',
    details: 'Poultry, minced meat, and reheated foods must reach 75°C core temperature.',
    status: 'info',
  },
]

// Compliance metrics
const COMPLIANCE_DATA = {
  overall: 75,
  compliant: 3,
  warning: 1,
  total: 4,
  dangerZoneIncidents: 0,
  lastInspection: '15 Jan 2026',
  nextInspection: '15 Jul 2026',
}

export default function OwnerCompliance() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            DM Compliance
          </h1>
          <p className={`text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Dubai Municipality Food Safety Guidelines
          </p>
        </div>

        {/* Compliance Score Card */}
        <div className={`rounded-3xl p-8 mb-6 ${
          isDark ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40' : 'bg-gradient-to-br from-emerald-50 to-teal-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  <Shield className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Compliance Score
                  </p>
                  <p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                    Based on current sensor readings
                  </p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mt-4">
                <span className={`text-6xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {COMPLIANCE_DATA.overall}%
                </span>
                <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>compliant</span>
              </div>
            </div>
            
            {/* Mini Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
                  isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  <CheckCircle className="h-7 w-7 text-emerald-500" />
                </div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {COMPLIANCE_DATA.compliant}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Compliant</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
                  isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                }`}>
                  <AlertTriangle className="h-7 w-7 text-amber-500" />
                </div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {COMPLIANCE_DATA.warning}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Warning</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
                  COMPLIANCE_DATA.dangerZoneIncidents === 0
                    ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    : isDark ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`h-7 w-7 ${
                    COMPLIANCE_DATA.dangerZoneIncidents === 0 ? 'text-emerald-500' : 'text-red-500'
                  }`} />
                </div>
                <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {COMPLIANCE_DATA.dangerZoneIncidents}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Danger Zone</p>
              </div>
            </div>
          </div>
        </div>

        {/* DM Reference Document */}
        <div className={`rounded-2xl p-6 mb-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <BookOpen className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    DM-HSD-GU46-KFPA2
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    v3
                  </span>
                </div>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Technical Guidelines for Occupational Health and Safety in Kitchen/Food Areas
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Published: 09 May 2024 • Dubai Municipality
                </p>
              </div>
            </div>
            
            <a 
              href="https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>

        {/* Temperature Requirements */}
        <div className={`rounded-2xl overflow-hidden mb-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Temperature Requirements
            </h2>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Dubai Municipality food safety temperature guidelines
            </p>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {DM_REQUIREMENTS.map((req) => {
              const Icon = req.icon
              return (
                <div 
                  key={req.id}
                  className={`p-6 transition-colors ${
                    isDark ? 'hover:bg-[#2c2c2e]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${req.bgColor}`}>
                      <Icon className={`h-7 w-7 ${req.iconColor}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {req.name}
                        </h3>
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {req.arabicName}
                        </span>
                        {req.isWarning && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500">
                            Avoid
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {req.description}
                      </p>
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {req.details}
                      </p>
                    </div>
                    
                    {/* Temperature */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-semibold tracking-tight ${
                        req.isWarning ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {req.requirement}
                      </p>
                      {req.currentReading && (
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {req.currentReading}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Inspection Schedule */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
              }`}>
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Inspection</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {COMPLIANCE_DATA.lastInspection}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <CheckCircle className="h-4 w-4" />
              Passed - No violations
            </div>
          </div>
          
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Next Inspection</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {COMPLIANCE_DATA.nextInspection}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="h-4 w-4" />
              Scheduled - 6 months from last
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#1c1c1e]' : 'bg-white shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Compliance Requirements
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`h-4 w-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Record Keeping
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Keep temperature logs for minimum 2 years. Records must be available for DM inspection.
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Danger Zone Rule
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Food in 5-60°C range must not exceed 2 hours total cumulative time.
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sensor Calibration
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Annual calibration required for all temperature monitoring equipment.
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  HACCP Compliance
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Temperature monitoring is a critical control point in your HACCP plan.
              </p>
            </div>
          </div>
        </div>

        {/* DM Badge */}
        <div className={`mt-6 p-4 rounded-2xl flex items-center justify-center gap-3 ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
        }`}>
          <BadgeCheck className="h-5 w-5 text-emerald-500" />
          <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            VisionDrive Smart Kitchen is Dubai Municipality Compliant
          </span>
          <span className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
            DM-HSD-GU46-KFPA2
          </span>
        </div>

      </div>
    </div>
  )
}
