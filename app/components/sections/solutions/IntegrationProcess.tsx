import Section from '../../common/Section'
import Button from '../../common/Button'
import { ArrowRight, CheckCircle } from 'lucide-react'

const steps = [
  { 
    title: 'Enterprise Consultation', 
    duration: '1-2 weeks',
    description: 'Comprehensive needs assessment, ROI analysis, and custom solution design'
  },
  { 
    title: 'Professional Installation', 
    duration: '2-4 weeks',
    description: 'Certified technicians deploy sensors and gateways with minimal disruption'
  },
  { 
    title: 'System Integration', 
    duration: '1-2 weeks',
    description: 'Seamless integration with existing infrastructure and enterprise systems'
  },
  { 
    title: 'Launch & Support', 
    duration: 'Ongoing',
    description: 'Go-live with dedicated support, training, and continuous optimization'
  },
]

export default function IntegrationProcess() {
  return (
    <Section>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Enterprise Implementation Process
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Streamlined deployment process designed for enterprise clients with minimal disruption 
            and maximum value from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{step.title}</h3>
              <p className="text-xs text-primary-600 font-medium mb-3 text-center">{step.duration}</p>
              <p className="text-sm text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary-50 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Enterprise Support Included</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">Dedicated account manager</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">24/7 technical support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">Custom training programs</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">Regular system updates</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">Performance monitoring</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">SLA guarantees</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button href="/contact" size="lg">
            Request Enterprise Consultation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </Section>
  )
}

