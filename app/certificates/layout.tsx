import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Certifications - VisionDrive Compliance Documents',
  description: 'VisionDrive certifications and compliance documentation. TDRA Type Approval, DESC ISR compliance, and UAE regulatory certificates.',
  keywords: 'VisionDrive certificates, TDRA approval, compliance documents, UAE certifications, IoT certification',
  openGraph: {
    title: 'VisionDrive Certifications',
    description: 'Regulatory compliance and certification documentation.',
    type: 'website',
  },
}

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

