import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/careers')

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



