import Section from '../../common/Section'
import { Star } from 'lucide-react'

const testimonials = [
  { quote: 'Never worry about finding parking anymore!', author: 'Sarah Al-Mazrouei' },
  { quote: 'The reservation feature is a game-changer.', author: 'Mohammed Hassan' },
  { quote: 'Simple, fast, and reliable.', author: 'Fatima Ali' },
]

export default function UserTestimonials() {
  return (
    <Section id="testimonials" background="gray">
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-gray-700 mb-3 italic">"{testimonial.quote}"</p>
            <p className="text-xs font-semibold text-gray-900">{testimonial.author}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

