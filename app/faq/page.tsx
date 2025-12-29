'use client'

import { useState } from 'react'
import Section from '../components/common/Section'
import { 
  HelpCircle,
  ChevronDown,
  Radio,
  Shield,
  Wrench,
  CreditCard,
  Building2,
  Smartphone,
  Mail,
  ArrowRight
} from 'lucide-react'

type FAQCategory = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  questions: {
    question: string
    answer: string
  }[]
}

const faqCategories: FAQCategory[] = [
  {
    id: 'technology',
    title: 'Technology & Sensors',
    icon: Radio,
    questions: [
      {
        question: 'What technology do VisionDrive parking sensors use?',
        answer: 'Our sensors use NB-IoT (Narrowband Internet of Things) cellular technology combined with magnetic and radar detection. NB-IoT provides excellent coverage, low power consumption, and reliable connectivity even in challenging environments like underground parking structures.',
      },
      {
        question: 'How accurate are the parking sensors?',
        answer: 'Our sensors achieve 99%+ detection accuracy using dual-sensing technology (magnetic + radar). This ensures reliable vehicle presence detection regardless of vehicle size, color, or material composition.',
      },
      {
        question: 'What is the battery life of the sensors?',
        answer: 'Our NB-IoT sensors are designed for 5+ years of battery life under normal operating conditions. The low-power NB-IoT protocol and intelligent sleep modes minimize energy consumption while maintaining real-time responsiveness.',
      },
      {
        question: 'How quickly does the system update parking availability?',
        answer: 'Our system provides sub-30 second latency from sensor event to display update. When a vehicle parks or leaves, the information is available in the system within seconds.',
      },
      {
        question: 'Do sensors work in underground parking?',
        answer: 'Yes, our NB-IoT sensors are designed to work in underground and covered parking structures. NB-IoT technology has excellent penetration characteristics and uses the existing du cellular network to communicate with our servers. For challenging locations, we conduct site surveys to ensure optimal coverage.',
      },
      {
        question: 'Are the sensors weatherproof?',
        answer: 'Yes, our sensors are IP68 rated, meaning they are completely dust-tight and can withstand continuous immersion in water. They are designed to operate in UAE conditions including extreme heat, rain, and direct sunlight.',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Security',
    icon: Shield,
    questions: [
      {
        question: 'Is VisionDrive TDRA approved?',
        answer: 'Yes, our NB-IoT parking sensors hold valid TDRA (Telecommunications and Digital Government Regulatory Authority) type approval for operation in the UAE.',
      },
      {
        question: 'Where is our data stored?',
        answer: 'All data is stored exclusively in the UAE using AWS Middle East (UAE) Region located in Abu Dhabi (me-central-1). Your data never leaves UAE jurisdiction, ensuring full compliance with UAE data sovereignty requirements.',
      },
      {
        question: 'Is VisionDrive DESC ISR compliant?',
        answer: 'Yes, we maintain full compliance with Dubai Electronic Security Center (DESC) Information Security Regulation, making our solutions suitable for Dubai government projects and contracts.',
      },
      {
        question: 'How is our data protected?',
        answer: 'We implement enterprise-grade security including end-to-end encryption (TLS 1.3 in transit, AES-256 at rest), role-based access control with multi-factor authentication, comprehensive audit logging, and regular security assessments.',
      },
      {
        question: 'What data do you collect?',
        answer: 'We collect parking occupancy data (occupied/vacant status), timestamps, and sensor health metrics. We do not collect or store vehicle identification data, license plates, or personal information unless specifically required for enforcement integration.',
      },
    ],
  },
  {
    id: 'implementation',
    title: 'Implementation & Installation',
    icon: Wrench,
    questions: [
      {
        question: 'How long does installation take?',
        answer: 'A typical sensor installation takes 15-30 minutes per bay. For a 100-bay parking facility, full deployment can be completed in 2-3 days including testing and commissioning.',
      },
      {
        question: 'Do you need to dig up the parking surface?',
        answer: 'Our sensors can be either surface-mounted or flush-mounted (embedded). Surface mounting requires no excavation and is ideal for rapid deployment. Flush mounting provides better protection and aesthetics but requires cutting into the surface.',
      },
      {
        question: 'What infrastructure is required?',
        answer: 'NB-IoT sensors communicate directly over cellular networks, so no local gateway infrastructure is required. You only need adequate NB-IoT coverage (available from du and Etisalat in the UAE) and internet connectivity for the management portal.',
      },
      {
        question: 'Do you provide installation services?',
        answer: 'Yes, we work with certified installation partners in the UAE who are trained on our equipment and procedures. We can also provide training for your own maintenance teams if preferred.',
      },
      {
        question: 'What about ongoing maintenance?',
        answer: 'Our sensors are designed for minimal maintenance. With 5+ year battery life and IP68 rating, there are no regular maintenance requirements. Our platform monitors sensor health automatically and alerts you to any issues.',
      },
    ],
  },
  {
    id: 'solutions',
    title: 'Solutions & Use Cases',
    icon: Building2,
    questions: [
      {
        question: 'What types of parking facilities do you support?',
        answer: 'We support on-street parking, surface lots, multi-level structures, underground parking, residential communities, commercial complexes, airports, hospitals, and shopping malls. Our solutions scale from small private facilities to city-wide deployments.',
      },
      {
        question: 'Can you integrate with existing parking systems?',
        answer: 'Yes, we provide REST APIs for integration with existing parking management systems, payment platforms, navigation apps, and smart city infrastructure. We can also integrate with access control and enforcement systems.',
      },
      {
        question: 'Do you offer a mobile app for drivers?',
        answer: 'Yes, the ParkSense mobile app (launching Q1 2026) will allow drivers to find available parking, get turn-by-turn navigation to open bays, and receive notifications. The app will be available on iOS and Android.',
      },
      {
        question: 'What analytics and reporting do you provide?',
        answer: 'Our management portal provides real-time occupancy dashboards, historical trends, peak hour analysis, turnover rates, utilization reports, and revenue optimization insights. Data can be exported or accessed via API.',
      },
    ],
  },
  {
    id: 'commercial',
    title: 'Pricing & Commercial',
    icon: CreditCard,
    questions: [
      {
        question: 'How is VisionDrive priced?',
        answer: 'We offer flexible pricing models including hardware purchase with SaaS subscription, and full-service managed solutions. Pricing depends on deployment size, features required, and service level. Contact us for a customized quote.',
      },
      {
        question: 'Is there a pilot program?',
        answer: 'Yes, we offer pilot programs for qualified organizations to test our solution before full deployment. Pilot programs typically include 20-50 sensors for 3-6 months with preferential pricing for subsequent rollout.',
      },
      {
        question: 'What is included in the subscription?',
        answer: 'Our subscription includes the cloud platform, management portal, mobile app access, API access, standard support, software updates, and sensor health monitoring. Additional services like custom integrations and premium support are available.',
      },
      {
        question: 'Do you offer government pricing?',
        answer: 'Yes, we offer special pricing for UAE government entities and municipalities. We also support government procurement processes and can provide all required compliance documentation.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support & Contact',
    icon: Smartphone,
    questions: [
      {
        question: 'What support do you provide?',
        answer: 'We provide email and phone support during UAE business hours (Sunday-Thursday, 9 AM - 6 PM GST). Premium support with extended hours and faster response times is available for enterprise customers.',
      },
      {
        question: 'How do I report a sensor issue?',
        answer: 'Sensor issues can be reported through the management portal, via email to tech@visiondrive.ae, or by phone. Our platform also proactively monitors sensor health and will alert you to potential issues.',
      },
      {
        question: 'Do you provide training?',
        answer: 'Yes, we provide training for facility managers and technical staff on using the management portal, interpreting analytics, and basic troubleshooting. Training can be conducted on-site or remotely.',
      },
      {
        question: 'How do I get started?',
        answer: 'Contact us at tech@visiondrive.ae or through our website contact form. We\'ll schedule a consultation to understand your requirements, conduct a site assessment if needed, and provide a tailored proposal.',
      },
    ],
  },
]

function FAQItem({ question, answer, isOpen, onToggle }: { 
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between text-left hover:bg-gray-50 transition-colors px-1"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed px-1">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('technology')

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const activeData = faqCategories.find(cat => cat.id === activeCategory)

  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Frequently Asked{' '}
            <span className="text-primary-600">Questions</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Find answers to common questions about VisionDrive&apos;s smart parking solutions, 
            technology, compliance, and implementation.
          </p>
        </div>
      </Section>

      {/* FAQ Content */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-2 lg:sticky lg:top-28">
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <category.icon className={`h-5 w-5 flex-shrink-0 ${
                        activeCategory === category.id ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium">{category.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Questions */}
            <div className="flex-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  {activeData && (
                    <>
                      <activeData.icon className="h-6 w-6 text-primary-600" />
                      <h2 className="text-xl font-semibold text-gray-900">{activeData.title}</h2>
                    </>
                  )}
                </div>
                <div>
                  {activeData?.questions.map((item, index) => (
                    <FAQItem
                      key={`${activeCategory}-${index}`}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.has(`${activeCategory}-${index}`)}
                      onToggle={() => toggleItem(`${activeCategory}-${index}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Still Have Questions */}
      <Section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <Mail className="h-12 w-12 mx-auto mb-6 text-primary-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our team is here to help 
              with any questions about our smart parking solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Us
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
              <a
                href="mailto:tech@visiondrive.ae"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
