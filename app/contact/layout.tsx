import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact VisionDrive - Practice OS UAE',
  description: 'Get in touch with VisionDrive for Practice OS demos, solo-practitioner onboarding, workflow review, and UAE practice operations software.',
  keywords: 'contact VisionDrive, Practice OS demo, solo practitioner software UAE, clinic software onboarding, practice management software',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact VisionDrive - Practice OS',
    description: 'Contact us for Practice OS demos, practitioner onboarding, and workflow review.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
