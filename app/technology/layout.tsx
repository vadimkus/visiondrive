import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/technology')

export default function TechnologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
