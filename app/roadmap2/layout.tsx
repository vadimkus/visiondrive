import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technical Roadmap - VisionDrive Detailed Plan',
  description: 'Detailed technical roadmap for VisionDrive smart kitchen IoT deployment. AWS infrastructure, MQTT broker, portal development, and pilot phases.',
  keywords: 'technical roadmap, VisionDrive implementation, AWS deployment, MQTT integration, IoT deployment plan',
  alternates: { canonical: '/roadmap2' },
  openGraph: {
    title: 'VisionDrive Technical Roadmap',
    description: 'Detailed technical implementation plan for smart kitchen IoT infrastructure.',
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
