'use client'

import { motion as fmMotion } from 'framer-motion'
import Section from '../components/common/Section'
import { CheckCircle2, DollarSign, TrendingUp, Zap, AlertCircle } from 'lucide-react'

// React 19 + Framer Motion v10 typing edge-case
const motion = fmMotion as any

export default function BudgetPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              NB-IoT Deployment Budget
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Complete Financial Breakdown for 1,000 NB-IoT Sensor Rollout with UAE Data Residency
            </p>
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-300 px-6 py-3 rounded-full border border-gold-500/30">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">Total Year 1 Investment: 561,850 AED (~$153,000 USD)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sunk Costs Section */}
      <Section background="gray">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Sunk Costs (Already Paid)</h2>
                <p className="text-gray-600">Value currently in the company</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Value (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-6 py-4 text-gray-900">Vision Drive Trade License (3 Years)</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          PAID
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">15,000 AED</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900" colSpan={2}>Total Pre-Paid Value</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">15,000 AED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Start-Up Capital Section */}
      <Section background="white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Start-Up Capital: Cash Required (Upfront)</h2>
                <p className="text-gray-600">Investment needed for NB-IoT infrastructure and pilot deployment</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item Detail</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Cost (USD)</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Cost (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">Development</td>
                      <td className="px-6 py-4 text-gray-700">MQTT Ingestion Service + Operator Portal (2 Months)</td>
                      <td className="px-6 py-4 text-right text-gray-900">$10,000</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">36,725 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">Hardware</td>
                      <td className="px-6 py-4 text-gray-700">1,000 NB-IoT Parking Sensors (~$70/unit)</td>
                      <td className="px-6 py-4 text-right text-gray-900">$70,000</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">257,075 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">Logistics</td>
                      <td className="px-6 py-4 text-gray-700">Air Freight + Customs (5%) + VAT (5%)</td>
                      <td className="px-6 py-4 text-right text-gray-900">~$8,675</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">31,850 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">Compliance</td>
                      <td className="px-6 py-4 text-gray-700">TDRA Dealer Reg + Type Approval</td>
                      <td className="px-6 py-4 text-right text-gray-900">~$1,700</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">6,200 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">Installation</td>
                      <td className="px-6 py-4 text-gray-700">Labor + Industrial Epoxy + Bluetooth Commissioning</td>
                      <td className="px-6 py-4 text-right text-gray-900">-</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">50,000 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">Contingency</td>
                      <td className="px-6 py-4 text-gray-700">RTA Pilot Safety Fund + Coverage Validation</td>
                      <td className="px-6 py-4 text-right text-gray-900">-</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">30,000 AED</td>
                    </tr>
                    <tr className="bg-gold-50 border-t-2 border-gold-500">
                      <td className="px-6 py-4 font-bold text-gray-900" colSpan={2}>TOTAL CASH NEEDED (To Launch)</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">~$112,000</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">411,850 AED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* OPEX Section */}
      <Section background="gray">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">OPEX: Running Costs (Year 1)</h2>
                <p className="text-gray-600">Recurring costs for NB-IoT connectivity and UAE-hosted infrastructure</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Monthly Cost</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Yearly Cost (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">NB-IoT Connectivity (Du/Etisalat) - Est. 10 AED/SIM</td>
                      <td className="px-6 py-4 text-right text-gray-900">10,000 AED</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">120,000 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">AWS UAE (me-central-1) - EC2 + PostgreSQL + MQTT IoT Core</td>
                      <td className="px-6 py-4 text-right text-gray-900">~500 AED</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">6,000 AED</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">Software Maintenance & Monitoring</td>
                      <td className="px-6 py-4 text-right text-gray-900">~2,000 AED</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">24,000 AED</td>
                    </tr>
                    <tr className="bg-blue-50 border-t-2 border-blue-500">
                      <td className="px-6 py-4 font-bold text-gray-900">TOTAL OPEX</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">12,500 AED / Month</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">150,000 AED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Financial Summary Section */}
      <Section background="white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Financial Summary</h2>
                <p className="text-gray-600">The complete 12-month investment picture</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium text-gold-100 mb-2">Development & Launch (CAPEX)</div>
                <div className="text-3xl font-bold mb-1">411,850 AED</div>
                <div className="text-gold-100">~$112,000 USD</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium text-blue-100 mb-2">1st Year Operations (OPEX)</div>
                <div className="text-3xl font-bold mb-1">150,000 AED</div>
                <div className="text-blue-100">~$41,000 USD</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium text-purple-100 mb-2">TOTAL YEAR 1 BUDGET</div>
                <div className="text-3xl font-bold mb-1">561,850 AED</div>
                <div className="text-purple-100">~$153,000 USD</div>
              </div>
            </div>

            {/* Unit Economics */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-green-400" />
                Unit Economics Check
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-gray-400 mb-2">Cost Per Sensor (Year 1)</div>
                  <div className="text-3xl font-bold text-white">~561 AED</div>
                  <div className="text-sm text-gray-400 mt-1">Hardware + App + Operations</div>
                </div>

                <div>
                  <div className="text-gray-400 mb-2">Revenue Per Sensor (Year 1)</div>
                  <div className="text-3xl font-bold text-green-400">720 AED</div>
                  <div className="text-sm text-gray-400 mt-1">At 60 AED/month per spot</div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Year 1 Profit Per Sensor</span>
                  <span className="text-2xl font-bold text-green-400">~158 AED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Year 2 Profit Per Sensor</span>
                  <span className="text-2xl font-bold text-green-400">~570 AED</span>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  * Year 2 profit increases significantly as hardware and development costs are already paid
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Key Insights Section */}
      <Section background="gray">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Key Technical & Financial Insights</h2>
                <p className="text-gray-600">What this budget delivers for NB-IoT deployment</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">UAE Data Residency Compliance</h3>
                <p className="text-gray-700 leading-relaxed">
                  All sensor data, ingestion logs, and backups hosted exclusively in AWS me-central-1 
                  (UAE region) meeting TDRA and DESC ISR requirements for government projects.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">NB-IoT Reliability</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our NB-IoT sensors deliver 99%+ uplink reliability with sub-30s latency for street 
                  and semi-covered environments, validated through pilot acceptance criteria.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">TDRA Regulatory Costs</h3>
                <p className="text-gray-700 leading-relaxed">
                  Budget includes TDRA Dealer Registration and Type Approval costs (~6,200 AED) 
                  required for IoT device deployment in the UAE.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-gold-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">MQTT Ingestion Architecture</h3>
                <p className="text-gray-700 leading-relaxed">
                  Always-on MQTT subscriber service with dead-letter handling, dedup/idempotency, 
                  and reconnect logic ensuring no event loss from sensor network.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl p-12 shadow-2xl text-white"
          >
            <DollarSign className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Deploy NB-IoT Infrastructure?
            </h2>
            <p className="text-xl text-gold-50 mb-8 leading-relaxed max-w-2xl mx-auto">
              Contact us to review the detailed phase-by-phase payment schedule and deployment 
              timeline for the 1,000-sensor pilot with full TDRA/DESC compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Us
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold-700 text-white font-semibold rounded-xl hover:bg-gold-800 border-2 border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Technical Details
              </a>
            </div>
          </motion.div>
        </div>
      </Section>
    </main>
  )
}

