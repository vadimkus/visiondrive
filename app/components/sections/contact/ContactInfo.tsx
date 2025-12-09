import Section from '../../common/Section'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactInfo() {
  return (
    <Section id="contact-info" background="gray">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-2">
        <div className="text-center">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mx-auto mb-2" />
          <a href="mailto:info@visiondrive.ae" className="text-xs sm:text-sm text-gray-700 hover:text-primary-600 break-all">
            info@visiondrive.ae
          </a>
        </div>
        <div className="text-center">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mx-auto mb-2" />
          <a href="tel:+971501234567" className="text-xs sm:text-sm text-gray-700 hover:text-primary-600">
            +971 50 123 4567
          </a>
        </div>
        <div className="text-center">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-gray-700">Dubai, UAE</p>
        </div>
      </div>
    </Section>
  )
}

