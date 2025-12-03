import Section from '../../common/Section'
import { Building2, Map, Award } from 'lucide-react'

const useCases = [
  { icon: Building2, title: 'Shopping Malls' },
  { icon: Map, title: 'Municipalities' },
  { icon: Award, title: 'RTA Partnership' },
]

export default function UseCases() {
  return (
    <Section id="use-cases" background="gray">
      <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {useCases.map((useCase) => {
          const Icon = useCase.icon
          return (
            <div key={useCase.title} className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{useCase.title}</h3>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

