'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Smartphone, 
  MapPin, 
  Zap, 
  Shield, 
  Clock, 
  Navigation, 
  Cloud, 
  Bell, 
  CheckCircle2, 
  Calendar, 
  Apple, 
  PlayCircle,
  ArrowRight,
  Users,
  Building2
} from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Availability',
    description: 'See live parking occupancy with sensor-accurate data. No more guessing—know before you go.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Navigation,
    title: 'Smart Navigation',
    description: 'Get guided to the nearest available spot with climate-aware routing preferences.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Pay for parking seamlessly across Dubai, Abu Dhabi, and Sharjah—all from one app.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Cloud,
    title: 'Weather Intelligence',
    description: 'Plan your parking with real-time environmental data including temperature and air quality.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified about parking expiry, weather warnings, and available spots near your destination.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected. Park with confidence knowing your privacy is our priority.',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
]

const benefits = [
  'Find parking faster and reduce stress',
  'Save time with predictive availability',
  'Unified payment across UAE parking systems',
  'Climate-optimized parking recommendations',
  'Never forget where you parked',
  'Integration with in-vehicle systems',
]

const timeline = [
  {
    quarter: 'Q1 2026',
    title: 'Public Beta',
    description: 'Limited release in Dubai Marina & JLT',
    active: true,
  },
  {
    quarter: 'Q2 2026',
    title: 'Wide Release',
    description: 'Full Dubai coverage with premium features',
    active: false,
  },
  {
    quarter: 'Q4 2026',
    title: 'UAE Expansion',
    description: 'Abu Dhabi, Sharjah, and beyond',
    active: false,
  },
]

export default function AppPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">The App</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            ParkSense <br className="hidden sm:block" />
            <span className="text-primary-600">Mobile App</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
            Never waste time searching for parking again. Real-time availability, smart navigation, 
            and seamless payments—all in one app.
          </p>
          
          {/* Availability Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
            <Calendar className="h-4 w-4 text-primary-600" />
            <span className="text-primary-700 font-medium text-sm">Available Q1 2026</span>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              disabled
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg opacity-50 cursor-not-allowed"
            >
              <Apple className="h-5 w-5 mr-2" />
              App Store
            </button>
            <button
              disabled
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg opacity-50 cursor-not-allowed"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Google Play
            </button>
          </div>

          {/* Phone Mockup */}
          <div className="max-w-xs mx-auto">
            <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-xl">
              <div className="bg-gray-50 rounded-[2rem] aspect-[9/19] flex items-center justify-center border border-gray-200">
                <div className="text-center p-6">
                  <Smartphone className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">App Preview</p>
                  <p className="text-gray-400 text-xs mt-1">Coming Q1 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features That Matter</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for UAE drivers who value their time and convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bg} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Why Choose ParkSense?
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  ParkSense combines IoT sensor technology with smart algorithms to deliver 
                  the most accurate parking information in the UAE.
                </p>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Launch Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    {timeline.map((item) => (
                      <div key={item.quarter} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.active ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                              {item.quarter}
                            </span>
                            <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Who It's For Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who It&apos;s For</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ParkSense serves different needs across the parking ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <Users className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Drivers</h3>
              <p className="text-sm text-gray-600">
                Find available parking spots instantly, navigate to them, and pay seamlessly.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <Building2 className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Businesses</h3>
              <p className="text-sm text-gray-600">
                Offer parking validation and attract customers with real-time availability.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <MapPin className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communities</h3>
              <p className="text-sm text-gray-600">
                Manage visitor parking and resident allocations with smart controls.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Powered by UAE-Compliant Infrastructure</h2>
          <p className="text-gray-600 mb-8">
            Real-time data from sensors deployed with government partners
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Smartphone className="h-12 w-12 text-primary-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Be First to Experience ParkSense
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our early access program and help shape the future of smart parking in the UAE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Request Early Access
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
            <a 
              href="/technology" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              Learn About the Technology
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}
