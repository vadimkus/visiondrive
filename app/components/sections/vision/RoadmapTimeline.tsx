'use client'

import { motion as fmMotion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const roadmap = [
  {
    quarter: 'Q4 2025',
    title: 'Sensor Procurement & Testing',
    description: 'Finalize sensor selection, conduct field tests, obtain RTA approvals.',
    status: 'current',
    milestones: [
      'Sensor vendor selection',
      'RTA certification',
      'Field testing in Dubai Marina',
    ],
  },
  {
    quarter: 'Q1 2026',
    title: 'Dubai Marina Pilot',
    description: 'Deploy 500 sensors across Dubai Marina. Launch beta app.',
    status: 'upcoming',
    milestones: [
      '500 spaces monitored',
      'Beta app launch',
      'Partner onboarding',
    ],
  },
  {
    quarter: 'Q2 2026',
    title: 'JLT + Business Bay Expansion',
    description: 'Scale to 2,000 spaces. Integrate with RTA systems.',
    status: 'upcoming',
    milestones: [
      '2,000 spaces live',
      'RTA API integration',
      'Commercial partnerships',
    ],
  },
  {
    quarter: 'Q4 2026',
    title: 'Full Dubai Coverage',
    description: 'Complete deployment across all Dubai districts. 50,000+ spaces.',
    status: 'upcoming',
    milestones: [
      '50,000+ spaces',
      'Full RTA integration',
      'Multi-emirate expansion',
    ],
  },
]

export default function RoadmapTimeline() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-obsidian">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Implementation Roadmap
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A clear path from pilot to full deployment
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-obsidian-100 hidden md:block" />

          <div className="space-y-12">
            {roadmap.map((phase, index) => {
              const isCurrent = phase.status === 'current'
              const Icon = isCurrent ? Clock : CheckCircle2

              return (
                <div
                  key={index}
                  className="relative flex items-start gap-8"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                      isCurrent 
                        ? 'from-gold-500 to-gold-600 shadow-lg shadow-gold-500/50' 
                        : 'from-obsidian-100 to-obsidian-200'
                    } flex items-center justify-center border-4 border-obsidian`}>
                      <Icon className={`h-7 w-7 ${
                        isCurrent ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-obsidian-50 border border-obsidian-100 rounded-2xl p-8 hover:border-gold-500 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-4 py-1 bg-gold-500/20 border border-gold-500/30 rounded-lg text-gold-400 font-semibold text-sm">
                        {phase.quarter}
                      </span>
                      {isCurrent && (
                        <span className="px-4 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-semibold text-sm">
                          Current Phase
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {phase.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="space-y-2">
                      {phase.milestones.map((milestone, milestoneIndex) => (
                        <div key={milestoneIndex} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-gold-500 flex-shrink-0" />
                          <span className="text-sm">{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

