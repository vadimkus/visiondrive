'use client'

import { useState } from 'react'
import Section from '../components/common/Section'
import Image from 'next/image'
import { 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Shield, 
  Battery, 
  Wrench, 
  Wifi, 
  Building2,
  Truck,
  Accessibility,
  MapPin,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

const sensorImages = [
  { src: '/images/sensor/sensor-1.png', alt: 'NB-IoT Parking Sensor - Top View' },
  { src: '/images/sensor/sensor-2.png', alt: 'NB-IoT Parking Sensor - Bottom View' },
  { src: '/images/sensor/sensor-3.png', alt: 'NB-IoT Parking Sensor - Side View' },
  { src: '/images/sensor/sensor-4.png', alt: 'NB-IoT Parking Sensor - Installation' },
  { src: '/images/sensor/sensor-5.png', alt: 'NB-IoT Parking Sensor - Components' },
  { src: '/images/sensor/sensor-6.png', alt: 'NB-IoT Parking Sensor - In Use' },
]

const specifications = [
  { param: 'Dimensions', value: '178×142×42mm' },
  { param: 'Weight', value: '0.85kg' },
  { param: 'Waterproof Rating', value: 'IP68' },
  { param: 'Battery Capacity', value: '27Ah' },
  { param: 'Operating Temp', value: '-30℃ ~ 80℃' },
  { param: 'Detection Accuracy', value: '99%' },
  { param: 'Communication', value: 'NB-IoT (B1/B3/B5/B8)' },
  { param: 'Battery Life', value: '5+ years' },
]

const features = [
  {
    icon: Radio,
    title: 'Dual-Mode Detection',
    description: 'Geomagnetic + 24GHz microwave radar fusion provides 99% detection accuracy with automatic mode switching.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'IP68 Military-Grade Protection',
    description: 'Fully sealed design withstands -30℃ to 80℃, 15-ton compression, and extreme weather conditions.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Battery,
    title: '5-Year Battery Life',
    description: '3.6V 27Ah industrial lithium battery with modular design for quick replacement without road damage.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Wrench,
    title: '30-Minute Installation',
    description: 'Bolt fixation on concrete, asphalt, or tiles. Deploy 100+ units daily without road-breaking construction.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Wifi,
    title: 'NB-IoT Full Coverage',
    description: 'Multi-band support (B1/B3/B5/B8) ensures connectivity in underground parking and signal-blind areas.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
]

const applications = [
  {
    icon: Building2,
    title: 'Commercial Parking',
    description: 'Real-time space guidance reduces search time and enhances turnover rates.',
  },
  {
    icon: MapPin,
    title: 'On-Street Parking',
    description: 'Accurate billing prevents fee evasion and improves collection efficiency.',
  },
  {
    icon: Truck,
    title: 'Logistics Parks',
    description: 'Dynamically allocates parking resources and optimizes truck flow.',
  },
  {
    icon: Accessibility,
    title: 'Accessible Spaces',
    description: 'High-precision detection prevents illegal occupation of reserved spots.',
  },
]

export default function SensorPage() {
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % sensorImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + sensorImages.length) % sensorImages.length)
  }

  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image Carousel */}
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-6 relative overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={sensorImages[currentImage].src}
                    alt={sensorImages[currentImage].alt}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="flex gap-2 mt-4 justify-center">
                {sensorImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === index 
                        ? 'border-primary-600 ring-2 ring-primary-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                NB-IoT Parking Sensor
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Redefining precision parking with innovative dual-mode detection, 
                military-grade protection, and 5-year battery life. Every parking 
                space is &quot;intelligently&quot; managed.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">99%</div>
                  <div className="text-sm text-blue-800">Detection Accuracy</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-600">5+ Years</div>
                  <div className="text-sm text-emerald-800">Battery Life</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">IP68</div>
                  <div className="text-sm text-purple-800">Waterproof Rating</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">15 Ton</div>
                  <div className="text-sm text-orange-800">Compression Resistance</div>
                </div>
              </div>

              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Request Quote <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced technology designed for reliability and performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bg} mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Specifications Table */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
            <p className="text-lg text-gray-600">
              Detailed specifications for our NB-IoT Parking Sensor
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parameter</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                </tr>
              </thead>
              <tbody>
                {specifications.map((spec, index) => (
                  <tr 
                    key={spec.param}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">{spec.param}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Applications Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Scenarios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empowering smart cities across diverse environments
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {applications.map((app) => (
              <div
                key={app.title}
                className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 mb-4">
                  <app.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.title}</h3>
                <p className="text-sm text-gray-600">{app.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Integration Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-primary-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Seamless Integration
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our sensors connect directly to cloud platforms via NB-IoT, providing real-time 
                data for smart city applications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Platform Integration</h3>
                <ul className="space-y-3">
                  {[
                    'Open REST API for third-party systems',
                    'Real-time MQTT data streaming',
                    'Navigation app integration ready',
                    'Municipal dashboard compatible',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Cloud Features</h3>
                <ul className="space-y-3">
                  {[
                    'Real-time occupancy monitoring',
                    'Abnormal event alerts',
                    'Comprehensive data analytics',
                    'UAE data residency compliant',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Deployed with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Sensors approved for government and municipal parking projects
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Deploy Smart Parking?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Contact us to learn more about our NB-IoT parking sensors and how they can 
            transform your parking infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Request a Quote
            </a>
            <a 
              href="/solutions" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              View All Solutions
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}

