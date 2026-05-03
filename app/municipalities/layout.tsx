import type { Metadata } from 'next'
import { createNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = createNoIndexMetadata(
  '/municipalities',
  'Legacy solutions page',
  'Legacy VisionDrive solutions route. The canonical Practice OS solutions page is /solutions.',
)

export default function MunicipalitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



