import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive - UAE IoT Solutions | Smart Kitchen Temperature Monitoring',
  description: 'Enterprise-grade IoT solutions for UAE businesses. Smart Kitchen temperature monitoring for commercial kitchens. TDRA certified, Dubai Municipality compliant, 100% UAE data residency.',
  keywords: 'IoT UAE, smart kitchen Dubai, temperature monitoring UAE, IoT solutions Dubai, food safety compliance, TDRA certified IoT, Dubai Municipality compliance, commercial kitchen monitoring',
  alternates: { canonical: '/' },
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
    description: 'Smart IoT solutions for UAE businesses - Smart Kitchen Temperature Monitoring',
  },
}

export default function HomePage() {
  return <HomeClient />
}
