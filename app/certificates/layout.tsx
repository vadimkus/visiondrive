import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & Compliance - VisionDrive Practice OS',
  description: 'VisionDrive Practice OS security and compliance information for UAE solo practitioners, patient records, data residency, privacy, and secure workflows.',
  keywords: 'VisionDrive compliance, Practice OS security, patient data privacy, UAE data residency, clinic software compliance',
  alternates: { canonical: '/certificates' },
  openGraph: {
    title: 'VisionDrive Practice OS Security & Compliance',
    description: 'Security, privacy, and data-residency information for Practice OS.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



