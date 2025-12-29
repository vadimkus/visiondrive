'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Building2,
  Car,
  TrendingDown,
  Leaf,
  DollarSign,
  BarChart3,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Users,
  FileCheck,
  Radio
} from 'lucide-react'

const benefits = [
  {
    icon: TrendingDown,
    title: 'Reduced Traffic Congestion',
    description: 'Up to 30% of urban traffic is caused by drivers searching for parking. Real-time availability eliminates circling and reduces overall congestion.',
    stat: '30%',
    statLabel: 'Traffic Reduction',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Leaf,
    title: 'Lower Carbon Emissions',
    description: 'Less time searching means less fuel burned. Smart parking contributes directly to UAE sustainability goals and cleaner urban air.',
    stat: '20%',
    statLabel: 'Emission Reduction',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: DollarSign,
    title: 'Increased Revenue',
    description: 'Better enforcement, reduced violations, and optimized pricing. Municipalities see 15-25% revenue increase from existing parking assets.',
    stat: '25%',
    statLabel: 'Revenue Increase',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Planning',
    description: 'Real occupancy data enables evidence-based urban planning. Know where parking is needed and where it&apos;s underutilized.',
    stat: 'Real-time',
    statLabel: 'Analytics',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Users,
    title: 'Improved Citizen Experience',
    description: 'Drivers find parking faster, spend less time frustrated, and have a better overall experience in your city.',
    stat: '5 min',
    statLabel: 'Time Saved',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Enhanced Enforcement',
    description: 'Automated violation detection, overstay alerts, and integration with enforcement systems for fair, efficient parking management.',
    stat: '90%',
    statLabel: 'Compliance Rate',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
]

const capabilities = [
  {
    title: 'Bay-Level Occupancy',
    description: 'Know the status of every individual parking bay in real-time with 99%+ accuracy.',
    icon: MapPin,
  },
  {
    title: 'Open API Integration',
    description: 'REST APIs for integration with existing smart city platforms, navigation apps, and municipal systems.',
    icon: Globe,
  },
  {
    title: 'UAE Data Residency',
    description: 'All data stays in the UAE. Full compliance with TDRA, DESC ISR, and local regulations.',
    icon: Shield,
  },
  {
    title: 'Comprehensive Analytics',
    description: 'Occupancy trends, peak hours, turnover rates, and utilization reports for informed decision-making.',
    icon: BarChart3,
  },
  {
    title: 'Sub-30s Latency',
    description: 'Real-time data with sub-30 second latency ensures drivers always see accurate availability.',
    icon: Zap,
  },
  {
    title: 'Regulatory Compliance',
    description: 'TDRA type approval, NB-IoT certified devices, and enterprise-grade security standards.',
    icon: FileCheck,
  },
]

const deploymentTypes = [
  {
    title: 'On-Street Parking',
    description: 'Public street parking with meters and time limits',
    features: ['Open-sky NB-IoT coverage', 'Meter integration', 'Enforcement support'],
    coverage: '99%+ reliability',
  },
  {
    title: 'Public Parking Lots',
    description: 'Municipal parking facilities and public lots',
    features: ['Entry/exit tracking', 'Capacity management', 'Revenue optimization'],
    coverage: '99%+ reliability',
  },
  {
    title: 'Multi-Level Structures',
    description: 'Covered and underground parking garages',
    features: ['Level-by-level status', 'Guidance displays', 'Ventilation optimization'],
    coverage: '95%+ reliability',
  },
]

const impactMetrics = [
  { value: '30%', label: 'Reduction in Search Traffic', description: 'Fewer vehicles circling for parking' },
  { value: '20%', label: 'Lower CO2 Emissions', description: 'Reduced fuel consumption' },
  { value: '25%', label: 'Revenue Increase', description: 'From existing parking assets' },
  { value: '15%', label: 'Better Space Utilization', description: 'Optimized parking distribution' },
]

export default function MunicipalitiesPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">
            Smart Parking for Cities
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Transform Urban Mobility with{' '}
            <span className="text-primary-600">Intelligent Parking</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Ground truth parking data for municipalities, RTA, and transportation authorities. 
            Reduce congestion, lower emissions, and improve citizen experience across the UAE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors group"
            >
              Request Pilot Program
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/technology"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              Technical Specifications
            </a>
          </div>
        </div>
      </Section>

      {/* Impact Metrics */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Measurable Urban Impact</h2>
            <p className="text-lg text-gray-600">
              Smart parking delivers quantifiable benefits for cities and citizens
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactMetrics.map((metric) => (
              <div
                key={`metric-${metric.label}`}
                className="bg-white rounded-xl p-6 border border-gray-200 text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{metric.value}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{metric.label}</div>
                <div className="text-xs text-gray-500">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits for Municipalities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From traffic reduction to revenue optimization—smart parking transforms urban mobility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${benefit.bg} rounded-lg flex items-center justify-center`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-2xl font-bold ${benefit.color}`}>{benefit.stat}</span>
                      <span className="text-xs text-gray-500 uppercase">{benefit.statLabel}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Capabilities */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Capabilities</h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade technology built for government requirements
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability) => (
              <div
                key={`cap-${capability.title}`}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  <capability.icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{capability.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Deployment Types */}
      <Section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Deployment Options</h2>
            <p className="text-lg text-gray-600">
              Flexible solutions for different parking environments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {deploymentTypes.map((type) => (
              <div
                key={`deploy-${type.title}`}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{type.title}</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {type.coverage}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Technology Stack */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Radio className="h-12 w-12 text-primary-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  NB-IoT Sensor Technology
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Our parking sensors use NB-IoT cellular technology for reliable, low-power 
                  communication. With 5+ year battery life, IP68 waterproofing, and 99%+ 
                  detection accuracy, they&apos;re built for UAE conditions.
                </p>
                <a
                  href="/sensor"
                  className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                >
                  View sensor specifications <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600 mb-1">99%+</div>
                  <div className="text-xs text-blue-700">Accuracy</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">5+ Years</div>
                  <div className="text-xs text-green-700">Battery Life</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600 mb-1">IP68</div>
                  <div className="text-xs text-purple-700">Waterproof</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                  <div className="text-2xl font-bold text-orange-600 mb-1">&lt;30s</div>
                  <div className="text-xs text-orange-700">Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Working with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Trusted by government entities for smart parking infrastructure
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
          </div>
          <a
            href="/partners"
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 mt-6"
          >
            View all partners <ArrowRight className="h-4 w-4 ml-1" />
          </a>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <Building2 className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your City&apos;s Parking?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join RTA and municipalities across the UAE deploying NB-IoT smart parking 
              infrastructure with full regulatory compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Request Pilot Program
              </a>
              <a
                href="/roadmap"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                View Roadmap
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
