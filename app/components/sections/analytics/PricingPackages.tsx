import Section from '../../common/Section'
import Button from '../../common/Button'
import { ArrowRight } from 'lucide-react'

const packages = ['Starter', 'Professional', 'Enterprise']

export default function PricingPackages() {
  return (
    <Section id="pricing">
      <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-3xl mx-auto">
        {packages.map((pkg) => (
          <div key={pkg} className="text-center">
            <h3 className="text-lg font-bold text-gray-900">{pkg}</h3>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button href="/contact" size="lg">
          Contact Us
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Section>
  )
}

