import Section from '../common/Section'
import { Clock, MapPin, Shield, Zap } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'Time Savings',
    description: 'Find parking instantly. No more circling blocks searching for a spot.',
  },
  {
    icon: MapPin,
    title: 'Guaranteed Spots',
    description: 'Reserve your parking space before you arrive. Guaranteed availability.',
  },
  {
    icon: Shield,
    title: 'Reduced Stress',
    description: 'Know availability before arrival. Plan ahead with confidence.',
  },
  {
    icon: Zap,
    title: 'Seamless Experience',
    description: 'From search to payment, everything happens in one app.',
  },
]

export default function CoreValue() {
  return (
    <Section id="value" background="gray">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          The Problem We Solve
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Every day, drivers waste precious time searching for parking. We eliminate that frustration 
          with real-time availability through smart technology.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={benefit.title}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {benefit.description}
              </p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
