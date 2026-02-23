import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About VisionDrive - UAE Smart Kitchen IoT Company',
  description: 'VisionDrive Technologies FZ-LLC is a UAE-based IoT company specializing in smart kitchen temperature monitoring solutions for food safety compliance.',
  keywords: 'VisionDrive, UAE technology company, smart kitchen, IoT solutions UAE, temperature monitoring, food safety, Dubai Municipality compliance',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About VisionDrive - Smart Kitchen IoT',
    description: 'UAE-based technology company specializing in IoT solutions for commercial kitchen temperature monitoring.',
    type: 'website',
    locale: 'en_AE',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
