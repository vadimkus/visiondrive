import type { Metadata } from 'next'
import FAQSchema from '../components/schema/FAQSchema'
import { faqItems } from './faqData'

export const metadata: Metadata = {
  title: 'FAQ - Practice OS for Solo Practitioners',
  description: 'Frequently asked questions about VisionDrive Practice OS: booking, patient records, mobile practitioner mode, payments, patient portal, and UAE data residency.',
  keywords: 'VisionDrive FAQ, Practice OS questions, solo practitioner software UAE, private practice software, patient records, online booking',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'VisionDrive FAQ - Practice OS Questions',
    description: 'Answers to common questions about VisionDrive Practice OS for solo practitioners.',
    type: 'website',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FAQSchema items={faqItems} />
      {children}
    </>
  )
}

