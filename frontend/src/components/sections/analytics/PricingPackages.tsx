import Section from '@/components/common/Section'
import Button from '@/components/common/Button'
import { ArrowRight } from 'lucide-react'

const packages = [
  { name: 'Starter', features: ['Basic reports', 'Monthly updates'] },
  { name: 'Professional', features: ['Custom reports', 'Real-time data'] },
  { name: 'Enterprise', features: ['All features', 'Dedicated support'] },
]

export default function PricingPackages() {
  return (
    <Section id="pricing">
      <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
        {packages.map((pkg) => (
          <div key={pkg.name} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{pkg.name}</h3>
            <ul className="space-y-2 mb-6">
              {pkg.features.map((feature) => (
                <li key={feature} className="text-sm text-gray-600 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button href="/contact" variant="outline" className="w-full" size="sm">
              Contact Sales
            </Button>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button href="/contact" size="lg">
          Request Demo
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Section>
  )
}

