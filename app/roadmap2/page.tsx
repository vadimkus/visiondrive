'use client'

import Image from 'next/image'
import { motion as fmMotion } from 'framer-motion'
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target, 
  Rocket, 
  Zap, 
  Shield, 
  Users, 
  Database, 
  Smartphone, 
  Cloud,
  Radio,
  Server,
  FileCheck,
  MapPin,
  Settings,
  BarChart3,
  Building2,
  AlertCircle
} from 'lucide-react'
import Section from '../components/common/Section'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for presentation-only animations.
const motion = fmMotion as any

const phases = [
  {
    phase: 'Phase 0',
    period: 'Week 0-6',
    title: 'Government Approvals & Compliance',
    status: 'in-progress',
    description: 'Secure RTA NOC, pilot approval, and prepare DESC ISR compliance evidence pack. Critical path that runs in parallel with technical build.',
    icon: FileCheck,
    color: 'from-red-500 to-red-600',
    highlight: true,
    milestones: [
      {
        title: 'RTA Approvals',
        items: ['NOC application for subcontractor installation', 'Pilot program proposal (10-100 sensors)', 'Site selection for street/covered/underground zones'],
      },
      {
        title: 'DESC ISR Compliance',
        items: ['UAE data residency architecture proof', 'RBAC & audit logging implementation', 'Encryption strategy (TLS 1.2+, AWS KMS)'],
      },
      {
        title: 'Vendor Documentation',
        items: ['TDRA type approval certificate', 'GSMA TAC/IMEI registration', 'RF/EMC test reports (EN 301 908)'],
      },
    ],
  },
  {
    phase: 'Phase 1',
    period: 'Week 1-2',
    title: 'AWS UAE Infrastructure Foundation',
    status: 'in-progress',
    description: 'Deploy compliant cloud infrastructure in AWS me-central-1 (UAE) with VPC, database, and monitoring.',
    icon: Cloud,
    color: 'from-blue-500 to-blue-600',
    milestones: [
      {
        title: 'AWS Foundation',
        items: ['VPC with public/private subnets (me-central-1)', 'KMS keys for encryption (UAE region)', 'CloudTrail + CloudWatch logging'],
      },
      {
        title: 'Database Layer',
        items: ['PostgreSQL + TimescaleDB (self-hosted)', 'Automated backups to S3 (UAE only)', 'No public IPs, private subnet access'],
      },
      {
        title: 'Security Baseline',
        items: ['SSM Session Manager (no SSH)', 'IAM least privilege policies', 'Security groups and NACLs'],
      },
    ],
  },
  {
    phase: 'Phase 2',
    period: 'Week 2-3',
    title: 'MQTT Broker & Ingestion Pipeline',
    status: 'planned',
    description: 'Deploy EMQX MQTT broker and build the ingestion service for NB-IoT sensor data with HEX payload decoding.',
    icon: Server,
    color: 'from-emerald-500 to-emerald-600',
    milestones: [
      {
        title: 'MQTT Broker (EMQX)',
        items: ['TLS 8883 + username/password auth', 'Per-device ACL (publish to /psl/<uuid>/event)', 'NLB load balancer for high availability'],
      },
      {
        title: 'Ingestion Service',
        items: ['HEX payload decoder (battery, temp, occupancy)', 'MQTT subscriber with reconnect handling', 'Idempotent writes + dead-letter queue'],
      },
      {
        title: 'Data Pipeline',
        items: ['sensor_events table (append-only)', 'bay_state table (latest snapshot)', 'Alert generation (offline, low battery, water)'],
      },
    ],
  },
  {
    phase: 'Phase 3',
    period: 'Week 3-4',
    title: 'Portal & Commissioning Workflow',
    status: 'planned',
    description: 'Build operator portal with sensor management, commissioning UI, health monitoring, and alert dashboards.',
    icon: Settings,
    color: 'from-purple-500 to-purple-600',
    milestones: [
      {
        title: 'Sensor Management',
        items: ['Sensor UUID as primary identity', 'Commissioning state tracking', 'Sensor ↔ bay polygon binding (1:1)'],
      },
      {
        title: 'Health Monitoring',
        items: ['Battery %, temperature, water coverage', 'Radar validity and last_seen heartbeat', 'Flapping detection (>10 changes/hour)'],
      },
      {
        title: 'Alerts & Reports',
        items: ['Offline/low battery/decode error alerts', 'Uptime %, latency p50/p95 reports', 'Coverage "bad spots" export'],
      },
    ],
  },
  {
    phase: 'Phase 4',
    period: 'Week 4-6',
    title: 'Field SOP & Pilot Deployment',
    status: 'planned',
    description: 'Deploy 10-100 sensors across street, semi-covered, and underground environments with trained installation team.',
    icon: MapPin,
    color: 'from-amber-500 to-amber-600',
    milestones: [
      {
        title: 'Installation SOP',
        items: ['Bluetooth AT commands (radar, calibration)', 'APN configuration per carrier (Du/Etisalat)', 'Photo/GPS documentation workflow'],
      },
      {
        title: 'Pilot Deployment',
        items: ['Street parking (open sky)', 'Semi-covered (shaded/roofed)', 'Underground (edge, center, ramps)'],
      },
      {
        title: 'Validation Metrics',
        items: ['≥99% uplink reliability (street)', '≥95% uplink reliability (underground)', '<2 false flips/day acceptance'],
      },
    ],
  },
  {
    phase: 'Phase 5',
    period: 'Week 8-12',
    title: 'Production Scale-Up',
    status: 'future',
    description: 'Scale to 2,000-5,000 sensors with multi-AZ MQTT cluster, performance tuning, and operational runbooks.',
    icon: Rocket,
    color: 'from-cyan-500 to-cyan-600',
    milestones: [
      {
        title: 'Infrastructure Scaling',
        items: ['EMQX multi-AZ cluster (2-3 nodes)', 'Database indexing and compression', 'Load testing (5,000 simultaneous sensors)'],
      },
      {
        title: 'Operations',
        items: ['Incident response runbooks', 'Credential rotation procedures', 'Disaster recovery drills'],
      },
      {
        title: 'Rollout',
        items: ['Phased deployment across RTA zones', 'Coverage map validation', 'Go-live with full monitoring'],
      },
    ],
  },
  {
    phase: 'Phase 6',
    period: 'Q2 2026+',
    title: 'ParkSense Mobile App & Ecosystem',
    status: 'future',
    description: 'Launch consumer-facing mobile app with real-time availability, navigation, and unified parking payments.',
    icon: Smartphone,
    color: 'from-pink-500 to-pink-600',
    milestones: [
      {
        title: 'Mobile App',
        items: ['Real-time bay availability map', 'Navigation to available spaces', 'Push notifications for space changes'],
      },
      {
        title: 'Payments Integration',
        items: ['RTA/Parkin parking payment integration', 'In-app payment processing', 'Parking session management'],
      },
      {
        title: 'Ecosystem',
        items: ['Enterprise B2B API access', 'Multi-emirate expansion', 'EV charging station integration'],
      },
    ],
  },
]

