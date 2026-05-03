import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/solutions')

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
