import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About VisionDrive - UAE Smart Parking Technology Company',
  description: 'VisionDrive Technologies FZ-LLC is a UAE-based IoT company specializing in smart parking solutions. Learn about our mission, capabilities, and ParkSense platform.',
  keywords: 'VisionDrive, UAE technology company, smart parking company, IoT solutions UAE, ParkSense, parking technology provider',
  openGraph: {
    title: 'About VisionDrive - Smart Parking Technology',
    description: 'UAE-based technology company specializing in IoT solutions and smart parking systems.',
    type: 'website',
    locale: 'en_AE',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
