import type { Metadata } from 'next'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/contact')

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
