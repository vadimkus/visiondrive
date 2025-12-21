import Section from '../components/common/Section'

const partners = [
  {
    name: 'RTA',
    fullName: 'Roads and Transport Authority',
    description: 'Dubai\'s official transportation authority managing parking, public transport, and road infrastructure.',
    website: 'https://www.rta.ae',
  },
  {
    name: 'TDRA',
    fullName: 'Telecommunications and Digital Government Regulatory Authority',
    description: 'Federal UAE authority regulating telecommunications and enabling digital transformation across all emirates.',
    website: 'https://tdra.gov.ae',
  },
  {
    name: 'LORIOT',
    fullName: 'LORIOT UAE',
    description: 'LoRaWAN network infrastructure and regional coverage provider.',
    website: 'https://www.loriot.io/',
  },
  {
    name: 'RAKwireless',
    description: 'Gateways and sensor hardware for resilient deployments.',
    website: 'https://www.rakwireless.com/',
  },
  {
    name: 'MokoSmart',
    description: 'Device ecosystem for occupancy and access use cases.',
    website: 'https://www.mokosmart.com/',
  },
]

export default function PartnersPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Partners</p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Our Strategic Partners
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
          Collaborating with leading technology providers and government authorities in Dubai to deliver smart parking solutions.
        </p>
      </Section>

      {/* Partners */}
      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {partners.map((partner) => (
              <a
                key={partner.name}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {partner.name}
                </div>
                {partner.fullName && (
                  <div className="text-sm text-gray-500 mt-1">{partner.fullName}</div>
                )}
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{partner.description}</p>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </main>
  )
}
