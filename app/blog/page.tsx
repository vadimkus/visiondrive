import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - IoT Insights & Smart Kitchen News',
  description: 'Stay updated with VisionDrive insights on IoT temperature monitoring, food safety compliance, and smart kitchen technology in the UAE.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog - IoT Insights & Smart Kitchen News',
    description: 'Stay updated with VisionDrive insights on IoT temperature monitoring, food safety compliance, and smart kitchen technology in the UAE.',
    url: '/blog',
  },
}

const upcomingTopics = [
  {
    title: 'Dubai Municipality HACCP Compliance Guide',
    description: 'Everything you need to know about meeting food safety temperature requirements in UAE commercial kitchens.',
    tag: 'Compliance',
  },
  {
    title: 'How IoT Sensors Reduce Food Waste',
    description: 'Real data on how continuous temperature monitoring prevents spoilage and saves costs for restaurant operators.',
    tag: 'Technology',
  },
  {
    title: 'Smart Kitchen ROI: A UAE Case Study',
    description: 'Breaking down the return on investment for automated temperature monitoring in a Dubai restaurant chain.',
    tag: 'Business',
  },
]

export default function BlogPage() {
  return (
    <div className="pt-20 pb-16 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center py-12 sm:py-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Coming Soon
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            VisionDrive Blog
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            We&apos;re preparing insightful articles about IoT technology, food safety compliance, 
            and smart kitchen solutions for the UAE market.
          </p>

          <div className="text-left space-y-6 mb-12">
            <h2 className="text-xl font-semibold text-gray-800 text-center">What to expect</h2>
            {upcomingTopics.map((topic) => (
              <div key={topic.title} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1 w-2 h-2 bg-orange-400 rounded-full" />
                  <div>
                    <span className="inline-block text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded mb-2">
                      {topic.tag}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-1">{topic.title}</h3>
                    <p className="text-gray-600 text-sm">{topic.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              Get Notified
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
