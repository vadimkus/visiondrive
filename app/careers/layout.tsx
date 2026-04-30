import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers - Join VisionDrive Practice OS Team in UAE',
  description: 'Join VisionDrive and work on practice operations software for solo practitioners in the UAE. Open positions in engineering, product, sales, and operations.',
  keywords: 'VisionDrive careers, jobs UAE, software engineer jobs UAE, practice management software jobs, health tech careers',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers - Join VisionDrive Practice OS Team in UAE',
    description: 'Join VisionDrive and work on practice operations software for solo practitioners in the UAE.',
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



