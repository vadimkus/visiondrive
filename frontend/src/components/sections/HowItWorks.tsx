import Section from '@/components/common/Section'
import { Radio, Wifi, Smartphone } from 'lucide-react'

const steps = [
  { icon: Radio, title: 'Sensor', description: 'Detects vehicle presence' },
  { icon: Wifi, title: 'Gateway', description: 'Transmits data securely' },
  { icon: Smartphone, title: 'App', description: 'Real-time availability' },
]

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

