import Section from '../../common/Section'

const steps = [
  { title: 'Consultation' },
  { title: 'Installation' },
  { title: 'Integration' },
  { title: 'Launch' },
]

export default function IntegrationProcess() {
  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Implementation
        </h2>
      </div>

      <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.title} className="text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">
              {index + 1}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          </div>
        ))}
      </div>
    </Section>
  )
}

