'use client'

import { Zap, Shield, TrendingUp, Globe, CheckCircle2, Radio, Cpu, Database, Smartphone, MapPin, Clock, Wifi, Code } from 'lucide-react'
import Image from 'next/image'
import AnimatedCounter from '../components/common/AnimatedCounter'
import { useLanguage } from '../contexts/LanguageContext'
import { visionTranslations } from '../translations/vision'

// Stats will be translated in component
const statsData = [
  {
    value: 2183,
    suffix: '',
    icon: MapPin,
  },
  {
    value: 190000,
    suffix: '+',
    icon: MapPin,
  },
  {
    value: 30,
    suffix: '%',
    icon: TrendingUp,
  },
  {
    value: 5,
    suffix: ' sec',
    icon: Clock,
  },
]

// Technologies will be translated in component
const technologiesIcons = [
  { icon: Radio },
  { icon: Wifi },
  { icon: Cpu },
  { icon: Code },
]

// Alignment points will be translated in component

// Roadmap will be translated in component

// Accuracy metrics will be translated in component

export default function VisionPage() {
  const { language } = useLanguage()
  const t = visionTranslations[language]
  
  const stats = statsData.map((stat, index) => ({
    ...stat,
    label: t.stats.items[index].label,
    description: t.stats.items[index].description,
  }))
  
  const technologies = technologiesIcons.map((tech, index) => ({
    ...tech,
    ...t.technology.items[index],
    image: null,
  }))
  
  const alignmentPoints = t.alignment.points
  
  const roadmap = t.roadmap.phases.map((phase, index) => ({
    ...phase,
    status: index === 0 ? 'current' : 'upcoming',
  }))
  
  const accuracyMetrics = t.metrics.items.map((item) => ({
    ...item,
    value: item.metric === 'Sensor Accuracy' ? '99.5%' : 
           item.metric === 'System Accuracy' ? '99.9%' :
           item.metric === 'Update Frequency' ? '< 5 sec' :
           item.metric === 'Uptime SLA' ? '99.9%' : '12 mos',
  }))
  
  return (
    <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 md:pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.hero.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Alignment with UAE Vision */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.alignment.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.alignment.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {alignmentPoints.map((point) => (
              <div
                key={`align-${point.title.slice(0, 15)}`}
                className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{point.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>{point.description}</p>
                    <p className="text-xs sm:text-sm text-gray-500 italic" dir={language === 'ar' ? 'rtl' : 'ltr'}>Source: {point.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.technology.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.technology.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {technologies.map((tech) => {
              const Icon = tech.icon
              return (
                <div
                  key={`tech-${tech.title.slice(0, 15)}`}
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {tech.image && (
                    <div className="relative w-full h-40 sm:h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={tech.image}
                        alt={tech.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onError={(e) => {
                          // Hide image if it doesn't exist
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{tech.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>{tech.description}</p>
                  {tech.specs && (
                    <div className="flex flex-wrap gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {tech.specs.map((spec) => (
                        <span
                          key={`spec-${spec.slice(0, 15)}`}
                          className="px-2 sm:px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.stats.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.stats.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={`stat-${stat.label.slice(0, 15)}`}
                  className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 sm:p-6 border border-primary-100 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{stat.label}</div>
                  <div className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{stat.description}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Accuracy Metrics */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.metrics.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.metrics.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {accuracyMetrics.map((metric) => (
              <div
                key={`metric-${metric.metric.slice(0, 15)}`}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">{metric.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>{metric.metric}</div>
                <div className="text-xs text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.roadmap.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.roadmap.subtitle}
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-300 hidden sm:block" />

            <div className="space-y-8 sm:space-y-12">
              {roadmap.map((phase) => {
                const isCurrent = phase.status === 'current'
                return (
                  <div
                    key={`roadmap-${phase.title.slice(0, 15)}`}
                    className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 self-start sm:self-auto">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 border-white ${
                        isCurrent 
                          ? 'bg-primary-600 shadow-lg shadow-primary-600/50' 
                          : 'bg-gray-200'
                      }`}>
                        {isCurrent ? (
                          <Clock className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                        ) : (
                          <CheckCircle2 className={`h-5 w-5 sm:h-7 sm:w-7 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow w-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <span className="px-3 sm:px-4 py-1 bg-primary-100 border border-primary-200 rounded-lg text-primary-700 font-semibold text-xs sm:text-sm">
                          {phase.quarter}
                        </span>
                        {isCurrent && (
                          <span className="px-3 sm:px-4 py-1 bg-green-100 border border-green-200 rounded-lg text-green-700 font-semibold text-xs sm:text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.roadmap.currentPhase}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {phase.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {phase.description}
                      </p>
                      <div className="space-y-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {phase.milestones.map((milestone, milestoneIndex) => (
                          <div key={milestoneIndex} className={`flex items-start gap-2 text-gray-700 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <CheckCircle2 className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm">{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.benefits.title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t.benefits.items.map((benefit, benefitIdx) => {
              const icons = [TrendingUp, Globe, Zap, Shield]
              const Icon = icons[benefitIdx]
              const benefitConfigs = [
                { bg: 'from-blue-50', border: 'border-blue-100', icon: 'text-blue-600' },
                { bg: 'from-green-50', border: 'border-green-100', icon: 'text-green-600' },
                { bg: 'from-purple-50', border: 'border-purple-100', icon: 'text-purple-600' },
                { bg: 'from-orange-50', border: 'border-orange-100', icon: 'text-orange-600' },
              ]
              const config = benefitConfigs[benefitIdx]
              return (
                <div key={`benefit-${benefit.title.slice(0, 15)}`} className={`bg-gradient-to-br ${config.bg} to-white rounded-xl p-4 sm:p-6 border ${config.border}`}>
                  <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${config.icon} mb-3 sm:mb-4`} />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.cta.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white text-sm sm:text-base font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-primary-600 transition-colors"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {t.cta.primary}
            </a>
            <a
              href="/solutions"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white text-sm sm:text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition-colors"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {t.cta.secondary}
            </a>
          </div>
          <p className="text-xs sm:text-sm text-primary-200 mt-4 sm:mt-6 px-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.cta.trust}
          </p>
        </div>
      </section>
    </div>
  )
}
