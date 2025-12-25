'use client'

import { motion as fmMotion } from 'framer-motion'
import { CheckCircle2, Shield, Zap, Clock, MapPin, TrendingUp } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const features = [
  {
    title: 'End the 30-Minute Parking Hunt',
    description: 'Find available spaces instantly. No more circling blocks.',
    icon: Clock,
    color: 'from-gold-500 to-gold-600',
    span: 'col-span-1 md:col-span-2',
  },
  {
    title: 'RTA-Approved Sensor Technology',
    description: 'Partnered with certified IoT sensors meeting Dubai standards.',
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
    span: 'col-span-1',
  },
  {
    title: 'Dubai Marina & JLT Ready',
    description: 'Already in talks with major towers. Pilot program launching Q1 2026.',
    icon: MapPin,
    color: 'from-green-500 to-green-600',
    span: 'col-span-1',
  },
  {
    title: '99.5% Accuracy Guaranteed',
    description: 'Flush-mount sensors with redundant verification systems.',
    icon: CheckCircle2,
    color: 'from-purple-500 to-purple-600',
    span: 'col-span-1 md:col-span-2',
  },
  {
    title: 'Zero Digging Required',
    description: 'Surface-mounted sensors. No infrastructure disruption.',
    icon: Zap,
    color: 'from-orange-500 to-orange-600',
    span: 'col-span-1',
  },
  {
    title: 'Launch-Ready in 90 Days',
    description: 'Proven technology stack. Rapid deployment capability.',
    icon: TrendingUp,
    color: 'from-pink-500 to-pink-600',
    span: 'col-span-1',
  },
]

export default function BentoGrid() {
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
              Why Vision Drive?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Benefit-driven solutions for the UAE's parking challenges
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div className={`${feature.span} bg-obsidian-50 border border-obsidian-100 rounded-2xl p-8 hover:border-gold-500 transition-all duration-300 group cursor-pointer`}>
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

