import Section from '../../common/Section'
import { Target, Lightbulb, Heart, Zap } from 'lucide-react'

const values = [
  { icon: Lightbulb, title: 'Innovation' },
  { icon: Target, title: 'Reliability' },
  { icon: Heart, title: 'Customer-Focused' },
  { icon: Zap, title: 'Data-Driven' },
]

export default function VisionMission() {
  return (
    <Section id="vision-mission" background="gray">
      <div className="grid md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        {values.map((value) => {
          const Icon = value.icon
          return (
            <div key={value.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

