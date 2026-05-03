import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/app')

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



