import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technical Roadmap - VisionDrive Detailed Plan',
  description: 'Detailed technical roadmap for VisionDrive Practice OS: private records, practitioner portal, payments, automation, analytics, and onboarding phases.',
  keywords: 'technical roadmap, VisionDrive implementation, Practice OS roadmap, clinic software plan, practitioner portal',
  alternates: { canonical: '/roadmap2' },
  openGraph: {
    title: 'VisionDrive Technical Roadmap',
    description: 'Detailed technical implementation plan for Practice OS infrastructure.',
    type: 'website',
  },
}

export default function Roadmap2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
