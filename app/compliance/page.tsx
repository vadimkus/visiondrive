'use client'

import Image from 'next/image'
import Section from '../components/common/Section'
import { 
  Shield,
  Server,
  Lock,
  FileCheck,
  CheckCircle2,
  Globe,
  Database,
  Eye,
  Key,
  Building2,
  Radio,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

const complianceAreas = [
  {
    icon: Radio,
    title: 'TDRA Type Approval',
    status: 'Compliant',
    description: 'Our NB-IoT parking sensors are type-approved by the Telecommunications and Digital Government Regulatory Authority (TDRA) for operation in the UAE.',
    details: [
      'NB-IoT frequency bands approved for UAE',
      'Device registration and certification complete',
      'Continuous compliance monitoring',
      'Annual recertification process',
    ],
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    icon: Server,
    title: 'UAE Data Residency',
    status: 'Compliant',
    description: 'All parking data is processed and stored exclusively within the UAE using AWS Middle East (UAE) Region (me-central-1) in Abu Dhabi.',
    details: [
      'Data never leaves UAE jurisdiction',
      'AWS me-central-1 region (Abu Dhabi)',
      'Local data processing and analytics',
      'No cross-border data transfers',
    ],
    color: 'text-green-600',
    bg: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    icon: Shield,
    title: 'DESC ISR Compliance',
    status: 'Compliant',
    description: 'Full compliance with Dubai Electronic Security Center (DESC) Information Security Regulation for government contracts in Dubai.',
    details: [
      'Security controls fully implemented',
      'Risk assessment procedures in place',
      'Incident response plan active',
      'Regular security audits conducted',
    ],
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    icon: Lock,
    title: 'Data Protection',
    status: 'Compliant',
    description: 'Adherence to UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection and international best practices.',
    details: [
      'Personal data minimization',
      'Consent management framework',
      'Data subject rights implementation',
      'Privacy impact assessments',
    ],
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
]

const securityFeatures = [
  {
    icon: Key,
    title: 'End-to-End Encryption',
    description: 'All sensor data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.',
  },
  {
    icon: Eye,
    title: 'Access Control',
    description: 'Role-based access control (RBAC) with multi-factor authentication for all administrative access.',
  },
  {
    icon: Database,
    title: 'Data Isolation',
    description: 'Multi-tenant architecture with complete data isolation between different clients and projects.',
  },
  {
    icon: FileCheck,
    title: 'Audit Logging',
    description: 'Comprehensive audit trails for all data access and system changes, retained for 7 years.',
  },
]

const dataRetention = [
  { type: 'Real-time Occupancy', retention: '30 days', purpose: 'Operational display and immediate analytics' },
  { type: 'Aggregated Analytics', retention: '3 years', purpose: 'Trend analysis and planning insights' },
  { type: 'Financial Records', retention: '7 years', purpose: 'UAE Commercial Companies Law compliance' },
  { type: 'Audit Logs', retention: '7 years', purpose: 'Security and compliance auditing' },
]

const certifications = [
  { name: 'TDRA Type Approval', status: 'Active', icon: Radio },
  { name: 'ISO 27001', status: 'Planned Q2 2026', icon: Shield },
  { name: 'SOC 2 Type II', status: 'Planned Q3 2026', icon: FileCheck },
  { name: 'CSP Certification', status: 'In Progress', icon: Building2 },
]

export default function CompliancePage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            UAE Compliant Infrastructure
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Security &{' '}
            <span className="text-primary-600">Compliance</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            VisionDrive is committed to the highest standards of data security and regulatory compliance. 
            All data stays in the UAE, processed on UAE-based infrastructure.
          </p>
          
          {/* Key Compliance Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">TDRA Approved</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">UAE Data Residency</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">DESC ISR Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">UAE Data Protection Law</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Data Residency Highlight */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12 border border-green-200">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Globe className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Your Data Stays in the UAE
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We exclusively use <strong>AWS Middle East (UAE) Region</strong> located in Abu Dhabi (me-central-1). 
                  All parking sensor data, analytics, and personal information is processed and stored within 
                  UAE borders, ensuring full compliance with UAE data sovereignty requirements.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Abu Dhabi Data Center</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>No Cross-Border Transfer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Local Data Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Compliance Areas */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Regulatory Compliance</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meeting UAE regulatory requirements across telecommunications, data protection, and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {complianceAreas.map((area) => (
              <div
                key={area.title}
                className={`bg-white rounded-xl p-6 border ${area.borderColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${area.bg} rounded-lg flex items-center justify-center`}>
                    <area.icon className={`h-6 w-6 ${area.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{area.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        area.status === 'Compliant' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {area.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{area.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-16">
                  {area.details.map((detail) => (
                    <li key={`detail-${detail.slice(0, 25)}`} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Security Features */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Architecture</h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade security built into every layer of our platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {securityFeatures.map((feature) => (
              <div
                key={`security-${feature.title}`}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Data Retention */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Retention Policy</h2>
            <p className="text-lg text-gray-600">
              Clear retention periods aligned with UAE legal requirements
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Data Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Retention</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 hidden sm:table-cell">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataRetention.map((item) => (
                  <tr key={`retention-${item.type}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.type}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.retention}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Certifications */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Standards</h2>
            <p className="text-lg text-gray-600">
              Current and planned certifications for enterprise readiness
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert) => (
              <div
                key={`cert-${cert.name}`}
                className="bg-white rounded-xl p-6 border border-gray-200 text-center"
              >
                <cert.icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cert.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : cert.status.includes('Progress')
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {cert.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Compliance Statement */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-primary-100">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="h-8 w-8 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Statement</h2>
                <p className="text-gray-600">For government proposals and enterprise contracts</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                <em>
                  &quot;VisionDrive IoT solutions are designed and operated with UAE regulatory compliance as a foundational principle. 
                  Our NB-IoT parking sensors hold valid TDRA type approval for UAE deployment. All customer data is 
                  processed and stored exclusively within the UAE using AWS Middle East (UAE) Region infrastructure 
                  in Abu Dhabi. We maintain full compliance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data 
                  Protection and DESC Information Security Regulation (ISR) for Dubai government engagements. 
                  Our platform implements enterprise-grade security controls including end-to-end encryption, 
                  role-based access control, and comprehensive audit logging.&quot;
                </em>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Working with UAE Authorities</h2>
          <p className="text-gray-600 mb-8">
            Trusted by government entities for compliant smart parking infrastructure
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
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <Shield className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Need Compliance Documentation?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Contact us for detailed compliance documentation, security questionnaire responses, 
              or to discuss specific regulatory requirements for your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Compliance Team
              </a>
              <a
                href="/privacy"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                View Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
