import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Mission - VisionDrive Smart Kitchen Vision',
  description: 'VisionDrive\'s mission is to transform commercial kitchen food safety through intelligent IoT solutions. Learn about our vision for smart kitchens and sustainable food operations.',
  keywords: 'VisionDrive mission, smart kitchen vision, UAE food safety, IoT temperature monitoring, sustainable food operations',
  alternates: { canonical: '/mission' },
  openGraph: {
    title: 'VisionDrive Mission - Transforming Commercial Kitchen Safety',
    description: 'Making kitchens smarter, food safer, and compliance effortless.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
