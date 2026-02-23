import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers at VisionDrive - Join Our Team in UAE',
  description: 'Join VisionDrive and work on cutting-edge IoT and AI solutions for smart parking. Open positions for LLM engineers and more in the UAE.',
  keywords: 'VisionDrive careers, jobs UAE, LLM engineer jobs, AI jobs Dubai, IoT careers, smart parking jobs',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers at VisionDrive',
    description: 'Join our team building the future of smart parking in the UAE.',
    type: 'website',
  },
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



