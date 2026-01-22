'use client'

import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const FAQ_CATEGORIES = [
  {
    category: '🌡️ Temperature & Compliance',
    items: [
      {
        question: 'What temperature should my fridge be?',
        answer: 'According to Dubai Municipality guidelines (DM-HSD-GU46-KFPA2), cold storage units must maintain 0°C to 5°C. Display coolers and prep fridges follow the same standard.',
      },
      {
        question: 'What temperature should my freezer be?',
        answer: 'Freezers must maintain -18°C or below. This ensures frozen foods remain safe and comply with DM regulations for frozen storage.',
      },
      {
        question: 'What is the Danger Zone?',
        answer: 'The danger zone is 5°C to 60°C where bacteria multiply rapidly. Food in this range for more than 2 hours total must be discarded. Our system alerts you immediately if equipment enters this zone.',
      },
      {
        question: 'What temperature should hot holding equipment be?',
        answer: 'Hot holding units (bain-marie, warming cabinets) must maintain food at 60°C or above to prevent bacterial growth and comply with DM food safety standards.',
      },
      {
        question: 'How do I stay compliant with Dubai Municipality?',
        answer: 'Keep all equipment within required temperature ranges, acknowledge alerts promptly, and download monthly compliance reports. Our DM Compliance page shows your real-time compliance status.',
      },
    ],
  },
  {
    category: '📡 Sensors & Equipment',
    items: [
      {
        question: 'How do the sensors work?',
        answer: 'Dragino PS-NB sensors monitor temperature every 5 minutes and transmit data via LoRaWAN to AWS IoT Core. Data is processed in real-time and displayed on your dashboard.',
      },
      {
        question: 'How often do sensors report data?',
        answer: 'Sensors report every 5 minutes by default. Critical readings are transmitted immediately. You can request more frequent readings through support.',
      },
      {
        question: 'What if a sensor goes offline?',
        answer: 'You\'ll receive an immediate alert. Check if the sensor has battery power and is within range of the gateway. Contact support if the issue persists.',
      },
      {
        question: 'How long do sensor batteries last?',
        answer: 'Sensor batteries typically last 2-3 years under normal conditions. Battery level is shown in My Equipment. We\'ll alert you when battery is below 20%.',
      },
      {
        question: 'Can I add more sensors?',
        answer: 'Yes! Contact support to add sensors. Pricing depends on total sensor count: Starter (1-2) 449 AED, Standard (3-5) 399 AED, Professional (6-15) 349 AED, Enterprise (16+) 299 AED per sensor/month. 15% discount on annual plans. Installation is 999 AED per sensor (one-time).',
      },
      {
        question: 'How do I assign equipment details to sensors?',
        answer: 'Go to Settings > Equipment Management. Click any equipment to add model name and serial number. This information appears in compliance reports.',
      },
    ],
  },
  {
    category: '🚨 Alerts & Notifications',
    items: [
      {
        question: 'What types of alerts will I receive?',
        answer: 'Warning alerts (approaching threshold), Critical alerts (threshold breached), Danger Zone alerts (5-60°C), and Equipment Offline alerts. Critical alerts are always enabled.',
      },
      {
        question: 'How do I set up WhatsApp alerts?',
        answer: 'Go to Settings > WhatsApp Alerts. Enable notifications and add up to 4 phone numbers. All numbers receive alerts simultaneously via Twilio.',
      },
      {
        question: 'What should I do when I receive an alert?',
        answer: '1) Check the affected equipment immediately. 2) Identify and fix the issue (door left open, power issue, etc.). 3) Wait for temperature to recover. 4) Acknowledge the alert in the app.',
      },
      {
        question: 'Can I customize alert thresholds?',
        answer: 'Default thresholds follow DM guidelines and cannot be loosened. You can request stricter thresholds through Settings > Thresholds. Contact support for custom configurations.',
      },
      {
        question: 'How do I acknowledge an alert?',
        answer: 'Click "Acknowledge" on any alert in your Dashboard or Alerts page. Acknowledged alerts are logged for compliance records but won\'t trigger repeat notifications.',
      },
    ],
  },
  {
    category: '📊 Reports & Data',
    items: [
      {
        question: 'How do I download compliance reports?',
        answer: 'Go to Reports, select your equipment and time period (Daily/Weekly/Monthly/Yearly), then click Download PDF. Reports include all temperature readings and compliance status.',
      },
      {
        question: 'How long is data stored?',
        answer: 'All temperature data is stored for 2 years in our UAE data centers. You can access historical reports at any time from the Reports page.',
      },
      {
        question: 'Can I edit temperature readings?',
        answer: 'If enabled in Settings > Manual Edit, you can adjust readings for compliance purposes. This feature is designed for legitimate corrections only.',
      },
      {
        question: 'What reports are available?',
        answer: 'Daily summaries, Weekly reports, Monthly compliance reports, and Yearly overviews. Each shows temperature trends, compliance percentage, alerts, and DM requirement adherence.',
      },
      {
        question: 'Can I export data to Excel?',
        answer: 'Yes, from My Equipment > select sensor > Export CSV. This provides raw temperature data with timestamps for your own analysis.',
      },
    ],
  },
  {
    category: '💳 Billing & Subscription',
    items: [
      {
        question: 'How much does the service cost?',
        answer: 'Installation: 999 AED per sensor (one-time). Monthly subscription varies by sensor count: Starter (1-2 sensors) 449 AED, Standard (3-5) 399 AED, Professional (6-15) 349 AED, Enterprise (16+) 299 AED per sensor/month. Annual plans get 15% discount. All plans include 24/7 monitoring, alerts, reports, support, and free sensor replacement after 5 years.',
      },
      {
        question: 'How do I change my subscription?',
        answer: 'Go to Subscription page to view plans and switch between monthly/yearly. Adding sensors may change your tier and reduce per-sensor price. Changes take effect at the next billing cycle.',
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit/debit cards via Stripe. Bank transfers available for yearly subscriptions. Contact billing@visiondrive.ae for invoice payments.',
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Monthly plans can be cancelled with 30 days written notice. Yearly plans can be cancelled but are non-refundable for the remaining period. Contact support@visiondrive.ae to cancel.',
      },
      {
        question: 'Is sensor replacement included?',
        answer: 'Yes! Sensors are replaced free of charge after 5 years of continuous service with an active subscription. Defective sensors are replaced at no cost during the subscription period.',
      },
    ],
  },
  {
    category: '🔒 Security & Privacy',
    items: [
      {
        question: 'Where is my data stored?',
        answer: 'All data is stored exclusively in AWS UAE Region (me-central-1) in Abu Dhabi. No data leaves the UAE, ensuring full compliance with local data residency requirements.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes. We use AES-256 encryption at rest, TLS 1.3 in transit, and follow GDPR standards. Access is restricted to authorized personnel only.',
      },
      {
        question: 'Who can access my kitchen data?',
        answer: 'Only you and users you authorize. VisionDrive support may access data for troubleshooting with your permission. No third-party access.',
      },
      {
        question: 'Can I request data deletion?',
        answer: 'Yes, contact legal@visiondrive.ae. We\'ll delete all your data within 30 days, except records required for regulatory compliance.',
      },
    ],
  },
]

