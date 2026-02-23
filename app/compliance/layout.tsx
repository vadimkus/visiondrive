import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart Kitchen Compliance - Dubai Municipality Food Safety | VisionDrive',
  description: 'VisionDrive Smart Kitchen compliance with Dubai Municipality food safety regulations, TDRA certification, and UAE data residency. Temperature monitoring for commercial kitchens.',
  keywords: 'Dubai Municipality compliance, food safety UAE, TDRA certified sensors, temperature monitoring compliance, kitchen food safety, UAE data residency, DM-HSD-GU46-KFPA2',
  alternates: { canonical: '/compliance' },
  openGraph: {
    title: 'Smart Kitchen Food Safety Compliance | VisionDrive UAE',
    description: 'Dubai Municipality compliant temperature monitoring for commercial kitchens. TDRA certified, 100% UAE data residency.',
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



