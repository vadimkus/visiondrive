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
    <div className={`p-4 md:p-6 lg:p-8 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Help & Support</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Get help with Smart Kitchen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Contact Support */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4 text-white">
              <h2 className="text-base font-semibold mb-1">Need Help?</h2>
              <p className="text-teal-100 text-xs mb-3">Support available 24/7</p>
              
              <div className="space-y-2">
                <a 
                  href="tel:+971559152985"
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="font-medium text-sm">+971 55 915 2985</p>
                    <p className="text-[10px] text-teal-100">24/7 Support</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:support@visiondrive.ae"
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <div>
                    <p className="font-medium text-sm">support@visiondrive.ae</p>
                    <p className="text-[10px] text-teal-100">Email</p>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/971559152985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <div>
                    <p className="font-medium text-sm">WhatsApp</p>
                    <p className="text-[10px] text-teal-100">Quick Response</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
              <h2 className={`font-semibold text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h2>
              
              <div className="space-y-1">
                <a 
                  href="https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between px-2 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>DM Guidelines (PDF)</span>
                  </div>
                  <ExternalLink className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </a>
                
                <a 
                  href="#"
                  className={`flex items-center justify-between px-2 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>User Manual</span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </a>
                
                <a 
                  href="#"
                  className={`flex items-center justify-between px-2 py-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sensor Calibration</span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ */}
          <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>FAQ</h2>
            </div>
            
            <div className="space-y-3">
              {FAQ.map((item, index) => (
                <div key={index} className={`pb-3 border-b last:border-0 last:pb-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <h3 className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.question}</h3>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
