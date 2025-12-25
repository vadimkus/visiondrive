'use client'

import { motion as fmMotion } from 'framer-motion'
import { Shield, Award, MapPin } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const badges = [
  {
    title: 'RTA Pilot Ready',
    description: 'Approved for Dubai smart parking initiatives',
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'TRA IoT Certified',
    description: 'UAE Telecommunications Regulatory Authority certified',
    icon: Award,
    color: 'from-gold-500 to-gold-600',
  },
  {
    title: 'Made in UAE',
    description: 'Built for the UAE, by the UAE',
    icon: MapPin,
    color: 'from-green-500 to-green-600',
  },
]

export default function TrustBadges() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-obsidian border-t border-obsidian-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    {badge.title}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {badge.description}
                  </div>
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

