import Section from '@/components/common/Section'
import { Database, TrendingUp, Map, Shield, BarChart3, Building2 } from 'lucide-react'

const features = [
  { 
    icon: Database, 
    title: 'Enterprise Data & Analytics', 
    description: 'Comprehensive parking insights and real-time monitoring for data-driven decision making',
    keywords: 'parking analytics, enterprise data, real-time monitoring'
  },
  { 
    icon: TrendingUp, 
    title: 'Predictive Analytics Platform', 
    description: 'Advanced demand forecasting and capacity planning for urban infrastructure',
    keywords: 'predictive analytics, demand forecasting, capacity planning'
  },
  { 
    icon: Map, 
    title: 'Traffic Flow Optimization', 
    description: 'Reduce urban congestion and improve traffic management with intelligent routing',
    keywords: 'traffic optimization, congestion reduction, smart city'
  },
  {
    icon: Shield,
    title: 'RTA Integration Solutions',
    description: 'Seamless integration with RTA systems and compliance with UAE smart city standards',
    keywords: 'RTA integration, smart city compliance, government systems'
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence Dashboard',
    description: 'Executive dashboards and custom reporting for strategic planning and ROI analysis',
    keywords: 'business intelligence, executive dashboard, ROI analytics'
  },
  {
    icon: Building2,
    title: 'Municipal Parking Management',
    description: 'End-to-end parking management solution for municipalities and government entities',
    keywords: 'municipal parking, government parking, public parking management'
  },
]

export default function MunicipalitiesSection() {
  return (
    <Section id="municipalities">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Enterprise Solutions for Municipalities & RTA
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive smart parking solutions designed for government entities, transportation authorities, 
            and municipal organizations. Transform urban mobility with data-driven insights and seamless integration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-primary-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Benefits for Government Entities</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-gray-700">Reduced traffic congestion and improved urban flow</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-gray-700">Enhanced citizen satisfaction and quality of life</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-gray-700">Data-driven urban planning and infrastructure decisions</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-gray-700">Compliance with UAE Smart City standards and regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-gray-700">Seamless integration with existing government systems</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span className="text-gray-700">Scalable solution for city-wide deployment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}

