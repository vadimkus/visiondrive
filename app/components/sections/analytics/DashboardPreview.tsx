import Section from '../../common/Section'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'

const metrics = [
  { icon: BarChart3, label: 'Occupancy', value: '87%' },
  { icon: TrendingUp, label: 'Revenue', value: '+23%' },
  { icon: Users, label: 'Users', value: '10K+' },
  { icon: Clock, label: 'Search Time', value: '2.5 min' },
]

export default function DashboardPreview() {
  return (
    <Section id="dashboard" background="gray">
      <div className="grid md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="text-center">
              <Icon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-xs text-gray-600">{metric.label}</div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

