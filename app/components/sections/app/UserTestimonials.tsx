import Section from '../../common/Section'

const testimonials = [
  { quote: 'Never worry about finding parking anymore!', author: 'Sarah Al-Mazrouei' },
  { quote: 'The reservation feature is a game-changer.', author: 'Mohammed Hassan' },
  { quote: 'Simple, fast, and reliable.', author: 'Fatima Ali' },
]

export default function UserTestimonials() {
  return (
    <Section id="testimonials" background="gray">
      <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-gray-700 mb-3 italic">"{testimonial.quote}"</p>
            <p className="text-xs text-gray-600">{testimonial.author}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

