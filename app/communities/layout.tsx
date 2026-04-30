import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Solutions for Independent Clinics - VisionDrive',
  description: 'Practice OS helps UAE solo practitioners and independent clinics manage appointments, patient records, payments, reminders, and reporting.',
  keywords: 'independent clinic software UAE, solo practitioner software, Practice OS, clinic management UAE',
  alternates: { canonical: '/communities' },
  openGraph: {
    title: 'Practice OS Solutions for Independent Clinics',
    description: 'Appointments, records, payments, reminders, and reporting for solo practitioners.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



