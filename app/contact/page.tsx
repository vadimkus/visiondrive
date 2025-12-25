'use client'

import { motion as fmMotion } from 'framer-motion'
import Section from '../components/common/Section'
import Button from '../components/common/Button'
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle2, Building2, Users, Zap } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const contacts = [
  {
    label: 'Email',
    value: 'ask@visiondrive.ae',
    href: 'mailto:ask@visiondrive.ae',
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'WhatsApp',
    value: '+971 55 915 2985',
    href: 'https://wa.me/971559152985',
    icon: MessageCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    label: 'Location',
    value: 'VisionDrive, Compass Coworking Centre, RAK, UAE',
    href: 'https://maps.app.goo.gl/TB79xTZArqX6wJZo6',
    icon: MapPin,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
]

const reasons = [
  {
    icon: Building2,
    title: 'Enterprise Pilots',
    description: 'Deploy smart parking solutions in your buildings or municipalities',
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Collaborate on IoT infrastructure and smart city initiatives',
  },
  {
    icon: Zap,
    title: 'Technical Integration',
    description: 'Connect your systems with our platform via standard APIs',
  },
]

const faqs = [
  {
    q: 'How fast do you respond?',
    a: 'We aim to reply within 1 business day. Pilots and incidents get priority.',
  },
  {
    q: 'Do you support pilots outside the UAE?',
    a: 'Our focus is UAE, but we evaluate strategic pilots regionally on a case-by-case basis.',
  },
  {
    q: 'Can we integrate with existing systems?',
    a: 'Yes. We support integration with various IoT sensors, access control systems, and third-party platforms via APIs.',
  },
]

export default function ContactPage() {
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
              Let's Build Together
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto">
              Ready to transform parking with IoT?
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Whether you're a municipality, property manager, or technology partner—we'd love to hear from you.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:ask@visiondrive.ae"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email Us
              </a>
              <a
                href="https://wa.me/971559152985"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Why Contact Us */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Contact Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help with deployments, data, integrations, and partnerships
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reasons.map((reason, index) => {
              const Icon = reason.icon
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
                    {reason.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {reason.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Contact Information & FAQs */}
      <Section background="white">
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                {contacts.map((contact) => {
                  const Icon = contact.icon
                  return (
                    <a
                      key={contact.label}
                      href={contact.href}
                      target={contact.label === 'Location' ? '_blank' : undefined}
                      rel={contact.label === 'Location' ? 'noopener noreferrer' : undefined}
                      className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-gold-500 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className={`w-12 h-12 ${contact.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${contact.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{contact.label}</div>
                        <div className="text-gray-700">{contact.value}</div>
                      </div>
                    </a>
                  )
                })}
                
                <div className="flex items-start gap-3 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <span className="font-semibold">Response Time:</span> Within 1 business day (faster for pilots and incidents)
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Common Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed ml-8">{faq.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl border border-gold-200">
                <h3 className="font-semibold text-gray-900 mb-2">Have more questions?</h3>
                <p className="text-gray-700 text-sm mb-4">
                  Check out our solutions page or send us a message directly.
                </p>
                <a
                  href="/solutions"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Explore Solutions
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>
    </main>
  )
}

