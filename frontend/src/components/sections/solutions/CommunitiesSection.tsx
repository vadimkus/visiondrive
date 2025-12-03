import Section from '@/components/common/Section'
import { TrendingUp, Users, DollarSign, Building2, BarChart3, Shield } from 'lucide-react'

const features = [
  { 
    icon: TrendingUp, 
    title: 'Maximize Space Utilization', 
    description: 'Increase parking turnover and optimize space efficiency with real-time monitoring',
    keywords: 'parking utilization, space optimization, turnover management'
  },
  { 
    icon: Users, 
    title: 'Traffic Flow Management', 
    description: 'Reduce congestion and improve customer experience with intelligent routing',
    keywords: 'traffic management, congestion reduction, customer experience'
  },
  { 
    icon: DollarSign, 
    title: 'Revenue Optimization Platform', 
    description: 'Dynamic pricing strategies and revenue analytics for commercial properties',
    keywords: 'revenue optimization, dynamic pricing, commercial parking'
  },
  {
    icon: Building2,
    title: 'Commercial Property Solutions',
    description: 'Enterprise-grade parking management for shopping malls, office complexes, and retail centers',
    keywords: 'commercial parking, mall parking, office parking'
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence Suite',
    description: 'Advanced analytics and reporting tools for data-driven property management',
    keywords: 'business intelligence, parking analytics, property management'
  },
  {
    icon: Shield,
    title: 'Enterprise Security & Compliance',
    description: 'Secure data handling and compliance with industry standards and regulations',
    keywords: 'enterprise security, data compliance, parking regulations'
  },
]

export default function CommunitiesSection() {
  return (
    <Section id="communities" background="gray">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Commercial & Enterprise Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive parking management solutions for commercial properties, shopping malls, 
            office complexes, and enterprise clients. Maximize revenue and enhance customer experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