const techStack = [
  {
    category: 'Sensors & Protocol',
    icon: Radio,
    color: 'bg-blue-500',
    items: [
      'NB-IoT parking sensors (99% accuracy)',
      'NB-IoT uplink (B1/B3/B5/B8 bands)',
      'MQTT protocol (TLS 8883, QoS 0/1/2)',
      'HEX payload decoding (battery, temp, occupancy)',
      'Bluetooth AT commands for commissioning',
    ],
  },
  {
    category: 'Cloud Infrastructure',
    icon: Cloud,
    color: 'bg-emerald-500',
    items: [
      'AWS UAE Region (me-central-1)',
      'VPC with private subnets (no public DB access)',
      'EMQX MQTT broker (self-hosted)',
      'PostgreSQL + TimescaleDB (time-series optimized)',
      'S3 for backups and logs (UAE only)',
    ],
  },
  {
    category: 'Application Stack',
    icon: Database,
    color: 'bg-purple-500',
    items: [
      'Next.js portal on Vercel',
      'Prisma ORM with TypeScript',
      'MQTT ingestion service (Node.js)',
      'REST APIs for government integration',
      'Real-time WebSocket updates',
    ],
  },
  {
    category: 'Security & Compliance',
    icon: Shield,
    color: 'bg-red-500',
    items: [
      'UAE data residency (DESC ISR aligned)',
      'TDRA IoT regulatory compliance',
      'AWS KMS encryption (data at rest)',
      'TLS 1.2+ encryption (data in transit)',
      'RBAC + audit logging (5-year retention)',
    ],
  },
]

