'use client'

import { motion as fmMotion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock, Target, Rocket, TrendingUp, Zap, Shield, Users, Database, Smartphone, Cloud } from 'lucide-react'
import Section from '../components/common/Section'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const phases = [
  {
    phase: 'Phase 1',
    period: 'Months 1-2',
    title: 'The "Connected Asphalt" MVP',
    status: 'in-progress',
    description: 'Deploy test site with core sensor infrastructure and basic mobile app functionality.',
    icon: Rocket,
    color: 'from-blue-500 to-blue-600',
    milestones: [
      {
        title: 'Hardware Deployment',
        items: ['Initial gateway and sensor deployment', 'Surface-mounted parking sensors', 'Environmental monitoring station'],
      },
      {
        title: 'Backend Infrastructure',
        items: ['Network server integration', 'Event streaming architecture', 'Time-series data storage'],
      },
      {
        title: 'App Alpha Release',
        items: ['Live occupancy map visualization', 'Manual vehicle location feature', 'Basic real-time data display'],
      },
    ],
  },
  {
    phase: 'Phase 2',
    period: 'Months 3-4',
    title: 'The "Dubai Driver" Update',
    status: 'planned',
    description: 'Unified payments and intelligent routing features tailored for UAE conditions.',
    icon: Target,
    color: 'from-emerald-500 to-emerald-600',
    milestones: [
      {
        title: 'Unified Payments',
        items: ['Dubai parking authority integration', 'Abu Dhabi parking system support', 'Sharjah parking integration'],
      },
      {
        title: 'Smart Features',
        items: ['Climate-aware routing preferences', 'Automatic location detection', 'Temperature-optimized routing'],
      },
      {
        title: 'Beta Launch',
        items: ['Public beta distribution', 'In-vehicle system integration', 'User feedback collection'],
      },
    ],
  },
  {
    phase: 'Phase 3',
    period: 'Months 5-6',
    title: 'Monetization & Intelligence',
    status: 'planned',
    description: 'Revenue streams activated with environmental intelligence layer.',
    icon: TrendingUp,
    color: 'from-amber-500 to-amber-600',
    milestones: [
      {
        title: 'Weather Intelligence',
        items: ['Real-time environmental heatmaps', 'Air quality monitoring overlays', 'Weather alert notifications'],
      },
      {
        title: 'Subscriptions',
        items: ['Payment gateway integration', 'Premium tier features (29 AED/month)', 'Free tier with basic features'],
      },
      {
        title: 'Merchant Integration',
        items: ['Digital validation for retail partners', 'Push notification system', 'Parking validation workflows'],
      },
    ],
  },
  {
    phase: 'Phase 4',
    period: 'Month 7+',
    title: 'Skyscrapers & Ecosystem',
    status: 'future',
    description: 'Vertical scaling for towers and third-party service integrations.',
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    milestones: [
      {
        title: 'Tower Features',
        items: ['Security monitoring for private spaces', 'Peer-to-peer space sharing', 'Digital guest access passes'],
      },
      {
        title: 'Service Integration',
        items: ['Fuel delivery service API', 'On-demand car care services', 'Weather-aware service scheduling'],
      },
      {
        title: 'Expansion',
        items: ['Multi-emirate coverage', 'EV charging station integration', 'Enterprise B2B partnerships'],
      },
    ],
  },
]

const techStack = [
  {
    category: 'Mobile App',
    icon: Smartphone,
    color: 'bg-blue-500',
    items: ['Cross-platform mobile framework', 'File-based navigation routing', 'High-performance graphics engine', 'Advanced mapping SDK', 'In-vehicle integration (CarPlay/Android Auto)'],
  },
  {
    category: 'Backend',
    icon: Cloud,
    color: 'bg-emerald-500',
    items: ['Serverless web framework', 'TypeScript microservices', 'Enterprise LoRaWAN network server', 'Managed event streaming platform', 'Time-series database with vector support'],
  },
  {
    category: 'Hardware',
    icon: Database,
    color: 'bg-amber-500',
    items: ['LoRaWAN parking occupancy sensors', 'Multi-parameter weather stations', 'RS485 to LoRa bridge devices', 'Wireless repeaters for vertical coverage'],
  },
  {
    category: 'Security',
    icon: Shield,
    color: 'bg-purple-500',
    items: ['Multi-tenant data isolation', 'Role-based access control (RBAC)', 'End-to-end encryption', 'Audit logging for all actions', 'GDPR compliance ready'],
  },
]

export default function RoadmapPage() {
  return (
    <div className="pt-20 pb-12 bg-white">
      {/* Hero Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Product Roadmap
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto font-medium">
              From MVP to Full UAE Smart Parking Ecosystem
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A phased delivery approach combining IoT sensors, real-time intelligence, and lifestyle services
            </p>
            
            {/* Decorative elements */}
            <div className="mt-12 flex justify-center items-center gap-3">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-gold-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gold-500 rounded-full"></div>
              <div className="h-1 w-32 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gold-500 rounded-full"></div>
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-gold-500 rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Timeline Section */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Development Phases
            </h2>
            <p className="text-xl text-gray-600">
              7+ month journey to transform urban mobility in the UAE
            </p>
          </div>

          <div className="space-y-12">
            {phases.map((phase, index) => {
              const Icon = phase.icon
              const isCurrent = phase.status === 'in-progress'
              const isCompleted = phase.status === 'completed'

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline connector */}
                  {index < phases.length - 1 && (
                    <div className="absolute left-8 top-24 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent hidden md:block" />
                  )}

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-2">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.color} shadow-lg flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm font-semibold">
                            {phase.phase}
                          </span>
                          <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {phase.period}
                          </span>
                          {isCurrent && (
                            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              In Progress
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                          {phase.title}
                        </h3>
                        <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                          {phase.description}
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {phase.milestones.map((milestone, mIndex) => (
                            <div key={mIndex} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                {milestone.title}
                              </h4>
                              <ul className="space-y-2.5">
                                {milestone.items.map((item, iIndex) => (
                                  <li key={iIndex} className="flex items-start gap-2 text-gray-800 text-sm leading-relaxed">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Tech Stack Section */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Technology Stack
              </h2>
              <p className="text-xl text-gray-600">
                "Bleeding Edge" 2025 architecture for enterprise-grade performance
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {techStack.map((tech, index) => {
              const Icon = tech.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 ${tech.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {tech.category}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {tech.items.map((item, iIndex) => (
                      <li key={iIndex} className="flex items-start gap-3 text-gray-800 text-sm leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Users className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Join Us on This Journey
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Be part of the future of smart parking in the UAE. From pilot to full deployment,
              we're building the infrastructure for tomorrow's urban mobility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Become a Partner
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 border-2 border-gray-900 hover:border-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Add Business to the Map
              </a>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
