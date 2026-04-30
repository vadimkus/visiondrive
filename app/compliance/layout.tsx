import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Security & Compliance - UAE Data Residency | VisionDrive',
  description: 'VisionDrive Practice OS security and compliance posture for UAE data residency, private patient records, tenant isolation, patient-safe sharing, and privacy-aware practice operations.',
  keywords: 'Practice OS compliance, UAE data residency, practice management security, patient records privacy, patient data protection UAE, UAE clinic software',
  alternates: { canonical: '/compliance' },
  openGraph: {
    title: 'Practice OS Security & Compliance | VisionDrive UAE',
    description: 'UAE data residency, private patient records, tenant isolation, and patient-safe sharing.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



