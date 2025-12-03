import Section from '../../common/Section'
import { CheckCircle } from 'lucide-react'

const securityFeatures = [
  'UAE Data Protection',
  'Encrypted Transmission',
  'Anonymized Data',
  'Access Control',
]

export default function DataSecurity() {
  return (
    <Section id="security">
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        {securityFeatures.map((feature) => (
          <div key={feature} className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

