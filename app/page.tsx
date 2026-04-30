import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'VisionDrive — Practice software for solo practitioners',
  description:
    'Practice operations, made clear. Professional practice management software for solo practitioners — bookings, records, treatment notes, inventory, payments, and reporting from anywhere.',
  keywords:
    'solo practitioner software, practice management software, VisionDrive, professional practice software, appointment software, private practice operations',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'VisionDrive — Practice software for solo practitioners',
    description:
      'Practice operations, made clear. A professional operating system for solo practitioners and independent service providers.',
    type: 'website',
    locale: 'en',
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
