import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/budget')

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



