import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Technology - VisionDrive',
  description: 'Technology foundation for VisionDrive Practice OS: secure records, UAE data residency, mobile practitioner workflows, and private patient portal links.',
  keywords: 'Practice OS technology, solo practitioner software, clinic management UAE, patient records, mobile practice portal',
  alternates: { canonical: '/sensor' },
  openGraph: {
    title: 'VisionDrive Practice OS Technology',
    description: 'Secure practice operations technology for solo practitioners in the UAE.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function SensorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



