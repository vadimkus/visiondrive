'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Target, 
  Eye, 
  Zap, 
  Shield, 
  Heart,
  Leaf,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  TrendingUp
} from 'lucide-react'

const visionPillars = [
  {
    icon: Eye,
    title: 'Make Parking Invisible',
    description: 'Transform the parking experience from a daily frustration into a seamless, unconscious action. Drivers find spots effortlessly—no circling, no stress.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Real-Time Intelligence',
    description: 'Deliver instant, accurate parking data to drivers, operators, and city planners. Every decision backed by ground truth sensor data.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Users,
    title: 'Connect the Ecosystem',
    description: 'Unify sensors, payments, enforcement, navigation apps, and analytics into a single reliable platform for all stakeholders.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

const values = [
  {
    icon: Shield,
    title: 'Reliability First',
    description: 'Enterprise-grade uptime, sensor accuracy you can trust, and support that responds when you need it.',
  },
  {
    icon: Heart,
    title: 'Privacy by Design',
    description: 'We collect only the data required to operate and improve. No tracking, no profiling, no selling.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Impact',
    description: 'Less circling means lower congestion, reduced emissions, and cleaner air for UAE communities.',
  },
  {
    icon: Globe,
    title: 'UAE Data Sovereignty',
    description: 'All data stays in the UAE. Full compliance with TDRA, DESC, and local regulations.',
  },
]

const impactStats = [
  { number: '30%', label: 'Reduction in Search Time', description: 'Drivers find parking faster' },
  { number: '20%', label: 'Less Traffic Congestion', description: 'Fewer cars circling blocks' },
  { number: '15%', label: 'Lower Emissions', description: 'Environmental benefit' },
  { number: '25%', label: 'Revenue Increase', description: 'For parking operators' },
]

const roadmapItems = [
  {
    phase: 'Now',
    title: 'Ground Truth Infrastructure',
    items: ['NB-IoT sensor deployment', 'Real-time occupancy data', 'Operator management portal'],
    status: 'active',
  },
  {
    phase: 'Q1 2026',
    title: 'Consumer Experience',
    items: ['ParkSense mobile app launch', 'Turn-by-turn navigation to spots', 'Payment integration'],
    status: 'upcoming',
  },
  {
    phase: 'Q3 2026',
    title: 'AI-Powered Insights',
    items: ['Predictive availability', 'Demand forecasting', 'Dynamic pricing optimization'],
    status: 'future',
  },
]

export default function MissionPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">
            Our Mission
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Orchestrate Seamless Mobility with{' '}
            <span className="text-primary-600">Parking That Just Works</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            We help cities, operators, and communities remove friction from curb to destination—so 
            people park once, move faster, and spend time on what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors group"
            >
              Join Our Mission
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              View Open Positions
            </a>
          </div>
        </div>
      </Section>

      {/* Vision Pillars */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three pillars that guide everything we build
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {visionPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${pillar.bg} mb-6`}>
                  <pillar.icon className={`h-7 w-7 ${pillar.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{pillar.title}</h3>
                <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Impact Stats */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Impact We Create</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Smart parking isn&apos;t just about convenience—it transforms cities
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100 text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide how we build and operate
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-6 border border-gray-200 flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Roadmap Preview */}
      <Section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Where We&apos;re Headed</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our journey to transform parking across the UAE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roadmapItems.map((item) => (
              <div
                key={item.phase}
                className={`rounded-xl p-6 border-2 ${
                  item.status === 'active'
                    ? 'border-primary-300 bg-primary-50'
                    : item.status === 'upcoming'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`text-sm font-semibold mb-2 ${
                  item.status === 'active' ? 'text-primary-600' : item.status === 'upcoming' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.phase}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.title}</h3>
                <ul className="space-y-2">
                  {item.items.map((listItem) => (
                    <li key={listItem} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        item.status === 'active' ? 'text-primary-600' : item.status === 'upcoming' ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      {listItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="/roadmap"
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
            >
              View full roadmap <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Partnering with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Working together to build smarter cities
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
            <Lightbulb className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Let&apos;s Make Parking Effortless Together
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a city planner, parking operator, or technology partner—we&apos;re ready to 
              collaborate on smarter parking solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Talk to Our Team
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                Explore Solutions
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
