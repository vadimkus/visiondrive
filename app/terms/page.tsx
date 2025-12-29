'use client'

import Section from '../components/common/Section'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using VisionDrive services, including the ParkSense mobile application and smart parking platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.',
  },
  {
    title: '2. Service Description',
    body: 'VisionDrive Technologies FZ-LLC provides smart parking solutions in the UAE, including: real-time parking availability, sensor-based occupancy detection, mobile payment processing, parking reservations, and municipal/community parking management. Services are provided "as is" and we reserve the right to modify or discontinue features with reasonable notice.',
  },
  {
    title: '3. User Accounts',
    body: 'You must create an account to use certain features. You are responsible for maintaining the confidentiality of your credentials and all activities under your account. You must provide accurate information and promptly update it. You must be at least 18 years old to create an account.',
  },
  {
    title: '4. Acceptable Use',
    body: 'You agree not to: use the service for illegal purposes, interfere with or disrupt the service, attempt unauthorized access to our systems, misuse parking sensors or equipment, share accounts or credentials, create false parking events or reservations, or violate any applicable laws or regulations.',
  },
  {
    title: '5. Parking and Payments',
    body: 'Parking fees are set by the facility operator (municipality, community, or private operator). You agree to pay all applicable fees and charges. Payment is processed through approved payment providers. Refunds are handled according to the operator\'s refund policy. You are responsible for ensuring valid payment methods are on file.',
  },
  {
    title: '6. Reservations and Cancellations',
    body: 'Parking reservations are subject to availability. Cancellation policies vary by operator and will be displayed before booking. Late arrivals or no-shows may result in forfeiture of fees. We are not liable for parking availability or operator-imposed restrictions.',
  },
  {
    title: '7. Sensor Technology and Data',
    body: 'Our NB-IoT sensors monitor parking bay occupancy in real-time. While we strive for accuracy, sensor data is provided "as is" without guarantee. You acknowledge that technical issues, environmental factors, or coverage limitations may affect sensor performance. See our Privacy Policy for how we handle sensor and location data.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All content, features, and functionality of VisionDrive and ParkSense (including but not limited to software, text, graphics, logos, sensor technology) are owned by VisionDrive Technologies FZ-LLC and protected by UAE and international copyright, trademark, and other laws. You may not copy, modify, or reverse-engineer any part of our services.',
  },
  {
    title: '9. Third-Party Services',
    body: 'Our services may integrate with third-party payment providers, mapping services, and other partners. Your use of third-party services is subject to their terms and policies. We are not responsible for third-party services or their availability.',
  },
  {
    title: '10. Liability and Disclaimers',
    body: 'VisionDrive is a technology platform connecting users with parking facilities. We do not own or operate parking facilities. We are not liable for: vehicle damage, theft, or loss while parked; parking violations or fines; operator actions or policies; or acts of God or circumstances beyond our control. Our total liability is limited to the amount you paid in the 12 months preceding the claim.',
  },
  {
    title: '11. Indemnification',
    body: 'You agree to indemnify and hold harmless VisionDrive Technologies FZ-LLC, its officers, employees, and partners from any claims, damages, or expenses arising from your use of the service, violation of these terms, or violation of any rights of another party.',
  },
  {
    title: '12. Termination',
    body: 'We may suspend or terminate your account at any time for violation of these terms, suspected fraud, or other reasonable cause. You may terminate your account by contacting support. Upon termination, your right to use the service immediately ceases. Outstanding payment obligations survive termination.',
  },
  {
    title: '13. Governing Law and Disputes',
    body: 'These Terms are governed by the laws of the United Arab Emirates and the Emirate of Ras Al Khaimah. Any disputes shall be resolved through arbitration in RAK, UAE, in accordance with UAE arbitration laws. You waive any right to class action or jury trial.',
  },
  {
    title: '14. Changes to Terms',
    body: 'We may update these Terms from time to time. Material changes will be notified via email or in-app notification. Continued use after changes constitutes acceptance. If you do not agree to changes, you must stop using the service.',
  },
  {
    title: '15. Contact and Support',
    body: 'For questions about these Terms or to report issues, contact tech@visiondrive.ae or call +971 55 915 2985. For legal inquiries, contact legal@visiondrive.ae.',
  },
]

interface SectionItem {
  title: string
  body: string
}

function CollapsibleCard({ item, defaultOpen = false }: { item: SectionItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-2">
          <ChevronRight
            className={`h-4 w-4 text-primary-600 mt-1 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{item.title}</h2>
        </div>
        <span className="sr-only">{open ? 'Collapse' : 'Expand'}</span>
      </button>
      {open && (
        <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">
          {item.body}
        </p>
      )}
    </div>
  )
}

export default function TermsPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Terms of Service</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">VisionDrive & ParkSense Terms of Service</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Effective date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — Governed by UAE Law.
          </p>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto space-y-6">
          {sections.map((item, index) => (
            <CollapsibleCard key={item.title} item={item} defaultOpen={index === 0} />
          ))}
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto text-sm text-gray-600 leading-relaxed space-y-4">
          <p>These Terms of Service constitute a legally binding agreement between you and VisionDrive Technologies FZ-LLC. Please read them carefully before using our services.</p>
          <div className="pt-4 border-t border-gray-200">
            <p className="font-medium text-gray-900 mb-2">Legal address and contact:</p>
            <p className="mb-2">
              <strong>VisionDrive Technologies FZ-LLC</strong><br />
              Compass Coworking Centre<br />
              Ras Al Khaimah, United Arab Emirates
            </p>
            <p>
              Legal inquiries:{' '}
              <a href="mailto:legal@visiondrive.ae" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                legal@visiondrive.ae
              </a>
            </p>
          </div>
        </div>
      </Section>
    </main>
  )
}
