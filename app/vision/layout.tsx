import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mission - Practice OS for UAE Solo Practitioners | VisionDrive',
  description: 'VisionDrive mission for Practice OS: helping UAE solo practitioners manage bookings, records, payments, reminders, and practice reporting from one workspace.',
  alternates: { canonical: '/vision' },
  openGraph: {
    title: 'Mission - Practice OS for UAE Solo Practitioners',
    description: 'Helping solo practitioners run bookings, records, payments, and follow-up from one workspace.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
