'use client'

import { 
  ArrowRight, 
  Radio, 
  Zap, 
  Shield, 
  Cpu,
  Thermometer,
  Car,
  Building2,
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

const solutions = [
  {
    icon: Thermometer,
    title: 'Smart Kitchen',
    description: 'Temperature monitoring for commercial kitchens. Dubai Municipality compliant.',
    href: '/solutions#smart-kitchen',
    color: 'bg-orange-500',
    badge: 'Live',
  },
  {
    icon: Car,
    title: 'Smart Parking',
    description: 'IoT parking sensors for real-time occupancy detection and management.',
    href: '/solutions#smart-parking',
    color: 'bg-blue-500',
    badge: 'Coming Soon',
  },
  {
    icon: Building2,
    title: 'Smart Building',
    description: 'Energy monitoring, access control, and facility management solutions.',
    href: '/solutions#smart-building',
    color: 'bg-emerald-500',
    badge: 'Planned',
  },
  {
    icon: Cpu,
    title: 'Custom IoT',
    description: 'Tailored IoT solutions for your specific industry requirements.',
    href: '/contact',
    color: 'bg-purple-500',
    badge: 'Contact Us',
  },
]

const capabilities = [
  { icon: Wifi, label: 'NB-IoT & LoRaWAN' },
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

      {/* Solutions Section */}
      <section className="py-14 md:py-20 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight mb-3">
              Our Solutions
            </h2>
            <p className="text-gray-500 text-lg">
              IoT solutions designed for UAE market requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {solutions.map((solution) => (
              <Link
                key={solution.title}
                href={solution.href}
                className="group p-6 md:p-8 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${solution.color} flex items-center justify-center`}>
                    <solution.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    solution.badge === 'Live' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : solution.badge === 'Coming Soon'
                        ? 'bg-blue-50 text-blue-600'
                        : solution.badge === 'Planned'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-orange-50 text-orange-600'
                  }`}>
                    {solution.badge}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {solution.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-4">
                  {solution.description}
                </p>
                <div className="flex items-center text-orange-500 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-12 md:py-16 px-5 md:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-8">
            Why Choose VisionDrive?
          </h2>
          <div className="space-y-3">
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

      {/* Customer Portal CTA */}
      <section className="py-12 md:py-20 px-5 md:px-8">
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

      {/* Contact CTA */}
      <section className="py-12 md:py-16 px-5 md:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
            Let's Build Together
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Contact us to discuss your IoT project requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/971559152985"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all w-full sm:w-auto"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="text-sm text-gray-500">WhatsApp</div>
                <div className="font-semibold text-gray-900">+971 55 915 2985</div>
              </div>
            </a>
            <a
              href="mailto:tech@visiondrive.ae"
              className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all w-full sm:w-auto"
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

      <div className="h-8 md:h-0" />
    </main>
  )
}
