import Section from '@/components/common/Section'
import { CheckCircle } from 'lucide-react'

const compliance = [
  'FZ-LLC Registered',
  'UAE Smart City Standards',
  'Data Privacy Compliant',
]

export default function ComplianceStandards() {
  return (
    <Section id="compliance">
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        {compliance.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

