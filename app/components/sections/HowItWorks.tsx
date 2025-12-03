import Section from '../common/Section'
import { Wifi, MapPin, Smartphone } from 'lucide-react'

const steps = [
  { icon: Wifi, title: 'Sensors' },
  { icon: MapPin, title: 'Gateway' },
  { icon: Smartphone, title: 'App' },
]

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          How It Works
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-12 max-w-3xl mx-auto">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
