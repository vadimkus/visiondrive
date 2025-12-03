import Section from '../common/Section'
import Button from '../common/Button'
import { ArrowRight, Download } from 'lucide-react'

export default function CTASection() {
  return (
    <Section id="cta">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Parking?
        </h2>
        <p className="text-lg text-primary-100 mb-8">
          Join Vision Drive and experience the future of smart parking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/app/download" size="lg" variant="secondary" className="group bg-white text-primary-600 hover:bg-gray-100">
            <Download className="mr-2 h-5 w-5" />
            Download Our App
          </Button>
          <Button href="/contact" size="lg" variant="outline" className="group border-2 border-white text-white hover:bg-white/10">
            Request Pilot Demo
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Section>
  )
}
