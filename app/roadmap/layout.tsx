import { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/roadmap')

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
