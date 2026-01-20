'use client'

import Section from '../components/common/Section'
import { 
  Thermometer, 
  AlertTriangle, 
  FileCheck, 
  Zap, 
  Shield, 
  CheckCircle2, 
  Building2,
  ChefHat,
  ArrowRight,
  Bell,
  BarChart3,
  Clock,
  Smartphone,
  Cloud,
  Radio
} from 'lucide-react'
import Link from 'next/link'

const solutions = [
  {
    icon: Thermometer,
    title: 'Real-Time Temperature Monitoring',
    description: 'NB-IoT sensors with 24/7 monitoring of fridges, freezers, and ambient temperatures. Sub-30 second data updates.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: AlertTriangle,
    title: 'Danger Zone Alerts',
    description: 'Instant SMS, email, and push notifications when temperatures enter the 5°C-60°C food safety danger zone.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: FileCheck,
    title: 'Compliance Reporting',
    description: 'Automated Dubai Municipality compliant reports. HACCP documentation ready for inspections.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Historical trends, temperature patterns, and insights for proactive kitchen management.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Smartphone,
    title: 'Kitchen Owner Portal',
    description: 'Mobile-friendly dashboard to monitor all your sensors, view alerts, and manage multiple locations.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    link: '/kitchen-owner',
  },
]

const benefits = [
  {
    title: 'For Restaurants',
    subtitle: 'QSR, Fine Dining & Cafes',
    icon: ChefHat,
    items: [
      'Ensure food safety compliance 24/7',
      'Reduce food waste from temperature excursions',
      'Automated inspection-ready reports',
      'Multi-location monitoring from one dashboard',
    ],
  },
  {
    title: 'For Hotels & Catering',
    subtitle: 'Large-Scale Operations',
    icon: Building2,
    items: [
      'Monitor walk-in coolers and banquet storage',
      'Track multiple kitchen zones simultaneously',
      'Integration with building management systems',
      'Enterprise reporting and analytics',
    ],
  },
  {
    title: 'For Food Production',
    subtitle: 'Central Kitchens & Manufacturing',
    icon: Shield,
    items: [
      'HACCP and ISO 22000 compliance support',
      'Cold chain monitoring and logging',
      'Batch tracking and temperature records',
      'Audit trail for quality assurance',
    ],
  },
]

const temperatureZones = [
  {
    title: 'Fridge Safe Zone',
    range: '0°C - 5°C',
    description: 'Optimal for fresh produce, dairy, and prepared foods',
    color: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-900',
    subtextColor: 'text-blue-700',
  },
  {
    title: 'Freezer Safe Zone',
    range: '≤ -18°C',
    description: 'Required for frozen meats, seafood, and ice cream',
    color: 'bg-cyan-50',
    border: 'border-cyan-200',
    textColor: 'text-cyan-900',
    subtextColor: 'text-cyan-700',
  },
  {
    title: 'Danger Zone ⚠️',
    range: '5°C - 60°C',
    description: 'Bacteria multiply rapidly—alerts trigger immediately',
    color: 'bg-red-50',
    border: 'border-red-200',
    textColor: 'text-red-900',
    subtextColor: 'text-red-700',
  },
  {
    title: 'Hot Holding',
    range: '≥ 60°C',
    description: 'Safe temperature for hot food display and service',
    color: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-900',
    subtextColor: 'text-orange-700',
  },
]

const stats = [
  { number: '24/7', label: 'Monitoring', sublabel: 'Never miss an alert' },
  { number: '<30s', label: 'Alert Latency', sublabel: 'Real-time response' },
  { number: '5+ yr', label: 'Battery Life', sublabel: 'Low maintenance' },
]

export default function SolutionsPage() {
  return (
    <main className="pt-[60px] sm:pt-[72px] bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-10 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-4 sm:mb-6">
            <ChefHat className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-xs sm:text-sm font-semibold text-orange-700">Our Solutions</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            Smart Kitchen
            <span className="text-orange-600 block sm:inline"> Temperature Monitoring</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Enterprise-grade IoT sensors for commercial kitchens. Ensure food safety compliance 
            with Dubai Municipality standards through real-time monitoring and automated alerts.
          </p>
        </div>
      </Section>

      {/* Stats Section */}
      <Section background="gray" className="py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 text-center shadow-sm"
              >
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base font-medium text-gray-900">{stat.label}</div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Temperature Zones */}
      <Section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Temperature Zones</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Dubai Municipality food safety standards require strict temperature control
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {temperatureZones.map((zone) => (
              <div 
                key={zone.title}
                className={`${zone.color} rounded-xl p-5 border ${zone.border}`}
              >
                <h4 className={`font-semibold ${zone.textColor} mb-1`}>{zone.title}</h4>
                <div className={`text-2xl font-bold ${zone.textColor} mb-2`}>{zone.range}</div>
                <p className={`text-sm ${zone.subtextColor}`}>{zone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Solutions Grid */}
      <Section background="gray" className="py-10 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">What We Offer</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive temperature monitoring solutions for commercial kitchens
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {solutions.map((solution) => {
              const CardContent = (
                <>
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${solution.bg} mb-4`}>
                    <solution.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${solution.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{solution.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{solution.description}</p>
                  {'link' in solution && (
                    <div className="mt-4 flex items-center text-orange-600 font-medium text-sm sm:text-base">
                      Access Portal <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  )}
                </>
              )
              
              if ('link' in solution && solution.link) {
                return (
                  <Link
                    key={solution.title}
                    href={solution.link}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg active:scale-[0.99] transition-all duration-200 block"
                  >
                    {CardContent}
                  </Link>
                )
              }
              
              return (
                <div
                  key={solution.title}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200"
                >
                  {CardContent}
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Solutions for Every Kitchen</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From quick-service restaurants to hotel banquets, we have you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6" id="restaurants">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100"
                id={benefit.title === 'For Hotels & Catering' ? 'hotels' : undefined}
              >
                <benefit.icon className="h-10 w-10 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{benefit.subtitle}</p>
                <ul className="space-y-3">
                  {benefit.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Technology Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Radio className="h-8 w-8 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">NB-IoT Sensor Technology</h2>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our temperature sensors use NB-IoT cellular technology for reliable, low-power 
                  communication. With 5+ year battery life, IP67 waterproofing, and medical-grade 
                  accuracy, they&apos;re built for demanding kitchen environments.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    'NB-IoT sensors with MQTT uplink',
                    'UAE data residency (AWS me-central-1)',
                    'Kitchen Owner Portal for monitoring',
                    'Automated compliance reporting',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
                <a 
                  href="/technology" 
                  className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
                >
                  View technical details <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600 mb-1">±0.3°C</div>
                  <div className="text-xs text-blue-700">Accuracy</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">5+ Years</div>
                  <div className="text-xs text-green-700">Battery Life</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600 mb-1">IP67</div>
                  <div className="text-xs text-purple-700">Waterproof</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                  <div className="text-2xl font-bold text-orange-600 mb-1">&lt;30s</div>
                  <div className="text-xs text-orange-700">Alert Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <ChefHat className="h-12 w-12 text-orange-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Ensure Food Safety Compliance?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Get started with smart temperature monitoring for your commercial kitchen.
            Request a demo to see how VisionDrive can help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Request a Demo
            </a>
            <a 
              href="/kitchen-owner" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              Kitchen Owner Portal
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}
