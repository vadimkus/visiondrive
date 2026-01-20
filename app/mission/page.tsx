'use client'

import Section from '../components/common/Section'
import { 
  Target, 
  Eye, 
  Zap, 
  Shield, 
  Heart,
  Thermometer,
  ChefHat,
  Globe,
  ArrowRight,
  CheckCircle2,
  Bell,
  FileCheck
} from 'lucide-react'

const visionPillars = [
  {
    icon: Thermometer,
    title: 'Protect Food Safety',
    description: 'Ensure every commercial kitchen maintains safe temperatures 24/7. Prevent foodborne illness through continuous monitoring and instant alerts.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    description: 'Deliver instant notifications when temperatures exceed safe limits. Every minute matters when protecting food quality and customer health.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: FileCheck,
    title: 'Simplify Compliance',
    description: 'Automate the documentation and reporting required for Dubai Municipality inspections and HACCP compliance.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
]

const values = [
  {
    icon: Shield,
    title: 'Food Safety First',
    description: 'Every feature we build is designed to help kitchens maintain the highest standards of food safety.',
  },
  {
    icon: Heart,
    title: 'Customer Protection',
    description: 'We help restaurants and hotels protect their customers from foodborne illness risks.',
  },
  {
    icon: Thermometer,
    title: 'Accuracy Matters',
    description: 'Medical-grade sensors with ±0.3°C accuracy because precise temperature monitoring saves lives.',
  },
  {
    icon: Globe,
    title: 'UAE Data Sovereignty',
    description: 'All data stays in the UAE. Full compliance with TDRA and local regulations.',
  },
]

const impactStats = [
  { number: '5°C-60°C', label: 'Danger Zone', description: 'Bacteria multiply rapidly' },
  { number: '<30s', label: 'Alert Time', description: 'Rapid response enabled' },
  { number: '24/7', label: 'Monitoring', description: 'Never miss an excursion' },
  { number: '100%', label: 'Logged', description: 'Complete audit trail' },
]

const roadmapItems = [
  {
    phase: 'Now',
    title: 'Temperature Monitoring',
    items: ['NB-IoT sensor deployment', 'Real-time alerts', 'Kitchen Owner Portal'],
    status: 'active',
  },
  {
    phase: 'Q1 2026',
    title: 'Compliance Automation',
    items: ['Dubai Municipality reports', 'HACCP documentation', 'Multi-location support'],
    status: 'upcoming',
  },
  {
    phase: 'Q3 2026',
    title: 'Advanced Analytics',
    items: ['Predictive maintenance', 'Equipment health insights', 'Trend analysis'],
    status: 'future',
  },
]

export default function MissionPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4">
            <ChefHat className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-sm font-semibold text-orange-700">Our Mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Protecting Food Safety with{' '}
            <span className="text-orange-600">Smart Technology</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            We help commercial kitchens across the UAE maintain the highest standards of food safety 
            through intelligent temperature monitoring, instant alerts, and automated compliance.
          </p>
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
                className="bg-white rounded-xl p-8 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Food Safety by the Numbers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Why continuous temperature monitoring matters
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 text-center"
              >
                <div className="text-3xl font-bold text-orange-600 mb-2">{stat.number}</div>
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
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-orange-600" />
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
              Our journey to transform kitchen food safety across the UAE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roadmapItems.map((item) => (
              <div
                key={item.phase}
                className={`rounded-xl p-6 border-2 ${
                  item.status === 'active'
                    ? 'border-orange-300 bg-orange-50'
                    : item.status === 'upcoming'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`text-sm font-semibold mb-2 ${
                  item.status === 'active' ? 'text-orange-600' : item.status === 'upcoming' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.phase}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.title}</h3>
                <ul className="space-y-2">
                  {item.items.map((listItem) => (
                    <li key={listItem} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        item.status === 'active' ? 'text-orange-600' : item.status === 'upcoming' ? 'text-blue-500' : 'text-gray-400'
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
              className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
            >
              View full roadmap <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-6 text-orange-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Protect Your Kitchen?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Join restaurants, hotels, and food service businesses across the UAE using smart 
              temperature monitoring to ensure food safety compliance.
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
