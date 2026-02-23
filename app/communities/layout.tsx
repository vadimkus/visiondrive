import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart Parking for Communities - VisionDrive UAE',
  description: 'Smart parking solutions for residential communities and commercial complexes. Reduce traffic, enhance security, and optimize parking allocation.',
  keywords: 'community parking, residential parking, apartment parking, complex parking, visitor parking management',
  alternates: { canonical: '/communities' },
  openGraph: {
    title: 'Smart Parking for Communities',
    description: 'Efficient parking management for residential and commercial complexes.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



