import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive - NB-IoT Smart Parking Solutions for UAE',
  description: 'Bay-level parking intelligence for UAE municipalities and smart cities. Real-time occupancy data, 99% accuracy, sub-30s latency. Trusted by RTA, SRTA, and UAE government authorities.',
  keywords: 'smart parking UAE, NB-IoT parking sensors, Dubai parking solution, RTA parking technology, real-time parking occupancy, smart city parking, municipal parking system',
  openGraph: {
    title: 'VisionDrive - Smart Parking Intelligence',
    description: 'Real-time parking occupancy for municipalities and smart cities. Know exactly which bays are free, instantly.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionDrive - NB-IoT Smart Parking',
    description: 'Bay-level parking intelligence for UAE smart cities',
  },
}

export default function HomePage() {
  return <HomeClient />
}
