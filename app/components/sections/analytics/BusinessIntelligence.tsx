import Section from '../../common/Section'
import { Building2, DollarSign, TrendingUp } from 'lucide-react'

const intelligence = [
  { icon: Building2, title: 'Urban Planning', description: 'Infrastructure insights' },
  { icon: DollarSign, title: 'Pricing Strategy', description: 'Revenue optimization' },
  { icon: TrendingUp, title: 'Investment Data', description: 'ROI projections' },
]

export default function BusinessIntelligence() {
  return (
    <Section id="business-intelligence">
      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {intelligence.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

