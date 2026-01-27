'use client'

import { 
  Shield, 
  CheckCircle2, 
  MapPin, 
  Lock, 
  Server, 
  FileCheck, 
  Eye,
  Database,
  Globe,
  Building2,
  Clock,
  UserCheck,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ComplianceItem {
  icon: React.ElementType
  title: string
  description: string
  status: 'compliant'
}

const dataResidencyItems: ComplianceItem[] = [
  {
    icon: MapPin,
    title: 'UAE Data Residency',
    description: 'All data is stored exclusively in AWS me-central-1 (Abu Dhabi) region, ensuring full compliance with UAE data sovereignty requirements.',
    status: 'compliant',
  },
  {
    icon: Building2,
    title: 'UAE Federal Law Compliance',
    description: 'Compliant with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection.',
    status: 'compliant',
  },
  {
    icon: Server,
    title: 'Local Infrastructure',
    description: 'Database, API, and all backend services operate from UAE-based AWS infrastructure with no data transfer outside the region.',
    status: 'compliant',
  },
  {
    icon: Clock,
    title: 'Data Retention Policy',
    description: 'Temperature readings: 2 years (DM requirement). Account data: Duration of service + 1 year. Billing records: 5 years (UAE tax law). Alert history: 2 years. Data deleted upon request within 30 days (except regulatory requirements).',
    status: 'compliant',
  },
]

const gdprItems: ComplianceItem[] = [
  {
    icon: UserCheck,
    title: 'Lawful Basis for Processing',
    description: 'Data processed under legitimate interest for food safety compliance and contract performance for service delivery.',
    status: 'compliant',
  },
  {
    icon: Eye,
    title: 'Transparency & Notice',
    description: 'Clear privacy notices provided at data collection. Users informed of data usage, retention, and their rights.',
    status: 'compliant',
  },
  {
    icon: Lock,
    title: 'Data Subject Rights',
    description: 'Full support for access, rectification, erasure, portability, and objection rights under GDPR Article 15-22.',
    status: 'compliant',
  },
  {
    icon: Database,
    title: 'Data Minimization',
    description: 'Only essential data collected: temperature readings, timestamps, and device identifiers. No excessive personal data.',
    status: 'compliant',
  },
]

const securityItems: ComplianceItem[] = [
  {
    icon: ShieldCheck,
    title: 'Encryption at Rest',
    description: 'All data encrypted using AES-256 encryption in AWS RDS and DynamoDB with AWS-managed keys.',
    status: 'compliant',
  },
  {
    icon: Globe,
    title: 'Encryption in Transit',
    description: 'TLS 1.3 encryption for all data transmission between devices, APIs, and user interfaces.',
    status: 'compliant',
  },
  {
    icon: FileCheck,
    title: 'Access Controls',
    description: 'Role-based access control (RBAC) with multi-tenant isolation. Each kitchen sees only their own data.',
    status: 'compliant',
  },
  {
    icon: BadgeCheck,
    title: 'Audit Logging',
    description: 'Comprehensive audit trails for all data access and modifications, retained for compliance verification.',
    status: 'compliant',
  },
]

const certifications = [
  { name: 'ISO 27001', description: 'Information Security Management' },
  { name: 'SOC 2 Type II', description: 'Security & Availability' },
  { name: 'GDPR', description: 'EU Data Protection' },
  { name: 'UAE PDPL', description: 'UAE Personal Data Protection' },
]

export default function PrivacyPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const ComplianceSection = ({ 
    title, 
    items, 
    icon: SectionIcon 
  }: { 
    title: string
    items: ComplianceItem[]
    icon: React.ElementType 
  }) => (
    <div className={`rounded-xl border p-5 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
          <SectionIcon className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
        </div>
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      </div>
      
      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className={`flex gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={`p-5 md:p-7 lg:p-9 pb-12 md:pb-16 transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
              <Shield className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Privacy & Compliance</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your data protection and regulatory compliance status</p>
            </div>
          </div>
        </div>

        {/* Compliance Hero Banner */}
        <div className={`rounded-xl p-5 mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Fully Compliant</h2>
                <p className="text-emerald-100">All data protection requirements met</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-emerald-100">Compliance Score</p>
            </div>
          </div>
          
          {/* Certification Badges */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{cert.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* UAE Data Residency Section */}
        <div className="mb-6">
          <ComplianceSection 
            title="🇦🇪 UAE Data Residency" 
            items={dataResidencyItems}
            icon={MapPin}
          />
        </div>

        {/* GDPR Compliance Section */}
        <div className="mb-6">
          <ComplianceSection 
            title="🇪🇺 GDPR Compliance" 
            items={gdprItems}
            icon={Shield}
          />
        </div>

        {/* Security & Encryption Section */}
        <div className="mb-6">
          <ComplianceSection 
            title="🔐 Security & Encryption" 
            items={securityItems}
            icon={Lock}
          />
        </div>

        {/* Data Processing Summary */}
        <div className={`rounded-xl border p-5 ${isDark ? 'bg-[#2d2d2f] border-gray-700' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Data Processing Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h3 className={`font-medium text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Data We Collect</h3>
              <ul className={`text-sm space-y-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Contact info (name, email, phone)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Kitchen details (address, trade license)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Equipment data (type, serial numbers)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sensor readings (temp, humidity, battery)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Alert history and acknowledgments</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Billing and payment records</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h3 className={`font-medium text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>How We Use It</h3>
              <ul className={`text-sm space-y-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Temperature monitoring & alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dubai Municipality compliance reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> WhatsApp/Email notifications</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Billing and invoicing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Technical support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Service improvements</li>
              </ul>
            </div>
          </div>
          
          {/* Data Retention Details */}
          <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <h3 className={`font-medium text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Data Retention Periods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>2 Years</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sensor Readings</p>
              </div>
              <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>2 Years</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Alert History</p>
              </div>
              <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>5 Years</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Billing Records</p>
              </div>
              <div className={`text-center p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>30 Days</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Post-Deletion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className={`mt-6 p-4 rounded-lg text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            For data access requests or privacy inquiries, contact{' '}
            <a href="mailto:legal@visiondrive.ae" className="text-orange-500 hover:underline">legal@visiondrive.ae</a>
          </p>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Last updated: January 2026 • VisionDrive Technologies FZ-LLC, Dubai, UAE
          </p>
        </div>
      </div>
    </div>
  )
}
