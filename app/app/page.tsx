'use client'

import { motion as fmMotion } from 'framer-motion'
import Section from '../components/common/Section'
import { Smartphone, MapPin, Zap, Shield, Clock, Navigation, Cloud, Bell, CheckCircle2, Calendar, Apple, Play } from 'lucide-react'

// React 19 + Framer Motion v10 can trip a typing edge-case where `motion.*` becomes `unknown`.
// This page is purely presentational, so we deliberately loosen typing here to keep builds green.
const motion = fmMotion as any

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Availability',
    description: 'See live parking occupancy with sensor-accurate data. No more guessing—know before you go.',
    color: 'bg-blue-500',
  },
  {
    icon: Navigation,
    title: 'Smart Navigation',
    description: 'Get guided to the nearest available spot with climate-aware routing preferences.',
    color: 'bg-emerald-500',
  },
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Pay for parking seamlessly across Dubai, Abu Dhabi, and Sharjah—all from one app.',
    color: 'bg-amber-500',
  },
  {
    icon: Cloud,
    title: 'Weather Intelligence',
    description: 'Plan your parking with real-time environmental data including temperature and air quality.',
    color: 'bg-purple-500',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified about parking expiry, weather warnings, and available spots near your destination.',
    color: 'bg-red-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected. Park with confidence knowing your privacy is our priority.',
    color: 'bg-gray-700',
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

export default function AppPage() {
  return (
    <main className="pt-20 bg-white">
      {/* Hero Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              ParkSense
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto font-medium">
              Smart Parking for the Modern UAE Driver
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Never waste time searching for parking again. Real-time availability, smart navigation, 
              and seamless payments—all in one app.
            </p>
            
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gold-100 border-2 border-gold-300 rounded-full mb-8">
              <Calendar className="h-5 w-5 text-gold-700" />
              <span className="text-gold-800 font-semibold">Available Q1 2026</span>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                disabled
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed shadow-lg"
              >
                <Apple className="h-6 w-6 mr-2" />
                Download on App Store
              </button>
              <button
                disabled
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed shadow-lg"
              >
                <Play className="h-6 w-6 mr-2" />
                Get it on Google Play
              </button>
            </div>

            {/* Decorative Phone Mockup Placeholder */}
            <div className="mt-12 mx-auto max-w-md">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-4 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] aspect-[9/19] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Smartphone className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">App Preview</p>
                    <p className="text-gray-300 text-sm mt-2">Coming Q1 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Features Section */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Features That Matter
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for UAE drivers who value their time and convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose ParkSense?
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                ParkSense combines IoT sensor technology with smart algorithms to deliver 
                the most accurate parking information in the UAE. No more circling blocks 
                or wasting fuel—just smart, efficient parking.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl p-8 shadow-2xl text-white">
                <Clock className="h-12 w-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Launch Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">Q1 2026 - Public Beta</div>
                      <div className="text-gold-100 text-sm">Limited release in Dubai Marina & JLT</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white/50 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">Q2 2026 - Wide Release</div>
                      <div className="text-gold-100 text-sm">Full Dubai coverage with premium features</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white/50 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">Q4 2026 - UAE Expansion</div>
                      <div className="text-gold-100 text-sm">Abu Dhabi, Sharjah, and beyond</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Smartphone className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Be First to Experience ParkSense
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Join our early access program and help shape the future of smart parking in the UAE.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Request Early Access
            </a>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}

