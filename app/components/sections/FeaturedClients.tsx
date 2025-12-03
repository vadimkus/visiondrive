import Section from '../common/Section'
import { Building, MapPin } from 'lucide-react'

const clients = [
  { name: 'Dubai Mall', icon: Building },
  { name: 'RTA', icon: MapPin },
  { name: 'Emaar', icon: Building },
  { name: 'Dubai Municipality', icon: MapPin },
]

export default function FeaturedClients() {
  return (
    <Section id="clients" background="gray">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Valued Partners
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Proudly partnering with leading organizations to transform urban mobility.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {clients.map((client) => {
          const Icon = client.icon
          return (
            <div key={client.name} className="flex flex-col items-center text-center">
              <Icon className="h-12 w-12 text-gray-500 mb-3" />
              <p className="text-lg font-medium text-gray-800">{client.name}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
