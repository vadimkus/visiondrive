import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Terms of Service - VisionDrive',
  description: 'VisionDrive Practice OS terms of service for practitioner workspaces, patient portals, booking links, payments, public profiles, AI-assisted workflows, and UAE software services.',
  keywords: 'Practice OS terms of service, VisionDrive terms, practitioner software terms, patient portal terms, UAE clinic software agreement',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Practice OS Terms of Service - VisionDrive',
    description: 'Terms governing VisionDrive Practice OS, practitioner workspaces, patient portals, payments, public profiles, and related UAE software services.',
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



