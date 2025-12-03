import Section from '@/components/common/Section'
import { Target, Lightbulb, Heart, Zap } from 'lucide-react'

const values = [
  { icon: Lightbulb, title: 'Innovation', description: 'Pushing boundaries' },
  { icon: Target, title: 'Reliability', description: 'Dependable solutions' },
  { icon: Heart, title: 'Customer-Focused', description: 'Your success' },
  { icon: Zap, title: 'Data-Driven', description: 'Insights & analytics' },
]

export default function VisionMission() {
  return (
    <Section id="vision-mission" background="gray">
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Mission</h2>
        <p className="text-sm text-gray-700 italic">
          "To revolutionize urban mobility in the UAE with cutting-edge smart parking solutions."
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {values.map((value) => {
          const Icon = value.icon
          return (
            <div key={value.title} className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{value.title}</h3>
              <p className="text-sm text-gray-600">{value.description}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

