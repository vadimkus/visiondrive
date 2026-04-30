import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Mission - VisionDrive Practice OS',
  description: 'VisionDrive builds practice operations software for UAE solo practitioners: bookings, patient records, notes, payments, inventory, and business visibility.',
  keywords: 'VisionDrive mission, Practice OS, solo practitioners UAE, clinic software, practice management',
  alternates: { canonical: '/mission' },
  openGraph: {
    title: 'VisionDrive Mission - Practice Operations for Solo Practitioners',
    description: 'Helping independent practitioners run calm, professional, data-resident practices.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
