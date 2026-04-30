import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technology - VisionDrive Practice OS Platform',
  description: 'Learn about VisionDrive Practice OS technology: secure records, practitioner portal, UAE data residency, payments, reminders, and analytics.',
  keywords: 'Practice OS technology, clinic software platform, practitioner portal, UAE data residency, patient records software',
  alternates: { canonical: '/technology' },
  openGraph: {
    title: 'VisionDrive Technology Platform',
    description: 'Practice operations platform technology with UAE data residency.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function TechnologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
