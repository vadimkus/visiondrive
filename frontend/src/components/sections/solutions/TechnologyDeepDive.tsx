import Section from '@/components/common/Section'
import { Radio, Wifi, Shield, Zap } from 'lucide-react'

export default function TechnologyDeepDive() {
  return (
    <Section id="technology" background="gray">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Enterprise-Grade Technology Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cutting-edge hardware and software infrastructure designed for reliability, scalability, and enterprise deployment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Radio className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">LW009-SM Sensors</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>99.5% accuracy rate with dual-mode detection</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Weather-resistant design for outdoor deployment</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>5+ year battery life for minimal maintenance</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Scalable installation for enterprise properties</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">RAK7289CV2 Gateway</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>LTE + LoRaWAN connectivity for reliable data transmission</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>10km coverage radius for wide-area deployment</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Enterprise-grade security and encryption</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Cloud integration for centralized management</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Shield className="h-6 w-6 text-primary-600 mr-3" />
              <h4 className="text-lg font-semibold text-gray-900">Enterprise Security</h4>
            </div>
            <p className="text-sm text-gray-700">
              End-to-end encryption, secure data transmission, and compliance with international security standards.
            </p>
          </div>

          <div className="bg-primary-50 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Zap className="h-6 w-6 text-primary-600 mr-3" />
              <h4 className="text-lg font-semibold text-gray-900">Scalable Infrastructure</h4>
            </div>
            <p className="text-sm text-gray-700">
              Cloud-based platform designed to scale from single properties to city-wide deployments.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