export default function OwnerHelp() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className={`p-5 md:p-8 lg:p-10 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Help & Support</h1>
          <p className={`text-base mt-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Get help with Smart Kitchen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Contact Support */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white">
              <h2 className="text-lg font-semibold mb-1.5">Need Help?</h2>
              <p className="text-teal-100 text-sm mb-4">Support available 24/7</p>
              
              <div className="space-y-3">
                <a 
                  href="tel:+971559152985"
                  className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-base">+971 55 915 2985</p>
                    <p className="text-xs text-teal-100">24/7 Support</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:support@visiondrive.ae"
                  className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-base">support@visiondrive.ae</p>
                    <p className="text-xs text-teal-100">Email</p>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/971559152985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-base">WhatsApp</p>
                    <p className="text-xs text-teal-100">Quick Response</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`font-semibold text-base mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h2>
              
              <div className="space-y-2">
                <a 
                  href="https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>DM Guidelines (PDF)</span>
                  </div>
                  <ExternalLink className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </a>
                
                <a 
                  href="#"
                  className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>User Manual</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </a>
                
                <a 
                  href="#"
                  className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sensor Calibration</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ */}
          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2.5 mb-4">
              <HelpCircle className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <h2 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {FAQ_CATEGORIES.map((category, catIndex) => (
                <div key={catIndex}>
                  <h3 className={`font-semibold text-sm mb-3 sticky top-0 py-1 ${isDark ? 'text-orange-400 bg-[#2d2d2f]' : 'text-orange-600 bg-white'}`}>
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item, index) => (
                      <details 
                        key={index} 
                        className={`group rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50'}`}
                      >
                        <summary className={`flex items-center justify-between px-3 py-2.5 cursor-pointer list-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <span className="font-medium text-sm pr-4">{item.question}</span>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-90 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        </summary>
                        <div className={`px-3 pb-3 pt-1 text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
