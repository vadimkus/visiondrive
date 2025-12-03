import Section from '@/components/common/Section'
import { Radio, Wifi } from 'lucide-react'

export default function TechnologyDeepDive() {
  return (
    <Section id="technology" background="gray">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technology</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">LW009-SM Sensors</h3>
          <p className="text-sm text-gray-600">99.5% accuracy • Dual-mode detection</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">RAK7289CV2 Gateway</h3>
          <p className="text-sm text-gray-600">LTE + LoRaWAN • 10km coverage</p>
        </div>
      </div>
    </Section>
  )
}

