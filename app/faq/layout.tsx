import type { Metadata } from 'next'
import FAQSchema from '../components/schema/FAQSchema'
import { faqItems } from './faqData'
import { createMarketingMetadata } from '@/lib/seo'

export const metadata: Metadata = createMarketingMetadata('/faq')

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FAQSchema items={faqItems} />
      {children}
    </>
  )
}

