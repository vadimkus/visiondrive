'use client'

import { 
  ArrowRight, 
  Radio, 
  Zap, 
  Shield, 
  Clock,
  Thermometer,
  AlertTriangle,
  FileCheck,
  Bell,
  BarChart3,
  ChevronRight,
  Smartphone,
  CheckCircle
} from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import Link from 'next/link'

const stats = [
  { number: '24/7', label: 'Monitoring', icon: Clock },
  { number: '<30s', label: 'Alert Time', icon: Zap },
  { number: '99%+', label: 'Accuracy', icon: Shield },
  { number: '5yr', label: 'Battery', icon: Radio },
]

const features = [
  {
    icon: Thermometer,
    title: 'Temperature Monitoring',
    description: 'Real-time fridge & freezer tracking with NB-IoT sensors',
    color: 'text-blue-600',
    bg: 'bg-blue-500',
  },
  {
    icon: AlertTriangle,
    title: 'Danger Zone Alerts',
    description: 'Instant alerts when temperatures enter 5°C-60°C zone',
    color: 'text-red-600',
    bg: 'bg-red-500',
  },
  {
    icon: FileCheck,
    title: 'DM Compliance',
    description: 'Automated Dubai Municipality compliance reporting',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Historical data & insights for kitchen management',
    color: 'text-purple-600',
    bg: 'bg-purple-500',
  },
]

const temperatureZones = [
  { temp: '0-5°C', label: 'Fridge', color: 'bg-blue-500' },
  { temp: '≤-18°C', label: 'Freezer', color: 'bg-cyan-500' },
  { temp: '5-60°C', label: 'Danger', color: 'bg-red-500' },
  { temp: '≥60°C', label: 'Hot Hold', color: 'bg-orange-500' },
]

const benefits = [
  'Dubai Municipality Compliant',
  'TDRA Certified IoT',
  '100% UAE Data Residency',
  'WhatsApp & Email Alerts',
]

export default function HomeClient() {
  const { language } = useLanguage()

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 md:pt-28 pb-8 md:pb-16 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Badge */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
              <span className="text-sm font-medium text-orange-700">🇦🇪 Smart Kitchen IoT</span>
            </div>
          </div>
          
          {/* Main Heading - Apple Style */}
          <div className="text-center mb-8 md:mb-12">
            <h1 
              className="text-[2rem] leading-[1.1] md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-4 md:mb-6"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              Temperature Monitoring
              <br />
              <span className="text-orange-500">Made Simple.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Real-time monitoring for commercial kitchens. Dubai Municipality compliant.
            </p>
          </div>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 md:mb-16 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 h-14 px-8 bg-orange-500 text-white text-[17px] font-semibold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
            >
              Request Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/solutions"
              className="flex items-center justify-center gap-2 h-14 px-8 bg-gray-100 text-gray-900 text-[17px] font-semibold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Temperature Zones - Compact Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 md:mb-16">
            {temperatureZones.map((zone) => (
              <div
                key={zone.label}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full"
              >
                <div className={`w-2 h-2 rounded-full ${zone.color}`} />
                <span className="text-sm font-medium text-gray-700">{zone.temp}</span>
                <span className="text-sm text-gray-400">{zone.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 px-5 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2 md:mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Apple Card Style */}
      <section className="py-12 md:py-20 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
              Why VisionDrive?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 md:p-8 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5`}>
                  <feature.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List - Clean & Minimal */}
      <section className="py-12 md:py-16 px-5 md:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div 
                key={benefit}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-[17px] font-medium text-gray-900">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kitchen Owner Portal CTA */}
      <section className="py-12 md:py-20 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-orange-400">Kitchen Owner Portal</span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight">
                Already a Customer?
              </h2>

              <p className="text-gray-400 mb-8 max-w-lg text-lg">
                Access your dashboard to monitor sensors, view alerts, and download compliance reports.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/kitchen-owner"
                  className="flex items-center justify-center gap-2 h-14 px-8 bg-orange-500 text-white text-[17px] font-semibold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all"
                >
                  Kitchen Portal
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 h-14 px-8 bg-white/10 text-white text-[17px] font-semibold rounded-2xl border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA - Simple */}
      <section className="py-12 md:py-16 px-5 md:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Contact us for a free consultation and demo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/971559152985"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="text-sm text-gray-500">WhatsApp</div>
                <div className="font-semibold text-gray-900">+971 55 915 2985</div>
              </div>
            </a>
            <a
              href="mailto:tech@visiondrive.ae"
              className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all"
            >
              <span className="text-2xl">✉️</span>
              <div className="text-left">
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-semibold text-gray-900">tech@visiondrive.ae</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Bottom padding for mobile */}
      <div className="h-8 md:h-0" />
    </main>
  )
}
