import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/privacy')

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



