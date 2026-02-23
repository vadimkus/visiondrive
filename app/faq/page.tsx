'use client'

import { useState } from 'react'
import Section from '../components/common/Section'
import { 
  HelpCircle,
  ChevronDown,
  Thermometer,
  Shield,
  Wrench,
  CreditCard,
  ChefHat,
  Bell,
  Mail,
  ArrowRight,
  TrendingUp,
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
    icon: Thermometer,
    questions: [
      {
        question: 'What technology do VisionDrive temperature sensors use?',
        answer: 'Our sensors use NB-IoT (Narrowband Internet of Things) cellular technology for reliable, low-power communication. They feature medical-grade temperature probes with ±0.3°C accuracy, designed specifically for commercial kitchen environments.',
      },
      {
        question: 'How accurate are the temperature sensors?',
        answer: 'Our sensors achieve ±0.3°C accuracy, meeting the requirements for food safety monitoring. This ensures reliable temperature readings for fridges, freezers, and ambient storage areas.',
      },
      {
        question: 'What is the battery life of the sensors?',
        answer: 'Our NB-IoT sensors are designed for 5+ years of battery life under normal operating conditions. The low-power NB-IoT protocol and intelligent sleep modes minimize energy consumption while maintaining real-time responsiveness.',
      },
      {
        question: 'How quickly does the system detect temperature changes?',
        answer: 'Our system provides sub-30 second latency from temperature change to alert. When a fridge door is left open or a freezer malfunctions, you receive notifications within seconds.',
      },
      {
        question: 'What temperature range do the sensors support?',
        answer: 'Our sensors support a temperature range of -40°C to +85°C, covering freezers (≤-18°C), refrigerators (0-5°C), and hot holding areas (≥60°C). They can monitor any commercial kitchen temperature zone.',
      },
      {
        question: 'Are the sensors waterproof?',
        answer: 'Yes, our sensors are IP67 rated, meaning they are completely dust-tight and can withstand temporary immersion in water. They are designed to operate in busy kitchen environments including areas subject to cleaning and splashing.',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Food Safety',
    icon: Shield,
    questions: [
      {
        question: 'Is VisionDrive compliant with Dubai Municipality standards?',
        answer: 'Yes, our temperature monitoring and reporting system is designed to meet Dubai Municipality food safety standards. Our automated reports include all required temperature logs and can be presented during health inspections.',
      },
      {
        question: 'Where is our data stored?',
        answer: 'All data is stored exclusively in the UAE using AWS Middle East (UAE) Region located in Abu Dhabi (me-central-1). Your data never leaves UAE jurisdiction, ensuring full compliance with UAE data sovereignty requirements.',
      },
      {
        question: 'Does the system support HACCP compliance?',
        answer: 'Yes, our system provides continuous temperature monitoring and automated logging required for HACCP (Hazard Analysis Critical Control Points) compliance. Reports include timestamps, temperature readings, and any excursions.',
      },
      {
        question: 'How is our data protected?',
        answer: 'We implement enterprise-grade security including end-to-end encryption (TLS 1.3 in transit, AES-256 at rest), role-based access control with multi-factor authentication, comprehensive audit logging, and regular security assessments.',
      },
      {
        question: 'What happens if temperatures enter the danger zone?',
        answer: 'When temperatures enter the danger zone (5°C-60°C for cold storage), the system immediately triggers alerts via SMS, email, and push notifications. You can configure escalation rules and multiple recipients to ensure rapid response.',
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
        answer: 'Sensor installation is quick and non-invasive. A typical kitchen with 5-10 monitoring points can be set up in 2-4 hours. Sensors are wireless and require no complex infrastructure.',
      },
      {
        question: 'Do sensors require wiring or infrastructure?',
        answer: 'No, our NB-IoT sensors are completely wireless and battery-powered. They communicate directly over cellular networks, so no local gateway infrastructure or WiFi is required. This makes installation quick and minimizes disruption to your kitchen operations.',
      },
      {
        question: 'What infrastructure is required?',
        answer: 'You only need adequate NB-IoT cellular coverage (available from du and Etisalat throughout the UAE) and internet connectivity to access the Kitchen Owner Portal. No additional networking or infrastructure is required.',
      },
      {
        question: 'Do you provide installation services?',
        answer: 'Yes, we provide professional installation services across the UAE. Our technicians are trained to position sensors optimally for accurate readings and configure the system for your specific requirements.',
      },
      {
        question: 'What about ongoing maintenance?',
        answer: 'Our sensors are designed for minimal maintenance. With 5+ year battery life and IP67 rating, there are no regular maintenance requirements. Our platform monitors sensor health automatically and alerts you to any issues.',
      },
    ],
  },
  {
    id: 'solutions',
    title: 'Solutions & Features',
    icon: ChefHat,
    questions: [
      {
        question: 'What types of kitchens do you support?',
        answer: 'We support restaurants (QSR, fast casual, fine dining), hotels, catering companies, central kitchens, food production facilities, hospitals, schools, and any commercial food service operation. Our solutions scale from single-location restaurants to multi-site chains.',
      },
      {
        question: 'Can I monitor multiple locations?',
        answer: 'Yes, the Kitchen Owner Portal supports multi-location management. You can view all your kitchens from a single dashboard, compare performance, and receive consolidated reports.',
      },
      {
        question: 'What alerts and notifications are available?',
        answer: 'We support SMS, email, and push notifications. You can configure temperature thresholds, escalation rules, quiet hours, and multiple recipients. Alerts include the sensor location, current temperature, and recommended action.',
      },
      {
        question: 'What analytics and reporting do you provide?',
        answer: 'Our Kitchen Owner Portal provides real-time temperature dashboards, historical trends, compliance reports (daily/weekly/monthly), excursion logs, and equipment performance insights. Reports can be exported as PDF or CSV.',
      },
    ],
  },
  {
    id: 'benefits',
    title: 'Benefits for Kitchen Owners',
    icon: TrendingUp,
    questions: [
      {
        question: 'How do automatic reports save me time?',
        answer: 'VisionDrive generates daily, weekly, and monthly compliance reports automatically — no manual temperature logging required. Reports are ready for Dubai Municipality inspections on demand, eliminating hours of paperwork each week. Kitchen managers can focus on food quality instead of clipboard checks.',
      },
      {
        question: 'What types of automatic alerts will I receive?',
        answer: 'You receive instant alerts for temperature excursions (e.g. fridge rising above 5°C), equipment malfunctions, door-left-open events, power failures, and sensor offline status. Alerts arrive via SMS, email, and push notification within seconds so you can act before food is compromised.',
      },
      {
        question: 'How does VisionDrive help reduce food waste and costs?',
        answer: 'Continuous monitoring catches temperature problems early — before they spoil inventory. Kitchen owners typically see a 15-30% reduction in food waste from prevented spoilage events. The system also identifies inefficient equipment (e.g. a freezer cycling too often), helping reduce energy costs by up to 20%.',
      },
      {
        question: 'Can VisionDrive help me pass health inspections more easily?',
        answer: 'Absolutely. The system maintains a complete, timestamped audit trail of every temperature reading. When inspectors arrive, you can produce professional compliance reports in seconds rather than sifting through manual logs. Many of our customers report faster, smoother inspections with zero findings.',
      },
      {
        question: 'Do I get notified before a problem becomes critical?',
        answer: 'Yes. VisionDrive supports multi-tier alerts: a warning notification when temperatures approach your threshold (e.g. fridge at 4°C) and a critical alert when the threshold is breached. This early-warning system gives you time to act — move stock, call a technician — before any food safety issue occurs.',
      },
      {
        question: 'How does the system help with staff accountability?',
        answer: 'The Kitchen Owner Portal logs which staff member acknowledged each alert and what corrective action was taken. Shift-based reports show whether temperature checks were completed on schedule, giving you full visibility into day-to-day compliance without micromanaging.',
      },
      {
        question: 'What ROI can I expect from VisionDrive?',
        answer: 'Most kitchen owners recoup their investment within 3-6 months through reduced food waste, lower energy bills, fewer compliance penalties, and saved staff hours. A mid-size restaurant (8-10 sensors) typically saves AED 2,000-5,000 per month compared to manual monitoring processes.',
      },
      {
        question: 'Can I get a consolidated view across all my locations?',
        answer: 'Yes. The Kitchen Owner Portal aggregates data from every location into a single dashboard. You can compare performance across branches, identify underperforming equipment, and receive one consolidated weekly report covering all your kitchens — perfect for franchise operators and multi-site chains.',
      },
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts & Monitoring',
    icon: Bell,
    questions: [
      {
        question: 'How do I receive temperature alerts?',
        answer: 'Alerts can be delivered via SMS, email, and push notifications to the Kitchen Owner Portal. You can configure which channels to use and set up multiple recipients for different alert types.',
      },
      {
        question: 'Can I customize alert thresholds?',
        answer: 'Yes, you can set custom temperature thresholds for each sensor based on what it\'s monitoring (fridge, freezer, ambient, etc.). You can also configure warning levels before critical thresholds are reached.',
      },
      {
        question: 'What happens if a sensor goes offline?',
        answer: 'You receive immediate alerts if a sensor loses connectivity. Sensors also store data locally and sync when reconnected, ensuring no gaps in your temperature records.',
      },
      {
        question: 'Can I set quiet hours for alerts?',
        answer: 'Yes, you can configure quiet hours during which non-critical alerts are suppressed. Critical alerts (like freezer failures) will always be delivered regardless of quiet hour settings.',
      },
    ],
  },
  {
    id: 'commercial',
    title: 'Pricing & Support',
    icon: CreditCard,
    questions: [
      {
        question: 'How is VisionDrive priced?',
        answer: 'We offer flexible pricing including sensor hardware with monthly subscription for the monitoring platform. Pricing depends on the number of sensors and features required. Contact us for a customized quote.',
      },
      {
        question: 'Is there a trial or pilot program?',
        answer: 'Yes, we offer pilot programs for qualified businesses to test our solution before full deployment. Pilots typically include 3-5 sensors for 30-60 days with preferential pricing for subsequent rollout.',
      },
      {
        question: 'What support do you provide?',
        answer: 'We provide email and phone support during UAE business hours (Sunday-Thursday, 9 AM - 6 PM GST). Our platform also includes an extensive knowledge base and the system proactively monitors sensor health.',
      },
      {
        question: 'How do I get started?',
        answer: 'Contact us at tech@visiondrive.ae or through our website contact form. We\'ll schedule a consultation to understand your kitchen requirements and provide a tailored proposal.',
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Frequently Asked{' '}
            <span className="text-orange-600">Questions</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Find answers to common questions about VisionDrive&apos;s smart kitchen temperature 
            monitoring, food safety compliance, and implementation.
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
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <category.icon className={`h-5 w-5 flex-shrink-0 ${
                        activeCategory === category.id ? 'text-orange-600' : 'text-gray-400'
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
                      <activeData.icon className="h-6 w-6 text-orange-600" />
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
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 md:p-12 text-white text-center">
            <Mail className="h-12 w-12 mx-auto mb-6 text-orange-200" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our team is here to help 
              with any questions about our smart kitchen solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Us
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
              <a
                href="mailto:tech@visiondrive.ae"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg border border-orange-400 hover:bg-orange-400 transition-colors"
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
