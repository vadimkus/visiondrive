import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Pricing Inquiry - VisionDrive',
  description: 'Contact VisionDrive for Practice OS pilot pricing, onboarding, and implementation options for UAE solo practitioners and small clinics.',
  keywords: 'Practice OS pricing, solo practitioner software pricing, clinic software UAE, VisionDrive pricing',
  alternates: { canonical: '/budget' },
  openGraph: {
    title: 'Practice OS Pricing Inquiry - VisionDrive',
    description: 'Contact VisionDrive for Practice OS onboarding and implementation options.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



