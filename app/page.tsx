'use client'

import { motion as fmMotion } from 'framer-motion'
import Section from './components/common/Section'
import { ArrowRight, MapPin, Smartphone, Zap, CheckCircle2, Building2, Users, TrendingUp } from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import { homeTranslations } from './translations/home'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Availability',
    description: 'See live parking occupancy with sensor-accurate data across the UAE',
  },
  {
    icon: Zap,
    title: 'Smart Navigation',
    description: 'Get guided to the nearest available spot with intelligent routing',
  },
  {
    icon: Smartphone,
    title: 'Unified Payments',
    description: 'Pay seamlessly across Dubai, Abu Dhabi, and Sharjah from one app',
  },
]

const stats = [
  { number: '200K+', label: 'Parking Spaces' },
  { number: '5+', label: 'Emirates Covered' },
  { number: 'Q1 2026', label: 'Launch Date' },
]

const useCases = [
  {
    icon: Users,
    title: 'For Drivers',
    description: 'Never waste time searching for parking. Get real-time availability and smart navigation.',
  },
  {
    icon: Building2,
    title: 'For Properties',
    description: 'Optimize parking operations with IoT sensors and analytics for buildings and municipalities.',
  },
  {
    icon: TrendingUp,
    title: 'For Cities',
    description: 'Reduce congestion and emissions while supporting smart city transformation goals.',
  },
]

export default function HomePage() {
  const { language } = useLanguage()
  const t = homeTranslations[language]

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-160px)] py-12">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.hero.title}{' '}
              <span className="text-gold-500">{t.hero.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              Smart parking solutions powered by IoT sensors. Find, navigate, and pay for parking across the UAE—all in one app.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                {t.hero.cta}
                <ArrowRight className={`${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5 group-hover:translate-x-1 transition-transform`} />
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 border-2 border-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose VisionDrive?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The most accurate parking information in the UAE, powered by IoT sensors
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                  <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-gold-600" />
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

      {/* Use Cases Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Solutions for Everyone
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From individual drivers to smart city initiatives
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
                >
                  <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {useCase.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl p-12 shadow-2xl text-white"
          >
            <Smartphone className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Parking Experience?
            </h2>
            <p className="text-xl text-gold-50 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join the waitlist for ParkSense and be among the first to experience 
              smart parking in the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Explore ParkSense
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold-700 text-white font-semibold rounded-xl hover:bg-gold-800 border-2 border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Partner With Us
              </a>
            </div>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}

