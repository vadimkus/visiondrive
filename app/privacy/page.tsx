'use client'

import Section from '../components/common/Section'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

const sections = [
  {
    title: '1. Who we are',
    body: 'VisionDrive Technologies FZ-LLC provides smart parking solutions in the UAE. This notice explains how we handle personal data when you use our apps, platform, sensors, and support channels.',
  },
  {
    title: '2. Data we collect',
    body: 'Account and contact details, parking activity (reservations, entries/exits, payments), device and network identifiers, coarse location for availability, and support communications. We avoid collecting precise GPS unless needed to deliver a requested feature.',
  },
  {
    title: '3. How we use data',
    body: 'To operate the service, prevent fraud, provide support, process payments, improve reliability, and meet legal obligations. Aggregated analytics are used to plan capacity and performance without identifying individuals.',
  },
  {
    title: '4. Legal bases',
    body: 'We rely on contract (to deliver the service you request), legitimate interests (service reliability, security, analytics), consent where required (marketing, certain cookies), and legal obligations.',
  },
  {
    title: '5. Sharing',
    body: 'Service providers (hosting, payments, messaging, analytics), municipal/parking operators for enforcement and access control, and authorities where required by law. We do not sell personal data.',
  },
  {
    title: '6. Retention',
    body: 'We keep data only as long as needed for the purpose collected and to meet legal or accounting requirements, then delete or anonymize it.',
  },
  {
    title: '7. Security',
    body: 'Encryption in transit and at rest, access controls, audit logging, and continuous monitoring. No system is perfect—please report suspected issues to security@visiondrive.ae.',
  },
  {
    title: '8. Your rights (UAE PDPL)',
    body: 'You may request access, correction, deletion, restriction, or portability where applicable. You may object to processing based on legitimate interests and withdraw consent at any time. We will respond per UAE Personal Data Protection Law requirements.',
  },
  {
    title: '9. Cookies & analytics',
    body: 'We use essential cookies for authentication and session continuity, and analytics cookies (where allowed) to improve performance. You can manage preferences in your browser or device settings.',
  },
  {
    title: '10. International transfers',
    body: 'If data is processed outside the UAE, we apply safeguards such as contractual protections and reputable cloud providers to maintain equivalent protection.',
  },
  {
    title: '11. Children',
    body: 'Our services are not directed to children under 16, and we do not knowingly collect their data.',
  },
  {
    title: '12. Contact',
    body: 'For privacy questions or requests, contact ask@visiondrive.ae or call +971 55 915 2985. Address: VisionDrive, Compass Coworking Centre, RAK, UAE.',
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

export default function PrivacyPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Privacy Policy</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Your data, protected by design</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Effective date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — Updated for UAE PDPL.
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
        <div className="max-w-4xl mx-auto text-sm text-gray-600 leading-relaxed space-y-2">
          <p>We may update this notice to reflect changes in law or our practices. Material changes will be highlighted on this page.</p>
        </div>
      </Section>
    </main>
  )
}
