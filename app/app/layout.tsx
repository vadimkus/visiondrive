import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS App - VisionDrive',
  description: 'VisionDrive Practice OS mobile-friendly practitioner portal for appointments, patient records, visit notes, payments, reminders, and reporting.',
  keywords: 'Practice OS app, practitioner portal UAE, clinic software app, patient records app, appointment app UAE',
  alternates: { canonical: '/app' },
  openGraph: {
    title: 'Practice OS App - VisionDrive',
    description: 'VisionDrive Practice OS mobile-friendly practitioner portal for appointments, patient records, visit notes, payments, and reminders.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



