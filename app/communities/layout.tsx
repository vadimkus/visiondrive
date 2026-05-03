import type { Metadata } from 'next'
import { createNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = createNoIndexMetadata(
  '/communities',
  'Legacy independent clinics page',
  'Legacy VisionDrive route. The canonical Practice OS solutions page is /solutions.',
)

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



