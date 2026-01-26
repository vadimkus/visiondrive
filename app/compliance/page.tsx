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
  Thermometer,
  AlertTriangle,
  Clock,
  FileText,
  Phone,
  Download,
  Award,
  FileSignature
} from 'lucide-react'

const complianceAreas = [
  {
    icon: Thermometer,
    title: 'Dubai Municipality Food Safety',
    status: 'Compliant',
    description: 'Full compliance with Dubai Municipality food safety guidelines (DM-HSD-GU46-KFPA2) for temperature monitoring in commercial kitchens.',
    details: [
      'Cold storage monitoring: 0°C to 5°C',
      'Freezer monitoring: ≤ -18°C',
      'Hot holding monitoring: ≥ 60°C',
      'Danger zone alerts: 5°C - 60°C',
      '2-year data retention for inspections',
    ],
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    icon: Radio,
    title: 'TDRA Device Certification',
    status: 'Compliant',
    description: 'Dragino S31-NB temperature sensors are TDRA-certified for operation in the UAE via Etisalat NB-IoT network.',
    details: [
      'TDRA Reference: EA-2026-1-55656',
      'NB-IoT frequency bands approved for UAE',
      'Etisalat network certified connectivity',
      'Annual recertification maintained',
    ],
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    icon: Server,
    title: 'UAE Data Residency',
    status: 'Compliant',
    description: 'All kitchen sensor data is processed and stored exclusively within the UAE using AWS Middle East (UAE) Region (me-central-1) in Abu Dhabi.',
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
    icon: Lock,
    title: 'UAE Personal Data Protection',
    status: 'Compliant',
    description: 'Full adherence to UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL).',
    details: [
      'Data minimization principles',
      'Explicit consent for data processing',
      'Right to access, correct, and delete data',
      'Privacy impact assessments conducted',
    ],
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
]

const securityFeatures = [
  {
    icon: Key,
    title: 'End-to-End Encryption',
    description: 'All sensor data encrypted in transit using TLS 1.2/1.3 (MQTTs port 8883) and at rest using AES-256.',
  },
  {
    icon: Eye,
    title: 'Access Control',
    description: 'Role-based access control with JWT authentication. Kitchen owners see only their own data.',
  },
  {
    icon: Database,
    title: 'Multi-Tenant Isolation',
    description: 'Complete data isolation between kitchens. Each customer\'s data is logically separated in DynamoDB.',
  },
  {
    icon: FileCheck,
    title: 'Comprehensive Audit Logging',
    description: 'AWS CloudTrail logs all data access and system changes. Audit trails retained for compliance.',
  },
]

const dataRetention = [
  { type: 'Temperature Readings', retention: '2 Years', purpose: 'Dubai Municipality inspection requirements' },
  { type: 'Alert History', retention: '2 Years', purpose: 'Compliance documentation and audit trail' },
  { type: 'Equipment Records', retention: 'Service Duration', purpose: 'Operational management' },
  { type: 'Billing Records', retention: '5 Years', purpose: 'UAE Commercial Companies Law compliance' },
  { type: 'Audit Logs', retention: '2 Years', purpose: 'Security and compliance auditing' },
]

const temperatureRequirements = [
  { equipment: 'Walk-in Fridge', arabic: 'غرفة تبريد', temp: '0°C to 5°C', icon: '🧊' },
  { equipment: 'Freezer', arabic: 'فريزر', temp: '≤ -18°C', icon: '❄️' },
  { equipment: 'Display Fridge', arabic: 'ثلاجة عرض', temp: '0°C to 5°C', icon: '🥗' },
  { equipment: 'Hot Holding', arabic: 'حفظ ساخن', temp: '≥ 60°C', icon: '🔥' },
  { equipment: 'Blast Chiller', arabic: 'مبرد سريع', temp: '-10°C to 3°C', icon: '💨' },
  { equipment: 'Danger Zone', arabic: 'منطقة الخطر', temp: '5°C - 60°C', icon: '⚠️', isDanger: true },
]

const certifications = [
  { name: 'TDRA IoT License', status: 'Active', icon: Shield },
  { name: 'TDRA Type Approval', status: 'Active', icon: Radio },
  { name: 'DM Food Safety', status: 'Compliant', icon: Thermometer },
  { name: 'UAE PDPL', status: 'Compliant', icon: Lock },
  { name: 'ISO 27001', status: 'Planned 2026', icon: FileCheck },
]

const downloadableCertificates = [
  {
    name: 'TDRA IoT Services License',
    description: 'TDRA authorization to deliver IoT services in the UAE - our official IoT service provider license',
    filename: 'IoT_Certificate_IOT-26-100000007.pdf',
    icon: Shield,
    color: 'purple',
  },
  {
    name: 'TDRA Type Approval Certificate',
    description: 'Official UAE telecommunications regulatory authority approval for our IoT devices',
    filename: 'TDRA_TYPE_APPROVAL_Certificate.pdf',
    icon: Radio,
    color: 'blue',
  },
  {
    name: 'Authorized Dealer Certificate',
    description: 'Official dealer certification for IoT equipment distribution in UAE',
    filename: 'Dealer_Certificate.pdf',
    icon: Award,
    color: 'orange',
  },
  {
    name: 'NOL Compliance Report',
    description: 'Technical compliance report for network operation and licensing requirements',
    filename: 'Nol_Report.pdf',
    icon: FileSignature,
    color: 'green',
  },
]

export default function CompliancePage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium mb-6">
            <Thermometer className="h-4 w-4" />
            Smart Kitchen Compliance
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Food Safety{' '}
            <span className="text-orange-600">Compliance</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            VisionDrive Smart Kitchen is designed from the ground up for Dubai Municipality food safety compliance. 
            All data stays in the UAE, processed on UAE-based infrastructure.
          </p>
          
          {/* Key Compliance Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
              <CheckCircle2 className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">DM Food Safety</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">TDRA Certified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">UAE Data Residency</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">UAE PDPL Compliant</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Dubai Municipality Requirements */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dubai Municipality Temperature Requirements</h2>
            <p className="text-lg text-gray-600">
              Reference: DM-HSD-GU46-KFPA2 (Version 3, May 9, 2024)
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {temperatureRequirements.map((req) => (
              <div
                key={req.equipment}
                className={`bg-white rounded-xl p-5 border ${
                  req.isDanger ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{req.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${req.isDanger ? 'text-red-700' : 'text-gray-900'}`}>
                      {req.equipment}
                    </h3>
                    <p className="text-xs text-gray-500">{req.arabic}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${req.isDanger ? 'text-red-600' : 'text-orange-600'}`}>
                  {req.temp}
                </div>
                {req.isDanger && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Food unsafe - max 2 hours exposure
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Official DM Guidelines</h3>
                <p className="text-sm text-gray-600 mb-3">
                  VisionDrive Smart Kitchen implements all temperature requirements from the official Dubai Municipality 
                  Technical Guidelines for Occupational Health and Safety in Kitchen/Food Areas.
                </p>
                <a 
                  href="https://www.dm.gov.ae/wp-content/uploads/2024/07/DM-HSD-GU46-KFPA2_Technical-Guidelines-for-Occupational-Health-and-Safety_Kitchen-Food-Areas_V3.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Download Official PDF
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Data Residency Highlight */}
      <Section className="py-12 md:py-16">
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
                  🇦🇪 Your Data Stays in the UAE
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We exclusively use <strong>AWS Middle East (UAE) Region</strong> located in Abu Dhabi (me-central-1). 
                  All temperature readings, kitchen data, and personal information is processed and stored within 
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
                    <span>DynamoDB in UAE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Compliance Areas */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Regulatory Compliance</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meeting UAE regulatory requirements for food safety, telecommunications, and data protection
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
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
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

      {/* Sensor Technology */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">TDRA-Certified Sensor Technology</h2>
            <p className="text-lg text-gray-600">
              Enterprise-grade NB-IoT temperature sensors approved for UAE deployment
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Dragino S31-NB Sensor</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Temperature range: -40°C to +80°C</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Accuracy: ±0.3°C</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Battery life: 5+ years</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Connectivity: Etisalat NB-IoT (UAE)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>TDRA certified: EA-2026-1-55656</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cloud Infrastructure</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>AWS IoT Core (me-central-1)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Amazon DynamoDB (UAE)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>AWS Lambda (Node.js 22.x)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>AWS WAF protection</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>CloudTrail audit logging</span>
                  </li>
                </ul>
              </div>
            </div>
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
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-orange-600" />
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
              Clear retention periods aligned with Dubai Municipality and UAE legal requirements
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
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
              Current certifications for regulatory compliance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {certifications.map((cert) => (
              <div
                key={`cert-${cert.name}`}
                className="bg-white rounded-xl p-6 border border-gray-200 text-center"
              >
                <cert.icon className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cert.status === 'Active' || cert.status === 'Compliant'
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {cert.status}
                </span>
              </div>
            ))}
          </div>

          {/* Downloadable Certificates */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Download Certificates</h3>
              <p className="text-gray-600">
                Access our official certification documents for your records
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {downloadableCertificates.map((cert) => {
                const colorClasses = {
                  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', hover: 'hover:border-purple-300 hover:bg-purple-50/50', btn: 'bg-purple-600 hover:bg-purple-700' },
                  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', hover: 'hover:border-blue-300 hover:bg-blue-50/50', btn: 'bg-blue-600 hover:bg-blue-700' },
                  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', hover: 'hover:border-orange-300 hover:bg-orange-50/50', btn: 'bg-orange-600 hover:bg-orange-700' },
                  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', hover: 'hover:border-green-300 hover:bg-green-50/50', btn: 'bg-green-600 hover:bg-green-700' },
                }
                const colors = colorClasses[cert.color as keyof typeof colorClasses]

                return (
                  <div
                    key={cert.filename}
                    className={`bg-white rounded-xl p-6 border ${colors.border} ${colors.hover} transition-all`}
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <cert.icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{cert.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {cert.description}
                    </p>
                    <a
                      href={`/Certification/${cert.filename}`}
                      download
                      className={`inline-flex items-center gap-2 px-4 py-2 ${colors.btn} text-white text-sm font-medium rounded-lg transition-colors`}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Compliance Statement */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 md:p-12 border border-orange-200">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Statement</h2>
                <p className="text-gray-600">For Dubai Municipality inspections and enterprise contracts</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                <em>
                  &quot;VisionDrive Smart Kitchen is designed and operated with UAE food safety regulatory compliance 
                  as a foundational principle. Our Dragino S31-NB temperature sensors hold valid TDRA type approval 
                  (EA-2026-1-55656) for UAE deployment via Etisalat NB-IoT network. All customer data is processed and stored 
                  exclusively within the UAE using AWS Middle East (UAE) Region infrastructure in Abu Dhabi (me-central-1). 
                  Temperature thresholds are configured per Dubai Municipality guidelines (DM-HSD-GU46-KFPA2). 
                  We maintain full compliance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. 
                  Temperature readings are retained for 2 years minimum as required for DM inspections. 
                  Our platform implements enterprise-grade security controls including TLS encryption, 
                  role-based access control, and comprehensive audit logging via AWS CloudTrail.&quot;
                </em>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white text-center">
            <Thermometer className="h-12 w-12 mx-auto mb-6 text-orange-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Need Compliance Documentation?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Contact us for detailed compliance documentation, TDRA certificates, 
              or to discuss Dubai Municipality inspection requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Compliance Team
              </a>
              <a
                href="/kitchen-owner/terms"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-400 text-white font-medium rounded-lg border border-orange-300 hover:bg-orange-300 transition-colors"
              >
                View Terms of Service
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-orange-400">
              <p className="text-sm text-orange-100">
                <Phone className="h-4 w-4 inline mr-2" />
                +971 55 915 2985 • tech@visiondrive.ae
              </p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
