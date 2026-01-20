import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive - Smart Kitchen Temperature Monitoring for UAE',
  description: 'Real-time temperature monitoring for commercial kitchens. Dubai Municipality compliant food safety sensors. Automated alerts, compliance reporting, and 24/7 monitoring for restaurants, hotels, and food service.',
  keywords: 'smart kitchen UAE, temperature monitoring Dubai, food safety sensors, Dubai Municipality compliance, commercial kitchen IoT, restaurant temperature monitoring, HACCP compliance UAE',
  openGraph: {
    title: 'VisionDrive - Smart Kitchen Temperature Monitoring',
    description: 'Real-time temperature monitoring for commercial kitchens. Ensure food safety compliance with Dubai Municipality standards.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionDrive - Smart Kitchen IoT',
    description: 'Temperature monitoring and food safety compliance for commercial kitchens',
  },
}

export default function HomePage() {
  return <HomeClient />
}
