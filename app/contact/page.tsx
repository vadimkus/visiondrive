'use client'

import Section from '../components/common/Section'
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  ChefHat,
  Thermometer, 
  Zap,
  ArrowRight,
  Send,
  FileCheck,
  Bell,
  Shield
} from 'lucide-react'

const contactMethods = [
  {
    label: 'Email',
    value: 'tech@visiondrive.ae',
    description: 'For inquiries and demonstrations',
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
    icon: Thermometer,
    title: 'Temperature Monitoring',
    description: 'Deploy smart sensors for real-time fridge, freezer, and ambient temperature monitoring in your kitchen.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: FileCheck,
    title: 'Compliance Support',
    description: 'Ensure your kitchen meets Dubai Municipality food safety standards with automated compliance reporting.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Bell,
    title: 'Alert Configuration',
    description: 'Set up custom temperature thresholds and alert channels for your specific kitchen requirements.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Technical Support',
    description: 'Get dedicated support for sensor deployment, configuration, and ongoing maintenance.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const features = [
  { icon: Clock, text: 'Response within 1 business day' },
  { icon: ChefHat, text: 'Kitchen-focused solutions' },
  { icon: Shield, text: 'UAE data residency compliant' },
]

const faqs = [
  {
    q: 'How quickly can sensors be installed?',
    a: 'Sensors are wireless and can be deployed within hours. No complex wiring or infrastructure changes required.',
  },
  {
    q: 'What types of kitchens do you serve?',
    a: 'We serve restaurants, hotels, catering companies, central kitchens, and food production facilities across the UAE.',
  },
  {
    q: 'Is the system Dubai Municipality compliant?',
    a: 'Yes, our reports are designed to meet Dubai Municipality food safety inspection requirements and HACCP documentation standards.',
  },
  {
    q: 'What happens if a sensor goes offline?',
    a: 'You receive immediate alerts if a sensor loses connectivity. Sensors also store data locally and sync when reconnected.',
  },
]

export default function ContactPage() {
  return (
    <main className="pt-[60px] sm:pt-[72px] bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-10 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div className="text-center md:text-left">
              <h1 className="text-[2rem] leading-[1.1] md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-4 sm:mb-6">
                Start Monitoring
                <span className="text-orange-500 block sm:inline"> Your Kitchen</span> Today
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                Whether you manage a single restaurant or a chain of kitchens, we&apos;re ready to help you 
                ensure food safety compliance with smart temperature monitoring.
              </p>
              
              {/* Features */}
              <div className="hidden sm:flex flex-wrap gap-4 mb-8">
                {features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm text-gray-600">
                    <feature.icon className="h-4 w-4 text-orange-600" />
                    {feature.text}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-0">
                <a
                  href="mailto:tech@visiondrive.ae"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/25"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Email
                </a>
                <a
                  href="https://wa.me/971559152985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="space-y-3 sm:space-y-4">
              {contactMethods.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`flex items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border ${contact.border} hover:shadow-lg active:scale-[0.99] transition-all duration-200 group`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${contact.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <contact.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${contact.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{contact.label}</div>
                    <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">{contact.value}</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">{contact.description}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </a>
              ))}

              {/* Office Location */}
              <a
                href="https://maps.app.goo.gl/TB79xTZArqX6wJZo6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg active:scale-[0.99] transition-all duration-200 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Office</div>
                  <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">VisionDrive HQ</div>
                  <div className="text-xs sm:text-sm text-gray-500">Compass Coworking, RAK, UAE</div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
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
              We work with restaurants, hotels, and food service businesses across the UAE
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
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
              Quick answers to common questions about our smart kitchen solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-orange-50 rounded-xl p-6 border border-orange-100"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
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
              className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
            >
              Send us an email <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Ensure Food Safety Compliance?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Join restaurants, hotels, and food service businesses across the UAE using smart 
              temperature monitoring to protect their customers and reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:tech@visiondrive.ae" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Request a Demo
              </a>
              <a 
                href="/solutions" 
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg border border-orange-400 hover:bg-orange-400 transition-colors"
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
