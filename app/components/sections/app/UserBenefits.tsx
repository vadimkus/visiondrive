import Section from '../../common/Section'
import { Shield, Clock, Heart } from 'lucide-react'

const benefits = [
  { icon: Shield, title: 'Guaranteed' },
  { icon: Clock, title: 'Time Savings' },
  { icon: Heart, title: 'Less Stress' },
]

export default function UserBenefits() {
  return (
    <Section id="benefits">
      <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

