import Section from '@/components/common/Section'
import { CheckCircle } from 'lucide-react'

const certifications = [
  'UAE Smart City Standards',
  'FZ-LLC Registered',
  'Data Privacy Compliant',
]

export default function TrustIndicators() {
  return (
    <Section id="trust">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {certifications.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-700">{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

