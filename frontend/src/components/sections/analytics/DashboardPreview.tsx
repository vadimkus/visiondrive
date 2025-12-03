import Section from '@/components/common/Section'
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
      <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Icon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-xs text-gray-600">{metric.label}</div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

