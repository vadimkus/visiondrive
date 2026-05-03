import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/certificates')

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



