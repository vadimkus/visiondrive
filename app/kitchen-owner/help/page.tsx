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

const FAQ = [
  {
    question: 'What temperature should my fridge be?',
    answer: 'According to Dubai Municipality guidelines (DM-HSD-GU46-KFPA2), cold storage units should maintain a temperature between 0°C and 5°C.',
  },
  {
    question: 'What is the Danger Zone?',
    answer: 'The danger zone is the temperature range between 5°C and 60°C where bacteria grow rapidly. Food should not be in this zone for more than 2 hours total.',
  },
  {
    question: 'How often should I check my sensors?',
    answer: 'Sensors are monitored automatically 24/7. You will receive alerts if any temperature goes out of range. We recommend a daily visual check of your dashboard.',
  },
  {
    question: 'How do I download compliance reports?',
    answer: 'Go to Reports in the sidebar, then click Download on any available report. You can also generate custom reports for specific date ranges.',
  },
  {
    question: 'What should I do if I get a warning alert?',
    answer: 'Check the affected sensor immediately. If a fridge is warming up, ensure the door is closed properly. Acknowledge the alert once resolved.',
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
              <h2 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>FAQ</h2>
            </div>
            
            <div className="space-y-4">
              {FAQ.map((item, index) => (
                <div key={index} className={`pb-4 border-b last:border-0 last:pb-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.question}</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
