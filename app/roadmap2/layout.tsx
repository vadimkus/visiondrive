import type { Metadata } from 'next'
import { createNoIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = createNoIndexMetadata(
  '/roadmap2',
  'Technical roadmap',
  'Internal technical roadmap for VisionDrive Practice OS implementation.',
)

export default function Roadmap2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
