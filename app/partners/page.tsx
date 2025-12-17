import Section from '../components/common/Section'
import Button from '../components/common/Button'

const strategicPartners = [
  { name: 'LORIOT UAE', detail: 'LoRaWAN network infrastructure and regional coverage.', url: 'https://www.loriot.io/' },
  { name: 'Rakwireless', detail: 'Gateways and sensor hardware for resilient deployments.', url: 'https://www.rakwireless.com/' },
  { name: 'MokoSmart', detail: 'Device ecosystem for occupancy and access use cases.', url: 'https://www.mokosmart.com/' },
  { name: 'Mapbox', detail: 'Maps, routing, and geospatial visualization.', url: 'https://www.mapbox.com/maps' },
]

const pilotPrograms = [
  { name: 'Smart districts', body: 'Block-level pilots to validate occupancy accuracy, enforcement flows, and resident access.' },
  { name: 'Mixed-use assets', body: 'Office + retail garages with timed reservations and demand-shaping rules.' },
  { name: 'Community parking', body: 'Residential zones with permit logic, visitor passes, and peak-hour throttling.' },
]

export default function PartnersPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Partners & Pilots</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Building reliable mobility with trusted partners
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
          From sensors and connectivity to maps and payments, we collaborate with proven technology leaders to deliver dependable parking experiences in the UAE.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button href="/contact" size="md">Discuss a pilot</Button>
          <Button href="/technology" variant="secondary" size="md">See our stack</Button>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Strategic partners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {strategicPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {partner.name}
                </div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{partner.detail}</p>
              </a>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Pilot programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pilotPrograms.map((pilot) => (
              <div key={pilot.name} className="h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="text-lg font-semibold text-gray-900">{pilot.name}</div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{pilot.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contact" size="md">Launch a pilot</Button>
            <Button href="/solutions" variant="secondary" size="md">Explore solutions</Button>
          </div>
        </div>
      </Section>
    </main>
  )
}

