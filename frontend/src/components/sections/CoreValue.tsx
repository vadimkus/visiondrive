import Section from '@/components/common/Section'
import { Clock, MapPin, Shield } from 'lucide-react'

const benefits = [
  { icon: Clock, title: 'Time Savings', description: 'Find parking instantly.' },
  { icon: MapPin, title: 'Guaranteed Spots', description: 'Reserve before arrival.' },
  { icon: Shield, title: 'Reduced Stress', description: 'Know availability ahead.' },
]

export default function CoreValue() {
  return (
    <Section id="value" background="gray">
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

