import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/')

export default function HomePage() {
  return <HomeClient />
}
