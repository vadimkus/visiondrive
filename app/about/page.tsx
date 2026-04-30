import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About VisionDrive - Practice OS for UAE Solo Practitioners',
  description: 'VisionDrive Technologies FZ-LLC builds Practice OS, a UAE-based practice operations platform for solo practitioners and small clinics.',
  keywords: 'VisionDrive, Practice OS, solo practitioner software UAE, clinic management software, appointment scheduling, patient records',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About VisionDrive - Practice OS',
    description: 'UAE-based technology company building practice operations software for solo practitioners.',
    type: 'website',
    locale: 'en_AE',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
