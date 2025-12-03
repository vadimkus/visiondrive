import Section from '../../common/Section'
import { BarChart3, TrendingUp, AlertTriangle, Map } from 'lucide-react'

const products = [
  { icon: BarChart3, title: 'Demand Reports' },
  { icon: TrendingUp, title: 'Turnover Metrics' },
  { icon: AlertTriangle, title: 'Violation Reports' },
  { icon: Map, title: 'Traffic Analytics' },
]

export default function DataProducts() {
  return (
    <Section id="data-products" background="gray">
      <div className="grid md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        {products.map((product) => {
          const Icon = product.icon
          return (
            <div key={product.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

