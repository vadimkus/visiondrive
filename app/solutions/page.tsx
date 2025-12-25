'use client'

import { motion as fmMotion } from 'framer-motion'
import Section from '../components/common/Section'
import { Target, Lightbulb, Handshake, Zap, Database, Cloud, CheckCircle2, Sparkles, Building2, LineChart } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const solutions = [
  {
    icon: Target,
    title: 'Smart Mobility Platform',
    description: 'A comprehensive parking solution designed to streamline the parking experience and reduce urban congestion.',
    color: 'bg-blue-500',
  },
  {
    icon: Database,
    title: 'Real-Time IoT Infrastructure',
    description: 'Advanced sensor networks providing accurate, live occupancy data to optimize parking availability.',
    color: 'bg-emerald-500',
  },
  {
    icon: Cloud,
    title: 'Data Integration',
    description: 'Seamless integration with government systems to provide unified parking information and tariff data.',
    color: 'bg-purple-500',
  },
  {
    icon: LineChart,
    title: 'Analytics & Insights',
    description: 'Actionable intelligence for traffic management and urban planning through data-driven insights.',
    color: 'bg-amber-500',
  },
]

const benefits = [
  {
    title: 'For Drivers',
    items: ['Find parking faster with real-time availability', 'Reduce time spent searching and fuel consumption', 'Access unified payment across multiple zones', 'Navigate efficiently to available spaces'],
  },
  {
    title: 'For Authorities',
    items: ['Reduce traffic congestion and emissions', 'Optimize parking space utilization', 'Access real-time occupancy analytics', 'Support smart city objectives'],
  },
  {
    title: 'For Cities',
    items: ['Contribute to sustainability goals', 'Enhance quality of life for residents', 'Support digital transformation initiatives', 'Enable data-driven urban planning'],
  },
]

const frameworks = [
  {
    title: 'Data Collaboration',
    description: 'Fostering innovation through responsible data exchange between public and private sectors.',
    icon: Handshake,
  },
  {
    title: 'Urban Sustainability',
    description: 'Contributing to long-term urban master plans by reducing congestion and environmental impact.',
    icon: Sparkles,
  },
  {
    title: 'Digital Innovation',
    description: 'Supporting smart city transformation through advanced IoT and analytics technologies.',
    icon: Zap,
  },
]

export default function SolutionsPage() {
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
              Our Solutions
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto font-medium">
              Smart Parking for Smart Cities
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are developing innovative smart mobility solutions that transform the parking experience 
              and support the vision of creating the world's smartest and happiest cities.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Mission Statement */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl p-12 shadow-2xl text-white"
          >
            <div className="flex items-start gap-6 mb-6">
              <Building2 className="h-16 w-16 flex-shrink-0" />
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Our Mission
                </h2>
                <p className="text-xl text-gold-50 leading-relaxed mb-6">
                  VisionDrive is a Dubai-based smart mobility initiative committed to streamlining 
                  the parking experience for UAE residents. Our platform aims to directly support 
                  the transformation of cities into the smartest and happiest in the world.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-1">200K+</div>
                    <div className="text-gold-100 text-sm">Parking Spaces Monitored</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-1">5+</div>
                    <div className="text-gold-100 text-sm">Emirates Covered</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-1">Q1 2026</div>
                    <div className="text-gold-100 text-sm">Platform Launch</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Solutions Grid */}
      <Section background="white">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive smart parking solutions built on cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${solution.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {solution.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Strategic Alignment */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Strategic Alignment
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our solutions are designed to support key urban development and digital transformation frameworks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {frameworks.map((framework, index) => {
              const Icon = framework.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-gold-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {framework.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {framework.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits for All Stakeholders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Creating value for drivers, authorities, and cities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, iIndex) => (
                    <li key={iIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Partnership Approach */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-12 shadow-xl border border-gray-200"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Lightbulb className="h-16 w-16 text-gold-500 mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Public-Private Partnership Model
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  We are deploying a pilot project using advanced IoT sensor technology to provide 
                  real-time parking occupancy data. This technology fills a critical gap in the 
                  current ecosystem.
                </p>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  We believe in creating true public-private partnerships that enhance the city's 
                  digital infrastructure through data collaboration and technology innovation.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">Real-time occupancy monitoring via IoT sensors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">Data sharing with government authorities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">API integration for unified parking information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">Supporting sustainability and congestion reduction</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">Data Collaboration Framework</h4>
                  <p className="text-blue-800 text-sm">
                    Encouraging innovation through responsible data exchange between government and private sector entities.
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-2">Urban Master Plan Alignment</h4>
                  <p className="text-emerald-800 text-sm">
                    Reducing traffic congestion and carbon emissions to support sustainability and quality of life goals.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">Digital Transformation</h4>
                  <p className="text-purple-800 text-sm">
                    Advancing smart city initiatives through cutting-edge IoT infrastructure and analytics platforms.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white">
        <div className="max-w-4xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Handshake className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Let's Collaborate
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              We're eager to partner with government authorities and organizations to create 
              innovative smart parking solutions that benefit everyone.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}

