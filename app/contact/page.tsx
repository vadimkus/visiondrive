'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Users, 
  Zap,
  ArrowRight,
  Send,
  Headphones,
  Globe,
  Shield
} from 'lucide-react'

const contactMethods = [
  {
    label: 'Email',
    value: 'tech@visiondrive.ae',
    description: 'For technical inquiries and partnerships',
    href: 'mailto:tech@visiondrive.ae',
    icon: Mail,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    label: 'WhatsApp',
    value: '+971 55 915 2985',
    description: 'Quick responses during business hours',
    href: 'https://wa.me/971559152985',
    icon: MessageCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  {
    label: 'Phone',
    value: '+971 55 915 2985',
    description: 'Mon-Fri, 9:00 AM - 6:00 PM GST',
    href: 'tel:+971559152985',
    icon: Phone,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
]

const reasons = [
  {
    icon: Building2,
    title: 'Government & Municipal Projects',
    description: 'Deploy NB-IoT parking sensors for RTA, municipalities, and smart city initiatives with full regulatory compliance.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Strategic Partnerships',
    description: 'Collaborate on IoT infrastructure, technology integration, and joint ventures in the UAE parking ecosystem.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Zap,
    title: 'Technical Integration',
    description: 'Connect your existing systems with our platform via REST APIs for real-time occupancy data and analytics.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Headphones,
    title: 'Pilot Support',
    description: 'Get dedicated support for sensor deployment, commissioning, and ongoing maintenance during your pilot.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

const features = [
  { icon: Clock, text: 'Response within 1 business day' },
  { icon: Globe, text: 'UAE-focused with regional coverage' },
  { icon: Shield, text: 'Secure & compliant communications' },
]

const faqs = [
  {
    q: 'How quickly can we start a pilot?',
    a: 'After initial discussions and NOC approval, sensor deployment typically begins within 2-4 weeks.',
  },
  {
    q: 'Do you support projects outside Dubai?',
    a: 'Yes, we serve all UAE emirates including Abu Dhabi, Sharjah, RAK, and beyond.',
  },
  {
    q: 'What integration options are available?',
    a: 'We provide REST APIs, MQTT streams, and can integrate with existing parking management and smart city platforms.',
  },
  {
    q: 'Is there a minimum deployment size?',
    a: 'Pilots typically start with 50-100 sensors. We customize based on your specific requirements and location.',
  },
]

export default function ContactPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">Get In Touch</p>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                Let&apos;s Build <br />
                <span className="text-primary-600">Smart Parking</span> Together
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Whether you&apos;re a government entity, municipality, property manager, or technology partner—we&apos;re ready to discuss how NB-IoT parking sensors can transform your infrastructure.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm text-gray-600">
                    <feature.icon className="h-4 w-4 text-primary-600" />
                    {feature.text}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:tech@visiondrive.ae"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Email
                </a>
                <a
                  href="https://wa.me/971559152985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactMethods.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`flex items-center gap-4 p-5 bg-white rounded-xl border ${contact.border} hover:shadow-lg transition-all duration-200 group`}
                >
                  <div className={`w-14 h-14 ${contact.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <contact.icon className={`h-7 w-7 ${contact.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{contact.label}</div>
                    <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{contact.value}</div>
                    <div className="text-sm text-gray-500">{contact.description}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </a>
              ))}

              {/* Office Location */}
              <a
                href="https://maps.app.goo.gl/TB79xTZArqX6wJZo6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-7 w-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Office</div>
                  <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">VisionDrive HQ</div>
                  <div className="text-sm text-gray-500">Compass Coworking Centre, RAK, UAE</div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* Why Contact Us */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We work with government entities, municipalities, and enterprises to deploy smart parking infrastructure
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${reason.bg} mb-4`}>
                  <reason.icon className={`h-6 w-6 ${reason.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about working with VisionDrive
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed ml-9">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">Have a question not listed here?</p>
            <a
              href="mailto:tech@visiondrive.ae"
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
            >
              Send us an email <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Working with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Partnering with government entities across the Emirates
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Parking Infrastructure?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join RTA, municipalities, and leading enterprises deploying NB-IoT parking sensors across the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:tech@visiondrive.ae" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Start a Conversation
              </a>
              <a 
                href="/solutions" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                Explore Solutions
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
