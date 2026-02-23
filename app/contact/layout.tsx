import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact VisionDrive - Smart Kitchen Solutions UAE',
  description: 'Get in touch with VisionDrive for NB-IoT smart kitchen temperature monitoring solutions. Contact us for enterprise projects, partnerships, and technical integrations in the UAE.',
  keywords: 'contact VisionDrive, smart kitchen inquiry, UAE IoT solutions, temperature monitoring contact, food safety partnership',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact VisionDrive - Smart Kitchen Solutions',
    description: 'Contact us for enterprise projects, partnerships, and smart kitchen deployments across the UAE.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
