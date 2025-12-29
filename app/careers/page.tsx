'use client'

import Image from 'next/image'
import { useState } from 'react'
import Section from '../components/common/Section'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  Users,
  Zap,
  Heart,
  Globe,
  ArrowRight,
  CheckCircle2,
  Building2,
  Cpu,
  Brain,
  Sparkles
} from 'lucide-react'

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'Market-leading compensation with performance bonuses and equity options',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive medical, dental, and vision coverage for you and your family',
  },
  {
    icon: Globe,
    title: 'Remote-First Culture',
    description: 'Work from anywhere in the UAE with flexible hours and async communication',
  },
  {
    icon: Zap,
    title: 'Learning Budget',
    description: 'Annual budget for conferences, courses, certifications, and books',
  },
  {
    icon: Users,
    title: 'Small Team Impact',
    description: 'Direct influence on product direction in a fast-moving startup environment',
  },
  {
    icon: Cpu,
    title: 'Cutting-Edge Tech',
    description: 'Work with NB-IoT sensors, real-time data pipelines, and LLM-powered systems',
  },
]

const vacancies = [
  {
    id: 'senior-llm-engineer',
    title: 'Senior LLM Engineer - Parking Intelligence',
    department: 'AI & Machine Learning',
    location: 'Dubai, UAE (Hybrid)',
    type: 'Full-time',
    posted: '2 days ago',
    description: `We're looking for a Senior LLM Engineer to lead the development of our AI-powered parking intelligence platform. You'll architect and deploy large language models that transform raw sensor data into actionable insights for cities, operators, and drivers.

This is a foundational role where you'll shape how AI understands and predicts parking patterns across the UAE. You'll work directly with our NB-IoT sensor network generating millions of occupancy events daily, building systems that help drivers find parking instantly and help cities plan infrastructure smarter.`,
    responsibilities: [
      'Design and implement LLM-based systems for parking demand prediction, anomaly detection, and natural language interfaces for our operator portal',
      'Build RAG (Retrieval-Augmented Generation) pipelines that combine real-time sensor data with historical patterns to answer complex parking queries',
      'Develop fine-tuned models for Arabic/English bilingual support in driver-facing applications',
      'Create evaluation frameworks and benchmarks specific to parking domain tasks (occupancy prediction, ETA estimation, demand forecasting)',
      'Optimize inference latency for real-time applications—sub-100ms response times for in-app recommendations',
      'Collaborate with sensor firmware team to design data schemas that maximize ML utility',
      'Lead technical discussions and mentor junior ML engineers as the team grows',
      'Establish MLOps best practices: model versioning, A/B testing, monitoring, and automated retraining pipelines',
    ],
    requirements: [
      '5+ years of software engineering experience, with 2+ years focused on LLMs/NLP',
      'Hands-on experience with transformer architectures (GPT, BERT, T5) and modern LLM frameworks (LangChain, LlamaIndex, vLLM)',
      'Production experience deploying and scaling LLM applications (not just prototypes)',
      'Strong Python skills and familiarity with ML infrastructure (PyTorch, HuggingFace, ONNX)',
      'Experience with vector databases (Pinecone, Weaviate, Milvus) and embedding models',
      'Understanding of prompt engineering, few-shot learning, and RLHF concepts',
      'Comfortable with cloud infrastructure (AWS preferred—we use me-central-1 for UAE data residency)',
      'Excellent communication skills—you\'ll interface with product, engineering, and government partners',
    ],
    niceToHave: [
      'Experience with time-series forecasting and IoT sensor data',
      'Background in geospatial ML or smart city applications',
      'Familiarity with Arabic NLP and multilingual models',
      'Published research or open-source contributions in LLM/NLP domain',
      'Experience with real-time streaming systems (Kafka, MQTT, Flink)',
    ],
  },
  {
    id: 'llm-engineer-nlp',
    title: 'LLM Engineer - Conversational AI & NLP',
    department: 'AI & Machine Learning',
    location: 'Abu Dhabi, UAE (Hybrid)',
    type: 'Full-time',
    posted: '5 days ago',
    description: `Join our AI team to build conversational interfaces that make parking data accessible to everyone. You'll develop the natural language layer that powers our mobile app, operator chatbots, and voice-enabled parking assistance.

We're creating a future where finding parking is as simple as asking "Where can I park near Dubai Mall for 2 hours?" and getting instant, accurate answers. You'll be at the center of making this vision real—combining our real-time sensor network with cutting-edge NLP to deliver magical user experiences.`,
    responsibilities: [
      'Build and maintain conversational AI systems for the ParkSense mobile app and operator dashboard',
      'Develop intent classification and entity extraction models for parking-specific queries (locations, durations, vehicle types, accessibility needs)',
      'Create context-aware dialogue management for multi-turn parking assistance conversations',
      'Implement semantic search over parking zones, facilities, and real-time availability data',
      'Build Arabic language support with culturally appropriate responses and UAE-specific location understanding',
      'Design and run user studies to improve conversation quality and task completion rates',
      'Integrate with external APIs (Google Maps, navigation apps, payment providers) for end-to-end booking flows',
      'Monitor production conversations for quality, identifying failure modes and improvement opportunities',
    ],
    requirements: [
      '3+ years of experience in NLP/ML engineering roles',
      'Strong experience with LLM APIs (OpenAI, Anthropic, Google) and prompt engineering',
      'Hands-on experience building chatbots, virtual assistants, or conversational interfaces',
      'Proficiency in Python and familiarity with NLP libraries (spaCy, NLTK, HuggingFace Transformers)',
      'Experience with dialogue systems, intent classification, and named entity recognition',
      'Understanding of evaluation metrics for conversational AI (task completion, user satisfaction, latency)',
      'Familiarity with REST APIs and mobile app integration patterns',
      'Strong analytical skills and data-driven approach to improving model performance',
    ],
    niceToHave: [
      'Experience with Arabic NLP—morphological analysis, dialectal variations, transliteration',
      'Background in voice interfaces (ASR, TTS) or multimodal systems',
      'Familiarity with location-based services and geospatial queries',
      'Experience with A/B testing frameworks and experimentation platforms',
      'Knowledge of UAE geography, landmarks, and local parking terminology',
      'Previous work on consumer-facing mobile applications',
    ],
  },
]

