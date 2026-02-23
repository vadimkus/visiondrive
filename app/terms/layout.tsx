import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - VisionDrive',
  description: 'VisionDrive and ParkSense terms of service. Legal agreement governing the use of our smart parking platform and services.',
  keywords: 'terms of service, user agreement, VisionDrive terms, ParkSense terms',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'VisionDrive Terms of Service',
    description: 'Terms and conditions for using VisionDrive services.',
    type: 'website',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



