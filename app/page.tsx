import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive — Practice operations software | Dubai, UAE',
  description:
    'Practice operations, made clear. Commercial practice platform for the UAE — appointments through finance. Founding team in Dubai; contact us for partnerships.',
  keywords:
    'practice management UAE, clinic software Dubai, VisionDrive, professional practice software UAE, operations software Dubai, healthcare operations UAE',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'VisionDrive — Practice operations (UAE)',
    description:
      'Practice operations, made clear. Built in the UAE for professional teams that plan to scale.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionDrive — Practice operations software',
    description:
      'Practice operations, made clear. UAE-built operations for professional practices. Founding team in Dubai.',
  },
}

export default function HomePage() {
  return <HomeClient />
}
