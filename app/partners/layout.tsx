import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/partners')

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
