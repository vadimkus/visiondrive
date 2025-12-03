import Section from '../../common/Section'
import { TrendingUp, Users, DollarSign } from 'lucide-react'

const features = [
  { icon: TrendingUp, title: 'Space Optimization' },
  { icon: Users, title: 'Traffic Management' },
  { icon: DollarSign, title: 'Revenue Analytics' },
]

export default function CommunitiesSection() {
  return (
    <Section id="communities" background="gray">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Commercial Solutions
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
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

