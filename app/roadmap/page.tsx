'use client'

import Section from '../components/common/Section'
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Rocket, 
  Shield, 
  Thermometer, 
  Cloud,
  Server,
  FileCheck,
  Bell,
  ChefHat,
  ArrowRight
} from 'lucide-react'

const phases = [
  {
    phase: 'Phase 1',
    title: 'Sensor Deployment',
    period: 'Q4 2025',
    status: 'completed',
    description: 'Initial sensor deployment and testing',
    icon: Thermometer,
    color: 'bg-green-500',
  },
  {
    phase: 'Phase 2',
    title: 'Platform Launch',
    period: 'Q1 2026',
    status: 'in-progress',
    description: 'Kitchen Owner Portal and alert system',
    icon: Cloud,
    color: 'bg-blue-500',
  },
  {
    phase: 'Phase 3',
    title: 'Compliance Features',
    period: 'Q1 2026',
    status: 'in-progress',
    description: 'Dubai Municipality compliance reporting',
    icon: FileCheck,
    color: 'bg-orange-500',
  },
  {
    phase: 'Phase 4',
    title: 'Multi-Location Support',
    period: 'Q2 2026',
    status: 'upcoming',
    description: 'Chain management and enterprise features',
    icon: Server,
    color: 'bg-purple-500',
  },
  {
    phase: 'Phase 5',
    title: 'Advanced Analytics',
    period: 'Q3 2026',
    status: 'future',
    description: 'Predictive insights and AI-powered alerts',
    icon: Rocket,
    color: 'bg-cyan-500',
  },
]

const milestones = [
  { date: 'Now', title: 'Pilot Deployments', status: 'active' },
  { date: 'Q1 2026', title: 'Portal Launch', status: 'upcoming' },
  { date: 'Q2 2026', title: 'Enterprise Scale', status: 'future' },
  { date: 'Q3 2026', title: 'AI Analytics', status: 'future' },
]

const highlights = [
  {
    icon: Shield,
    title: 'DM Compliant',
    description: 'Dubai Municipality food safety standards',
  },
  {
    icon: Cloud,
    title: 'AWS UAE Region',
    description: 'All data hosted in me-central-1',
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    description: 'Sub-30 second alert latency',
  },
  {
    icon: Thermometer,
    title: 'Accurate Sensors',
    description: '±0.3°C temperature accuracy',
  },
]

export default function RoadmapPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
            <ChefHat className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-sm font-semibold text-orange-700">Product Roadmap</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Building the Future of{' '}
            <span className="text-orange-600">Smart Kitchens</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            From pilot deployments to enterprise scale—our roadmap for delivering 
            comprehensive kitchen temperature monitoring across the UAE.
          </p>
          
          {/* Quick Timeline */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {milestones.map((m) => (
              <div 
                key={`milestone-${m.date}-${m.title}`}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  m.status === 'active' 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : m.status === 'upcoming'
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
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
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors group"
            >
              Request a Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/solutions"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              View Solutions
            </a>
          </div>
        </div>
      </Section>

      {/* Phases Overview */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Development Phases</h2>
            <p className="text-lg text-gray-600">
              Our phased approach to delivering comprehensive kitchen monitoring
            </p>
          </div>

          <div className="space-y-4">
            {phases.map((phase) => {
              const Icon = phase.icon
              const isActive = phase.status === 'in-progress'
              const isCompleted = phase.status === 'completed'
              
              return (
                <div
                  key={`phase-${phase.phase}`}
                  className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all ${
                    isActive 
                      ? 'bg-white border-orange-300 shadow-md' 
                      : isCompleted
                      ? 'bg-green-50 border-green-200'
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
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </span>
                      )}
                      {isActive && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                    ) : phase.status === 'upcoming' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-gray-400" />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for UAE Kitchens</h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade technology with local compliance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <div
                key={`highlight-${item.title}`}
                className="bg-orange-50 rounded-xl p-6 border border-orange-100 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 mb-4">
                  <item.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-6 text-orange-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Join restaurants and hotels across the UAE deploying smart kitchen 
              temperature monitoring for food safety compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Request a Demo
              </a>
              <a
                href="/kitchen-owner"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg border border-orange-400 hover:bg-orange-400 transition-colors"
              >
                Kitchen Owner Portal
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
