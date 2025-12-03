import Section from '../../common/Section'
import Button from '../../common/Button'
import { ArrowRight } from 'lucide-react'

export default function AppHero() {
  return (
    <Section className="pt-32 pb-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          The App
        </h1>
        <Button href="/app/download" size="lg" className="group">
          Download
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Section>
  )
}

