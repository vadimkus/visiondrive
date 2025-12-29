import Image from 'next/image'
import Section from '../components/common/Section'
import Button from '../components/common/Button'

const stack = [
  {
    title: 'NB-IoT Parking Sensors',
    body: 'Bay-level occupancy sensors with MQTT uplink, Bluetooth commissioning, and HEX payload decoding for ground truth data.',
  },
  {
    title: 'MQTT Ingestion (UAE)',
    body: 'Always-on subscriber service in AWS me-central-1 with sub-30s latency, dead-letter handling, and dedup/idempotency.',
  },
  {
    title: 'Operator Portal & APIs',
    body: 'Fleet health monitoring, sensor-to-bay binding, alerts lifecycle, and unified REST APIs for government integration.',
  },
  {
    title: 'Data Residency & Compliance',
    body: 'UAE-only database, logs, and backups aligned with TDRA/DESC ISR requirements for RTA and government projects.',
  },
]

const assurances = [
  'Reliability: 99%+ uplink reliability with reconnect handling, backpressure, and graceful degradation.',
  'Security: TLS/auth for MQTT, encrypted at rest, role-based access with full audit trails.',
  'Compliance: UAE data residency (AWS me-central-1), TDRA IoT policy, DESC ISR alignment for government.',
  'Scalability: Multi-tenant architecture tested for 1,000+ sensor deployments across urban environments.',
]

const environmentalSensors = [
  {
    title: 'Commissioning Workflow',
    body: 'Bluetooth AT commands for radar enable, park type config, and on-site calibration with installer SOP and validation.',
  },
  {
    title: 'Fleet Health Monitoring',
    body: 'Real-time alerts for battery drain, water coverage, radar validity, offline sensors, and flapping detection.',
  },
  {
    title: 'Pilot & Scale Framework',
    body: 'Validated acceptance criteria: ≥99% events <30s (street), ≥95% <60s (underground), with coverage mapping.',
  },
]

export default function TechnologyPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Technology</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            NB-IoT sensor infrastructure for ground truth parking data
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            NB-IoT parking sensors with MQTT ingestion, UAE data residency, and enterprise-grade reliability for municipalities and smart cities.
          </p>
          <div className="flex items-center justify-center gap-3">
          <Button href="/contact" size="md">Talk to our team</Button>
          <Button href="/budget" variant="secondary" size="md">View Budget</Button>
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
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Operations & Deployment</h2>
          <p className="text-base text-gray-600 mb-5 max-w-3xl">
            From sensor commissioning to fleet operations, our platform provides end-to-end visibility and control for IoT parking deployments.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {environmentalSensors.map((item) => (
              <div key={item.title} className="h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{item.title}</div>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Built to be trusted</p>
          <ul className="space-y-3">
            {assurances.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-600" aria-hidden />
                <span className="text-base text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="white" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Trusted by UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Enterprise-grade technology for government and municipal deployments
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Ready for pilots and scale</h2>
          <p className="text-base sm:text-lg text-gray-600">
            Integrate quickly, validate with a block or district, then expand with confidence.
          </p>
          <Button href="/contact" size="md">Schedule a walkthrough</Button>
        </div>
      </Section>
    </main>
  )
}


