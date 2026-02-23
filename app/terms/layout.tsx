import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - VisionDrive',
  description: 'VisionDrive terms of service. Legal agreement governing the use of our smart kitchen monitoring platform and IoT services in the UAE.',
  keywords: 'terms of service, user agreement, VisionDrive terms, smart kitchen terms',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service - VisionDrive',
    description: 'VisionDrive terms of service. Legal agreement governing the use of our smart kitchen monitoring platform and IoT services in the UAE.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



