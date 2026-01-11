import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance - VisionDrive UAE Data Residency & Security',
  description: 'VisionDrive compliance with TDRA, DESC ISR, and UAE data residency requirements. Full regulatory alignment for government IoT deployments.',
  keywords: 'TDRA compliance, DESC ISR, UAE data residency, IoT compliance UAE, data sovereignty, government security',
  openGraph: {
    title: 'VisionDrive Compliance & Security',
    description: 'Full regulatory compliance with UAE data residency and security standards.',
    type: 'website',
  },
}

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



