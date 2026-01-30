'use client'

import { 
  ArrowRight, 
  Radio, 
  Zap, 
  Shield, 
  Wifi,
  ChevronRight,
  CheckCircle,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import Link from 'next/link'

const stats = [
  { number: '24/7', label: 'Monitoring', icon: Radio },
  { number: '<30s', label: 'Response', icon: Zap },
  { number: '99%+', label: 'Uptime', icon: Shield },
  { number: 'UAE', label: 'Based', icon: Globe },
]

const capabilities = [
  { icon: Wifi, label: 'NB-IoT Connectivity' },
  { icon: Lock, label: 'UAE Data Residency' },
  { icon: Shield, label: 'TDRA Certified' },
  { icon: BarChart3, label: 'Real-time Analytics' },
]

const benefits = [
  'TDRA Certified IoT Solutions',
  '100% UAE Data Residency',
  'Dubai Municipality Compliant',
  '24/7 Monitoring & Support',
]

export default function HomeClient() {
  const { language } = useLanguage()

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 md:pt-28 pb-12 md:pb-20 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Badge */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-sm font-medium text-gray-700">🇦🇪 UAE IoT Company</span>
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="text-center mb-10 md:mb-14">
            <h1 
              className="text-[2rem] leading-[1.1] md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-4 md:mb-6"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              Smart IoT Solutions
              <br />
              <span className="text-orange-500">for the UAE.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade IoT sensors, real-time monitoring, and compliance reporting. Built for UAE businesses.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 md:mb-16 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/solutions"
              className="flex items-center justify-center gap-2 h-14 px-8 bg-orange-500 text-white text-[17px] font-semibold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
            >
              Explore Solutions
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 h-14 px-8 bg-gray-100 text-gray-900 text-[17px] font-semibold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Contact Us
            </Link>
          </div>

          {/* Capabilities Pills */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.label}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-100"
              >
                <cap.icon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{cap.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-14 px-5 md:px-8 bg-gray-50">
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

      {/* Benefits List */}
      <section className="py-12 md:py-16 px-5 md:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-8">
            Why Choose VisionDrive?
          </h2>
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div 
                key={benefit}
                className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl"
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

      {/* Customer Portal CTA */}
      <section className="py-12 md:py-20 px-5 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-orange-400">Customer Portal</span>
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

      <div className="h-8 md:h-0" />
    </main>
  )
}
