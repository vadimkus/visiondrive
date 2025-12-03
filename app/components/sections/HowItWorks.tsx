import Section from '../common/Section'
import Button from '../common/Button'
import { ArrowRight, Wifi, MapPin, Smartphone } from 'lucide-react'

const steps = [
  {
    icon: Wifi,
    title: 'Sensors & Gateway',
    description: 'Smart sensors detect real-time parking availability, relayed by our robust gateways.',
  },
  {
    icon: MapPin,
    title: 'Data Processing',
    description: 'Data is processed in the cloud to provide accurate, up-to-the-minute information.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Users access real-time data, reserve, and pay via our intuitive mobile application.',
  },
]

export default function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our seamless process from detection to reservation.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="relative text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Button href="/solutions" size="lg">
          Learn More About Our Technology
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </Section>
  )
}
