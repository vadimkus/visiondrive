import Section from '@/components/common/Section'
import Button from '@/components/common/Button'
import { ArrowRight } from 'lucide-react'

const steps = [
  { title: 'Consultation', duration: '1-2 weeks' },
  { title: 'Installation', duration: '2-4 weeks' },
  { title: 'Integration', duration: '1-2 weeks' },
  { title: 'Launch', duration: 'Ongoing' },
]

export default function IntegrationProcess() {
  return (
    <Section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Integration Process</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.title} className="text-center">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
              {index + 1}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-xs text-gray-600">{step.duration}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button href="/contact" size="lg">
          Request Consultation
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Section>
  )
}

