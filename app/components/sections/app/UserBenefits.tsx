import Section from '../../common/Section'
import { Shield, Clock, Heart } from 'lucide-react'

const benefits = [
  { icon: Shield, title: 'Guaranteed', description: 'Reserved spot waiting' },
  { icon: Clock, title: 'Time Savings', description: 'Find instantly' },
  { icon: Heart, title: 'Less Stress', description: 'Plan ahead' },
]

export default function UserBenefits() {
  return (
    <Section id="benefits">
      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-white" />
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

