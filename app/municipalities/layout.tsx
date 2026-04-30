import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Solutions - VisionDrive',
  description: 'VisionDrive Practice OS solutions for UAE solo practitioners and independent clinics: bookings, records, payments, reminders, and practice reporting.',
  keywords: 'Practice OS solutions, solo practitioner software UAE, clinic management software, appointment software Dubai',
  alternates: { canonical: '/municipalities' },
  openGraph: {
    title: 'Practice OS Solutions - VisionDrive',
    description: 'Practice operations software for UAE solo practitioners and independent clinics.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function MunicipalitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



