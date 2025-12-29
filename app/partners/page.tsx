'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Cpu, 
  CheckCircle2,
  Handshake,
  Target,
  Shield,
  Zap,
  Users,
  ArrowRight
} from 'lucide-react'

const governmentPartners = [
  {
    name: 'RTA',
    fullName: 'Roads and Transport Authority',
    description: 'Dubai\'s official transportation authority managing parking, public transport, and road infrastructure.',
    website: 'https://www.rta.ae',
    logo: '/images/gov/icons/rta.jpg',
  },
  {
    name: 'Parkin',
    fullName: 'Parkin Company PJSC',
    description: 'Dubai\'s leading provider of paid public parking facilities, managing over 200,000 parking spaces across the emirate.',
    website: 'https://www.parkin.ae',
    logo: '/images/gov/icons/parkin.jpg',
  },
  {
    name: 'ITC Abu Dhabi',
    fullName: 'Integrated Transport Centre',
    description: 'Abu Dhabi\'s official authority regulating transport, traffic management, and parking services across the emirate.',
    website: 'https://itc.gov.ae',
    logo: '/images/gov/icons/itc.jpg',
  },
  {
    name: 'SRTA',
    fullName: 'Sharjah Roads and Transport Authority',
    description: 'Sharjah\'s government body overseeing transportation systems, parking services, and traffic management since 2014.',
    website: 'https://www.srta.gov.ae',
    logo: '/images/gov/icons/srta.jpg',
  },
  {
    name: 'TDRA',
    fullName: 'Telecommunications and Digital Government Regulatory Authority',
    description: 'Federal UAE authority regulating telecommunications and enabling digital transformation across all emirates.',
    website: 'https://tdra.gov.ae',
    logo: '/images/gov/icons/tdra.jpg',
  },
  {
    name: 'RAK Government',
    fullName: 'Ras Al Khaimah Government',
    description: 'Working with RAK authorities to bring smart parking solutions to the northern emirates.',
    website: '#',
    logo: '/images/gov/icons/rak.jpg',
  },
]

const capabilities = [
  'Enterprise-grade NB-IoT sensor networks',
  'AWS UAE Region (me-central-1) hosting',
  'Multi-vendor hardware integration',
  'Cloud-native data processing',
  'Real-time analytics platform',
  'Secure payment gateway integration',
]

const partnershipValues = [
  {
    icon: Target,
    title: 'Innovation Focus',
    description: 'Partnering with technology leaders to deliver cutting-edge solutions.',
  },
  {
    icon: Shield,
    title: 'UAE Compliance',
    description: 'Full alignment with TDRA, DESC, and local regulatory requirements.',
  },
  {
    icon: Handshake,
    title: 'Long-term Commitment',
    description: 'Building sustainable relationships for mutual growth and success.',
  },
]

export default function PartnersPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">Our Partners</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Collaborating with <br className="hidden sm:block" />
            <span className="text-primary-600">UAE Authorities</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We work closely with government entities and technology providers to deliver 
            world-class smart parking solutions across the UAE.
          </p>
        </div>
      </Section>

      {/* Partnership Values */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Handshake className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Partnership Philosophy</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We believe in building long-term relationships with partners who share our 
              commitment to innovation, quality, and making UAE cities smarter.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {partnershipValues.map((value) => (
                <div key={value.title} className="text-center sm:text-left">
                  <value.icon className="h-6 w-6 text-primary-600 mx-auto sm:mx-0 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Government Partners Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Government & Regulatory Partners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by UAE government authorities to deliver innovative parking solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {governmentPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.website}
                target={partner.website !== '#' ? '_blank' : undefined}
                rel={partner.website !== '#' ? 'noopener noreferrer' : undefined}
                className={`block bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 ${partner.website === '#' ? 'cursor-default' : 'group'}`}
                onClick={(e) => partner.website === '#' && e.preventDefault()}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {partner.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{partner.fullName}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{partner.description}</p>
                {partner.website !== '#' && (
                  <div className="mt-4 flex items-center text-sm text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Visit website <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* Technology Ecosystem */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology Ecosystem</h2>
            <p className="text-lg text-gray-600">
              Partnering with leading technology providers for reliable, scalable infrastructure
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="h-6 w-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Our Capabilities</h3>
                </div>
                <ul className="space-y-3">
                  {capabilities.map((capability) => (
                    <li key={capability} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Integration Standards</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Open APIs</h4>
                    <p className="text-sm text-gray-600">
                      RESTful APIs and webhooks for seamless third-party integration.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Vendor-Neutral</h4>
                    <p className="text-sm text-gray-600">
                      Architecture designed to work with multiple sensor manufacturers.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Enterprise SLAs</h4>
                    <p className="text-sm text-gray-600">
                      99.9% uptime guarantee with dedicated support channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pilot Program Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">
                  <Users className="h-4 w-4" />
                  Now Accepting
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Pilot Program Partners
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We&apos;re actively seeking municipalities and communities to participate 
                  in our pilot program. Get early access to ParkSense technology with 
                  preferential pricing and dedicated support.
                </p>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Apply for Pilot Program
                </a>
              </div>
              <div className="space-y-3">
                {[
                  'Free initial consultation',
                  'Customized pilot scope',
                  'Dedicated technical support',
                  'Preferential pricing for scale-up',
                  'Direct feedback channel to product team',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-primary-600">✓</span>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Become a Partner
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Interested in partnering with VisionDrive? Let&apos;s explore how we can work together 
            to advance smart parking across the UAE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/technology" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              Learn About Our Technology
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}
