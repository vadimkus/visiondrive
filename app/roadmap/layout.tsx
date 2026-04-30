import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap - VisionDrive Implementation Plan',
  description: 'VisionDrive Practice OS roadmap and implementation timeline for UAE solo-practitioner workflows.',
  keywords: 'VisionDrive roadmap, development timeline, Practice OS implementation plan, UAE pilot',
  alternates: { canonical: '/roadmap' },
  openGraph: {
    title: 'VisionDrive Roadmap',
    description: 'Our journey from pilot to production deployment across the UAE.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
