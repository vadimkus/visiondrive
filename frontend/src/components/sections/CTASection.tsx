import Section from '@/components/common/Section'
import Button from '@/components/common/Button'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <Section background="primary">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Ready to Get Started?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/app/download" size="lg" variant="secondary">
            Download App
          </Button>
          <Button href="/contact" size="lg" className="group">
            Request Demo
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Section>
  )
}

