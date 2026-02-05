'use client'

import Section from '../components/common/Section'
import { 
  BarChart3, 
  Globe, 
  Server,
  Shield,
  Target,
  Users,
  Thermometer,
  Bell,
  FileCheck,
  Download
} from 'lucide-react'

const capabilities = [
  {
    icon: Thermometer,
    title: 'Temperature Monitoring',
    description: 'Real-time monitoring of fridges, freezers, and ambient temperatures using NB-IoT sensors with medical-grade accuracy.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Alert Systems',
    description: 'Instant SMS, email, and push notifications when temperatures enter dangerous zones, ensuring rapid response.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: FileCheck,
    title: 'Compliance Reporting',
    description: 'Automated Dubai Municipality compliant reports with HACCP documentation ready for health inspections.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Historical data analysis, temperature trends, and predictive insights for proactive kitchen management.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Server,
    title: 'UAE Data Residency',
    description: 'All data hosted in AWS UAE region (me-central-1) for full compliance with local data protection requirements.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Globe,
    title: 'Multi-Location Support',
    description: 'Manage multiple kitchen locations from a single dashboard with role-based access for staff.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
]

const values = [
  {
    icon: Target,
    title: 'Food Safety First',
    description: 'We help kitchens maintain the highest standards of food safety compliance.',
  },
  {
    icon: Shield,
    title: 'UAE Compliant',
    description: 'Full compliance with Dubai Municipality, TDRA, and local regulations.',
  },
  {
    icon: Users,
    title: 'Partnership Driven',
    description: 'Working closely with restaurants, hotels, and food service operators.',
  },
]

export default function AboutClient() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[2rem] leading-[1.1] md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-6">
            Smart Kitchen IoT for <br className="hidden sm:block" />
            <span className="text-orange-600">Food Safety Compliance</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            VisionDrive Technologies FZ-LLC is a UAE-based technology company specializing in IoT solutions 
            for commercial kitchen temperature monitoring. We help restaurants, hotels, and food service 
            operators ensure food safety compliance with Dubai Municipality standards.
          </p>
        </div>
      </Section>

      {/* Mission Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Thermometer className="h-8 w-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              To protect public health and help food service businesses maintain the highest standards 
              of food safety through intelligent IoT monitoring solutions. We make temperature 
              compliance simple, automated, and stress-free.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {values.map((value) => (
                <div key={value.title} className="text-center sm:text-left">
                  <value.icon className="h-6 w-6 text-orange-600 mx-auto sm:mx-0 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Capabilities Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Capabilities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive smart kitchen solutions for food safety compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div 
                key={cap.title} 
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${cap.bg} mb-4`}>
                  <cap.icon className={`h-6 w-6 ${cap.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Company Info Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Company Information</h2>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Entity</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Company Name</dt>
                    <dd className="font-medium text-gray-900">VisionDrive Technologies FZ-LLC</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Jurisdiction</dt>
                    <dd className="font-medium text-gray-900">Ras Al Khaimah, United Arab Emirates</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">Free Zone LLC</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Trade License</dt>
                    <dd>
                      <a 
                        href="/license/E-License.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        View E-License
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">TDRA Type Approval</dt>
                    <dd>
                      <a 
                        href="/Certification/TDRA_TYPE_APPROVAL_Certificate.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        View Certificate
                        <Download className="h-4 w-4" />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">TDRA IoT License</dt>
                    <dd>
                      <a 
                        href="/Certification/IoT_Certificate_IOT-26-100000007.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        View License
                        <Download className="h-4 w-4" />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Dealer Certificate</dt>
                    <dd>
                      <a 
                        href="/Certification/Dealer_Certificate.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        View Certificate
                        <Download className="h-4 w-4" />
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd>
                      <a href="mailto:tech@visiondrive.ae" className="font-medium text-orange-600 hover:text-orange-700">
                        tech@visiondrive.ae
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Phone</dt>
                    <dd>
                      <a href="tel:+971559152985" className="font-medium text-gray-900 hover:text-orange-600">
                        +971 55 915 2985
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900">
                      Compass Coworking Centre,<br />
                      Ras Al Khaimah, UAE
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Section>

    </main>
  )
}
