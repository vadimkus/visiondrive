'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Home,
  Users,
  Car,
  Shield,
  Clock,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Building2,
  Leaf,
  TrendingDown,
  Eye,
  Bell,
  Settings,
  BarChart3,
  MapPin
} from 'lucide-react'

const benefits = [
  {
    icon: TrendingDown,
    title: 'Reduced Traffic Congestion',
    description: 'Eliminate circling vehicles looking for parking. Residents and visitors find spots instantly, reducing internal traffic by up to 30%.',
    stat: '30%',
    statLabel: 'Less Traffic',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: 'Time Savings',
    description: 'No more wasted time searching for parking. Real-time availability means residents park and go in under 2 minutes.',
    stat: '5 min',
    statLabel: 'Average Saved',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Leaf,
    title: 'Environmental Impact',
    description: 'Less idling and circling means reduced emissions. Smart parking contributes to cleaner air for your community.',
    stat: '20%',
    statLabel: 'Lower Emissions',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Shield,
    title: 'Enhanced Security',
    description: 'Know which vehicles are in your community at all times. Integration with access control for authorized parking only.',
    stat: '24/7',
    statLabel: 'Monitoring',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Users,
    title: 'Visitor Management',
    description: 'Allocate visitor parking fairly. Pre-book spots for guests and track visitor parking usage across the community.',
    stat: '100%',
    statLabel: 'Visibility',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Understand parking patterns. Optimize allocation based on actual usage data, not guesswork.',
    stat: 'Real-time',
    statLabel: 'Insights',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
]

const features = [
  {
    title: 'Real-Time Availability',
    description: 'Residents see available parking spots instantly via mobile app or lobby displays.',
    icon: Eye,
  },
  {
    title: 'Smart Allocation',
    description: 'Assign dedicated spots to residents with overflow management for visitors.',
    icon: Settings,
  },
  {
    title: 'Mobile App Access',
    description: 'Check parking status, guide visitors to spots, and manage allocations from your phone.',
    icon: Smartphone,
  },
  {
    title: 'Instant Alerts',
    description: 'Get notified of unauthorized parking, violations, or when your designated spot is occupied.',
    icon: Bell,
  },
]

const useCases = [
  {
    title: 'Residential Towers',
    description: 'Multi-story residential buildings with basement or podium parking. Manage resident spots and visitor allocation.',
    features: ['Resident spot assignment', 'Visitor pre-booking', 'Overflow management'],
  },
  {
    title: 'Gated Communities',
    description: 'Villa compounds and gated neighborhoods with street or designated parking areas.',
    features: ['Street parking monitoring', 'Guest vehicle tracking', 'Community-wide visibility'],
  },
  {
    title: 'Mixed-Use Developments',
    description: 'Complexes with residential, retail, and office spaces sharing parking facilities.',
    features: ['Multi-tenant management', 'Time-based allocation', 'Revenue optimization'],
  },
]

export default function CommunitiesPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">
            Smart Parking for Communities
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Parking That Works for{' '}
            <span className="text-primary-600">Your Residents</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Transform your community&apos;s parking experience with NB-IoT sensors that provide 
            real-time availability, reduce traffic, and eliminate parking disputes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors group"
            >
              Request a Demo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/sensor"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              View Sensor Technology
            </a>
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits for Your Community</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Smart parking delivers measurable improvements for residents, management, and the environment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
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

      {/* Features Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Simple technology, powerful results
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={`feature-${feature.title}`}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Use Cases */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect For</h2>
            <p className="text-lg text-gray-600">
              Solutions tailored to different community types
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div
                key={`usecase-${useCase.title}`}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.features.map((feature) => (
                    <li key={`uc-feat-${feature.slice(0, 20)}`} className="flex items-center gap-2 text-sm text-gray-700">
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

      {/* Stats Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-primary-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">The Impact of Smart Parking</h2>
              <p className="text-gray-600">What communities experience after deployment</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">30%</div>
                <div className="text-sm text-gray-600">Less Internal Traffic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">90%</div>
                <div className="text-sm text-gray-600">Fewer Parking Disputes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">5 min</div>
                <div className="text-sm text-gray-600">Time Saved Daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">20%</div>
                <div className="text-sm text-gray-600">Lower Emissions</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">UAE Compliant Technology</h2>
          <p className="text-gray-600 mb-8">
            Working with government authorities across the Emirates
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
            <Home className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Community&apos;s Parking?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join residential communities across the UAE deploying smart parking solutions 
              that residents love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Schedule a Consultation
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                View All Solutions
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
