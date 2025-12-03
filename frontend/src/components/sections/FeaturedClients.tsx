import Section from '@/components/common/Section'

const stats = [
  { value: '20+', label: 'Locations' },
  { value: '500+', label: 'Spaces' },
  { value: '95%', label: 'Accuracy' },
]

export default function FeaturedClients() {
  return (
    <Section id="clients" background="gray">
      <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

