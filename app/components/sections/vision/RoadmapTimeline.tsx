'use client'

import { motion as fmMotion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const roadmap = [
  {
    quarter: 'Q4 2025',
    title: 'Practice Setup',
    description: 'Configure services, forms, booking rules, and demo client data.',
    status: 'current',
    milestones: [
      'Service catalogue',
      'Booking rules',
      'Demo data setup',
    ],
  },
  {
    quarter: 'Q1 2026',
    title: 'Solo Practitioner Pilot',
    description: 'Run appointments, records, quotes, payments, and follow-up in one workspace.',
    status: 'upcoming',
    milestones: [
      'Patient cards live',
      'Mobile portal launch',
      'Partner onboarding',
    ],
  },
  {
    quarter: 'Q2 2026',
    title: 'Workflow Expansion',
    description: 'Add automation, waitlist fill, price quotes, and marketing workflows.',
    status: 'upcoming',
    milestones: [
      'Automation live',
      'Client portal improvements',
      'Commercial partnerships',
    ],
  },
  {
    quarter: 'Q4 2026',
    title: 'Practice OS Scale',
    description: 'Broaden to independent clinics and home-visit practitioners across the UAE.',
    status: 'upcoming',
    milestones: [
      'Clinic onboarding',
      'WhatsApp workflows',
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
              A clear path from setup to daily practice operations
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
                  key={`phase-${phase.quarter}-${phase.title.slice(0, 15)}`}
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

