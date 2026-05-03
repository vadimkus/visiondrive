import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/compliance')

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



