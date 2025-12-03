'use client'

import { motion } from 'framer-motion'
import Button from '@/components/common/Button'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 bg-white">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Guaranteed Parking.{' '}
            <span className="text-primary-600">Seamless Mobility.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time smart parking solutions for the UAE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/app/download" size="lg" className="group">
              Download App
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Request Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

