import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers - Join VisionDrive IoT Team in UAE',
  description: 'Join VisionDrive and work on cutting-edge IoT solutions for smart kitchen food safety monitoring. Open positions in engineering, sales, and operations in the UAE.',
  keywords: 'VisionDrive careers, jobs UAE, IoT engineer jobs, food safety jobs Dubai, IoT careers, smart kitchen jobs',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers - Join VisionDrive IoT Team in UAE',
    description: 'Join VisionDrive and work on cutting-edge IoT solutions for smart kitchen food safety monitoring. Open positions in engineering, sales, and operations in the UAE.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



