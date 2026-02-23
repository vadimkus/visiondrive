import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Kitchens - Smart Temperature Monitoring',
  description: 'Smart kitchen temperature monitoring for community kitchens, shared commercial kitchens, and multi-tenant food facilities. Ensure food safety across all units.',
  keywords: 'community kitchen monitoring, shared kitchen temperature, multi-tenant food safety, commercial kitchen IoT',
  alternates: { canonical: '/communities' },
  openGraph: {
    title: 'Community Kitchens - Smart Temperature Monitoring',
    description: 'Smart kitchen temperature monitoring for community kitchens, shared commercial kitchens, and multi-tenant food facilities. Ensure food safety across all units.',
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



