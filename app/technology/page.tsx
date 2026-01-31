import type { Metadata } from 'next'
import Section from '../components/common/Section'
import Button from '../components/common/Button'
import { 
  Thermometer, 
  Radio, 
  Cloud, 
  Shield, 
  Bell, 
  FileCheck,
  Smartphone,
  Server,
  CheckCircle2
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Technology - Smart Kitchen Temperature Sensors | VisionDrive',
  description: 'NB-IoT temperature sensors for commercial kitchens. UAE data residency, real-time monitoring, and automated compliance reporting for food safety.',
}

const stack = [
  {
    title: 'NB-IoT Temperature Sensors',
    body: 'Wireless sensors with ±0.3°C accuracy, IP67 waterproofing, and 5+ year battery life. Built for commercial kitchen environments.',
    icon: Thermometer,
  },
  {
    title: 'Real-Time Monitoring',
    body: 'Sub-30 second data updates via MQTT. Continuous monitoring of fridges, freezers, and ambient temperatures 24/7.',
    icon: Radio,
  },
  {
    title: 'UAE Data Residency',
    body: 'All data hosted in AWS UAE region (me-central-1) for full compliance with local data protection and TDRA requirements.',
    icon: Cloud,
  },
  {
    title: 'Kitchen Owner Portal',
    body: 'Web dashboard for monitoring all sensors, viewing alerts, generating compliance reports, and managing multiple locations.',
    icon: Smartphone,
  },
]

const assurances = [
  'Reliability: 99%+ uplink reliability with automatic reconnection and offline data buffering.',
  'Security: TLS encryption for all communications, encrypted data at rest, and role-based access control.',
  'Compliance: Dubai Municipality food safety standards, HACCP documentation, and automated inspection reports.',
  'Scalability: Multi-tenant architecture supporting hundreds of sensors across multiple kitchen locations.',
]

const sensorFeatures = [
  {
    title: 'Temperature Probes',
    body: 'External probes for fridge/freezer monitoring with food-safe stainless steel tips. Range: -40°C to +85°C.',
    icon: Thermometer,
  },
  {
    title: 'Alert System',
    body: 'Instant SMS, email, and push notifications when temperatures exceed safe thresholds. Configurable alert rules.',
    icon: Bell,
  },
  {
    title: 'Compliance Reports',
    body: 'Automated daily, weekly, and monthly reports aligned with Dubai Municipality inspection requirements.',
    icon: FileCheck,
  },
]

const specs = [
  { label: 'Temperature Range', value: '-40°C to +85°C' },
  { label: 'Accuracy', value: '±0.3°C' },
  { label: 'Battery Life', value: '5+ years' },
  { label: 'Protection Rating', value: 'IP67' },
  { label: 'Connectivity', value: 'NB-IoT (B3/B8/B20)' },
  { label: 'Data Interval', value: '5 min (configurable)' },
  { label: 'Alert Latency', value: '<30 seconds' },
  { label: 'Operating Temp', value: '-20°C to +60°C' },
]

export default function TechnologyPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-[2rem] leading-[1.1] md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900">
            NB-IoT Temperature Sensors for <span className="text-orange-500">Commercial Kitchens</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Enterprise-grade IoT sensors with UAE data residency, real-time monitoring, 
            and automated compliance reporting for Dubai Municipality food safety standards.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button href="/contact" size="md">Request a Demo</Button>
            <Button href="/solutions" variant="secondary" size="md">View Solutions</Button>
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((item) => (
            <div
              key={item.title}
              className="h-full rounded-2xl border border-gray-200 bg-white px-4 py-5 sm:px-6 sm:py-6 shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 mb-3">
                <item.icon className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Sensor Features</h2>
          <p className="text-base text-gray-600 mb-5 max-w-3xl">
            Our temperature monitoring platform provides everything you need for food safety compliance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sensorFeatures.map((item) => (
              <div key={item.title} className="h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 mb-3">
                  <item.icon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Technical Specifications */}
      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 text-center">Technical Specifications</h2>
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200">
            <div className="grid sm:grid-cols-2 gap-4">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{spec.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-sm font-semibold tracking-wide text-orange-600 uppercase">Built to be trusted</p>
          <ul className="space-y-3">
            {assurances.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-orange-600 flex-shrink-0" />
                <span className="text-base text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* How It Works */}
      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold text-xl mb-4">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Install Sensors</h3>
              <p className="text-sm text-gray-600">Place wireless sensors in fridges, freezers, and storage areas. No wiring required.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold text-xl mb-4">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Monitor 24/7</h3>
              <p className="text-sm text-gray-600">Real-time data streams to your dashboard. Get instant alerts when temperatures exceed safe limits.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold text-xl mb-4">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Compliant</h3>
              <p className="text-sm text-gray-600">Automated reports for Dubai Municipality inspections. Full temperature history at your fingertips.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Ready to get started?</h2>
          <p className="text-base sm:text-lg text-gray-600">
            Request a demo to see how our smart kitchen sensors can help your business.
          </p>
          <Button href="/contact" size="md">Request a Demo</Button>
        </div>
      </Section>
    </main>
  )
}
