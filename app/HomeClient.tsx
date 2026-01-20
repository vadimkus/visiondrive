'use client'

import { 
  ArrowRight, 
  Radio, 
  Zap, 
  Shield, 
  Clock,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Building2,
  FileCheck,
  Bell,
  BarChart3
} from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'

const stats = [
  { number: '24/7', label: 'Monitoring', icon: Clock },
  { number: '<30s', label: 'Alert Latency', icon: Zap },
  { number: '99%+', label: 'Accuracy', icon: Shield },
  { number: '5+ yr', label: 'Battery Life', icon: Radio },
]

const features = [
  {
    icon: Thermometer,
    title: 'Temperature Monitoring',
    description: 'Real-time fridge, freezer, and ambient temperature tracking with NB-IoT sensors.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: AlertTriangle,
    title: 'Danger Zone Alerts',
    description: 'Instant notifications when temperatures enter the 5°C-60°C food safety danger zone.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: FileCheck,
    title: 'DM Compliance',
    description: 'Automated compliance reporting aligned with Dubai Municipality food safety standards.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Historical data, trends, and insights for proactive kitchen management.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const temperatureZones = [
  { temp: '0°C - 5°C', label: 'Fridge Safe Zone', color: 'border-blue-200', bg: 'bg-blue-50', icon: Thermometer, iconColor: 'text-blue-500' },
  { temp: '≤ -18°C', label: 'Freezer Safe Zone', color: 'border-cyan-200', bg: 'bg-cyan-50', icon: Thermometer, iconColor: 'text-cyan-500' },
  { temp: '5°C - 60°C', label: 'Danger Zone', color: 'border-red-200', bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-500' },
  { temp: '≥ 60°C', label: 'Hot Holding', color: 'border-orange-200', bg: 'bg-orange-50', icon: Thermometer, iconColor: 'text-orange-500' },
]

export default function HomeClient() {
  const { language } = useLanguage()

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 text-gray-900">
      <div className="flex flex-col pt-[60px] sm:pt-[72px] px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full py-8 sm:py-12 lg:py-16">
          
          {/* Hero */}
          <div className="text-center mb-8 sm:mb-10">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 mb-4 sm:mb-6">
              <ChefHat className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-orange-700">
                🇦🇪 Smart Kitchen IoT • Dubai Municipality Compliant
              </span>
            </div>
            
            {/* Heading */}
            <h1 
              className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-4 sm:mb-5"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              Smart Kitchen
              <br className="sm:hidden" />
              <span className="text-orange-600"> Temperature Monitoring</span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              Real-time temperature monitoring for commercial kitchens. Ensure food safety compliance 
              with Dubai Municipality standards. Automated alerts and compliance reporting.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto mb-8 sm:mb-10">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-orange-600 text-white text-base font-semibold rounded-xl hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/25 group"
              >
                Request Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-900 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 active:scale-[0.98] transition-all"
              >
                View Solutions
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto w-full mb-8 sm:mb-10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-orange-100 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 mb-2 sm:mb-3">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Temperature Zones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto w-full mb-12 sm:mb-16">
            {temperatureZones.map((zone) => (
              <div
                key={zone.label}
                className={`${zone.bg} backdrop-blur rounded-xl p-3 sm:p-4 border ${zone.color} text-center`}
              >
                <zone.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${zone.iconColor} mx-auto mb-2`} />
                <div className="text-xs sm:text-sm font-semibold text-gray-900">{zone.temp}</div>
                <div className="text-xs text-gray-500">{zone.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                Why Choose VisionDrive?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Enterprise-grade IoT sensors built for commercial kitchen environments
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kitchen Owner Portal CTA */}
          <div className="w-full max-w-4xl mx-auto mt-12 sm:mt-16">
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 lg:p-10 text-white">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-8xl">🍳</div>
              </div>

              <div className="relative text-center">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 mb-4">
                  <Bell className="h-4 w-4 text-orange-400 mr-2" />
                  <span className="text-xs sm:text-sm font-semibold text-orange-300">
                    Kitchen Owner Portal
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
                  Already a VisionDrive Customer?
                </h2>

                <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-6">
                  Access your dashboard to monitor sensors, view alerts, and download compliance reports.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a
                    href="/kitchen-owner"
                    className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 active:scale-[0.98] transition-all"
                  >
                    Kitchen Owner Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all"
                  >
                    Admin Portal Login
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
