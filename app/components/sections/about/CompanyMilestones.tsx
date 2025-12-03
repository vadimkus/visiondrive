import Section from '../../common/Section'
import { Rocket, Target, TrendingUp } from 'lucide-react'

const milestones = [
  { icon: Rocket, year: '2024', title: 'Founded' },
  { icon: Target, year: '2024', title: 'Pilot Launch' },
  { icon: TrendingUp, year: '2025', title: 'Expansion' },
]

export default function CompanyMilestones() {
  return (
    <Section id="milestones" background="gray">
      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {milestones.map((milestone) => {
          const Icon = milestone.icon
          return (
            <div key={milestone.title} className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-semibold text-primary-600 mb-1">{milestone.year}</div>
              <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

