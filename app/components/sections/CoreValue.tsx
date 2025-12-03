import Section from '../common/Section'
import { Clock, MapPin, Shield, Zap } from 'lucide-react'

const benefits = [
  { icon: Clock, title: 'Time Savings' },
  { icon: MapPin, title: 'Guaranteed Spots' },
  { icon: Shield, title: 'Reduced Stress' },
  { icon: Zap, title: 'Seamless Experience' },
]

export default function CoreValue() {
  return (
    <Section id="value" background="gray">
      <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {benefit.title}
              </h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
