'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Wifi, 
  Code, 
  BarChart3, 
  Lightbulb, 
  Globe, 
  Server,
  Shield,
  Target,
  Users,
  Cpu
} from 'lucide-react'

const capabilities = [
  {
    icon: Wifi,
    title: 'IoT & Wireless Solutions',
    description: 'Trading and deployment of wireless communication equipment, NB-IoT sensors, and smart devices for connected urban infrastructure.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Server,
    title: 'Telecommunications Infrastructure',
    description: 'Supply and integration of telecommunication systems, network equipment, and connectivity solutions for enterprise and municipal deployments.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Code,
    title: 'Software Development',
    description: 'Custom software design, web and mobile application development, and scalable platform solutions tailored to client requirements.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: 'Data Analytics & Intelligence',
    description: 'Advanced data classification, analysis, and visualization services to transform raw data into actionable insights for informed decision-making.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Lightbulb,
    title: 'IT Consulting',
    description: 'Strategic technology consultancy to optimize operations, select appropriate solutions, and drive digital transformation across organizations.',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  {
    icon: Globe,
    title: 'Digital Platforms',
    description: 'Development and operation of web portals, marketplaces, and digital platforms connecting service providers with end users.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
]

const values = [
  {
    icon: Target,
    title: 'Innovation First',
    description: 'We embrace cutting-edge technology to solve real-world urban mobility challenges.',
  },
  {
    icon: Shield,
    title: 'UAE Compliant',
    description: 'Full compliance with UAE data sovereignty, TDRA, and DESC security regulations.',
  },
  {
    icon: Users,
    title: 'Partnership Driven',
    description: 'Collaborating with municipalities, communities, and businesses for sustainable solutions.',
  },
]

export default function AboutClient() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">About VisionDrive</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Smart Technology for <br className="hidden sm:block" />
            <span className="text-primary-600">Urban Mobility</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            VisionDrive Technologies FZ-LLC is a UAE-based technology company specializing in IoT solutions, 
            software development, and digital infrastructure. Our flagship product, <strong>ParkSense</strong>, 
            revolutionizes urban parking with real-time NB-IoT sensor technology.
          </p>
        </div>
      </Section>

      {/* Mission Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              To transform urban mobility in the UAE and beyond through intelligent IoT solutions that make 
              cities smarter, parking easier, and data-driven decisions accessible to municipalities, 
              communities, and businesses.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {values.map((value) => (
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

      {/* Capabilities Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Capabilities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              As a licensed technology company in the UAE, we offer comprehensive services across 
              the full spectrum of digital innovation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div 
                key={cap.title} 
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${cap.bg} mb-4`}>
                  <cap.icon className={`h-6 w-6 ${cap.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Flagship Product Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Flagship Product: ParkSense</h2>
            <p className="text-lg text-gray-600">
              Our smart parking platform powered by NB-IoT sensor technology
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What is ParkSense?</h3>
                <p className="text-gray-600 mb-4">
                  ParkSense is our comprehensive smart parking solution that combines ground-level 
                  IoT sensors with a powerful software platform to provide real-time parking availability, 
                  analytics, and management tools.
                </p>
                <ul className="space-y-2">
                  {[
                    'Real-time bay-level occupancy detection',
                    'NB-IoT sensors with 5+ year battery life',
                    'Mobile app for drivers (iOS & Android)',
                    'Management portal for operators',
                    'Analytics and reporting dashboard',
                    'UAE data sovereignty compliant',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary-600 mt-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Who We Serve</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Municipalities</h4>
                    <p className="text-sm text-gray-600">
                      City-wide parking management, traffic reduction, and revenue optimization for government parking authorities.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Communities</h4>
                    <p className="text-sm text-gray-600">
                      Residential and commercial complexes seeking efficient visitor parking and resident allocation.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Private Operators</h4>
                    <p className="text-sm text-gray-600">
                      Shopping malls, airports, hospitals, and commercial parking facilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Company Info Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Company Information</h2>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Entity</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Company Name</dt>
                    <dd className="font-medium text-gray-900">VisionDrive Technologies FZ-LLC</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Jurisdiction</dt>
                    <dd className="font-medium text-gray-900">Ras Al Khaimah, United Arab Emirates</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">Free Zone LLC</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Trade License</dt>
                    <dd>
                      <a 
                        href="/license/E-License.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                      >
                        View E-License
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd>
                      <a href="mailto:tech@visiondrive.ae" className="font-medium text-primary-600 hover:text-primary-700">
                        tech@visiondrive.ae
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Phone</dt>
                    <dd>
                      <a href="tel:+971559152985" className="font-medium text-gray-900 hover:text-primary-600">
                        +971 55 915 2985
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900">
                      Compass Coworking Centre,<br />
                      Ras Al Khaimah, UAE
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Partnering with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Working with government entities to deploy smart parking across the Emirates
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
            View all partners <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Parking Operations?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let&apos;s discuss how VisionDrive can help your municipality, community, or business 
            implement smart parking solutions.
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



