'use client'

import { motion as fmMotion } from 'framer-motion'
import { Calendar, Download, ArrowRight } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

export default function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-obsidian via-obsidian-50 to-obsidian relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the Future of Smart Parking
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Partner with Vision Drive to revolutionize parking in the UAE. 
            Pilot program starting Q1 2026.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="https://calendly.com/visiondrive"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-lg shadow-gold-500/50"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Join the Pilot Program
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="/technical-deck.pdf"
                download
                className="group inline-flex items-center justify-center px-8 py-4 bg-obsidian-50 border-2 border-gold-500 text-gold-500 font-semibold rounded-xl hover:bg-gold-500/10 transition-all duration-300"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Technical Deck
              </a>
            </motion.div>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Already in talks with Dubai Marina & JLT towers • RTA Pilot Ready
          </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

