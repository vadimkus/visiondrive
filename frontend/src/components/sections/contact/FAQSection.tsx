import Section from '@/components/common/Section'

const faqs = [
  { q: 'How does Vision Drive work?', a: 'Real-time sensors detect availability displayed in our app.' },
  { q: 'Where is Vision Drive available?', a: 'Select pilot locations across Dubai.' },
  { q: 'How do I become a partner?', a: 'Contact us through the form above.' },
]

export default function FAQSection() {
  return (
    <Section id="faq" background="gray">
      <div className="max-w-2xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{faq.q}</h3>
            <p className="text-sm text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

