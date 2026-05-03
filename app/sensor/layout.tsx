import type { Metadata } from 'next'
import { createNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = createNoIndexMetadata(
  '/sensor',
  'Legacy technology page',
  'Legacy VisionDrive technology route. The canonical Practice OS technology page is /technology.',
)

export default function SensorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



