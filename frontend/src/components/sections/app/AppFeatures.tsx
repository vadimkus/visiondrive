import Section from '@/components/common/Section'
import { Map, Calendar, DollarSign, CreditCard } from 'lucide-react'

const features = [
  { icon: Map, title: 'Real-time Map', description: 'Live availability' },
  { icon: Calendar, title: 'Reservations', description: 'Book ahead' },
  { icon: DollarSign, title: 'Dynamic Pricing', description: 'Transparent rates' },
  { icon: CreditCard, title: 'In-App Payment', description: 'Contactless' },
]

export default function AppFeatures() {
  return (
    <Section id="features" background="gray">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

