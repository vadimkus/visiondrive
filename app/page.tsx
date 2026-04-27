import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive — Practice software for solo practitioners | Dubai, UAE',
  description:
    'Practice operations, made clear. Professional practice management software for solo practitioners in the UAE — bookings, records, treatment notes, inventory, payments, and reporting.',
  keywords:
    'solo practitioner software UAE, practice management UAE, clinic software Dubai, VisionDrive, professional practice software UAE, appointment software Dubai',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'VisionDrive — Practice software for solo practitioners',
    description:
      'Practice operations, made clear. A professional operating system for independent clinics and solo service providers in the UAE.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionDrive — Practice software for solo practitioners',
    description:
      'Practice operations, made clear. Bookings, records, treatment notes, inventory, payments, and reporting for solo practitioners.',
  },
}

export default function HomePage() {
  return <HomeClient />
}
