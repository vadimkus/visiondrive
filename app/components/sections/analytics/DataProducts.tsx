import Section from '../../common/Section'
import { BarChart3, TrendingUp, AlertTriangle, Map } from 'lucide-react'

const products = [
  { icon: BarChart3, title: 'Demand Reports', description: 'Peak hours & patterns' },
  { icon: TrendingUp, title: 'Turnover Metrics', description: 'Utilization & revenue' },
  { icon: AlertTriangle, title: 'Violation Reports', description: 'Compliance tracking' },
  { icon: Map, title: 'Traffic Analytics', description: 'Flow optimization' },
]

export default function DataProducts() {
  return (
    <Section id="data-products" background="gray">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {products.map((product) => {
          const Icon = product.icon
          return (
            <div key={product.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

