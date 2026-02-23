import type { Metadata } from 'next'
import FAQSchema from '../components/schema/FAQSchema'
import { faqItems } from './faqData'

export const metadata: Metadata = {
  title: 'FAQ - Smart Kitchen Temperature Monitoring Questions',
  description: 'Frequently asked questions about VisionDrive smart kitchen temperature monitoring. Learn about NB-IoT sensors, installation, pricing, and Dubai Municipality compliance.',
  keywords: 'VisionDrive FAQ, smart kitchen questions, temperature sensor FAQ, NB-IoT FAQ, UAE food safety, Dubai Municipality compliance',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'VisionDrive FAQ - Smart Kitchen Questions',
    description: 'Answers to common questions about smart kitchen temperature monitoring solutions.',
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

