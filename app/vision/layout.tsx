import { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/vision')

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
