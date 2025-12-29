'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Target, 
  Lightbulb, 
  Handshake, 
  Zap, 
  Database, 
  Cloud, 
  CheckCircle2, 
  Building2, 
  LineChart,
  Radio,
  Shield,
  Users,
  ArrowRight,
  MapPin,
  Cpu
} from 'lucide-react'
import Link from 'next/link'

const solutions = [
  {
    icon: Cpu,
    title: 'NB-IoT Parking Sensors',
    description: '99% detection accuracy, 5-year battery life, IP68 protection, and dual-mode detection technology.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    link: '/sensor',
  },
  {
    icon: Target,
    title: 'Ground Truth Occupancy Data',
    description: 'NB-IoT sensors providing bay-level parking status with 99%+ reliability and sub-30-second latency for municipalities.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Database,
    title: 'UAE Data Residency',
    description: 'Full compliance with TDRA and DESC ISR requirements—all sensor data, logs, and backups remain in UAE regions.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Cloud,
    title: 'Government API Integration',
    description: 'Unified REST APIs for seamless integration with RTA systems, smart city platforms, and municipal dashboards.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: LineChart,
    title: 'Fleet Operations Portal',
    description: 'Monitor sensor health, battery levels, calibration status, and occupancy analytics with comprehensive alerts.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
]

const benefits = [
  {
    title: 'For Municipalities',
    subtitle: 'RTA & Government',
    icon: Building2,
    items: [
      'Bay-level ground truth data from NB-IoT sensors',
      'TDRA Type Approval and Dealer Registration',
      'UAE data residency (AWS me-central-1)',
      'Pilot validation with acceptance criteria',
    ],
  },
  {
    title: 'For Operators',
    subtitle: 'Facilities & Property',
    icon: Users,
    items: [
      'Fleet health monitoring and alerts',
      'Bluetooth commissioning workflow',
      'Battery and calibration tracking',
      'Multi-level garage and street coverage',
    ],
  },
  {
    title: 'For Smart Cities',
    subtitle: 'Digital Platforms',
    icon: MapPin,
    items: [
      'Unified REST APIs for integration',
      'Real-time occupancy event streams',
      'Audit trails and compliance reporting',
      'Support for digital transformation goals',
    ],
  },
]

const frameworks = [
  {
    title: 'TDRA IoT Compliance',
    description: 'Full regulatory compliance with TDRA Dealer Registration, Type Approval, and IoT data classification requirements.',
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'DESC ISR Alignment',
    description: 'UAE data residency meeting Dubai Government DESC Information Security Regulation for sensitive IoT telemetry.',
    icon: Database,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Smart City Integration',
    description: 'Supporting RTA digital transformation and smart city initiatives through standardized APIs and data collaboration.',
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const stats = [
  { number: '1,000', label: 'NB-IoT Sensors', sublabel: 'Pilot Deployment' },
  { number: '99%+', label: 'Uplink Reliability', sublabel: 'Enterprise Grade' },
  { number: 'Q1 2026', label: 'Pilot Launch', sublabel: 'UAE Market' },
]

const technicalFeatures = [
  {
    title: 'NB-IoT Protocol Stack',
    description: 'MQTT uplink with HEX payload decoding, Bluetooth commissioning, and sub-30s latency for real-time occupancy events.',
    color: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-900',
    subtextColor: 'text-blue-700',
  },
  {
    title: 'Data Sovereignty',
    description: 'All sensor data, logs, and backups hosted in UAE (AWS me-central-1) with TDRA and DESC ISR alignment.',
    color: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-900',
    subtextColor: 'text-emerald-700',
  },
  {
    title: 'Pilot Validation',
    description: 'Acceptance criteria validated across street, semi-covered, and underground environments with coverage mapping.',
    color: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-900',
    subtextColor: 'text-purple-700',
  },
]

export default function SolutionsPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">Our Solutions</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            NB-IoT Infrastructure for <br className="hidden sm:block" />
            <span className="text-primary-600">Smart Parking</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We deploy enterprise-grade parking sensors that provide bay-level ground truth occupancy data 
            with full UAE data residency compliance for government and smart city projects.
          </p>
        </div>
      </Section>

      {/* Stats Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-900">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Solutions Grid */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive smart parking solutions built on cutting-edge NB-IoT technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution) => {
              const CardContent = (
                <>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${solution.bg} mb-4`}>
                    <solution.icon className={`h-6 w-6 ${solution.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{solution.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{solution.description}</p>
                  {'link' in solution && (
                    <div className="mt-4 flex items-center text-primary-600 font-medium">
                      Learn more <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  )}
                </>
              )
              
              if ('link' in solution && solution.link) {
                return (
                  <Link
                    key={solution.title}
                    href={solution.link}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 block"
                  >
                    {CardContent}
                  </Link>
                )
              }
              
              return (
                <div
                  key={solution.title}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  {CardContent}
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Regulatory Framework */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Regulatory & Compliance</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built from the ground up to meet UAE government standards and IoT regulations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <div
                key={framework.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${framework.bg} mb-4`}>
                  <framework.icon className={`h-6 w-6 ${framework.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{framework.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{framework.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits for All Stakeholders</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Creating value for municipalities, operators, and smart city platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <benefit.icon className="h-10 w-10 text-primary-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{benefit.subtitle}</p>
                <ul className="space-y-3">
                  {benefit.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Partnership Model */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="h-8 w-8 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">IoT Infrastructure Partnership</h2>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We deploy NB-IoT sensor networks that provide bay-level ground truth occupancy data 
                  for RTA pilot projects and municipal parking management systems.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    '1,000 NB-IoT parking sensors with MQTT uplink',
                    'UAE data residency (AWS me-central-1)',
                    'REST APIs for RTA/government integration',
                    'Operator portal for fleet health and analytics',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
                <a 
                  href="/technology" 
                  className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                >
                  View technical details <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div className="space-y-4">
                {technicalFeatures.map((feature) => (
                  <div 
                    key={feature.title}
                    className={`${feature.color} rounded-xl p-5 border ${feature.border}`}
                  >
                    <h4 className={`font-semibold ${feature.textColor} mb-1`}>{feature.title}</h4>
                    <p className={`text-sm ${feature.subtextColor}`}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Trusted By Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Trusted by UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Working with government entities across the Emirates
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
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Handshake className="h-12 w-12 text-primary-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Partner with VisionDrive
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We&apos;re ready to collaborate with RTA, municipalities, and government entities to deploy 
            enterprise-grade IoT parking infrastructure with full regulatory compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Schedule a Consultation
            </a>
            <a 
              href="/partners" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              View Our Partners
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}
