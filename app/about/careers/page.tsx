import Section from '../../components/common/Section'
import { Briefcase, MapPin, Clock, Users } from 'lucide-react'

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Full-Stack Developer',
      location: 'Dubai, UAE',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'IoT Solutions Architect',
      location: 'Dubai, UAE',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'Business Development Manager',
      location: 'Dubai, UAE',
      type: 'Full-time',
      department: 'Sales',
    },
  ]

  return (
    <>
      <Section className="pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Careers
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Join us in revolutionizing urban mobility in the UAE
          </p>
        </div>
      </Section>

      <Section background="gray">
        <div className="max-w-4xl mx-auto">
          {/* Why Join Us */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Join Vision Drive?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Work on cutting-edge IoT and smart city technologies that are transforming urban mobility.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact</h3>
                <p className="text-gray-600">
                  Make a real difference in how people navigate cities and reduce traffic congestion.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth</h3>
                <p className="text-gray-600">
                  Join a fast-growing startup with opportunities for professional development and career advancement.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Culture</h3>
                <p className="text-gray-600">
                  Be part of a collaborative team that values creativity, diversity, and work-life balance.
                </p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
            {openPositions.length > 0 ? (
              <div className="space-y-4">
                {openPositions.map((position, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {position.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {position.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {position.type}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {position.department}
                          </div>
                        </div>
                      </div>
                      <a
                        href="/contact"
                        className="inline-flex items-center px-6 py-2 text-sm font-medium text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">We're not currently hiring, but we're always interested in connecting with talented individuals.</p>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Get in Touch
                </a>
              </div>
            )}
          </div>

          {/* How to Apply */}
          <div className="bg-white rounded-lg p-8 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-gray-600 mb-4">
              Interested in joining our team? Send us your resume and cover letter through our{' '}
              <a href="/contact" className="text-primary-600 hover:underline">contact form</a>.
            </p>
            <p className="text-gray-600">
              We review all applications and will reach out to candidates whose skills and experience align with our needs.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}

