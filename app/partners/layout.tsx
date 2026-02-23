import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Partners - VisionDrive UAE Partnerships',
  description: 'VisionDrive partners with UAE government entities and enterprise clients for smart kitchen IoT infrastructure deployment and food safety compliance.',
  keywords: 'VisionDrive partners, UAE partnerships, IoT partners, smart kitchen partners, food safety compliance partners',
  alternates: { canonical: '/partners' },
  openGraph: {
    title: 'VisionDrive Partners',
    description: 'Working with UAE entities to deploy smart kitchen IoT infrastructure across the Emirates.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
