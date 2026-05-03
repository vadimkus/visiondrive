import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/terms')

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



