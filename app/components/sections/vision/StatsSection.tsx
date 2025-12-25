'use client'

import { motion as fmMotion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter'
import { TrendingDown, Clock, Zap, MapPin } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const stats = [
  {
    icon: MapPin,
    value: 2183,
    suffix: '',
    label: 'Mosques with Parking',
    description: 'Coverage across UAE',
    color: 'from-gold-500 to-gold-600',
  },
  {
    icon: TrendingDown,
    value: 30,
    suffix: '%',
    label: 'Reduction in Search Time',
    description: 'Based on RTA data',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MapPin,
    value: 190000,
    suffix: '+',
    label: 'Paid Spaces in Dubai',
    description: 'Real-time monitoring',
    color: 'from-gold-500 to-gold-600',
  },
  {
    icon: Clock,
    value: 5,
    suffix: ' sec',
    label: 'Real-Time Update',
    description: 'Instant availability',
    color: 'from-green-500 to-green-600',
  },
]

export default function StatsSection() {
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
              Real-Time Intelligence at Scale
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powered by advanced sensor technology and edge computing
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-obsidian-50 border border-obsidian-100 rounded-2xl p-6 hover:border-gold-500 transition-all duration-300 group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-lg font-semibold text-gold-500 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.description}
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

