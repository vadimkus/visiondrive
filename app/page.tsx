import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive - UAE IoT Solutions | Smart Kitchen, Parking & Building',
  description: 'Enterprise-grade IoT solutions for UAE businesses. Smart Kitchen temperature monitoring, Smart Parking sensors, and custom IoT development. TDRA certified, Dubai Municipality compliant, 100% UAE data residency.',
  keywords: 'IoT UAE, smart kitchen Dubai, smart parking UAE, IoT solutions Dubai, temperature monitoring, TDRA certified IoT, Dubai Municipality compliance, NB-IoT UAE, LoRaWAN Dubai',
  openGraph: {
    title: 'VisionDrive - UAE IoT Solutions',
    description: 'Enterprise-grade IoT solutions for UAE businesses. TDRA certified, Dubai Municipality compliant.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionDrive - UAE IoT Company',
    description: 'Smart IoT solutions for UAE businesses - Kitchen, Parking, Building & Custom',
  },
}

export default function HomePage() {
  return <HomeClient />
}
