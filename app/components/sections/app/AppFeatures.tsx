import Section from '../../common/Section'
import { Map, Calendar, DollarSign, CreditCard } from 'lucide-react'

const features = [
  { icon: Map, title: 'Real-time Map' },
  { icon: Calendar, title: 'Reservations' },
  { icon: DollarSign, title: 'Pricing' },
  { icon: CreditCard, title: 'Payment' },
]

export default function AppFeatures() {
  return (
    <Section id="features" background="gray">
      <div className="grid md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

