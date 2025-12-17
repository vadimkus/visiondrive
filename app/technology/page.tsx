import Section from '../components/common/Section'
import Button from '../components/common/Button'

const stack = [
  {
    title: 'Edge + Sensors',
    body: 'LoRaWAN devices, ANPR, BLE access, and mobile SDKs feeding live occupancy and status.',
  },
  {
    title: 'Real-time Data Fabric',
    body: 'Stream processing with health checks, deduplication, and SLA-backed uptime.',
  },
  {
    title: 'Control & APIs',
    body: 'Unified APIs for availability, reservations, payments, and enforcement events.',
  },
  {
    title: 'Insights',
    body: 'Dashboards and exports for demand, compliance, and curb performance.',
  },
]

const assurances = [
  'Reliability: monitored devices, alerting, and graceful degradation when inputs fail.',
  'Security: encrypted in transit and at rest; role-based access with audit trails.',
  'Interoperability: standards-first (LoRaWAN, REST/JSON), webhooks, and SDKs.',
  'Scalability: multi-tenant architecture tested across dense urban deployments.',
]

export default function TechnologyPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Technology</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            The platform behind effortless parking
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            A connected stack that blends sensors, data fabric, and APIs so cities, operators, and drivers see the same live picture—and act on it instantly.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button href="/contact" size="md">Talk to our team</Button>
            <Button href="/app/download" variant="secondary" size="md">See it live</Button>
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

