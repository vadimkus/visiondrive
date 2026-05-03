import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/mission')

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
