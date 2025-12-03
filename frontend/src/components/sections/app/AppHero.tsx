import Section from '@/components/common/Section'
import Button from '@/components/common/Button'
import { ArrowRight } from 'lucide-react'

export default function AppHero() {
  return (
    <Section className="pt-32 pb-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Park Smarter, Not Harder
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Real-time parking availability at your fingertips.
        </p>
        <Button href="/app/download" size="lg" className="group">
          Download App
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Section>
  )
}

