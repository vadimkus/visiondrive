import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Partners - VisionDrive UAE Partnerships',
  description: 'VisionDrive partners with UAE practitioners, independent clinics, and service providers to improve practice operations with Practice OS.',
  keywords: 'VisionDrive partners, UAE practice software partners, clinic software partnerships, Practice OS',
  alternates: { canonical: '/partners' },
  openGraph: {
    title: 'VisionDrive Partners',
    description: 'Working with UAE practitioners and independent clinics to improve practice operations.',
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
