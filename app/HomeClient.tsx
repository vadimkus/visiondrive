'use client'

import { 
  ArrowRight, 
  Radio, 
  Zap, 
  Shield, 
  Clock,
  Building2,
  Users,
  MapPin,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  ChefHat
} from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'

const stats = [
  { number: '1,000+', label: 'Sensors', icon: Radio },
  { number: '<30s', label: 'Latency', icon: Clock },
  { number: '99%+', label: 'Accuracy', icon: Zap },
  { number: '5+ yr', label: 'Battery', icon: Shield },
]

const quickLinks = [
  { icon: Building2, title: 'Municipalities', href: '/municipalities' },
  { icon: Users, title: 'Communities', href: '/communities' },
  { icon: MapPin, title: 'Solutions', href: '/solutions' },
]

export default function HomeClient() {
  const { language } = useLanguage()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900">
      <div className="flex flex-col pt-[60px] sm:pt-[72px] px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full py-8 sm:py-12 lg:py-16">
          
          {/* Hero */}
          <div className="text-center mb-8 sm:mb-10">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-primary-700">
                🇦🇪 NB-IoT Smart Parking • UAE
              </span>
            </div>
            
            {/* Heading */}
            <h1 
              className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-4 sm:mb-5"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              Bay-Level Parking
              <br className="sm:hidden" />
              <span className="text-primary-600"> Intelligence</span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              Real-time parking occupancy for municipalities and smart cities. 
              Know exactly which bays are free, instantly.
            </p>
            
            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto mb-8 sm:mb-10">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/25 group"
              >
                Request Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-gray-900 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 active:scale-[0.98] transition-all"
              >
                View Solutions
              </a>
            </div>
          </div>

          {/* Stats Row - 2x2 on mobile, 4 columns on tablet+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto w-full mb-8 sm:mb-10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 mb-2 sm:mb-3">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Links - Full width cards on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xl sm:max-w-2xl mx-auto w-full mb-12 sm:mb-16">
            {quickLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="flex items-center justify-center gap-3 px-5 py-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md active:scale-[0.98] transition-all text-base font-medium text-gray-700 hover:text-primary-600"
              >
                <link.icon className="h-5 w-5" />
                <span>{link.title}</span>
              </a>
            ))}
          </div>

          {/* Smart Kitchen Section */}
          <div className="w-full max-w-4xl mx-auto">
            {/* Section Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Also from VisionDrive</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>

            {/* Smart Kitchen Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl border border-orange-100 p-6 sm:p-8 lg:p-10">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 text-8xl">🌡️</div>
              </div>

              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 mb-4">
                  <ChefHat className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-xs sm:text-sm font-semibold text-orange-700">
                    🇦🇪 Smart Kitchen IoT • Dubai Municipality Compliant
                  </span>
                </div>

                {/* Heading */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Smart Kitchen
                  <span className="text-orange-600"> Temperature Monitoring</span>
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mb-6 leading-relaxed">
                  Real-time temperature monitoring for commercial kitchens. Ensure food safety compliance 
                  with Dubai Municipality standards. Automated alerts for danger zone temperatures.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-3 sm:p-4 border border-orange-100 text-center">
                    <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">0°C - 5°C</div>
                    <div className="text-xs text-gray-500">Fridge</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-3 sm:p-4 border border-blue-100 text-center">
                    <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">≤ -18°C</div>
                    <div className="text-xs text-gray-500">Freezer</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-3 sm:p-4 border border-red-100 text-center">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mx-auto mb-2" />
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">5°C - 60°C</div>
                    <div className="text-xs text-gray-500">Danger Zone</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-3 sm:p-4 border border-green-100 text-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">DM Compliant</div>
                    <div className="text-xs text-gray-500">Food Safety</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}

