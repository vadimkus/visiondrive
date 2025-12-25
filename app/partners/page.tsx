'use client'

import { motion as fmMotion } from 'framer-motion'
import Section from '../components/common/Section'
import { Building2, Shield, Globe, Cpu, CheckCircle2 } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const governmentPartners = [
  {
    name: 'RTA',
    fullName: 'Roads and Transport Authority',
    description: 'Dubai\'s official transportation authority managing parking, public transport, and road infrastructure.',
    website: 'https://www.rta.ae',
    icon: Building2,
    color: 'bg-blue-500',
  },
  {
    name: 'Parkin',
    fullName: 'Parkin Company PJSC',
    description: 'Dubai\'s leading provider of paid public parking facilities, managing over 200,000 parking spaces across the emirate.',
    website: 'https://www.parkin.ae',
    icon: Building2,
    color: 'bg-red-500',
  },
  {
    name: 'ITC Abu Dhabi',
    fullName: 'Integrated Transport Centre',
    description: 'Abu Dhabi\'s official authority regulating transport, traffic management, and parking services across the emirate.',
    website: 'https://itc.gov.ae',
    icon: Globe,
    color: 'bg-purple-500',
  },
  {
    name: 'SRTA',
    fullName: 'Sharjah Roads and Transport Authority',
    description: 'Sharjah\'s government body overseeing transportation systems, parking services, and traffic management since 2014.',
    website: 'https://www.srta.gov.ae',
    icon: Building2,
    color: 'bg-orange-500',
  },
  {
    name: 'TDRA',
    fullName: 'Telecommunications and Digital Government Regulatory Authority',
    description: 'Federal UAE authority regulating telecommunications and enabling digital transformation across all emirates.',
    website: 'https://tdra.gov.ae',
    icon: Shield,
    color: 'bg-emerald-500',
  },
  {
    name: 'RAK Government',
    fullName: 'Ras Al Khaimah Government',
    description: 'Working with RAK authorities to bring smart parking solutions to the northern emirates.',
    website: '#',
    icon: Building2,
    color: 'bg-amber-500',
  },
]

const capabilities = [
  'Enterprise-grade IoT sensor networks',
  'Advanced LoRaWAN infrastructure',
  'Multi-vendor hardware integration',
  'Cloud-native data processing',
  'Real-time analytics platform',
  'Secure payment gateway integration',
]

export default function PartnersPage() {
  return (
    <main className="pt-20 bg-white">
      {/* Hero Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Partners
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto font-medium">
              Collaborating with UAE Authorities
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We work closely with government entities and technology providers to deliver 
              world-class smart parking solutions across the UAE.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Government Partners Section */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Government & Regulatory Partners
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by UAE government authorities to deliver innovative parking solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {governmentPartners.map((partner, index) => {
              const Icon = partner.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <a
                    href={partner.website}
                    target={partner.website !== '#' ? '_blank' : undefined}
                    rel={partner.website !== '#' ? 'noopener noreferrer' : undefined}
                    className={`block h-full bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 ${partner.website === '#' ? 'cursor-default' : ''}`}
                    onClick={(e) => partner.website === '#' && e.preventDefault()}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 ${partner.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {partner.fullName}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {partner.description}
                    </p>
                  </a>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Technology Capabilities */}
      <Section background="white">
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Technology Ecosystem
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                We partner with leading technology providers across the IoT, cloud, and 
                telecommunications sectors to build reliable, scalable smart parking infrastructure.
              </p>
              <div className="space-y-4">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800 text-lg">{capability}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl p-8 shadow-2xl text-white">
                <Cpu className="h-12 w-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Partnership Approach</h3>
                <p className="text-gold-50 mb-6 leading-relaxed">
                  We believe in building long-term relationships with partners who share our 
                  commitment to innovation, quality, and customer success.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-gold-50">Open integration standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-gold-50">Vendor-neutral architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-gold-50">Enterprise support & SLAs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-gold-50">Continuous innovation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Building2 className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Become a Partner
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Interested in partnering with VisionDrive? Let's explore how we can work together 
              to advance smart parking across the UAE.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}
