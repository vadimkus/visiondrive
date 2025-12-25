'use client'

import { motion as fmMotion } from 'framer-motion'
import { Radio, Wifi, Cpu, Code } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const technologies = [
  {
    title: 'Flush-Mount Chinese Sensors',
    description: 'High-precision ultrasonic sensors embedded in parking bays. Weather-resistant, maintenance-free design.',
    icon: Radio,
    specs: ['99.5% accuracy', '5-year battery', 'IP68 rated'],
    color: 'from-gold-500 to-gold-600',
  },
  {
    title: 'LoRaWAN + 4G SIM Redundancy',
    description: 'Dual connectivity ensures 99.9% uptime. LoRaWAN for low-power, 4G for critical updates.',
    icon: Wifi,
    specs: ['Dual-band', 'Auto-failover', 'Encrypted'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Edge Computing Nodes',
    description: 'Local processing reduces latency to <5 seconds. Works offline during network outages.',
    icon: Cpu,
    specs: ['<5ms latency', 'Offline capable', 'Auto-sync'],
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Next.js + Supabase + Vercel',
    description: 'Modern tech stack for scalability. Serverless architecture handles millions of requests.',
    icon: Code,
    specs: ['99.99% uptime', 'Global CDN', 'Auto-scaling'],
    color: 'from-purple-500 to-purple-600',
  },
]

export default function TechnologyCards() {
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
              Technology Stack
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Proven hardware and software for enterprise-grade reliability
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {technologies.map((tech, index) => {
            const Icon = tech.icon
            return (
              <div
                key={index}
                className="bg-obsidian-50 border border-obsidian-100 rounded-2xl p-8 hover:border-gold-500 transition-all duration-300 group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {tech.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {tech.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tech.specs.map((spec, specIndex) => (
                    <span
                      key={specIndex}
                      className="px-3 py-1 bg-obsidian-100 border border-obsidian-200 rounded-lg text-sm text-gold-400"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

