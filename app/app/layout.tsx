import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ParkSense App - Find Parking in UAE | VisionDrive',
  description: 'Download ParkSense, the smart parking app for UAE. Real-time bay availability, navigation to free spots, and seamless payment. Available Q1 2026.',
  keywords: 'ParkSense app, parking app UAE, Dubai parking app, find parking, smart parking app, real-time parking',
  alternates: { canonical: '/app' },
  openGraph: {
    title: 'ParkSense - Smart Parking App for UAE',
    description: 'Find parking instantly with real-time bay availability and navigation.',
    type: 'website',
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



