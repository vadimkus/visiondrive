import Section from '../components/common/Section'
import Button from '../components/common/Button'
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react'

const contacts = [
  {
    label: 'Email',
    value: 'ask@visiondrive.ae',
    href: 'mailto:ask@visiondrive.ae',
    icon: Mail,
  },
  {
    label: 'Phone',
    value: '+971 55 915 2985',
    href: 'tel:+971559152985',
    icon: Phone,
  },
  {
    label: 'WhatsApp',
    value: '+971 55 915 2985',
    href: 'https://wa.me/971559152985',
    icon: MessageCircle,
  },
  {
    label: 'Address',
    value: 'VisionDrive, Compass Coworking Centre, RAK, UAE',
    href: 'https://maps.app.goo.gl/TB79xTZArqX6wJZo6',
    icon: MapPin,
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
    q: 'Can we integrate with existing sensors or access systems?',
    a: 'Yes. We interoperate with LoRaWAN devices, ANPR, BLE access, and webhooks.',
  },
]

export default function ContactPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Contact</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Let’s connect about parking, pilots, and partnerships
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Tell us what you need—deployments, data, or integrations. We’ll respond quickly and route you to the right team.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button href="mailto:ask@visiondrive.ae" size="md">Email us</Button>
            <Button href="https://wa.me/971559152985" variant="secondary" size="md">Message on WhatsApp</Button>
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Reach us directly</h2>
            <div className="space-y-3">
              {contacts.map(({ label, value, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={label === 'Address' ? '_blank' : undefined}
                  rel={label === 'Address' ? 'noopener noreferrer' : undefined}
                  className="flex items-start gap-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors p-3"
                >
                  <Icon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-700">{value}</div>
                  </div>
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-primary-600" />
              <span>Response target: 1 business day (faster for pilots/incidents)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Common questions</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-900">{faq.q}</div>
                  <div className="mt-1 text-sm text-gray-700 leading-relaxed">{faq.a}</div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Button href="/solutions" variant="secondary" size="md">See what we offer</Button>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}

