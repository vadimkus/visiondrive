import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Mission - VisionDrive Smart Mobility Vision',
  description: 'VisionDrive\'s mission is to transform urban mobility through intelligent IoT solutions. Learn about our vision for smarter cities and sustainable parking.',
  keywords: 'VisionDrive mission, smart mobility vision, UAE smart city, urban mobility, sustainable parking',
  alternates: { canonical: '/mission' },
  openGraph: {
    title: 'VisionDrive Mission - Transforming Urban Mobility',
    description: 'Making cities smarter, parking easier, and data-driven decisions accessible.',
    type: 'website',
  },
}

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



