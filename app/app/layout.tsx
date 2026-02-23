import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kitchen Owner App - Smart Temperature Monitoring',
  description: 'VisionDrive Kitchen Owner app for real-time temperature monitoring. View sensor readings, receive alerts, and generate compliance reports from your mobile device.',
  keywords: 'kitchen monitoring app, temperature alert app UAE, food safety app, smart kitchen mobile, VisionDrive app',
  alternates: { canonical: '/app' },
  openGraph: {
    title: 'Kitchen Owner App - Smart Temperature Monitoring',
    description: 'VisionDrive Kitchen Owner app for real-time temperature monitoring. View sensor readings, receive alerts, and generate compliance reports from your mobile device.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



