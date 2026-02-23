import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap - VisionDrive Implementation Plan',
  description: 'VisionDrive development roadmap and implementation timeline. Key milestones from TDRA certification to production deployment in UAE.',
  keywords: 'VisionDrive roadmap, development timeline, implementation plan, smart kitchen rollout, UAE pilot',
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
