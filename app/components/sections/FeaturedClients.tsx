import Section from '../common/Section'

const clients = ['Dubai Mall', 'RTA', 'Emaar', 'Dubai Municipality']

export default function FeaturedClients() {
  return (
    <Section id="clients" background="gray">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        {clients.map((client) => (
          <div key={client} className="text-center">
            <p className="text-gray-600">{client}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
