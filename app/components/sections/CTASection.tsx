import Section from '../common/Section'
import Button from '../common/Button'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <Section id="cta">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Ready to get started?
        </h2>
        <Button href="/contact" size="lg" className="group">
          Contact Us
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Section>
  )
}
