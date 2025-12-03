import Section from '@/components/common/Section'
import { Apple, Smartphone } from 'lucide-react'
import Button from '@/components/common/Button'

export default function DownloadSection() {
  return (
    <Section id="download">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-center text-white max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Download Vision Drive</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            href="#"
            variant="secondary"
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-100"
          >
            <Apple className="mr-2 h-5 w-5" />
            App Store
          </Button>
          <Button
            href="#"
            variant="secondary"
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-100"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            Google Play
          </Button>
        </div>
      </div>
    </Section>
  )
}

