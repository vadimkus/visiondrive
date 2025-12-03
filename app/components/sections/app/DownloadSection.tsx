import Section from '../../common/Section'
import { Apple, Smartphone } from 'lucide-react'
import Button from '../../common/Button'

export default function DownloadSection() {
  return (
    <Section id="download">
      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
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

