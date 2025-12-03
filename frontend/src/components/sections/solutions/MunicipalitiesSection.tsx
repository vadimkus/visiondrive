import Section from '@/components/common/Section'
import { Database, TrendingUp, Map } from 'lucide-react'

const features = [
  { icon: Database, title: 'Data & Analytics', description: 'Comprehensive insights' },
  { icon: TrendingUp, title: 'Predictive Analytics', description: 'Demand forecasting' },
  { icon: Map, title: 'Traffic Optimization', description: 'Reduce congestion' },
]

export default function MunicipalitiesSection() {
  return (
    <Section id="municipalities">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">For Municipalities & RTA</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
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