const milestones = [
  {
    date: 'Week 1-2',
    title: 'Local Sensor Validation',
    description: '2 test sensors deployed for NB-IoT coverage and decoder validation',
    status: 'in-progress',
  },
  {
    date: 'Week 4-6',
    title: 'RTA Approvals Secured',
    description: 'NOC and pilot program approval from RTA',
    status: 'upcoming',
  },
  {
    date: 'Week 7',
    title: 'Pilot Deployment Begins',
    description: '10-20 sensors in RTA-approved zones',
    status: 'upcoming',
  },
  {
    date: 'Week 8-10',
    title: 'Pilot Acceptance',
    description: 'Acceptance criteria met, go/no-go for scale-up',
    status: 'upcoming',
  },
  {
    date: 'Week 12+',
    title: 'Production Rollout',
    description: '2,000-5,000 sensors across UAE',
    status: 'future',
  },
  {
    date: 'Q1 2026',
    title: 'ParkSense App Launch',
    description: 'Consumer mobile app available on App Store & Play Store',
    status: 'future',
  },
]

export default function Roadmap2Page() {
  return (
    <div className="pt-20 pb-12 bg-white">
      {/* Hero Section */}
      <Section background="white">
        <div className="max-w-7xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">Technical Implementation Roadmap</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              NB-IoT Smart Parking <br className="hidden sm:block" />
              <span className="text-primary-600">Detailed Deployment Plan</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              From pilot validation to production scale-up across the UAE
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Target: 2,000-5,000 NB-IoT sensors | Pilot: 10-100 sensors | UAE Data Residency Compliant
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Key Milestones Timeline */}
      <Section background="gray">
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Milestones</h2>
            <p className="text-lg text-gray-600">Critical checkpoints on the path to production</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone, milestoneIdx) => (
              <motion.div
                key={`milestone-${milestone.date}-${milestone.title}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: milestoneIdx * 0.1 }}
                className={`bg-white rounded-xl p-6 border-2 ${
                  milestone.status === 'in-progress' 
                    ? 'border-green-300 bg-green-50' 
                    : milestone.status === 'upcoming'
                    ? 'border-blue-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className={`h-5 w-5 ${
                    milestone.status === 'in-progress' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    milestone.status === 'in-progress' ? 'text-green-600' : 'text-gray-500'
                  }`}>{milestone.date}</span>
                  {milestone.status === 'in-progress' && (
                    <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                <p className="text-sm text-gray-600">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Development Phases */}
      <Section background="white">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Development Phases
            </h2>
            <p className="text-lg text-gray-600">
              Phased approach from infrastructure to production deployment
            </p>
          </div>

          <div className="space-y-8">
            {phases.map((phase, phaseIdx) => {
              const Icon = phase.icon
              const isCurrent = phase.status === 'in-progress'
              const isCompleted = phase.status === 'completed'

              return (
                <motion.div
                  key={`phase-${phase.phase}`}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: phaseIdx * 0.1 }}
                  className="relative"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${phase.color} shadow-lg flex items-center justify-center`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className={`bg-white rounded-xl border-2 p-6 md:p-8 hover:shadow-lg transition-all duration-300 ${
                        phase.highlight ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                      }`}>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm font-semibold">
                            {phase.phase}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {phase.period}
                          </span>
                          {isCurrent && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              In Progress
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </span>
                          )}
                          {phase.highlight && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Critical Path
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          {phase.title}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {phase.description}
                        </p>

                        <div className="grid md:grid-cols-3 gap-4">
                          {phase.milestones.map((milestone) => (
                            <div key={`pm-${milestone.title}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                {milestone.title}
                              </h4>
                              <ul className="space-y-2">
                                {milestone.items.map((item) => (
                                  <li key={`pm-item-${item.slice(0, 20)}`} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Tech Stack Section */}
      <Section background="gray">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Technology Stack
              </h2>
              <p className="text-lg text-gray-600">
                UAE-compliant architecture built for enterprise-grade reliability
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {techStack.map((tech, techIdx) => {
              const Icon = tech.icon
              return (
                <motion.div
                  key={`tech-${tech.category}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: techIdx * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 ${tech.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {tech.category}
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {tech.items.map((item) => (
                      <li key={`tech-item-${item.slice(0, 20)}`} className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="white">
        <div className="max-w-4xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Approved by UAE Authorities</h2>
            <p className="text-gray-600 mb-8">
              Working with government entities for pilot approval and deployment
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
              <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
              <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
              <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
              <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
              <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Building2 className="h-12 w-12 text-primary-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Partner with VisionDrive
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join RTA, municipalities, and enterprises deploying NB-IoT smart parking infrastructure 
              with full UAE data residency compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Schedule a Consultation
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                View Solutions
              </a>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}

