import Section from '../../common/Section'
import { Radio, Wifi } from 'lucide-react'

export default function TechnologyDeepDive() {
  return (
    <Section id="technology" background="gray">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Technology
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sensors</h3>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Gateway</h3>
        </div>
      </div>
    </Section>
  )
}

