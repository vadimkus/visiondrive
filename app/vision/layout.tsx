import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vision - Real-Time Parking Intelligence for UAE Municipalities & Investors | Vision Drive',
  description: 'RTA pilot-ready smart parking solution with TRA-certified sensors. Already in discussions with Parkin and major mall operators. Limited pilot slots for Q1 2026.',
  alternates: { canonical: '/vision' },
  openGraph: {
    title: 'Vision - Real-Time Parking Intelligence for UAE Municipalities & Investors',
    description: 'RTA pilot-ready smart parking solution with TRA-certified sensors. Already in discussions with Parkin and major mall operators.',
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