function JobCard({ job }: { job: typeof vacancies[0] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-300 transition-colors">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                {job.department}
              </span>
              <span className="text-xs text-gray-500">{job.posted}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {job.type}
              </div>
            </div>
          </div>
          <button className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-6">
          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">About the Role</h4>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">What You&apos;ll Do</h4>
            <ul className="space-y-2">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">What We&apos;re Looking For</h4>
            <ul className="space-y-2">
              {job.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nice to Have */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Nice to Have</h4>
            <ul className="space-y-2">
              {job.niceToHave.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Apply Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:tech@visiondrive.ae?subject=Application: ${job.title}&body=Hi VisionDrive Team,%0D%0A%0D%0AI'm interested in the ${job.title} position.%0D%0A%0D%0A[Please attach your resume and include a brief introduction]`}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
            <a
              href={`mailto:tech@visiondrive.ae?subject=Question about: ${job.title}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              Ask a Question
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CareersPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      {/* Hero Section */}
      <Section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase mb-4">
            Careers at VisionDrive
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Build the Future of{' '}
            <span className="text-primary-600">Smart Parking</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Join a team transforming how millions of people park across the UAE. We&apos;re 
            combining NB-IoT sensors, real-time data, and AI to make parking effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#openings"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors group"
            >
              View Open Positions
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="text-sm text-gray-500">
              {vacancies.length} open roles • UAE-based
            </span>
          </div>
        </div>
      </Section>

      {/* Why Join Us */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why VisionDrive?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              More than a job—an opportunity to shape smart cities
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 mb-4">
                  <benefit.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Open Positions */}
      <Section className="py-12 md:py-16" id="openings">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">
              Find your next opportunity with us
            </p>
          </div>

          <div className="space-y-4">
            {vacancies.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don&apos;t see a role that fits? We&apos;re always looking for talented people.
            </p>
            <a
              href="mailto:tech@visiondrive.ae?subject=General Application"
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
            >
              Send us your resume <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* Team Culture */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Brain className="h-12 w-12 text-primary-600 mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Building AI for Smart Cities
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Our AI team is at the forefront of applying large language models to real-world 
                  infrastructure challenges. From predicting parking demand to enabling natural 
                  language interfaces for city operators, we&apos;re creating technology that makes 
                  urban life better.
                </p>
                <ul className="space-y-3">
                  {[
                    'Millions of sensor events processed daily',
                    'Real-time inference with sub-100ms latency',
                    'Bilingual Arabic/English NLP systems',
                    'UAE data sovereignty compliant infrastructure',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 text-center border border-primary-100">
                  <div className="text-3xl font-bold text-primary-600 mb-1">1M+</div>
                  <div className="text-sm text-gray-600">Daily Events</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center border border-emerald-100">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">&lt;100ms</div>
                  <div className="text-sm text-gray-600">Inference Time</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 text-center border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-1">2</div>
                  <div className="text-sm text-gray-600">Languages</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 text-center border border-amber-100">
                  <div className="text-3xl font-bold text-amber-600 mb-1">UAE</div>
                  <div className="text-sm text-gray-600">Data Residency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Work with UAE&apos;s Leading Authorities</h2>
          <p className="text-gray-600 mb-8">
            Our technology is deployed with government partners across the Emirates
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <Image src="/images/gov/icons/rta.jpg" alt="RTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/parkin.jpg" alt="Parkin" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/itc.jpg" alt="ITC Abu Dhabi" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/srta.jpg" alt="SRTA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
            <Image src="/images/gov/icons/tdra.jpg" alt="TDRA" width={56} height={56} className="h-14 w-14 object-contain rounded-lg" />
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gray" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Building2 className="h-12 w-12 text-primary-600 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We&apos;re building the infrastructure that will transform how cities manage parking. 
            Come help us make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#openings"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Open Positions
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              Learn About Us
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}
