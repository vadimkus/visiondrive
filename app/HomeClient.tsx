'use client'

import Image from 'next/image'
import { 
  ArrowRight, 
  Radio, 
  Zap, 
  Shield, 
  Clock,
  Building2,
  Users,
  MapPin
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
    <main className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900 overflow-hidden">
      <div className="h-full flex flex-col pt-20 pb-4 px-4 sm:px-6 lg:px-8">
        
        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full">
          
          {/* Hero */}
          <div className="text-center mb-6 lg:mb-8">
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-primary-600 uppercase mb-2 lg:mb-3">
              NB-IoT Smart Parking • UAE
            </p>
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-3 lg:mb-4"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              Bay-Level Parking{' '}
              <span className="text-primary-600">Intelligence</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4 lg:mb-6 leading-relaxed">
              Real-time parking occupancy for municipalities and smart cities. 
              Know exactly which bays are free, instantly.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mb-6 lg:mb-8">
              <a
                href="/contact"
                className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors group"
              >
                Request Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-gray-900 text-sm font-semibold rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                View Solutions
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto w-full mb-6 lg:mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/80 backdrop-blur rounded-xl p-3 sm:p-4 border border-gray-100 text-center shadow-sm"
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mx-auto mb-1" />
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {stat.number}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6 lg:mb-8">
            {quickLinks.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.title}</span>
              </a>
            ))}
          </div>

          {/* Partners */}
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Trusted by UAE Authorities</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center opacity-60 hover:opacity-80 transition-opacity">
              <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg" />
              <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg" />
              <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg" />
              <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg" />
              <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg" />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}

