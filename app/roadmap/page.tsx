'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Rocket, 
  Shield, 
  Smartphone, 
  Cloud,
  Server,
  FileCheck,
  MapPin,
  Settings,
  Building2,
  ArrowRight
} from 'lucide-react'

const phases = [
  {
    phase: 'Phase 1',
    title: 'Government Approvals',
    period: 'Q4 2024',
    status: 'in-progress',
    description: 'RTA NOC and pilot program approval',
    icon: FileCheck,
    color: 'bg-red-500',
  },
  {
    phase: 'Phase 2',
    title: 'Infrastructure Setup',
    period: 'Q4 2024',
    status: 'in-progress',
    description: 'AWS UAE cloud deployment',
    icon: Cloud,
    color: 'bg-blue-500',
  },
  {
    phase: 'Phase 3',
    title: 'Pilot Deployment',
    period: 'Q1 2025',
    status: 'upcoming',
    description: '10-100 sensors in selected zones',
    icon: MapPin,
    color: 'bg-amber-500',
  },
  {
    phase: 'Phase 4',
    title: 'Production Rollout',
    period: 'Q2 2025',
    status: 'future',
    description: 'Scale to 2,000-5,000 sensors',
    icon: Rocket,
    color: 'bg-emerald-500',
  },
  {
    phase: 'Phase 5',
    title: 'ParkSense App',
    period: 'Q1 2026',
    status: 'future',
    description: 'Consumer mobile app launch',
    icon: Smartphone,
    color: 'bg-purple-500',
  },
]

const milestones = [
  { date: 'Now', title: 'Sensor Testing', status: 'active' },
  { date: 'Q1 2025', title: 'RTA Pilot Launch', status: 'upcoming' },
  { date: 'Q2 2025', title: 'Production Scale', status: 'future' },
  { date: 'Q1 2026', title: 'App Launch', status: 'future' },
]

const highlights = [
  {
    icon: Shield,
    title: 'UAE Compliant',
    description: 'Full TDRA and DESC ISR data residency compliance',
  },
  {
    icon: Cloud,
    title: 'AWS UAE Region',
    description: 'All data hosted in me-central-1',
  },
  {
    icon: Server,
    title: 'Enterprise Grade',
    description: '99%+ uplink reliability target',
  },
  {
    icon: Settings,
    title: 'Real-Time Data',
    description: 'Sub-30 second event latency',
  },
]

export default function RoadmapPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">
            Product Roadmap
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Our Journey to{' '}
            <span className="text-primary-600">Smart Parking</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            From pilot to production—deploying NB-IoT parking sensors across the UAE 
            with full government compliance and enterprise reliability.
          </p>
          
          {/* Quick Timeline */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {milestones.map((m, i) => (
              <div 
                key={i}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  m.status === 'active' 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : m.status === 'upcoming'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {m.date}: {m.title}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors group"
            >
              Join the Pilot
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/roadmap2"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              View Technical Details
            </a>
          </div>
        </div>
      </Section>

      {/* Phases Overview */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Deployment Phases</h2>
            <p className="text-lg text-gray-600">
              A phased approach to smart parking across the UAE
            </p>
          </div>

          <div className="space-y-4">
            {phases.map((phase, index) => {
              const Icon = phase.icon
              const isActive = phase.status === 'in-progress'
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                    isActive 
                      ? 'bg-white border-primary-300 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 ${phase.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-gray-500">{phase.phase}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{phase.period}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">
                    {isActive ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                    ) : phase.status === 'upcoming' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Key Highlights */}
      <Section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for UAE</h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade infrastructure with local compliance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 mb-4">
                  <item.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Working with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Government partnerships for pilot approval and deployment
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <Building2 className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Partner?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join municipalities and enterprises deploying NB-IoT smart parking 
              infrastructure across the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                View Solutions
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
