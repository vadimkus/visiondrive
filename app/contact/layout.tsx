import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact VisionDrive - Smart Parking Solutions UAE',
  description: 'Get in touch with VisionDrive for NB-IoT smart parking solutions. Contact us for government projects, partnerships, and technical integrations in the UAE.',
  keywords: 'contact VisionDrive, smart parking inquiry, UAE parking solutions, RTA parking contact, municipal parking partnership',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact VisionDrive - Let\'s Build Smart Parking Together',
    description: 'Contact us for government projects, partnerships, and smart parking deployments across the UAE.',
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



