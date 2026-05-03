import type { Metadata } from 'next'
import AboutClient from './AboutClient'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/about')

export default function AboutPage() {
  return <AboutClient />
}
