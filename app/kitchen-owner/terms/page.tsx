'use client'

import { useState } from 'react'
import { 
  FileText, 
  ChevronDown,
  ChevronRight,
  Shield,
  Clock,
  CreditCard,
  AlertTriangle,
  Server,
  Wrench,
  Scale,
  Phone,
  CheckCircle2
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface TermsSection {
  id: string
  icon: React.ElementType
  title: string
  content: string | string[]
}

const termsData: TermsSection[] = [
  {
    id: 'service-description',
    icon: Server,
    title: '1. Service Description',
    content: [
      'VisionDrive Smart Kitchen is an IoT-based temperature monitoring service for commercial kitchens in the UAE. The service includes:',
      '• 24/7 automated temperature monitoring using Dragino S31-NB NB-IoT sensors',
      '• Real-time alerts via dashboard, WhatsApp, and email when temperatures exceed thresholds',
      '• Dubai Municipality compliance reports and documentation',
      '• Historical data storage for 2 years minimum',
      '• Equipment management and multi-user access',
      '• Professional sensor installation and configuration',
      '',
      'The service is designed to help commercial kitchens comply with Dubai Municipality food safety regulations (DM-HSD-GU46-KFPA2) and UAE Federal Law No. 10 of 2015 on Food Safety.',
    ],
  },
  {
    id: 'pricing',
    icon: CreditCard,
    title: '2. Pricing and Subscription Terms',
    content: [
      'INSTALLATION FEE (One-Time):',
      '• 999 AED per sensor - includes hardware, du NB-IoT SIM, professional installation, configuration, and staff training',
      '',
      'MONTHLY SUBSCRIPTION:',
      '• Starter (1-2 sensors): 449 AED per sensor/month',
      '• Standard (3-5 sensors): 399 AED per sensor/month',
      '• Professional (6-15 sensors): 349 AED per sensor/month',
      '• Enterprise (16+ sensors): 299 AED per sensor/month',
      '',
      'ANNUAL SUBSCRIPTION (15% discount):',
      '• Starter: 382 AED per sensor/month (billed annually)',
      '• Standard: 339 AED per sensor/month (billed annually)',
      '• Professional: 297 AED per sensor/month (billed annually)',
      '• Enterprise: 254 AED per sensor/month (billed annually)',
      '',
      'BILLING:',
      '• Monthly subscriptions are billed on the same day each month',
      '• Annual subscriptions are billed in full at the start of the subscription period',
      '• Payment is due within 7 days of invoice date',
      '• Late payments may result in service suspension after 14 days',
      '',
      'CANCELLATION:',
      '• Monthly plans may be cancelled with 30 days written notice',
      '• Annual plans may be cancelled but are non-refundable for the remaining period',
      '• Sensors remain property of the customer after installation',
    ],
  },
  {
    id: 'sla',
    icon: Clock,
    title: '3. Service Level Agreement (SLA)',
    content: [
      'MONITORING UPTIME:',
      '• Target uptime: 99.5% monthly (excluding scheduled maintenance)',
      '• Scheduled maintenance windows: Sundays 02:00-04:00 UAE time (with 48-hour notice)',
      '• Unscheduled downtime credits: 5% monthly fee credit per 0.1% below 99.5% (maximum 30%)',
      '',
      'SENSOR DATA TRANSMISSION:',
      '• Standard transmission interval: Every 5 minutes',
      '• Critical alerts: Real-time transmission (within 60 seconds of threshold breach)',
      '• Data delivery SLA: 99% of readings delivered within 2 minutes',
      '',
      'ALERT DELIVERY:',
      '• Dashboard alerts: Real-time (within 60 seconds)',
      '• WhatsApp alerts: Within 2 minutes of threshold breach',
      '• Email alerts: Within 5 minutes of threshold breach',
      '',
      'SUPPORT RESPONSE TIMES:',
      '• Critical (sensor offline, no alerts): Response within 1 hour, resolution within 4 hours',
      '• High (alert delivery issues): Response within 2 hours, resolution within 8 hours',
      '• Medium (reporting issues): Response within 4 hours, resolution within 24 hours',
      '• Low (general inquiries): Response within 24 hours',
      '',
      'EXCLUSIONS:',
      '• du network outages or NB-IoT coverage issues',
      '• Customer-caused damage to sensors',
      '• Power outages at customer premises',
      '• Force majeure events',
    ],
  },
  {
    id: 'sensor-replacement',
    icon: Wrench,
    title: '4. Equipment and Sensor Replacement',
    content: [
      'SENSOR LIFECYCLE:',
      '• Sensors have an expected lifespan of 5 years under normal operating conditions',
      '• Battery life: Approximately 5 years with standard 5-minute transmission intervals',
      '',
      'FREE REPLACEMENT POLICY:',
      '• Sensors are replaced at no additional cost after 5 years of continuous service with an active subscription',
      '• Defective sensors are replaced free of charge during the subscription period',
      '• Replacement includes professional installation',
      '',
      'CUSTOMER RESPONSIBILITIES:',
      '• Sensors must not be tampered with, moved, or modified',
      '• Sensors must be protected from physical damage, water immersion, and extreme conditions',
      '• Any damage caused by customer negligence may result in replacement charges (999 AED per sensor)',
      '',
      'CALIBRATION:',
      '• Annual calibration verification included in subscription',
      '• Calibration certificates available upon request for DM inspections',
    ],
  },
  {
    id: 'compliance',
    icon: Shield,
    title: '5. Compliance and Regulatory',
    content: [
      'DUBAI MUNICIPALITY COMPLIANCE:',
      '• Service is designed to meet DM-HSD-GU46-KFPA2 temperature monitoring requirements',
      '• Temperature thresholds are pre-configured per DM guidelines (cannot be loosened)',
      '• Compliance reports are formatted for DM inspection requirements',
      '• Data retention meets the 2-year minimum requirement',
      '',
      'TDRA CERTIFICATION:',
      '• All sensors are TDRA-certified for use in the UAE (Reference: EA-2026-1-55656)',
      '• du NB-IoT network is used for connectivity',
      '',
      'UAE DATA RESIDENCY:',
      '• All customer data is stored exclusively in AWS me-central-1 (Abu Dhabi, UAE)',
      '• No data is transferred outside the UAE',
      '• Compliant with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection',
      '',
      'CUSTOMER RESPONSIBILITY:',
      '• VisionDrive provides monitoring tools; ultimate compliance responsibility remains with the kitchen operator',
      '• Customers must respond to alerts promptly and maintain equipment in working condition',
      '• Temperature logs and alerts should be reviewed regularly',
    ],
  },
  {
    id: 'alerts',
    icon: AlertTriangle,
    title: '6. Alert Configuration and Thresholds',
    content: [
      'DEFAULT TEMPERATURE THRESHOLDS (per DM Guidelines):',
      '• Cold Storage (Fridges): 0°C to 5°C',
      '• Freezer Storage: ≤ -18°C',
      '• Hot Holding: ≥ 60°C',
      '• Danger Zone Alert: 5°C to 60°C (immediate alert)',
      '',
      'ALERT TYPES:',
      '• Warning: Temperature approaching threshold (configurable buffer)',
      '• Critical: Temperature exceeds threshold',
      '• Danger Zone: Temperature in unsafe range (5-60°C)',
      '• Equipment Offline: No data received for 15+ minutes',
      '• Low Battery: Sensor battery below 20%',
      '',
      'NOTIFICATION METHODS:',
      '• Dashboard: Real-time visual alerts with sound option',
      '• WhatsApp: Instant messages to up to 4 phone numbers',
      '• Email: Alerts sent to registered email addresses',
      '',
      'CUSTOMIZATION:',
      '• Thresholds can be made stricter (but not looser) than DM requirements',
      '• Alert recipients and methods can be configured per equipment',
      '• Quiet hours can be set for non-critical alerts (critical alerts always delivered)',
    ],
  },
  {
    id: 'liability',
    icon: Scale,
    title: '7. Liability and Disclaimers',
    content: [
      'SERVICE LIMITATIONS:',
      '• VisionDrive provides temperature monitoring as a tool to assist with compliance',
      '• The service does not guarantee compliance with DM regulations',
      '• Customers are responsible for responding to alerts and maintaining food safety',
      '',
      'LIABILITY LIMITS:',
      '• VisionDrive is not liable for food spoilage, DM fines, or business losses',
      '• Maximum liability is limited to 12 months of subscription fees paid',
      '• VisionDrive is not liable for du network outages or AWS service interruptions',
      '',
      'INDEMNIFICATION:',
      '• Customer agrees to indemnify VisionDrive against claims arising from:',
      '  - Failure to respond to alerts',
      '  - Improper use of the service',
      '  - Food safety incidents not caused by service failure',
      '',
      'FORCE MAJEURE:',
      '• Neither party is liable for failures due to events beyond reasonable control',
      '• Including: natural disasters, war, government actions, network outages, pandemics',
    ],
  },
  {
    id: 'termination',
    icon: FileText,
    title: '8. Termination',
    content: [
      'CUSTOMER-INITIATED:',
      '• Monthly plans: 30 days written notice to support@visiondrive.ae',
      '• Annual plans: Can be cancelled anytime, no refund for remaining period',
      '• Access terminates at end of paid period',
      '',
      'VISIONDRIVE-INITIATED:',
      '• Immediate termination for non-payment (after 14-day grace period)',
      '• Immediate termination for violation of terms',
      '• 30-day notice for service discontinuation',
      '',
      'UPON TERMINATION:',
      '• Customer data is retained for 30 days, then deleted',
      '• Compliance reports can be downloaded before termination',
      '• Sensors remain customer property',
      '• No refunds for partial months',
    ],
  },
  {
    id: 'governing-law',
    icon: Scale,
    title: '9. Governing Law',
    content: [
      'These Terms are governed by the laws of the United Arab Emirates.',
      '',
      'Any disputes shall be resolved through:',
      '1. Good faith negotiation (30 days)',
      '2. Mediation in Dubai, UAE',
      '3. Arbitration in Dubai International Arbitration Centre (DIAC)',
      '',
      'The language of arbitration shall be English.',
    ],
  },
  {
    id: 'contact',
    icon: Phone,
    title: '10. Contact Information',
    content: [
      'VisionDrive Technologies FZ-LLC',
      'Compass Coworking Centre',
      'Ras Al Khaimah, United Arab Emirates',
      '',
      'Technical Support: support@visiondrive.ae | +971 55 915 2985',
      'Billing: billing@visiondrive.ae',
      'Legal: legal@visiondrive.ae',
      '',
      'Support Hours: 24/7 for critical issues',
      'WhatsApp: +971 55 915 2985',
    ],
  },
]

export default function TermsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [expandedSections, setExpandedSections] = useState<string[]>(['service-description'])

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const expandAll = () => setExpandedSections(termsData.map(s => s.id))
  const collapseAll = () => setExpandedSections([])

  return (
    <div className={`p-4 md:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <FileText className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Terms of Service</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Smart Kitchen Temperature Monitoring Service</p>
            </div>
          </div>
        </div>

        {/* Effective Date Banner */}
        <div className={`rounded-xl p-4 mb-6 border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Effective Date: January 21, 2026
                </p>
                <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  VisionDrive Technologies FZ-LLC • Governed by UAE Law
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-3">
          {termsData.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(section.id)
            
            return (
              <div 
                key={section.id}
                className={`rounded-xl border overflow-hidden transition-all ${
                  isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <h2 className={`flex-1 font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {section.title}
                  </h2>
                  {isExpanded ? (
                    <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  ) : (
                    <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </button>
                
                {isExpanded && (
                  <div className={`px-4 pb-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
                    <div className={`pt-3 text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {Array.isArray(section.content) 
                        ? section.content.map((line, i) => (
                            <p key={i} className={line === '' ? 'h-3' : line.startsWith('•') ? 'pl-4' : ''}>
                              {line}
                            </p>
                          ))
                        : section.content
                      }
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className={`mt-6 p-4 rounded-xl text-center ${isDark ? 'bg-[#2d2d2f]' : 'bg-gray-50'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            By using VisionDrive Smart Kitchen, you agree to these terms.
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Questions? Contact <a href="mailto:legal@visiondrive.ae" className="text-orange-500 hover:underline">legal@visiondrive.ae</a>
          </p>
          <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Document Version 1.0 • Last Updated: January 21, 2026
          </p>
        </div>
      </div>
    </div>
  )
}
