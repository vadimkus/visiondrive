'use client'

import Section from '../components/common/Section'
import { 
  FileCheck,
  Shield,
  Radio,
  Building2,
  Lock,
  Award,
  Mail,
  Clock
} from 'lucide-react'

const certificates = [
  {
    icon: Shield,
    title: 'TDRA IoT Services License',
    description: 'Official TDRA authorization to deliver IoT services in the UAE - our IoT service provider license.',
    status: 'Active',
  },
  {
    icon: Radio,
    title: 'TDRA Type Approval',
    description: 'Telecommunications and Digital Government Regulatory Authority approval for NB-IoT device operation in the UAE.',
    status: 'Active',
  },
  {
    icon: FileCheck,
    title: 'DESC ISR Compliance',
    description: 'Dubai Electronic Security Center Information Security Regulation compliance certification.',
    status: 'Active',
  },
  {
    icon: Building2,
    title: 'Trade License',
    description: 'UAE commercial trade license for technology solutions and IoT services.',
    status: 'Active',
  },
  {
    icon: Lock,
    title: 'Data Protection Compliance',
    description: 'Compliance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection.',
    status: 'Active',
  },
]

const upcomingCertifications = [
  {
    title: 'ISO 27001',
    description: 'Information Security Management System',
    timeline: 'Q2 2026',
  },
  {
    title: 'SOC 2 Type II',
    description: 'Service Organization Control',
    timeline: 'Q3 2026',
  },
  {
    title: 'CSP Certification',
    description: 'Cloud Service Provider Certification',
    timeline: 'Q4 2025',
  },
]

export default function CertificatesPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Award className="h-4 w-4" />
            Certifications & Credentials
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Our{' '}
            <span className="text-primary-600">Certificates</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            VisionDrive maintains all required certifications and regulatory approvals 
            for operating IoT solutions in the UAE.
          </p>
        </div>
      </Section>

      {/* Request Notice */}
      <Section background="gray" className="py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-primary-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-7 w-7 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Certificates Available Upon Request
                </h2>
                <p className="text-gray-600 text-sm">
                  For security and confidentiality reasons, we share certificate copies directly with 
                  prospective clients and partners. Please contact us to request documentation.
                </p>
              </div>
              <a
                href="mailto:legal@visiondrive.ae?subject=Certificate Request"
                className="flex-shrink-0 inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Request
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* Current Certificates */}
      <Section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Active Certifications</h2>
            <p className="text-gray-600">Current regulatory approvals and compliance certifications</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <div
                key={`cert-${cert.title}`}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <cert.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {cert.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Upcoming Certifications */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Planned Certifications</h2>
            <p className="text-gray-600">Additional certifications in our roadmap</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {upcomingCertifications.map((cert) => (
              <div
                key={`upcoming-${cert.title}`}
                className="bg-white rounded-xl p-5 border border-gray-200 text-center"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="h-5 w-5 text-gray-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{cert.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{cert.description}</p>
                <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  <Clock className="h-3 w-3 mr-1" />
                  {cert.timeline}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>


      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <Mail className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Request Certificate Copies
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              Need our certificates for your procurement process or due diligence? 
              We&apos;re happy to provide documentation to qualified organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:legal@visiondrive.ae?subject=Certificate Request&body=Hello VisionDrive Team,%0D%0A%0D%0AI would like to request copies of the following certificates:%0D%0A%0D%0A- [ ] TDRA Type Approval%0D%0A- [ ] Trade License%0D%0A- [ ] Compliance Attestation%0D%0A- [ ] Other: ____________%0D%0A%0D%0AOrganization: %0D%0APurpose: %0D%0A%0D%0AThank you."
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Request via Email
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
